-- ============================================================
-- Migration شاملة: نظام العيادة المتكامل
-- Run AFTER all previous migrations in Supabase SQL Editor
-- ============================================================

-- 1) الأطباء (Multi-doctor)
CREATE TABLE IF NOT EXISTS doctors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  specialty TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public select doctors" ON doctors FOR SELECT USING (true);
CREATE POLICY "Public insert doctors" ON doctors FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update doctors" ON doctors FOR UPDATE USING (true);
CREATE POLICY "Public delete doctors" ON doctors FOR DELETE USING (true);

-- 2) إضافة doctor_id للمواعيد + تذكير
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false;

-- 3) الزيارات الطبية (Consultations)
CREATE TABLE IF NOT EXISTS visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  visit_date DATE NOT NULL,
  diagnosis TEXT DEFAULT '',
  symptoms TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  follow_up_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public select visits" ON visits FOR SELECT USING (true);
CREATE POLICY "Public insert visits" ON visits FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update visits" ON visits FOR UPDATE USING (true);
CREATE POLICY "Public delete visits" ON visits FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS idx_visits_patient ON visits (patient_id);
CREATE INDEX IF NOT EXISTS idx_visits_date ON visits (visit_date);

-- 4) الوصفات الطبية
CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  visit_id UUID REFERENCES visits(id) ON DELETE CASCADE,
  medication TEXT NOT NULL,
  dosage TEXT DEFAULT '',
  frequency TEXT DEFAULT '',
  duration TEXT DEFAULT '',
  instructions TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public select prescriptions" ON prescriptions FOR SELECT USING (true);
CREATE POLICY "Public insert prescriptions" ON prescriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update prescriptions" ON prescriptions FOR UPDATE USING (true);
CREATE POLICY "Public delete prescriptions" ON prescriptions FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS idx_prescriptions_visit ON prescriptions (visit_id);

-- 5) الفواتير
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  visit_id UUID REFERENCES visits(id) ON DELETE SET NULL,
  amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  paid BOOLEAN DEFAULT false,
  payment_method TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public select invoices" ON invoices FOR SELECT USING (true);
CREATE POLICY "Public insert invoices" ON invoices FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update invoices" ON invoices FOR UPDATE USING (true);
CREATE POLICY "Public delete invoices" ON invoices FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS idx_invoices_patient ON invoices (patient_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices (created_at);

-- 6) إضافة doctor_id للإعدادات (الطبيب الافتراضي)
ALTER TABLE settings ADD COLUMN IF NOT EXISTS default_doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS consultation_fee NUMERIC(10, 2) DEFAULT 0;

-- 7) الطبيب الافتراضي الأولي
INSERT INTO doctors (name, specialty) VALUES ('الدكتور', 'عام')
ON CONFLICT DO NOTHING;