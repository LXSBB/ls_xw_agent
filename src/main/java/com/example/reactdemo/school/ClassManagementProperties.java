package com.example.reactdemo.school;

import java.util.Map;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** 本机单账号的服务配置；凭证不进入模型参数、工具结果或浏览器响应。 */
@ConfigurationProperties("lingshi")
public record ClassManagementProperties(String socialBaseUrl, String token, String instId,
                                        String serverId, String userId, String instCode,
                                        Map<String, String> headers) {
}
