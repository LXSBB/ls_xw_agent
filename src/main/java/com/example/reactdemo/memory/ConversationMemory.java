package com.example.reactdemo.memory;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Connection;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

import com.example.reactdemo.agent.AgentResponse;
import com.example.reactdemo.agent.ChatTurn;
import com.example.reactdemo.school.ClassManagementProperties;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.util.Assert;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.json.JsonMapper;

/** MySQL 是历史的唯一来源。数据库锁只用于短事务，不跨模型或业务接口调用。 */
@Repository
public class ConversationMemory {
    public static final int CONTEXT_TURNS = 6;
    public static final int DISPLAY_TURNS = 50;
    private final JdbcTemplate jdbc;
    private final TransactionTemplate transaction;
    private final JsonMapper mapper;
    private final String ownerKey;
    private Connection instanceConnection;

    public ConversationMemory(JdbcTemplate jdbc, PlatformTransactionManager manager, JsonMapper mapper,
                              ClassManagementProperties identity) throws NoSuchAlgorithmException {
        this.jdbc = jdbc;
        this.transaction = new TransactionTemplate(manager);
        this.mapper = mapper;
        Assert.hasText(identity.instId(), "记忆存储需要配置 LINGSHI_INST_ID");
        Assert.hasText(identity.userId(), "记忆存储需要配置 LINGSHI_USER_ID");
        // 区分业务环境、服务、机构和账号；不使用可变 token，也不接受浏览器提供身份。
        String scope = mapper.writeValueAsString(List.of(identity.socialBaseUrl(), identity.serverId(),
                identity.instId(), identity.userId()));
        this.ownerKey = HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                .digest(scope.getBytes(StandardCharsets.UTF_8)));
    }

    @PostConstruct
    void recoverInterrupted() throws SQLException {
        // 用专用连接持有命名锁，防止第二实例把仍在执行的请求误判为重启中断。
        instanceConnection = jdbc.getDataSource().getConnection();
        try {
            try (var statement = instanceConnection.prepareStatement("SELECT GET_LOCK(?, 0)")) {
                statement.setString(1, instanceLockName());
                try (var result = statement.executeQuery()) {
                    result.next();
                    if (result.getInt(1) != 1) throw new IllegalStateException("当前账号已有记忆服务实例，请先停止该实例。");
                }
            }
            jdbc.update("""
                UPDATE agent_chat_turn t JOIN agent_conversation c ON c.id=t.conversation_id
                SET t.status='INTERRUPTED', t.error_message=?, t.completed_at=CURRENT_TIMESTAMP(6)
                WHERE c.owner_key=? AND t.status='RUNNING'
                """, "上次请求因服务重启中断，执行结果未确认；若涉及创建，请先查询核实。", ownerKey);
        } catch (SQLException | RuntimeException failure) {
            try { releaseInstanceLock(); }
            catch (SQLException cleanupFailure) { failure.addSuppressed(cleanupFailure); }
            throw failure;
        }
    }

    private String instanceLockName() { return "react-memory:" + ownerKey.substring(0, 48); }

    @PreDestroy
    void releaseInstanceLock() throws SQLException {
        if (instanceConnection == null) return;
        try (var statement = instanceConnection.prepareStatement("SELECT RELEASE_LOCK(?)")) {
            statement.setString(1, instanceLockName());
            statement.execute();
        } finally {
            instanceConnection.close();
            instanceConnection = null;
        }
    }

    public ConversationSummary create() {
        UUID id = UUID.randomUUID();
        jdbc.update("INSERT INTO agent_conversation(id, owner_key) VALUES (?, ?)", id.toString(), ownerKey);
        return requireConversation(id, false);
    }

    public List<ConversationSummary> list() {
        return jdbc.query("""
                SELECT id, title, updated_at FROM agent_conversation
                WHERE owner_key=? ORDER BY updated_at DESC, id LIMIT 50
                """, this::summary, ownerKey);
    }

    public ConversationView read(UUID id) {
        return transaction.execute(status -> {
            var conversation = requireConversation(id, false);
            var turns = new ArrayList<>(jdbc.query("""
                    SELECT * FROM agent_chat_turn WHERE conversation_id=? ORDER BY id DESC LIMIT ?
                    """, this::turn, id.toString(), DISPLAY_TURNS));
            Collections.reverse(turns);
            int total = jdbc.queryForObject("SELECT COUNT(*) FROM agent_chat_turn WHERE conversation_id=?",
                    Integer.class, id.toString());
            return new ConversationView(conversation.id(), conversation.title(), List.copyOf(turns), total);
        });
    }

    public void delete(UUID id) {
        transaction.executeWithoutResult(status -> {
            requireConversation(id, true);
            requireIdle(id);
            jdbc.update("DELETE FROM agent_conversation WHERE id=? AND owner_key=?", id.toString(), ownerKey);
        });
    }

    /** 原子领取本轮；相同 requestId 成功后只返回已保存的结果，不再次执行工具。 */
    public StartedTurn begin(UUID id, UUID requestId, String message) {
        return transaction.execute(status -> {
            requireConversation(id, true);
            var existing = jdbc.query("SELECT * FROM agent_chat_turn WHERE conversation_id=? AND request_id=?",
                    this::turn, id.toString(), requestId.toString());
            if (!existing.isEmpty()) {
                var prior = existing.getFirst();
                if (!prior.message().equals(message)) throw conflict("同一个 requestId 不能用于不同消息。");
                if ("COMPLETED".equals(prior.status())) return new StartedTurn(List.of(), prior.response());
                throw conflict("该请求已受理，状态为 " + prior.status() + "；请读取会话查看结果，不会重新执行。");
            }
            requireIdle(id);
            var recent = new ArrayList<>(jdbc.query("""
                    SELECT * FROM agent_chat_turn WHERE conversation_id=? AND status='COMPLETED'
                    ORDER BY id DESC LIMIT ?
                    """, this::turn, id.toString(), CONTEXT_TURNS));
            Collections.reverse(recent);
            var history = new ArrayList<ChatTurn>();
            for (var prior : recent) {
                history.add(new ChatTurn("user", prior.message()));
                history.add(new ChatTurn("assistant", prior.response().answer()));
            }
            jdbc.update("""
                    UPDATE agent_conversation SET title=CASE
                      WHEN NOT EXISTS(SELECT 1 FROM agent_chat_turn WHERE conversation_id=?) THEN ? ELSE title END,
                      updated_at=CURRENT_TIMESTAMP(6) WHERE id=?
                    """, id.toString(), message.substring(0, message.offsetByCodePoints(0,
                    Math.min(80, message.codePointCount(0, message.length())))), id.toString());
            jdbc.update("""
                    INSERT INTO agent_chat_turn(conversation_id, request_id, user_message, status)
                    VALUES (?, ?, ?, 'RUNNING')
                    """, id.toString(), requestId.toString(), message);
            return new StartedTurn(List.copyOf(history), null);
        });
    }

    public void complete(UUID id, UUID requestId, AgentResponse response) {
        finish(id, requestId, "COMPLETED", mapper.writeValueAsString(response), null);
    }

    public void fail(UUID id, UUID requestId) {
        finish(id, requestId, "FAILED", null, "本轮未完成，不作为后续上下文；若涉及创建，请先查询核实结果。");
    }

    private void finish(UUID id, UUID requestId, String state, String response, String error) {
        transaction.executeWithoutResult(status -> {
            requireConversation(id, true);
            int changed = jdbc.update("""
                    UPDATE agent_chat_turn SET status=?, response_json=?, error_message=?, completed_at=CURRENT_TIMESTAMP(6)
                    WHERE conversation_id=? AND request_id=? AND status='RUNNING'
                    """, state, response, error, id.toString(), requestId.toString());
            if (changed != 1) throw conflict("本轮状态已变化，请读取会话确认结果。");
            jdbc.update("UPDATE agent_conversation SET updated_at=CURRENT_TIMESTAMP(6) WHERE id=?", id.toString());
        });
    }

    private ConversationSummary requireConversation(UUID id, boolean lock) {
        var rows = jdbc.query("SELECT id, title, updated_at FROM agent_conversation WHERE id=? AND owner_key=?"
                + (lock ? " FOR UPDATE" : ""), this::summary, id.toString(), ownerKey);
        if (rows.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "会话不存在或不属于当前账号。");
        return rows.getFirst();
    }

    private void requireIdle(UUID id) {
        int running = jdbc.queryForObject("SELECT COUNT(*) FROM agent_chat_turn WHERE conversation_id=? AND status='RUNNING'",
                Integer.class, id.toString());
        if (running > 0) throw conflict("当前会话仍有请求执行中，请稍后刷新查看结果。");
    }

    private ResponseStatusException conflict(String message) {
        return new ResponseStatusException(HttpStatus.CONFLICT, message);
    }

    private ConversationSummary summary(ResultSet row, int index) throws SQLException {
        return new ConversationSummary(UUID.fromString(row.getString("id")), row.getString("title"),
                row.getTimestamp("updated_at").toInstant());
    }

    private StoredTurn turn(ResultSet row, int index) throws SQLException {
        String response = row.getString("response_json");
        return new StoredTurn(UUID.fromString(row.getString("request_id")), row.getString("user_message"),
                row.getString("status"), response == null ? null : mapper.readValue(response, AgentResponse.class),
                row.getString("error_message"));
    }

    public record ConversationSummary(UUID id, String title, Instant updatedAt) {}
    public record ConversationView(UUID conversationId, String title, List<StoredTurn> turns, int totalTurns) {}
    public record StoredTurn(UUID requestId, String message, String status, AgentResponse response, String error) {}
    public record StartedTurn(List<ChatTurn> history, AgentResponse cachedResponse) {}
}
