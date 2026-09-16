-- Run this AFTER schema.sql in your Supabase SQL Editor

-- Clinic settings (إعدادات العيادة)
CREATE TABLE IF NOT EXISTS settings (
  id INT PRIMARY KEY DEFAULT 1,
  clinic_name TEXT DEFAULT 'عيادتي',
  clinic_phone TEXT DEFAULT '',
  clinic_address TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now(),
  CHECK (id = 1)
);

INSERT INTO settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public select settings" ON settings
  FOR SELECT USING (true);
CREATE POLICY "Public insert settings" ON settings
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update settings" ON settings
  FOR UPDATE USING (true);
CREATE POLICY "Public delete settings" ON settings
  FOR DELETE USING (true);