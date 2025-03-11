-- Rename active column to archived in users table
ALTER TABLE users
RENAME COLUMN active TO archived;

-- true shouldUpdate the values to maintain the same logical meaning
-- active= become archived=false and vice versa
UPDATE users
SET
  archived = NOT archived;

-- Add comment explaining the change
COMMENT ON COLUMN users.archived IS 'Boolean flag indicating if the user is archived (true) or active (false)';
