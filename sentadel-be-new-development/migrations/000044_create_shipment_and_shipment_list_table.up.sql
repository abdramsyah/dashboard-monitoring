CREATE TYPE shipment_type_enum AS ENUM (
    'GOODS',
    'GROUPING'
);

CREATE TABLE shipment_address (
  id                      BIGSERIAL,
  client_id               BIGINT REFERENCES clients(id) NOT NULL,
  address                 VARCHAR,
  created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by              BIGINT REFERENCES users(id) NOT NULL,
  deleted_at              TIMESTAMP NULL,
  deleted_reason          VARCHAR(100) NULL,
  PRIMARY KEY (id)
);

CREATE TABLE shipment (
  id                      BIGSERIAL,
  shipment_number         VARCHAR NOT NULL,
  shipment_client_number  VARCHAR,
  shipment_type           shipment_type_enum NOT NULL,
  client_id               BIGINT REFERENCES clients(id) NOT NULL,
  address_id              BIGINT REFERENCES shipment_address(id) NOT NULL,
  license_plate           VARCHAR,
  driver                  VARCHAR,
  pic                     VARCHAR,
  created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by              BIGINT REFERENCES users(id) NOT NULL,
  deleted_at              TIMESTAMP NULL,
  deleted_reason          VARCHAR(100) NULL,
  PRIMARY KEY (id)
);

CREATE TYPE shipment_status_enum AS ENUM (
    'LOADING',
    'DELIVERING',
    'DELIVERED'
);

CREATE TABLE shipment_status (
  id                      BIGSERIAL,
  shipment_id             BIGINT REFERENCES shipment(id) NOT NULL,
  status                  shipment_status_enum NOT NULL,   
  created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by              BIGINT REFERENCES users(id) NOT NULL,
  deleted_at              TIMESTAMP NULL,
  deleted_reason          VARCHAR(100) NULL,
  PRIMARY KEY (id)
);

CREATE OR REPLACE FUNCTION delete_shipment_status() RETURNS TRIGGER AS
$BODY$
BEGIN
  UPDATE shipment_status
  SET deleted_at = new.deleted_at,
  deleted_reason = new.deleted_reason
  WHERE shipment_id = new.id;
  RETURN NEW;
END;
$BODY$
language plpgsql;

CREATE TABLE shipment_grouping (
  id                      BIGSERIAL,
  shipment_id             BIGINT REFERENCES shipment(id) NOT NULL,
  grouping_id             BIGINT REFERENCES grouping(id) NOT NULL,
  created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by              BIGINT REFERENCES users(id) NOT NULL,
  deleted_at              TIMESTAMP NULL,
  deleted_reason          VARCHAR(100) NULL,
  PRIMARY KEY (id)
);

CREATE TABLE shipment_goods (
  id                      BIGSERIAL,
  shipment_id             BIGINT REFERENCES shipment(id) NOT NULL,
  grouping_list_id        BIGINT REFERENCES grouping_list(id) NOT NULL,
  created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by              BIGINT REFERENCES users(id) NOT NULL,
  deleted_at              TIMESTAMP NULL,
  deleted_reason          VARCHAR(100) NULL,
  PRIMARY KEY (id)
);

CREATE OR REPLACE FUNCTION delete_shipment_list() RETURNS TRIGGER AS
$BODY$
BEGIN
  IF new.shipment_type = 'GOODS' THEN
    UPDATE shipment_goods
    SET deleted_at = new.deleted_at,
    deleted_reason = new.deleted_reason
    WHERE shipment_id = new.id;
    RETURN NEW;
  ELSE 
    UPDATE shipment_grouping
    SET deleted_at = new.deleted_at,
    deleted_reason = new.deleted_reason
    WHERE shipment_id = new.id;
    RETURN NEW;
  END IF;
END;
$BODY$
language plpgsql;

CREATE OR REPLACE FUNCTION on_delete_shipment() RETURNS TRIGGER AS
$$
BEGIN
  PERFORM delete_shipment_status();
  PERFORM delete_shipment_list();
END;
$$
language plpgsql;

CREATE TRIGGER delete_shipment
AFTER UPDATE OF deleted_at ON shipment
FOR EACH ROW
EXECUTE PROCEDURE on_delete_shipment();