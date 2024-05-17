CREATE TABLE partnership (
    id              BIGSERIAL,
    name            VARCHAR (50) NOT NULL,
    quota           BIGINT NOT NULL DEFAULT 0,
    coordinator_id  BIGINT REFERENCES coordinators(id) NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP NULL,
    PRIMARY KEY (id)
);

ALTER TABLE queue_supplies
    ADD COLUMN partner_id BIGINT,
    ADD CONSTRAINT partnership_checker CHECK ( product_type = 'Kemitraan' AND partner_id IS NOT NULL);

CREATE TRIGGER last_upd_trigger
    BEFORE INSERT OR UPDATE ON partnership
    FOR EACH ROW
EXECUTE PROCEDURE last_upd_trig();