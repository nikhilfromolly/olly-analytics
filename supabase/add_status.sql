-- Adds paid/trial status to brands, so the Users tab can show both.
ALTER TABLE brands
  ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('paid', 'trial')) DEFAULT 'paid';

-- Existing rows were backfilled from paid companies, so they're all 'paid' already.
-- Add trial brands as new rows, e.g.:
-- INSERT INTO brands (name, status, amplitude_emails) VALUES ('New Trial Brand', 'trial', '{"trial.user@brand.com"}'::text[]);
