CREATE TYPE invoices_status_enum AS ENUM (
    'APPROVED',
    'REJECTED',
    'PRINTED',
    'CONFIRMED_BY_COORDINATOR'
);