CREATE TABLE invoices (
    id               BIGSERIAL,
    coordinator_id   BIGINT REFERENCES coordinators(id) NOT NULL,
    invoice_number   VARCHAR NOT NULL,
    revision         BIGINT NOT NULL,
    tax_id           BIGINT REFERENCES tax(id) NOT NULL,
    fee_id           BIGINT REFERENCES fee_scheme(id) NOT NULL,
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by       BIGINT REFERENCES users(id) NOT NULL,
    deleted_at       TIMESTAMP NULL,
    deleted_reason   VARCHAR(100) NULL,
    PRIMARY          KEY(id)
);