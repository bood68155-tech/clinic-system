-- Run this SQL in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Patients (المرضى)
CREATE TABLE IF NOT EXISTS patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Appointments (المواعيد)
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME NOT NULL,
  reason TEXT DEFAULT '',
  status TEXT DEFAULT 'booked' CHECK (status IN ('booked', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (date, time)
);

-- Enable Row Level Security
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Allow anyone to book (public booking flow)
CREATE POLICY "Public insert patients" ON patients
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Public select patients" ON patients
  FOR SELECT USING (true);

CREATE POLICY "Public insert appointments" ON appointments
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Public select appointments" ON appointments
  FOR SELECT USING (true);
CREATE POLICY "Public update appointments" ON appointments
  FOR UPDATE USING (true);
CREATE POLICY "Public delete appointments" ON appointments
  FOR DELETE USING (true);

-- Indexes for fast slot lookups
CREATE INDEX IF NOT EXISTS idx_appointments_date_time ON appointments (date, time);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients (phone);