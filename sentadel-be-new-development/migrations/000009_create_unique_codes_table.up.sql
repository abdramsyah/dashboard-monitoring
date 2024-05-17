CREATE TABLE unique_codes (
    id               BIGSERIAL,
    code             VARCHAR(100)   NOT NULL UNIQUE,
    created_at       TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    used_at          TIMESTAMP      NULL,
    used_by          BIGINT         REFERENCES users(id) NULL,
    PRIMARY          KEY(id)
);