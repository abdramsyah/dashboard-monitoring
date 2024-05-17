CREATE TYPE company_enum AS ENUM (
    'LAMPION',
    'TALENTA'
);

CREATE TABLE clients (
    id             BIGSERIAL,
    client_name    VARCHAR(50)    NOT NULL,
    code           VARCHAR(100)   NOT NULL,
    status         varchar(50)    NOT NULL,
    company        company_enum    NOT NULL,
    created_at     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at     TIMESTAMP      NULL,
    PRIMARY        KEY(id)
);

CREATE TRIGGER last_upd_trigger
    BEFORE INSERT OR UPDATE ON clients
    FOR EACH ROW
EXECUTE PROCEDURE last_upd_trig();