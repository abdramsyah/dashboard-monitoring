CREATE TABLE code_list (
    id                BIGSERIAL,
    code              VARCHAR(8) UNIQUE,
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by        BIGINT REFERENCES users(id) NOT NULL,
    PRIMARY           KEY(id)
);