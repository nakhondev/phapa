-- =============================================
-- Pha Pa Donation Management Schema
-- =============================================

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  target_amount NUMERIC(12,2) DEFAULT 0,
  event_date DATE,
  location TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User profiles (linked to auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'เจ้าหน้าที่',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Donations table
CREATE TABLE IF NOT EXISTS donations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  donor_name TEXT NOT NULL,
  donor_phone TEXT,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  note TEXT,
  donation_type TEXT DEFAULT 'cash' CHECK (donation_type IN ('cash', 'transfer', 'other')),
  is_anonymous BOOLEAN DEFAULT false,
  processed_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Envelopes table (ซองผ้าป่า)
CREATE TABLE IF NOT EXISTS envelopes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  route_name TEXT NOT NULL DEFAULT 'ทั่วไป',
  envelope_no TEXT NOT NULL,
  donor_name TEXT,
  donor_phone TEXT,
  amount NUMERIC(12,2) DEFAULT 0,
  payment_type TEXT CHECK (payment_type IN ('cash', 'transfer')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'returned')),
  note TEXT,
  processed_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Income table (รายรับ)
CREATE TABLE IF NOT EXISTS income (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  description TEXT,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  received_date DATE DEFAULT CURRENT_DATE,
  receipt_no TEXT,
  processed_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Expenses table (รายจ่าย)
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  description TEXT,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  expense_date DATE DEFAULT CURRENT_DATE,
  receipt_no TEXT,
  processed_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- View: event summary
CREATE OR REPLACE VIEW event_summary AS
SELECT
  e.id AS event_id,
  e.name AS event_name,
  e.target_amount,
  e.is_active,
  COALESCE((SELECT SUM(d.amount) FROM donations d WHERE d.event_id = e.id), 0) AS total_donated,
  COALESCE((SELECT COUNT(d.id) FROM donations d WHERE d.event_id = e.id), 0) AS total_donors,
  COALESCE((SELECT SUM(i.amount) FROM income i WHERE i.event_id = e.id), 0) AS total_income,
  COALESCE((SELECT SUM(ex.amount) FROM expenses ex WHERE ex.event_id = e.id), 0) AS total_expenses,
  COALESCE((SELECT COUNT(env.id) FROM envelopes env WHERE env.event_id = e.id), 0) AS total_envelopes,
  COALESCE((SELECT COUNT(env.id) FROM envelopes env WHERE env.event_id = e.id AND env.status = 'received'), 0) AS envelopes_received,
  COALESCE((SELECT SUM(env.amount) FROM envelopes env WHERE env.event_id = e.id AND env.status = 'received'), 0) AS total_envelope_amount,
  CASE
    WHEN e.target_amount > 0
    THEN ROUND((COALESCE((SELECT SUM(d.amount) FROM donations d WHERE d.event_id = e.id), 0) / e.target_amount) * 100, 2)
    ELSE 0
  END AS percent_reached
FROM events e;

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE donations;
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE envelopes;
ALTER PUBLICATION supabase_realtime ADD TABLE income;
ALTER PUBLICATION supabase_realtime ADD TABLE expenses;

-- RLS Policies
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE envelopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE income ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "public_read_events" ON events FOR SELECT USING (true);
CREATE POLICY "public_read_donations" ON donations FOR SELECT USING (true);
CREATE POLICY "public_read_envelopes" ON envelopes FOR SELECT USING (true);
CREATE POLICY "public_read_income" ON income FOR SELECT USING (true);
CREATE POLICY "public_read_expenses" ON expenses FOR SELECT USING (true);
CREATE POLICY "public_read_user_profiles" ON user_profiles FOR SELECT USING (true);

-- Authenticated write
CREATE POLICY "auth_insert_events" ON events FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "auth_update_events" ON events FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "auth_insert_donations" ON donations FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "auth_delete_donations" ON donations FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "auth_insert_envelopes" ON envelopes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "auth_update_envelopes" ON envelopes FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "auth_delete_envelopes" ON envelopes FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "auth_insert_income" ON income FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "auth_delete_income" ON income FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "auth_insert_expenses" ON expenses FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "auth_delete_expenses" ON expenses FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "auth_insert_user_profiles" ON user_profiles FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "auth_update_user_profiles" ON user_profiles FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "auth_delete_user_profiles" ON user_profiles FOR DELETE USING (auth.role() = 'authenticated');
