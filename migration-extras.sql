-- Run this AFTER schema.sql + migration-settings.sql in your Supabase SQL Editor

-- 1) Add clinic logo field to settings
ALTER TABLE settings ADD COLUMN IF NOT EXISTS clinic_logo TEXT DEFAULT '';

-- 2) WhatsApp conversation memory (جلسات محادثة واتساب لكل مريض)
CREATE TABLE IF NOT EXISTS whatsapp_sessions (
  phone TEXT PRIMARY KEY,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE whatsapp_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public select whatsapp_sessions" ON whatsapp_sessions
  FOR SELECT USING (true);
CREATE POLICY "Public insert whatsapp_sessions" ON whatsapp_sessions
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update whatsapp_sessions" ON whatsapp_sessions
  FOR UPDATE USING (true);
CREATE POLICY "Public delete whatsapp_sessions" ON whatsapp_sessions
  FOR DELETE USING (true);

-- 3) Public storage bucket for clinic images (رفع صور العيادة)
INSERT INTO storage.buckets (id, name, public)
VALUES ('clinic-images', 'clinic-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public upload clinic images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'clinic-images');
CREATE POLICY "Public select clinic images" ON storage.objects
  FOR SELECT USING (bucket_id = 'clinic-images');
CREATE POLICY "Public update clinic images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'clinic-images');
CREATE POLICY "Public delete clinic images" ON storage.objects
  FOR DELETE USING (bucket_id = 'clinic-images');