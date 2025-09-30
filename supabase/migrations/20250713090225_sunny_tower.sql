/*
  # Farm Management Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `phone` (text, unique) - User's phone number for authentication
      - `name` (text) - User's full name
      - `email` (text) - User's email address
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `farms`
      - `id` (uuid, primary key)
      - `field_id` (text, unique) - External API field ID
      - `farm_name` (text) - Name of the farm
      - `location` (text) - Farm location
      - `user_phone` (text) - Reference to user's phone
      - `crop` (text) - Primary crop type
      - `coordinates` (jsonb) - Farm boundary coordinates
      - `fertilizer_data` (jsonb) - Fertilizer information
      - `growth_yield_data` (jsonb) - Growth and yield data
      - `irrigation_data` (jsonb) - Irrigation schedule data
      - `pest_disease_data` (jsonb) - Pest and disease information
      - `weed_data` (jsonb) - Weed management data
      - `enhanced_fertilizer_data` (jsonb) - Enhanced fertilizer data
      - `enhanced_irrigation_data` (jsonb) - Enhanced irrigation data
      - `enhanced_pest_disease_data` (jsonb) - Enhanced pest/disease data
      - `enhanced_weed_data` (jsonb) - Enhanced weed data
      - `soil_analysis_data` (jsonb) - Soil analysis results
      - `weather_data` (jsonb) - Weather information
      - `uid` (text) - External API user ID
      - `timestamp` (bigint) - Unix timestamp
      - `sensed_day` (text) - Last sensing date
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `activities`
      - `id` (uuid, primary key)
      - `farm_id` (uuid) - Reference to farms table
      - `user_phone` (text) - Reference to user's phone
      - `name` (text) - Activity name
      - `type` (text) - Activity type (irrigation, fertilization, etc.)
      - `date` (date) - Scheduled date
      - `time` (time) - Scheduled time
      - `description` (text) - Activity description
      - `priority` (text) - Priority level (low, medium, high)
      - `status` (text) - Status (pending, in-progress, completed, cancelled)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `user_settings`
      - `id` (uuid, primary key)
      - `user_phone` (text, unique) - Reference to user's phone
      - `language` (text) - Preferred language
      - `notifications` (jsonb) - Notification preferences
      - `profile_data` (jsonb) - Additional profile information
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Add policies for farm-related data access
    - Add policies for activity management

  3. Functions
    - Create trigger function to update `updated_at` timestamps
    - Add triggers to all tables for automatic timestamp updates
*/

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone text UNIQUE NOT NULL,
  name text DEFAULT '',
  email text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create farms table
CREATE TABLE IF NOT EXISTS farms (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  field_id text UNIQUE NOT NULL,
  farm_name text NOT NULL,
  location text NOT NULL,
  user_phone text NOT NULL,
  crop text NOT NULL,
  coordinates jsonb DEFAULT '[]'::jsonb,
  fertilizer_data jsonb DEFAULT '{}'::jsonb,
  growth_yield_data jsonb DEFAULT '{}'::jsonb,
  irrigation_data jsonb DEFAULT '[]'::jsonb,
  pest_disease_data jsonb DEFAULT '{}'::jsonb,
  weed_data jsonb DEFAULT '{}'::jsonb,
  enhanced_fertilizer_data jsonb DEFAULT '{}'::jsonb,
  enhanced_irrigation_data jsonb DEFAULT '[]'::jsonb,
  enhanced_pest_disease_data jsonb DEFAULT '{}'::jsonb,
  enhanced_weed_data jsonb DEFAULT '{}'::jsonb,
  soil_analysis_data jsonb DEFAULT '{}'::jsonb,
  weather_data jsonb DEFAULT '{}'::jsonb,
  uid text DEFAULT '',
  timestamp bigint DEFAULT 0,
  sensed_day text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id uuid REFERENCES farms(id) ON DELETE CASCADE,
  user_phone text NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('irrigation', 'fertilization', 'pesticide', 'harvesting', 'planting', 'weeding', 'other')),
  date date NOT NULL,
  time time NOT NULL,
  description text DEFAULT '',
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_phone text UNIQUE NOT NULL,
  language text DEFAULT 'en' CHECK (language IN ('en', 'hi', 'te')),
  notifications jsonb DEFAULT '{
    "weatherAlerts": true,
    "cropHealthAlerts": true,
    "activityReminders": true,
    "marketPrices": false,
    "systemUpdates": true
  }'::jsonb,
  profile_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_farms_user_phone ON farms(user_phone);
CREATE INDEX IF NOT EXISTS idx_farms_field_id ON farms(field_id);
CREATE INDEX IF NOT EXISTS idx_activities_farm_id ON activities(farm_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_phone ON activities(user_phone);
CREATE INDEX IF NOT EXISTS idx_activities_date ON activities(date);
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_phone ON user_settings(user_phone);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'phone' = phone);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'phone' = phone);

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'phone' = phone);

-- Create policies for farms table
CREATE POLICY "Users can read own farms"
  ON farms
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'phone' = user_phone);

CREATE POLICY "Users can insert own farms"
  ON farms
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'phone' = user_phone);

CREATE POLICY "Users can update own farms"
  ON farms
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'phone' = user_phone);

CREATE POLICY "Users can delete own farms"
  ON farms
  FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'phone' = user_phone);

-- Create policies for activities table
CREATE POLICY "Users can read own activities"
  ON activities
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'phone' = user_phone);

CREATE POLICY "Users can insert own activities"
  ON activities
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'phone' = user_phone);

CREATE POLICY "Users can update own activities"
  ON activities
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'phone' = user_phone);

CREATE POLICY "Users can delete own activities"
  ON activities
  FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'phone' = user_phone);

-- Create policies for user_settings table
CREATE POLICY "Users can read own settings"
  ON user_settings
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'phone' = user_phone);

CREATE POLICY "Users can insert own settings"
  ON user_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'phone' = user_phone);

CREATE POLICY "Users can update own settings"
  ON user_settings
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'phone' = user_phone);

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_farms_updated_at
  BEFORE UPDATE ON farms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing (optional)
-- This will be automatically handled by the application