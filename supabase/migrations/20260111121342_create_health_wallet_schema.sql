/*
  # Digital Health Wallet Database Schema

  ## Overview
  Complete database schema for a Digital Health Wallet application that allows users to:
  - Store and track health vitals over time
  - Upload and manage health reports (PDF/images)
  - Share reports with doctors, family members, and friends
  - Filter and retrieve reports by date, vital type, and category

  ## Tables Created

  ### 1. profiles
  Extended user information linked to Supabase auth.users
  - `id` (uuid, primary key) - Links to auth.users.id
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `phone` (text, optional) - Contact number
  - `date_of_birth` (date, optional) - For age-related health tracking
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last profile update

  ### 2. vital_types
  Reference table for different types of vitals that can be tracked
  - `id` (uuid, primary key)
  - `name` (text) - e.g., "Blood Pressure", "Blood Sugar", "Heart Rate"
  - `unit` (text) - e.g., "mmHg", "mg/dL", "bpm"
  - `description` (text) - Brief description of the vital
  - `normal_range_min` (numeric, optional) - Normal minimum value
  - `normal_range_max` (numeric, optional) - Normal maximum value

  ### 3. vitals
  Stores vital measurements over time
  - `id` (uuid, primary key)
  - `user_id` (uuid) - Links to profiles.id
  - `vital_type_id` (uuid) - Links to vital_types.id
  - `value` (numeric) - Measured value
  - `measured_at` (timestamptz) - When the measurement was taken
  - `notes` (text, optional) - Additional notes about the measurement
  - `created_at` (timestamptz) - Record creation timestamp

  ### 4. reports
  Metadata about uploaded health reports
  - `id` (uuid, primary key)
  - `user_id` (uuid) - Owner of the report
  - `title` (text) - Report title/name
  - `report_type` (text) - e.g., "Blood Test", "X-Ray", "MRI", "CT Scan"
  - `file_path` (text) - Path to file in Supabase Storage
  - `file_type` (text) - MIME type (e.g., "application/pdf", "image/jpeg")
  - `file_size` (bigint) - File size in bytes
  - `report_date` (date) - Date of the medical report/test
  - `description` (text, optional) - Additional details
  - `vital_type_id` (uuid, optional) - Associated vital type if applicable
  - `created_at` (timestamptz) - Upload timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 5. report_shares
  Access control for sharing reports with others
  - `id` (uuid, primary key)
  - `report_id` (uuid) - The shared report
  - `owner_id` (uuid) - User who owns the report
  - `shared_with_id` (uuid) - User who has access (viewer)
  - `access_level` (text) - "viewer" (read-only)
  - `shared_at` (timestamptz) - When access was granted
  - `expires_at` (timestamptz, optional) - Optional expiration for shared access

  ## Security

  All tables have Row Level Security (RLS) enabled with the following policies:

  ### profiles
  - Users can view their own profile
  - Users can update their own profile
  - Users can insert their own profile

  ### vital_types
  - All authenticated users can view vital types (reference data)
  - Only service role can modify vital types

  ### vitals
  - Users can view their own vitals
  - Users can insert their own vitals
  - Users can update their own vitals
  - Users can delete their own vitals

  ### reports
  - Users can view their own reports
  - Users can view reports shared with them
  - Users can insert their own reports
  - Users can update their own reports
  - Users can delete their own reports

  ### report_shares
  - Report owners can view shares of their reports
  - Report owners can create shares for their reports
  - Report owners can delete shares of their reports
  - Viewers can see reports shared with them

  ## Notes
  - All timestamps use timestamptz for proper timezone handling
  - Foreign keys ensure referential integrity
  - Indexes added for common query patterns
  - Default values set appropriately
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  phone text,
  date_of_birth date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create vital_types reference table
CREATE TABLE IF NOT EXISTS vital_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  unit text NOT NULL,
  description text,
  normal_range_min numeric,
  normal_range_max numeric,
  created_at timestamptz DEFAULT now()
);

-- Create vitals table
CREATE TABLE IF NOT EXISTS vitals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vital_type_id uuid NOT NULL REFERENCES vital_types(id) ON DELETE CASCADE,
  value numeric NOT NULL,
  measured_at timestamptz NOT NULL DEFAULT now(),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  report_type text NOT NULL,
  file_path text NOT NULL,
  file_type text NOT NULL,
  file_size bigint NOT NULL,
  report_date date NOT NULL,
  description text,
  vital_type_id uuid REFERENCES vital_types(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create report_shares table
CREATE TABLE IF NOT EXISTS report_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  shared_with_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  access_level text NOT NULL DEFAULT 'viewer',
  shared_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  UNIQUE(report_id, shared_with_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_vitals_user_id ON vitals(user_id);
CREATE INDEX IF NOT EXISTS idx_vitals_vital_type_id ON vitals(vital_type_id);
CREATE INDEX IF NOT EXISTS idx_vitals_measured_at ON vitals(measured_at);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_report_date ON reports(report_date);
CREATE INDEX IF NOT EXISTS idx_reports_report_type ON reports(report_type);
CREATE INDEX IF NOT EXISTS idx_report_shares_report_id ON report_shares(report_id);
CREATE INDEX IF NOT EXISTS idx_report_shares_shared_with_id ON report_shares(shared_with_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vital_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_shares ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Vital types policies (reference data - all users can read)
CREATE POLICY "Authenticated users can view vital types"
  ON vital_types FOR SELECT
  TO authenticated
  USING (true);

-- Vitals policies
CREATE POLICY "Users can view own vitals"
  ON vitals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vitals"
  ON vitals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vitals"
  ON vitals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own vitals"
  ON vitals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Reports policies
CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view shared reports"
  ON reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM report_shares
      WHERE report_shares.report_id = reports.id
      AND report_shares.shared_with_id = auth.uid()
      AND (report_shares.expires_at IS NULL OR report_shares.expires_at > now())
    )
  );

CREATE POLICY "Users can insert own reports"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports"
  ON reports FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports"
  ON reports FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Report shares policies
CREATE POLICY "Owners can view shares of their reports"
  ON report_shares FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Viewers can see their shared access"
  ON report_shares FOR SELECT
  TO authenticated
  USING (auth.uid() = shared_with_id);

CREATE POLICY "Owners can create shares for their reports"
  ON report_shares FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = owner_id
    AND EXISTS (
      SELECT 1 FROM reports
      WHERE reports.id = report_shares.report_id
      AND reports.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can delete shares of their reports"
  ON report_shares FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Insert default vital types
INSERT INTO vital_types (name, unit, description, normal_range_min, normal_range_max) VALUES
  ('Blood Pressure (Systolic)', 'mmHg', 'Upper number in blood pressure reading', 90, 120),
  ('Blood Pressure (Diastolic)', 'mmHg', 'Lower number in blood pressure reading', 60, 80),
  ('Blood Sugar (Fasting)', 'mg/dL', 'Fasting blood glucose level', 70, 100),
  ('Blood Sugar (Random)', 'mg/dL', 'Random blood glucose level', 70, 140),
  ('Heart Rate', 'bpm', 'Beats per minute', 60, 100),
  ('Body Temperature', '°F', 'Body temperature in Fahrenheit', 97, 99),
  ('Oxygen Saturation', '%', 'Blood oxygen level', 95, 100),
  ('Weight', 'kg', 'Body weight in kilograms', NULL, NULL),
  ('Height', 'cm', 'Height in centimeters', NULL, NULL),
  ('BMI', 'kg/m²', 'Body Mass Index', 18.5, 24.9),
  ('Cholesterol (Total)', 'mg/dL', 'Total cholesterol level', 125, 200),
  ('Cholesterol (LDL)', 'mg/dL', 'Low-density lipoprotein', 0, 100),
  ('Cholesterol (HDL)', 'mg/dL', 'High-density lipoprotein', 40, 60),
  ('Hemoglobin', 'g/dL', 'Hemoglobin level in blood', 12, 16)
ON CONFLICT (name) DO NOTHING;
