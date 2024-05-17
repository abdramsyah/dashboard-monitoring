CREATE TABLE user_modules(
    user_id           BIGINT      REFERENCES users(id) NOT NULL,
    module_id         BIGINT      REFERENCES modules(id) NOT NULL,
    read_only         BOOLEAN     NOT NULL DEFAULT false,
    created_at        TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER last_upd_trigger
    BEFORE INSERT OR UPDATE ON user_modules
    FOR EACH ROW
EXECUTE PROCEDURE last_upd_trig();