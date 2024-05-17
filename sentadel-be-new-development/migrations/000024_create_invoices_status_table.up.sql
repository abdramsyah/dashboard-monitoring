CREATE TABLE invoices_status (
    id                BIGSERIAL,
    invoice_id        BIGINT REFERENCES invoices(id) NOT NULL,
    status            invoices_status_enum NOT NULL,
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by        BIGINT REFERENCES users(id) NOT NULL,
    PRIMARY           KEY(id)
);