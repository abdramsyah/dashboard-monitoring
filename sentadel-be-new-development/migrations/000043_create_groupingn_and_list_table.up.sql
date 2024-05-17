CREATE TABLE grouping (
  id                  BIGSERIAL,
  grouping_number     VARCHAR NOT NULL,
  client_id           BIGINT REFERENCES clients(id) NOT NULL,
  grade_initial       VARCHAR(1) NOT NULL,
  ub                  BIGINT NOT NULL DEFAULT 0,
  client_number       VARCHAR,
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by          BIGINT REFERENCES users(id) NOT NULL,
  deleted_at          TIMESTAMP NULL,
  deleted_reason      VARCHAR(100) NULL,
  PRIMARY KEY (id)
);

CREATE TABLE grouping_list (
  id                          BIGSERIAL,
  grouping_id                 BIGINT REFERENCES grouping(id) NOT NULL,
  goods_id                    BIGINT REFERENCES goods(id) NOT NULL,
  grade_information_id        BIGINT REFERENCES grade_information(id) NOT NULL,
  weight_information_id       BIGINT REFERENCES weight_information(id) NOT NULL,
  -- purchase_information_id     BIGINT REFERENCES purchase_information(id) NOT NULL,
  created_at                  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by                  BIGINT REFERENCES users(id) NOT NULL,
  deleted_at                  TIMESTAMP NULL,
  deleted_by                  BIGINT REFERENCES users(id) NULL,
  deleted_reason              VARCHAR(100) NULL,
  PRIMARY KEY (id),
  CONSTRAINT deleted_checker CHECK (
      (deleted_at IS NULL AND deleted_by IS NULL AND deleted_reason IS NULL) 
      OR (deleted_at IS NOT NULL AND deleted_by IS NOT NULL AND deleted_reason IS NOT NULL)) 

);

CREATE OR REPLACE FUNCTION delete_grouping_list() RETURNS TRIGGER AS
$BODY$
BEGIN
  UPDATE grouping_list
  SET deleted_at = new.deleted_at,
  deleted_reason = new.deleted_reason
  WHERE grouping_id = new.id;
  RETURN NEW;
END;
$BODY$
language plpgsql;

CREATE TRIGGER delete_grouping
AFTER UPDATE OF deleted_at ON grouping
FOR EACH ROW
EXECUTE PROCEDURE delete_grouping_list();