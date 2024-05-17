DROP TABLE invoice_list;

ALTER TABLE purchase_information
    ADD COLUMN invoice_id BIGINT NOT NULL REFERENCES invoices(id);

CREATE TABLE loan_invoice (
    id          BIGSERIAL NOT NULL,
    loan_id     BIGINT NOT NULL REFERENCES loan(id),
    invoice_id  BIGINT NOT NULL REFERENCES invoices(id),
    PRIMARY KEY (id)
);

ALTER TABLE invoices
    DROP COLUMN coordinator_id,
    ADD COLUMN queue_delivery_id BIGINT NOT NULL REFERENCES queue_delivery(id);