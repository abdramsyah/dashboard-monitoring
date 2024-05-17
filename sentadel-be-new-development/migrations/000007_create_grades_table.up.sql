CREATE TABLE grades (
    id               BIGSERIAL,
    client_id        BIGINT         REFERENCES clients(id),
    grade            VARCHAR(50),
    price            BIGINT,
    quota            BIGINT,
    ub               INT4,
    created_at       TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at       TIMESTAMP      NULL,
    PRIMARY          KEY(id)
);

CREATE TRIGGER last_upd_trigger
    BEFORE INSERT OR UPDATE ON grades
    FOR EACH ROW
EXECUTE PROCEDURE last_upd_trig();