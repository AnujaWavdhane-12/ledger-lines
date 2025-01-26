CREATE TABLE IF NOT EXISTS propio_transactions (
    transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
    city_state TEXT,
    plaid_detailed TEXT,
    plaid_transaction_id TEXT UNIQUE,
    plaid_account_id TEXT,
    plaid_category TEXT,
    plaid_category_id TEXT,
    plaid_merchant_name TEXT,
    plaid_payment_channel TEXT,
    plaid_name TEXT,
    plaid_amount REAL,
    plaid_iso_currency_code TEXT,
    plaid_pending INTEGER,
    plaid_transaction_type TEXT,
    plaid_date TEXT,
    plaid_authorized_date TEXT,
    client_id INTEGER,
    suggestion_id INTEGER
);

CREATE TABLE IF NOT EXISTS propio_clients (
    client_id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_first_name TEXT,
    contact_last_name TEXT,
    contact_email TEXT,
    whatsapp_phone_number TEXT,
    whatsapp_identity TEXT,
    link_id TEXT UNIQUE,
    live_financial_worksheet_url TEXT UNIQUE,
    preferred_communication TEXT CHECK(preferred_communication IN ('SMS', 'Email', 'WhatsApp')),
    organization_id INTEGER
);


-- INSERT INTO propio_clients (
--     contact_first_name,
--     contact_last_name,
--     contact_email,
--     whatsapp_phone_number,
--     preferred_communication,
--     organization_id
-- ) VALUES 
--     ('John', 'Smith', 'john.smith@example.com', '+14155552671', 'WhatsApp', 1001),
--     ('Sarah', 'Johnson', 'sarah.j@example.com', '+14155552672', 'SMS', 1002),
--     ('Michael', 'Brown', 'michael.b@example.com', '+14155552673', 'Email', 1003),
--     ('Emily', 'Davis', 'emily.davis@example.com', '+14155552674', 'WhatsApp', 1004),
--     ('David', 'Wilson', 'david.w@example.com', '+14155552675', 'SMS', 1005);
-- 