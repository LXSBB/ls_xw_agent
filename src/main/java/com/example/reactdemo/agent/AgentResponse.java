package com.example.reactdemo.agent;

import java.util.List;

/** steps 仅展示真实的工具调用和返回值，不包含模型的内部推理文本。 */
public record AgentResponse(String answer, int modelCalls, List<ToolStep> steps) {

    public record ToolStep(int round, String toolCallId, String tool,
                           String arguments, String observation) {
    }
}
