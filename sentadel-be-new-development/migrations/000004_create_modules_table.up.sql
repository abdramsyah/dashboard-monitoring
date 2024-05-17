CREATE TABLE modules(
    id             BIGSERIAL,
    name           VARCHAR(50)    NOT NULL,
    description    VARCHAR(100)   NOT NULL,
    read_only      BOOLEAN        NOT NULL DEFAULT false,
    created_at     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TRIGGER last_upd_trigger
    BEFORE INSERT OR UPDATE ON modules
    FOR EACH ROW
EXECUTE PROCEDURE last_upd_trig();



CREATE TABLE role_modules(
    id_role        BIGINT REFERENCES roles(id) NOT NULL,
    id_module      BIGINT REFERENCES modules(id) NOT NULL,
    created_at     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER last_upd_trigger
    BEFORE INSERT OR UPDATE ON role_modules
    FOR EACH ROW
EXECUTE PROCEDURE last_upd_trig();