CREATE TABLE tax (
    id          BIGSERIAL,
    tax_name    VARCHAR(35) NOT NULL,
    value       FLOAT NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by  BIGINT REFERENCES users(id) NOT NULL,
    deleted_at  TIMESTAMP NULL,
    PRIMARY     KEY(id)
);