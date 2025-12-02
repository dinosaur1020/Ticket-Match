-- 4.1 USER
CREATE TABLE IF NOT EXISTS "USER" (
    user_id     VARCHAR(20) PRIMARY KEY,
    user_name   VARCHAR(50) NOT NULL,
    email       VARCHAR(100) UNIQUE NOT NULL,
    password    TEXT NOT NULL,
    user_status VARCHAR(20) NOT NULL DEFAULT 'Active'
);

-- 4.2 USER_ROLE
CREATE TABLE IF NOT EXISTS USER_ROLE (
    user_id  VARCHAR(20) REFERENCES "USER"(user_id) ON DELETE CASCADE,
    role     VARCHAR(20) NOT NULL,
    PRIMARY KEY (user_id, role)
);

-- 4.3 EVENT
CREATE TABLE IF NOT EXISTS "EVENT" (
    event_id     VARCHAR(20) PRIMARY KEY,
    event_name   VARCHAR(100) NOT NULL,
    venue        VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS EVENT_TIME (
    event_id    VARCHAR(20) REFERENCES EVENT(event_id),
    event_time  TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS PERFORMER (
    event_id   VARCHAR(20) REFERENCES EVENT(event_id),
    performer  VARCHAR(50),
    PRIMARY KEY (event_id, performer)
);

-- 4.4 LISTING
CREATE TABLE IF NOT EXISTS LISTING (
    listing_id   VARCHAR(30) PRIMARY KEY,
    owner_id     VARCHAR(20) REFERENCES "USER"(user_id),
    event_id     VARCHAR(20) REFERENCES EVENT(event_id),
    event_date   DATE NOT NULL,
    content      TEXT,
    status       VARCHAR(20) DEFAULT 'Open',
    type         VARCHAR(20)
);

-- 4.5 TICKET
CREATE TABLE IF NOT EXISTS TICKET (
    ticket_id    VARCHAR(30) PRIMARY KEY,
    event_id     VARCHAR(20) REFERENCES EVENT(event_id),
    owner_id     VARCHAR(20) REFERENCES "USER"(user_id),
    seat_area    VARCHAR(30),
    seat_number  VARCHAR(30),
    price        NUMERIC,
    status       VARCHAR(20) DEFAULT 'Active',
    listing_id   VARCHAR(30) REFERENCES LISTING(listing_id)
);

-- 5. Trade Module (Final Version)
-- 5.1 TRADE
CREATE TABLE IF NOT EXISTS TRADE (
    trade_id    VARCHAR(30) PRIMARY KEY,
    listing_id  VARCHAR(30) REFERENCES LISTING(listing_id),
    status      VARCHAR(20) NOT NULL DEFAULT 'Pending'
        CHECK (status IN ('Pending','Completed','Canceled','Disputed')),
    created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMPTZ
);

-- 5.2 TRADE_PARTICIPANT
CREATE TABLE IF NOT EXISTS TRADE_PARTICIPANT (
    trade_id      VARCHAR(30),
    user_id       VARCHAR(20),
    role          VARCHAR(20)
        CHECK (role IN ('Buyer','Seller','Exchanger')),
    confirmed     BOOLEAN DEFAULT FALSE,
    confirmed_at  TIMESTAMPTZ,
    PRIMARY KEY (trade_id, user_id),
    FOREIGN KEY (trade_id) REFERENCES TRADE(trade_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES "USER"(user_id)
);

-- 5.3 TRADE_TICKET
CREATE TABLE IF NOT EXISTS TRADE_TICKET (
    trade_id      VARCHAR(30),
    ticket_id     VARCHAR(30),
    from_user_id  VARCHAR(20),
    to_user_id    VARCHAR(20),
    PRIMARY KEY (trade_id, ticket_id),
    FOREIGN KEY (trade_id) REFERENCES TRADE(trade_id) ON DELETE CASCADE,
    FOREIGN KEY (ticket_id) REFERENCES TICKET(ticket_id),
    FOREIGN KEY (from_user_id) REFERENCES "USER"(user_id),
    FOREIGN KEY (to_user_id) REFERENCES "USER"(user_id)
);

-- 7. High-Volume Performance Design
-- 7.1 Essential Indexes
CREATE INDEX IF NOT EXISTS idx_listing_event ON LISTING(event_id);
CREATE INDEX IF NOT EXISTS idx_ticket_owner ON TICKET(owner_id);
CREATE INDEX IF NOT EXISTS idx_trade_listing ON TRADE(listing_id);
CREATE INDEX IF NOT EXISTS idx_trade_ticket_ticket ON TRADE_TICKET(ticket_id);

-- Check if admin user exists
SELECT user_id, user_name, email, user_status 
FROM "USER" 
WHERE email = 'admin@ticketmatch.com';

-- Check if admin has the Admin role
SELECT ur.user_id, ur.role, u.email, u.user_name
FROM USER_ROLE ur
JOIN "USER" u ON ur.user_id = u.user_id
WHERE u.email = 'admin@ticketmatch.com';