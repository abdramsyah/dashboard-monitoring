CREATE TABLE purchase_information (
    id                    BIGSERIAL,
    goods_id              BIGINT REFERENCES goods(id) NOT NULL,
    gross_weight          BIGINT NOT NULL,
    net_weight            BIGINT NOT NULL,
    purchase_price        BIGINT NOT NULL,
    created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by            BIGINT REFERENCES users(id) NOT NULL,
    deleted_at            TIMESTAMP NULL,
    deleted_reason        VARCHAR(100) NULL,
    PRIMARY               KEY(id)
);