CREATE TABLE queue_supplies (
    id                      BIGSERIAL,
    coordinator_id          BIGINT        REFERENCES coordinators(id) NOT NULL,
    farmer_name             VARCHAR(50)   NOT NULL,
    product_type            VARCHAR(50)   NOT NULL,
    quantity_bucket         BIGINT        NOT NULL,
    created_at              TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status                  VARCHAR(30)   NOT NULL,
    status_date             TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status_changed_by       BIGINT        REFERENCES users(id) NULL,
    PRIMARY                 KEY(id)
);