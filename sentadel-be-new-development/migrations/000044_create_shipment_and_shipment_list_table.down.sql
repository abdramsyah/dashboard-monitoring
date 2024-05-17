DROP TRIGGER delete_shipment ON shipment;

DROP FUNCTION delete_shipment_status();
DROP FUNCTION delete_shipment_list();
DROP FUNCTION on_delete_shipment();

DROP TABLE shipment_status;
DROP TABLE shipment_goods;
DROP TABLE shipment_grouping;
DROP TABLE shipment;
DROP TABLE shipment_address;

DROP TYPE shipment_type_enum;
DROP TYPE shipment_status_enum;