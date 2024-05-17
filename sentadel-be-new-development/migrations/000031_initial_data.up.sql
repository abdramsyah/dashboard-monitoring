WITH create_role(id) AS (
    INSERT INTO roles("name", description) VALUES('SUPERADMIN','Superadmin')
        RETURNING id
), create_module(id) AS (
    INSERT INTO modules("name", description)
        VALUES('USER_MANAGEMENT','Manajemen Pengguna'),
              ('CLIENT_MANAGEMENT','Manajemen Klien'),
              ('GRADE_MANAGEMENT','Manajemen Grade'),
              ('COORDINATOR_MANAGEMENT','Manajemen Koordinator'),
              ('PARTNERSHIP_MANAGEMENT','Manajemen Kemitraan'),
              ('LOAN_MANAGEMENT','Manajemen Pinjaman'),
              ('SUPPLY_POWER_MANAGEMENT','Manajemen Daya Pasok'),
              ('COORDINATOR_PERFORMANCE','Performa Koordinator'),
              ('UNIQUE_CODE','Kode Unik'),
              ('TAX_AND_FEE','Pajak & Potongan')
        RETURNING id
), role_modules_values(role_id, module_id) AS (
    SELECT (SELECT id FROM create_role), id FROM create_module
) INSERT INTO role_modules(id_role, id_module)
SELECT role_id, module_id FROM role_modules_values rmv
WHERE rmv.role_id = role_id;

WITH create_role(id) AS (
    INSERT INTO roles("name", description) VALUES('OPERATIONAL_ADMINISTRATOR','Admin Operasional')
        RETURNING id
), create_module(id) AS (
    INSERT INTO modules("name", description)
        VALUES('POUR_OUT','Numplek'),
              ('GRADING','Grading'),
              ('WEIGH','Timbangan'),
              ('GROUPING','Gulungan'),
              ('GROUPING_SHIPMENT','Pengiriman Gulungan'),
              ('SHIPMENT','Pengiriman')
        RETURNING id
), role_modules_values(role_id, module_id) AS (
    SELECT (SELECT id FROM create_role), id FROM create_module
) INSERT INTO role_modules(id_role, id_module)
SELECT role_id, module_id FROM role_modules_values rmv
WHERE rmv.role_id = role_id;

WITH create_role(id) AS (
    INSERT INTO roles("name", description) VALUES('COORDINATOR_ADMINISTRATOR','Admin Koordinator')
        RETURNING id
), create_module(id) AS (
    INSERT INTO modules("name", description)
        VALUES('QUEUE_MANAGEMENT','Manajemen Antrian'),
              ('QUEUE_HISTORY','Riwayat Antrian'),
              ('BARCODE_SELLING_SYSTEM','Sistem Barcode Penjualan')
        RETURNING id
), role_modules_values(role_id, module_id) AS (
    SELECT (SELECT id FROM create_role), id FROM create_module
) INSERT INTO role_modules(id_role, id_module)
SELECT role_id, module_id FROM role_modules_values rmv
WHERE rmv.role_id = role_id;

WITH create_role(id) AS (
    INSERT INTO roles("name", description) VALUES('PURCHASE_ADMINISTRATOR','Admin Pembelian')
        RETURNING id
), create_module(id) AS (
    INSERT INTO modules("name", description)
        VALUES('PAYMENT_MANAGEMENT','Manajemen Pembayaran'),
              ('PENDING_VALIDATION','Menunggu Validasi')
        RETURNING id
), role_modules_values(role_id, module_id) AS (
    SELECT (SELECT id FROM create_role), id FROM create_module
) INSERT INTO role_modules(id_role, id_module)
SELECT role_id, module_id FROM role_modules_values rmv
WHERE rmv.role_id = role_id;

WITH create_role(id) AS (
    INSERT INTO roles("name", description) VALUES('STOCK_ADMINISTRATOR','Admin Stok')
        RETURNING id
), create_module(id) AS (
    INSERT INTO modules("name", description)
        VALUES('STOCK_SUMMARY','Ringkasan Stok'),
              ('GOODS_TABLE','Tabel Barang')
        RETURNING id
), role_modules_values(role_id, module_id) AS (
    SELECT (SELECT id FROM create_role), id FROM create_module
) INSERT INTO role_modules(id_role, id_module)
SELECT role_id, module_id FROM role_modules_values rmv
WHERE rmv.role_id = role_id;

