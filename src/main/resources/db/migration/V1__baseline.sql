CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(120) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(120) NOT NULL,
    role VARCHAR(16) NOT NULL,
    CONSTRAINT uk_users_email UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS questions (
    id BIGINT PRIMARY KEY,
    text VARCHAR(255) NOT NULL,
    options_serialized VARCHAR(2000) NOT NULL,
    correct_option INTEGER NOT NULL,
    topic VARCHAR(255) NOT NULL,
    difficulty INTEGER NOT NULL,
    weight INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS quizzes (
    code VARCHAR(16) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    question_ids_csv VARCHAR(1000) NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
    session_id VARCHAR(16) PRIMARY KEY,
    quiz_code VARCHAR(16) NOT NULL,
    host_user_id BIGINT NOT NULL,
    state VARCHAR(16) NOT NULL,
    question_duration_seconds INTEGER NOT NULL,
    start_epoch_ms BIGINT,
    paused_at_epoch_ms BIGINT,
    forced_question_index BIGINT,
    last_persisted_touch_epoch_ms BIGINT NOT NULL,
    last_activity_epoch_ms BIGINT NOT NULL,
    CONSTRAINT fk_sessions_host_user FOREIGN KEY (host_user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS players (
    participant_id VARCHAR(64) PRIMARY KEY,
    session_id VARCHAR(16) NOT NULL,
    user_id BIGINT,
    participant_name VARCHAR(255) NOT NULL,
    score INTEGER NOT NULL,
    score_history_csv VARCHAR(4000) NOT NULL,
    CONSTRAINT fk_players_session FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE,
    CONSTRAINT fk_players_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS results (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    session_id VARCHAR(16) NOT NULL,
    participant_id VARCHAR(64) NOT NULL,
    question_index INTEGER NOT NULL,
    question_id BIGINT NOT NULL,
    correct BOOLEAN NOT NULL,
    score_after_answer INTEGER NOT NULL,
    submitted_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_result_submission UNIQUE (session_id, participant_id, question_index),
    CONSTRAINT fk_results_session FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quiz_results (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    quiz_code VARCHAR(16) NOT NULL,
    participant_id VARCHAR(64) NOT NULL,
    participant_name VARCHAR(255) NOT NULL,
    score INTEGER NOT NULL,
    submitted_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_sessions_last_activity ON sessions(last_activity_epoch_ms);
CREATE INDEX idx_players_session_id ON players(session_id);
CREATE INDEX idx_results_session_question ON results(session_id, question_index);
CREATE INDEX idx_quiz_results_quiz_code ON quiz_results(quiz_code);
