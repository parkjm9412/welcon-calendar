-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  color_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  all_day BOOLEAN DEFAULT false,
  google_event_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS events_employee_id_idx ON events(employee_id);
CREATE INDEX IF NOT EXISTS events_start_date_idx ON events(start_date);
CREATE INDEX IF NOT EXISTS events_end_date_idx ON events(end_date);
CREATE INDEX IF NOT EXISTS events_date_range_idx ON events(start_date, end_date);

-- Create users table for authentication (optional, if using Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS (Row Level Security)
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (you can make this more restrictive)
CREATE POLICY "Allow public read on employees" ON employees
  FOR SELECT USING (true);

CREATE POLICY "Allow public read on events" ON events
  FOR SELECT USING (true);

CREATE POLICY "Allow public write on events" ON events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on events" ON events
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete on events" ON events
  FOR DELETE USING (true);

-- Insert sample employees (optional)
INSERT INTO employees (name, email, color_index) VALUES
  ('김철수', 'chulsu@welconsystems.com', 0),
  ('이영희', 'younghee@welconsystems.com', 1),
  ('박민준', 'minjun@welconsystems.com', 2),
  ('최지은', 'jieun@welconsystems.com', 3),
  ('정준호', 'junho@welconsystems.com', 4),
  ('강미영', 'miyoung@welconsystems.com', 5),
  ('이광순', 'kwangsoon@welconsystems.com', 6),
  ('현수빈', 'subin@welconsystems.com', 7),
  ('송민정', 'minjeong@welconsystems.com', 8),
  ('한승준', 'seungjun@welconsystems.com', 9),
  ('조세희', 'sehee@welconsystems.com', 10),
  ('윤나영', 'nayoung@welconsystems.com', 11),
  ('배지현', 'jihyun@welconsystems.com', 12)
ON CONFLICT DO NOTHING;
