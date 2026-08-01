-- Standalone brand table for Product Analytics, replacing the CRM `companies`
-- table as the source of amplitude email -> brand name mapping.
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  status TEXT CHECK (status IN ('paid', 'trial')) DEFAULT 'paid',
  plan TEXT CHECK (plan IN ('Lite', 'Growth', 'Pro')),
  billing_cycle TEXT CHECK (billing_cycle IN ('Monthly', 'Yearly')),
  amount NUMERIC,
  amplitude_emails TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE brands DISABLE ROW LEVEL SECURITY;

-- One-time backfill from companies, if that table still exists:
-- INSERT INTO brands (name, plan, billing_cycle, amount, amplitude_emails)
-- SELECT name, plan, billing_cycle, amount, amplitude_emails FROM companies
-- WHERE plan IS NOT NULL AND amount > 0;

-- Supabase doesn't auto-grant API access to tables created via the SQL
-- editor (unlike tables made through the dashboard UI) — without this,
-- the anon key gets 0 rows back even though the data exists.
GRANT SELECT, INSERT, UPDATE, DELETE ON brands TO anon, authenticated;
