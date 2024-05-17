CREATE TABLE repayment_invoice (
    id          BIGSERIAL NOT NULL,
    repayment_id     BIGINT NOT NULL REFERENCES repayment(id),
    invoice_id  BIGINT NOT NULL REFERENCES invoices(id),
    PRIMARY KEY (id)
);

DROP TABLE loan_invoice;