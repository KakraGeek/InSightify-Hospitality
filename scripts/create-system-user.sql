-- Create system user for automated operations
-- Run this in your database directly

INSERT INTO users (id, email, name, password_hash, created_at) 
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'system@insightify.com',
  'System User',
  NULL,
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Verify the user was created
SELECT * FROM users WHERE id = '00000000-0000-0000-0000-000000000000';
