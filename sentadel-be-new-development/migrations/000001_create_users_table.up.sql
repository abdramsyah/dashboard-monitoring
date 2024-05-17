CREATE TABLE users(
      id             BIGSERIAL,
      number_id      VARCHAR(50)    UNIQUE  NOT NULL,
      name           VARCHAR(50)    NOT NULL,
      email          VARCHAR(50)    UNIQUE  NOT NULL,
      phone_number   VARCHAR(20)    NOT NULL,
      username       VARCHAR(50)    UNIQUE  NOT NULL,
      password       VARCHAR(100)   NOT NULL,
      photo          VARCHAR(100),
      status         VARCHAR(50)    NOT NULL,
      is_super       BOOLEAN        NOT NULL DEFAULT FALSE,
      created_at     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
      deleted_at     TIMESTAMP      NULL,
      PRIMARY        KEY(id)
);

CREATE FUNCTION last_upd_trig() RETURNS trigger
    LANGUAGE plpgsql AS
$$BEGIN
    NEW.updated_at := current_timestamp;
    RETURN NEW;
END;$$;

CREATE TRIGGER last_upd_trigger
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW
EXECUTE PROCEDURE last_upd_trig();