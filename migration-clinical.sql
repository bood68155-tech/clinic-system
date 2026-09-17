-- ============================================================
-- Migration إكلينيكية: مخطط الأسنان، الأشعة، خطط العلاج والوصفات
-- Run AFTER schema.sql + migration-settings.sql + migration-extras.sql + migration-full.sql
-- في Supabase SQL Editor
-- ============================================================

-- 1) مخطط الأسنان التفاعلي — صف واحد لكل سن لكل مريض
CREATE TABLE IF NOT EXISTS tooth_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  tooth_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'healthy',
  note TEXT DEFAULT '',
  history JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (patient_id, tooth_code)
);

ALTER TABLE tooth_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public select tooth_records" ON tooth_records;
CREATE POLICY "Public select tooth_records" ON tooth_records FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert tooth_records" ON tooth_records;
CREATE POLICY "Public insert tooth_records" ON tooth_records FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public update tooth_records" ON tooth_records;
CREATE POLICY "Public update tooth_records" ON tooth_records FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Public delete tooth_records" ON tooth_records;
CREATE POLICY "Public delete tooth_records" ON tooth_records FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS idx_tooth_records_patient ON tooth_records (patient_id);

-- 2) خطط العلاج والتكلفة (البنود والأقساط داخل JSONB)
CREATE TABLE IF NOT EXISTS treatment_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  title TEXT DEFAULT '',
  status TEXT DEFAULT 'draft',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  discount NUMERIC(10, 2) DEFAULT 0,
  down_payment NUMERIC(10, 2) DEFAULT 0,
  installments INT DEFAULT 1,
  start_date DATE,
  paid_installments JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE treatment_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public select treatment_plans" ON treatment_plans;
CREATE POLICY "Public select treatment_plans" ON treatment_plans FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert treatment_plans" ON treatment_plans;
CREATE POLICY "Public insert treatment_plans" ON treatment_plans FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public update treatment_plans" ON treatment_plans;
CREATE POLICY "Public update treatment_plans" ON treatment_plans FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Public delete treatment_plans" ON treatment_plans;
CREATE POLICY "Public delete treatment_plans" ON treatment_plans FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS idx_treatment_plans_patient ON treatment_plans (patient_id);
CREATE INDEX IF NOT EXISTS idx_treatment_plans_created ON treatment_plans (created_at);

-- 3) نتائج تحليل الأشعة (ملاحظات التشخيص المحاكية أو من Gemini)
CREATE TABLE IF NOT EXISTS xray_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  image_url TEXT DEFAULT '',
  source TEXT DEFAULT 'simulator',
  findings JSONB NOT NULL DEFAULT '[]'::jsonb,
  summary TEXT DEFAULT '',
  quality_score INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE xray_analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public select xray_analyses" ON xray_analyses;
CREATE POLICY "Public select xray_analyses" ON xray_analyses FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert xray_analyses" ON xray_analyses;
CREATE POLICY "Public insert xray_analyses" ON xray_analyses FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public update xray_analyses" ON xray_analyses;
CREATE POLICY "Public update xray_analyses" ON xray_analyses FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Public delete xray_analyses" ON xray_analyses;
CREATE POLICY "Public delete xray_analyses" ON xray_analyses FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS idx_xray_analyses_patient ON xray_analyses (patient_id);

-- 4) ربط الوصفات بالمريض مباشرة (مطلوب للوصفات السريعة بدون زيارة)
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS patient_id UUID REFERENCES patients(id) ON DELETE CASCADE;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions (patient_id);
