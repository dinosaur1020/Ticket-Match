-- Create initial admin account
-- Replace the values below with your desired admin credentials

-- Insert admin user
INSERT INTO "USER" (user_id, user_name, email, password, user_status)
VALUES ('ADM001', 'Admin', 'admin@ticketmatch.com', 'admin123', 'Active')
ON CONFLICT (email) DO NOTHING;

-- Add Admin role
INSERT INTO USER_ROLE (user_id, role)
VALUES ('ADM001', 'Admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- You can also promote an existing user to admin:
-- INSERT INTO USER_ROLE (user_id, role)
-- VALUES ('USR675499', 'Admin')  -- Replace with actual user_id
-- ON CONFLICT (user_id, role) DO NOTHING;