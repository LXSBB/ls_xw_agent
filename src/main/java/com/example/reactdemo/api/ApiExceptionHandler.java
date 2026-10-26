package com.example.reactdemo.api;

import java.util.UUID;

import com.example.reactdemo.agent.AgentLimitException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.dao.DataAccessException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/** HTTP 错误边界：客户端输入错误保留 Spring 的 400，执行错误返回可关联的错误编号。 */
@RestControllerAdvice
public class ApiExceptionHandler extends ResponseEntityExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

    @ExceptionHandler(DataAccessException.class)
    public ProblemDetail handleDatabase(DataAccessException exception) {
        String errorId = UUID.randomUUID().toString();
        log.warn("Memory storage failed: errorId={}, type={}", errorId, exception.getClass().getSimpleName());
        var problem = ProblemDetail.forStatusAndDetail(HttpStatus.SERVICE_UNAVAILABLE,
                "会话存储不可用，请检查 MySQL 后刷新查看；若涉及创建，请先查询核实，不要重复提交。");
        problem.setProperty("errorId", errorId);
        return problem;
    }

    @ExceptionHandler(AgentLimitException.class)
    public ProblemDetail handleLimit(AgentLimitException exception) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.UNPROCESSABLE_CONTENT, exception.getMessage());
    }

    @ExceptionHandler(RuntimeException.class)
    public ProblemDetail handleExecution(RuntimeException exception) {
        String errorId = UUID.randomUUID().toString();
        // 不把供应商原始响应或异常消息直接返回或写入日志，避免其中夹带请求内容。
        log.warn("Agent execution failed: errorId={}, type={}", errorId, exception.getClass().getSimpleName());
        var problem = ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR,
                "Agent 执行失败，请检查模型配置、网络和工具参数；可通过 errorId 关联日志。");
        problem.setProperty("errorId", errorId);
        return problem;
    }
}
