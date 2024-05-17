CREATE TABLE print_list (
    id                      BIGSERIAL,
    ref_id                  BIGINT NOT NULL,
    type                    print_type_enum,
    print_at                TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    print_by                BIGINT REFERENCES users(id) NOT NULL,
    PRIMARY                 KEY (id)
)