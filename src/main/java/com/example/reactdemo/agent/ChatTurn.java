package com.example.reactdemo.agent;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** 模型使用的历史文本；由服务端从已完成轮次读取，旧 history 输入仅保留校验以明确拒绝。 */
public record ChatTurn(
        @NotBlank @Pattern(regexp = "user|assistant", message = "历史角色只允许 user 或 assistant") String role,
        @NotBlank @Size(max = 12000, message = "单条历史消息最多 12000 个字符") String content) {
}
