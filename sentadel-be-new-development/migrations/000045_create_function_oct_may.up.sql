CREATE OR REPLACE FUNCTION create_purchase_weight(rgw BIGINT) 
RETURNS TABLE (gw BIGINT, nw BIGINT)
AS
$$
    WITH cgw AS (
    	SELECT CASE 
    		WHEN rgw - MOD(rgw, 1000) > 63000 then 63000
    		ELSE rgw - MOD(rgw, 1000)
    	END AS val
    ) SELECT val, CASE
    	WHEN val > 30000 and MOD(val * 20 / 100, 1000) > 0
    		THEN val - ((FLOOR((val * 20 / 100) / 1000) * 1000) + 1000)
    	WHEN val > 30000 and MOD(val * 20 / 100, 1000) = 0
    		THEN val - (FLOOR((val * 20 / 100) / 1000) * 1000)
		ELSE val - 7000
    END
    FROM cgw
$$
LANGUAGE SQL IMMUTABLE STRICT;

CREATE OR REPLACE FUNCTION create_client_weight(rgw BIGINT, client_code TEXT) 
RETURNS BIGINT
AS
$$
    WITH cgw AS (
    	SELECT CASE 
    		WHEN rgw > 63000 then 63000
    		ELSE rgw
    	END AS val
    ) SELECT CASE
	    WHEN client_code = 'DJRM' THEN dwd.net_weight 
    	WHEN val > 30000 AND MOD(val * 20 / 100, 1000) > 0
    		THEN val - ((FLOOR((val * 20 / 100) / 1000) * 1000) + 1000)
    	WHEN val > 30000 AND MOD(val * 20 / 100, 1000) = 0
    		THEN val - (FLOOR((val * 20 / 100) / 1000) * 1000)
		ELSE val - 7000
    END
    FROM cgw
	LEFT JOIN djarum_weight_dictionaries dwd ON dwd.gross_weight = val
$$
LANGUAGE SQL IMMUTABLE STRICT;

CREATE OR REPLACE FUNCTION get_tax_data(pp BIGINT) 
RETURNS TABLE (tax_price BIGINT, tax_value FLOAT8)
AS
$$
    WITH accum AS (
		SELECT (pp * t.value / 100) AS val, 
		MOD((pp * t.value / 100)::INT, 1000) AS mod_val, t.value AS tax_value
		FROM tax t
		WHERE t.deleted_at IS NULL
		LIMIT 1
	) SELECT CASE 
		WHEN mod_val > 0 THEN val + 1000 - mod_val
		ELSE val
	END, tax_value
	FROM accum
$$
LANGUAGE SQL IMMUTABLE STRICT;

CREATE OR REPLACE FUNCTION get_fee_data(qb BIGINT) 
RETURNS TABLE (fee_price BIGINT, fee_value BIGINT)
AS
$$
    SELECT (qb * fs2.value), fs2.value AS fee_value
	FROM fee_scheme fs2
	WHERE fs2.deleted_at IS NULL
	LIMIT 1
$$
LANGUAGE SQL IMMUTABLE STRICT;

CREATE OR REPLACE FUNCTION get_invoice_number(prefix TEXT) 
RETURNS TEXT
AS
$$
	SELECT prefix || '-' || (COUNT(i.id) + 1)
	FROM invoices i 
	WHERE i.invoice_number ILIKE prefix || '%'
$$
LANGUAGE SQL IMMUTABLE STRICT;

CREATE OR REPLACE FUNCTION get_grouping_number(prefix TEXT) 
RETURNS TEXT
AS
$$
	SELECT prefix || '-' || (COUNT(grp.id) + 1)
	FROM "grouping" grp 
	WHERE grp.grouping_number ILIKE prefix || '%'
$$
LANGUAGE SQL IMMUTABLE STRICT;

CREATE OR REPLACE FUNCTION get_shipment_number(prefix TEXT) 
RETURNS TEXT
AS
$$
	SELECT prefix || '-' || (COUNT(sm.id) + 1)
	FROM "shipment" sm 
	WHERE sm.shipment_number ILIKE prefix || '%'
$$
LANGUAGE SQL IMMUTABLE STRICT;











