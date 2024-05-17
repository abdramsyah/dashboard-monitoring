ALTER TABLE purchase_information
    DROP COLUMN invoice_id;

CREATE TABLE invoice_purchase (
    id          BIGSERIAL,
    invoice_id  BIGINT NOT NULL REFERENCES invoices(id),
    purchase_id BIGINT NOT NULL REFERENCES purchase_information(id),
    PRIMARY KEY (id)
);

ALTER TABLE invoices
    ADD COLUMN tax_value BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN fee_value BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN tax_price BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN fee_price BIGINT NOT NULL DEFAULT 0,
    DROP COLUMN tax_id,
    DROP COLUMN fee_id;