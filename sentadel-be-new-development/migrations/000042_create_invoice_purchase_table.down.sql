ALTER TABLE purchase_information
    ADD COLUMN invoice_id BIGINT NOT NULL REFERENCES invoices(id) DEFAULT 3;

DROP TABLE invoice_purchase;

ALTER TABLE invoices
    DROP COLUMN tax_value,
    DROP COLUMN fee_value,
    DROP COLUMN tax_price,
    DROP COLUMN fee_price,
    ADD COLUMN tax_id BIGINT NOT NULL REFERENCES tax(id) default 1,
    ADD COLUMN fee_id BIGINT NOT NULL REFERENCES fee_scheme(id) default 1;