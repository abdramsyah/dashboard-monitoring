CREATE TABLE user_roles(
    user_id      BIGINT         REFERENCES users(id),
    role_id      BIGINT         REFERENCES roles(id),
    created_at   TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ALTER TABLE user_roles ADD UNIQUE (user_id,role_id);

CREATE TRIGGER last_upd_trigger
    BEFORE INSERT OR UPDATE ON user_roles
    FOR EACH ROW
EXECUTE PROCEDURE last_upd_trig();