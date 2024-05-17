CREATE TABLE roles(
      id             BIGSERIAL,
      name           VARCHAR (50)   NOT NULL,
      description    VARCHAR (100)  NOT NULL,
      created_at     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
);

CREATE TRIGGER last_upd_trigger
    BEFORE INSERT OR UPDATE ON roles
    FOR EACH ROW
EXECUTE PROCEDURE last_upd_trig();