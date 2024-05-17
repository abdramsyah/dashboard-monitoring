ALTER TABLE code_list
    ADD COLUMN client_id BIGINT REFERENCES clients(id),
    ADD COLUMN user_id BIGINT REFERENCES users(id);

CREATE OR REPLACE FUNCTION num_to_char(num BIGINT)
RETURNS TEXT
AS
$$
    WITH dummy(charArr) AS (
        SELECT ARRAY(SELECT JSONB_ARRAY_ELEMENTS_TEXT('["A", "B", "C", "D", "E", "F", "G", "H", "I", "J",
          "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]'))
    ) SELECT charArr[num + 1] from dummy;
$$
LANGUAGE SQL IMMUTABLE STRICT