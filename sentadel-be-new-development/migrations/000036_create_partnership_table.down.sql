DROP TABLE partnership;

ALTER TABLE queue_supplies
    DROP CONSTRAINT partnership_checker,
    DROP COLUMN partner_id;