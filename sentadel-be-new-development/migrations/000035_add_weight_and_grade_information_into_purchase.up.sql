ALTER TABLE purchase_information
    ADD COLUMN grade_information_id BIGINT NOT NULL REFERENCES grade_information(id),
    ADD COLUMN weight_information_id BIGINT NOT NULL REFERENCES weight_information(id),
    ADD COLUMN grade_information_excl_id BIGINT[] NULL,
    ADD COLUMN weight_information_excl_id BIGINT[] NULL;