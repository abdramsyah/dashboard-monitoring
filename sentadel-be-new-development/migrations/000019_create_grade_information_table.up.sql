CREATE TABLE grade_information (
    id                  BIGSERIAL,
    code_id             BIGINT REFERENCES code_list(id) NULL,
    goods_id            BIGINT REFERENCES goods(id) NOT NULL,
    grade_id            BIGINT REFERENCES grades(id) NOT NULL,
    grade_price         BIGINT NOT NULL,
    grader              VARCHAR(20) NOT NULL,
    unit_price          BIGINT NOT NULL,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by          BIGINT REFERENCES users(id) NOT NULL,
    deleted_at          TIMESTAMP NULL,
    deleted_reason      VARCHAR(100) NULL,
    PRIMARY             KEY(id)
);