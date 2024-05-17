CREATE TABLE queue_delivery_list (
    id                      BIGSERIAL,
    queue_delivery_id       BIGINT REFERENCES queue_delivery(id) NOT NULL,
    queue_supplies_id       BIGINT REFERENCES queue_supplies(id) NOT NULL,
    created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              BIGINT REFERENCES users(id) NOT NULL,
    PRIMARY                 KEY (id)
)