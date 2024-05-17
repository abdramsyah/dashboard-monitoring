CREATE TABLE queue_delivery (
    id                      BIGSERIAL,
    delivery_number         VARCHAR(18) NOT NULL,
    scheduled_arrival_date  TIMESTAMP NOT NULL,
    created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              BIGINT REFERENCES users(id) NOT NULL,
    PRIMARY                 KEY (id)
)