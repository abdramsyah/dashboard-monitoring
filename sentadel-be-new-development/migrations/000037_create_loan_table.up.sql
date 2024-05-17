CREATE TYPE reference_type_enum AS ENUM (
    'COORDINATOR',
    'PARTNER'
);

CREATE TABLE loan (
    id              BIGSERIAL,
    code            VARCHAR(8) NOT NULL,
    loan_principal  BIGINT NOT NULL DEFAULT 0,
    total           BIGINT NOT NULL DEFAULT 0,
    reference_type  reference_type_enum NOT NULL,
    reference_id    BIGINT NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by      BIGINT NOT NULL REFERENCES users(id),
    description     VARCHAR (100) NULL,
    deleted_at      TIMESTAMP NULL,
    deleted_by      BIGINT NULL REFERENCES users(id),
    delete_reason   VARCHAR(100) NULL,
    PRIMARY KEY (id),
    CONSTRAINT check_min_length CHECK (length(code) = 8)
);