package com.example.reactdemo.api;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.example.reactdemo.agent.ChatTurn;
import com.example.reactdemo.memory.ConversationAgentService;
import com.example.reactdemo.memory.ConversationMemory;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/agent")
public class AgentController {

    private final ConversationAgentService agentService;
    private final ConversationMemory memory;
    private final String model;

    public AgentController(ConversationAgentService agentService, ConversationMemory memory,
                           @Value("${spring.ai.openai.chat.model}") String model) {
        this.agentService = agentService;
        this.memory = memory;
        this.model = model;
    }

    @GetMapping("/info")
    public Map<String, String> info() {
        // 页面只读取模型名称，不向浏览器发送 Key 或其他连接配置。
        return Map.of("model", model, "displayName",
                "deepseek-flash".equals(model) ? "DeepSeek-V4.1-Flash-1017" : model);
    }

    @PostMapping("/chat")
    public ConversationAgentService.ChatResult chat(@Valid @RequestBody ChatRequest request) {
        return agentService.chat(request.conversationId(), request.requestId(), request.message().trim());
    }

    @PostMapping("/conversations")
    public ConversationMemory.ConversationSummary createConversation() { return memory.create(); }

    @GetMapping("/conversations")
    public List<ConversationMemory.ConversationSummary> conversations() { return memory.list(); }

    @GetMapping("/conversations/{id}")
    public ConversationMemory.ConversationView conversation(@PathVariable UUID id) { return memory.read(id); }

    @DeleteMapping("/conversations/{id}")
    public void deleteConversation(@PathVariable UUID id) { memory.delete(id); }

    // 在 HTTP 输入边界检查空值和长度，业务层不用重复校验同一份用户输入。
    public record ChatRequest(
            @NotBlank(message = "message 不能为空")
            @Size(max = 2000, message = "message 最多 2000 个字符") String message,
            UUID conversationId, UUID requestId,
            @Size(max = 0, message = "历史已由服务端保存，请使用 conversationId 继续会话，不再传入 history")
            List<@NotNull @Valid ChatTurn> history) {
    }
}
