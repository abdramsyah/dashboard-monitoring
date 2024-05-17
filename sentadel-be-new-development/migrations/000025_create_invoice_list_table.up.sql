CREATE TABLE invoice_list (
    id                          BIGSERIAL,
    invoice_id                  BIGINT REFERENCES invoices(id) NOT NULL,
    goods_id                    BIGINT REFERENCES goods(id) NOT NULL,
    grade_information_id        BIGINT REFERENCES grade_information(id) NOT NULL,
    weight_information_id       BIGINT REFERENCES weight_information(id) NOT NULL,
    purchase_information_id     BIGINT REFERENCES purchase_information(id) NOT NULL,
    created_at                  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by                  BIGINT REFERENCES users(id) NOT NULL,
    deleted_at                  TIMESTAMP NULL,
    deleted_by                  BIGINT REFERENCES users(id) NULL,
    deleted_reason              VARCHAR(100) NULL,
    PRIMARY                     KEY(id)
);