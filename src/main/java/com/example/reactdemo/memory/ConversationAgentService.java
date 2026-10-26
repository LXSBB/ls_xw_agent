package com.example.reactdemo.memory;

import java.util.List;
import java.util.UUID;

import com.example.reactdemo.agent.AgentResponse;
import com.example.reactdemo.agent.ReActAgentService;
import org.springframework.stereotype.Service;

/** 先保存用户请求，再调用原有 ReAct；成功结果落库后才返回浏览器。 */
@Service
public class ConversationAgentService {
    private final ConversationMemory memory;
    private final ReActAgentService agent;

    public ConversationAgentService(ConversationMemory memory, ReActAgentService agent) {
        this.memory = memory;
        this.agent = agent;
    }

    public ChatResult chat(UUID conversationId, UUID requestId, String message) {
        UUID id = conversationId == null ? memory.create().id() : conversationId;
        UUID request = requestId == null ? UUID.randomUUID() : requestId;
        var started = memory.begin(id, request, message);
        AgentResponse response = started.cachedResponse();
        if (response == null) {
            try {
                response = agent.chat(message, started.history());
            } catch (RuntimeException failure) {
                try { memory.fail(id, request); }
                catch (RuntimeException persistenceFailure) { failure.addSuppressed(persistenceFailure); }
                throw failure;
            }
            // 落库失败不能触发第二次模型/工具执行；保留 RUNNING 供恢复后确认。
            memory.complete(id, request, response);
        }
        return new ChatResult(id, request, response.answer(), response.modelCalls(), response.steps());
    }

    public record ChatResult(UUID conversationId, UUID requestId, String answer, int modelCalls,
                             List<AgentResponse.ToolStep> steps) {}
}
