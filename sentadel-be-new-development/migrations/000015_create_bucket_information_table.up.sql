CREATE TABLE bucket_information (
    id                BIGSERIAL,
    queue_supplies_id BIGINT REFERENCES queue_supplies(id) NOT NULL,
    serial_number     VARCHAR(20) NOT NULL DEFAULT '-',
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by        BIGINT REFERENCES users(id) NOT NULL,
    deleted_at        TIMESTAMP NULL,
    deleted_by        BIGINT REFERENCES users(id) NULL,
    deleted_reason    VARCHAR(100) NULL,
    scanned_at        TIMESTAMP NULL,
    PRIMARY           KEY(id)
);