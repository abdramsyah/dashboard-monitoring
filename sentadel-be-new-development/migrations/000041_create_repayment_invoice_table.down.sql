CREATE TABLE loan_invoice (
    id          BIGSERIAL NOT NULL,
    loan_id     BIGINT NOT NULL REFERENCES loan(id),
    invoice_id  BIGINT NOT NULL REFERENCES invoices(id),
    PRIMARY KEY (id)
);

DROP TABLE repayment_invoice;