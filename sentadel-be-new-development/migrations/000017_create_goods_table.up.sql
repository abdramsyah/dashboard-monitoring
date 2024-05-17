CREATE TABLE goods (
    id                BIGSERIAL,
    bucket_id         BIGINT REFERENCES bucket_information(id) NOT NULL,
--     code_id           BIGINT REFERENCES code_list(id) NULL,
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by        BIGINT REFERENCES users(id) NOT NULL,
    PRIMARY           KEY(id)
);