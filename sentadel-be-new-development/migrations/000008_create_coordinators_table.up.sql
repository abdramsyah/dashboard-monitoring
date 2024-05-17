CREATE TABLE coordinators (
    id         BIGSERIAL,
    user_id    BIGINT UNIQUE REFERENCES users (id) NOT NULL,
    code       VARCHAR(4) UNIQUE NOT NULL,
    quota      BIGINT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    PRIMARY    KEY(id)
);

CREATE TRIGGER last_upd_trigger
    BEFORE INSERT OR UPDATE ON coordinators
    FOR EACH ROW
EXECUTE PROCEDURE last_upd_trig();