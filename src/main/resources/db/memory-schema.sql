-- 本机单实例的会话记忆。首次建表；再次启动保留已有数据。
CREATE TABLE IF NOT EXISTS agent_conversation (
    id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
    owner_key CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    title VARCHAR(80) NOT NULL DEFAULT '新对话',
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    INDEX idx_conversation_owner_updated (owner_key, updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS agent_chat_turn (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    conversation_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    request_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    user_message TEXT NOT NULL,
    status VARCHAR(16) CHARACTER SET ascii NOT NULL,
    response_json JSON NULL,
    error_message VARCHAR(300) NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    completed_at TIMESTAMP(6) NULL,
    UNIQUE KEY uk_turn_request (conversation_id, request_id),
    INDEX idx_turn_context (conversation_id, status, id),
    CONSTRAINT fk_turn_conversation FOREIGN KEY (conversation_id)
        REFERENCES agent_conversation(id) ON DELETE CASCADE,
    CONSTRAINT chk_turn_status CHECK (status IN ('RUNNING', 'COMPLETED', 'FAILED', 'INTERRUPTED')),
    CONSTRAINT chk_turn_response CHECK (
        (status = 'COMPLETED' AND response_json IS NOT NULL) OR
        (status <> 'COMPLETED' AND response_json IS NULL))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
