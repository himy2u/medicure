-- Add date_of_birth to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Add index for age-based queries
CREATE INDEX IF NOT EXISTS idx_users_dob ON users(date_of_birth);
