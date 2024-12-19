-- Convert all timestamp columns to TIMESTAMPTZ with string representation
ALTER TABLE users 
ALTER COLUMN last_online TYPE TIMESTAMPTZ 
USING last_online AT TIME ZONE 'UTC';

ALTER TABLE users 
ALTER COLUMN created_at TYPE TIMESTAMPTZ 
USING created_at AT TIME ZONE 'UTC';

ALTER TABLE status_logs 
ALTER COLUMN created_at TYPE TIMESTAMPTZ 
USING created_at AT TIME ZONE 'UTC'; 