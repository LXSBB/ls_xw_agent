package com.example.reactdemo.agent;

/** 达到执行预算时明确终止，避免模型一直请求工具导致调用失控。 */
public class AgentLimitException extends RuntimeException {

    public AgentLimitException(String message) {
        super(message);
    }
}
