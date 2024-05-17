CREATE TABLE repayment (
    id              BIGSERIAL,
    loan_id         BIGINT NOT NULL REFERENCES loan(id),
    value           BIGINT NOT NULL DEFAULT 0,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by      BIGINT NOT NULL REFERENCES users(id),
    description     VARCHAR (100) NULL,
    deleted_at      TIMESTAMP NULL,
    deleted_by      BIGINT NULL REFERENCES users(id),
    delete_reason   VARCHAR(100) NULL,
    PRIMARY KEY (id)
);