WITH create_role(id) AS (
    INSERT INTO roles("name", description) VALUES('SALES_ADMINISTRATOR','Admin Penjualan')
        RETURNING id
), create_module(id) AS (
    INSERT INTO modules("name", description)
        VALUES('GROUPING_MANAGEMENT','Manajemen Gulungan'),
        ('GROUPING_SHIPMENT_MANAGEMENT','Manajemen Pengiriman Gulungan'),
        ('SHIPMENT_MANAGEMENT','Manajemen Pengiriman')
        RETURNING id
), role_modules_values(role_id, module_id) AS (
    SELECT (SELECT id FROM create_role), id FROM create_module
) INSERT INTO role_modules(id_role, id_module)
SELECT role_id, module_id FROM role_modules_values rmv
WHERE rmv.role_id = role_id;

WITH create_role(id) AS (
    INSERT INTO roles("name", description) VALUES('ACCOUNTING_ADMINISTRATOR','Admin Akuntansi')
        RETURNING id
), create_module(id) AS (
    INSERT INTO modules("name", description)
        VALUES('INVOICE_APPROVAL','Persetujuan Invoice'),
              ('SELL_BUY_DIFFERENCES','Selisih Jual-Bayar')
        RETURNING id
), role_modules_values(role_id, module_id) AS (
    SELECT (SELECT id FROM create_role), id FROM create_module
) INSERT INTO role_modules(id_role, id_module)
SELECT role_id, module_id FROM role_modules_values rmv
WHERE rmv.role_id = role_id;

WITH create_role(id) AS (
    INSERT INTO roles("name", description) VALUES('GENERAL','Umum')
        RETURNING id
), create_module(id) AS (
    INSERT INTO modules("name", description)
        VALUES('INFORMATION_CHECKER','Cek Informasi')
        RETURNING id
), role_modules_values(role_id, module_id) AS (
    SELECT (SELECT id FROM create_role), id FROM create_module
) INSERT INTO role_modules(id_role, id_module)
SELECT role_id, module_id FROM role_modules_values rmv
WHERE rmv.role_id = role_id;

WITH create_role(id) AS (
    INSERT INTO roles("name", description) VALUES('REMUNERATION_ADMINISTRATOR','Admin Remunerasi')
        RETURNING id
), create_module(id) AS (
    INSERT INTO modules("name", description)
        VALUES('EMPLOYEE_MANAGEMENT','Manajemen Karyawan'),
              ('PRESENCE','Kehadiran')
        RETURNING id
), role_modules_values(role_id, module_id) AS (
    SELECT (SELECT id FROM create_role), id FROM create_module
) INSERT INTO role_modules(id_role, id_module)
SELECT role_id, module_id FROM role_modules_values rmv
WHERE rmv.role_id = role_id;

WITH create_user(id) AS (
    INSERT INTO users(number_id, "name", email, phone_number, username, "password", photo, status, is_super)
        VALUES('123456', 'Super Admin Default', 'superadmindefault@cmail.com', '082212365236',
               'superadmindefault', '$2a$10$YhNv1opD154KsrBO24ZSKO3mP4jfW2GkZON/KhJfqr3iHyINqXBaO',
               '', 'ACTIVE', true)
        RETURNING id
), get_superadmin(user_id, role_id) AS (
    SELECT (SELECT id FROM create_user), r.id FROM roles r
    WHERE r."name" = 'SUPERADMIN'
), create_user_roles AS (
    INSERT INTO user_roles(user_id, role_id)
        SELECT * FROM get_superadmin gs
        WHERE gs.user_id = user_id
), get_modules(user_id, module_id) AS (
    SELECT (SELECT * FROM create_user), m.id FROM modules m
    WHERE m."name" IN ('USER_MANAGEMENT', 'CLIENT_MANAGEMENT','GRADE_MANAGEMENT',
                       'COORDINATOR_MANAGEMENT', 'PARTNERSHIP_MANAGEMENT', 'LOAN_MANAGEMENT',
                       'SUPPLY_POWER_MANAGEMENT', 'COORDINATOR_PERFORMANCE',
                       'UNIQUE_CODE','TAX_AND_FEE')
) INSERT INTO user_modules(user_id, module_id)
SELECT * FROM get_modules gm
WHERE gm.user_id = user_id;