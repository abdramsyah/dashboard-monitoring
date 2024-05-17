CREATE TABLE goods_status (
    id                BIGSERIAL,
    goods_id          BIGINT REFERENCES goods(id) NOT NULL,
    status            goods_status_enum NOT NULL,
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by        BIGINT REFERENCES users(id) NOT NULL,
    PRIMARY           KEY(id)
);