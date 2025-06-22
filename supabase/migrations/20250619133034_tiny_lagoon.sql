/*
  # Update database structure for LifeLeveler

  1. Database Changes
    - Add bonus_stat_points column to user_profiles
    - Create proper indexes for better performance
    - Update RLS policies for better security
    - Add triggers for automatic updates

  2. New Features
    - Bonus stat points system (3 points per level up)
    - Proper quest management with database storage
    - Achievement tracking with database storage
    - Title system with database storage

  3. Security
    - Updated RLS policies for all tables
    - Proper foreign key relationships
    - Secure stat point allocation
*/

-- Add bonus stat points to user_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'bonus_stat_points'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN bonus_stat_points integer DEFAULT 0 NOT NULL;
  END IF;
END $$;

-- Update the profiles table to match user_profiles structure
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'bonus_stat_points'
  ) THEN
    ALTER TABLE profiles ADD COLUMN bonus_stat_points integer DEFAULT 0;
  END IF;
END $$;

-- Create function to calculate level from EXP
CREATE OR REPLACE FUNCTION calculate_level(total_exp bigint)
RETURNS integer AS $$
BEGIN
  RETURN FLOOR(total_exp / 1000.0) + 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function to handle level up and award bonus points
CREATE OR REPLACE FUNCTION handle_level_up()
RETURNS TRIGGER AS $$
DECLARE
  old_level integer;
  new_level integer;
  bonus_points integer;
BEGIN
  -- Calculate old and new levels
  old_level := calculate_level(COALESCE(OLD.total_exp, 0));
  new_level := calculate_level(NEW.total_exp);
  
  -- If level increased, award bonus stat points
  IF new_level > old_level THEN
    bonus_points := (new_level - old_level) * 3;
    NEW.bonus_stat_points := COALESCE(NEW.bonus_stat_points, 0) + bonus_points;
    NEW.level := new_level;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for level up on user_profiles
DROP TRIGGER IF EXISTS trigger_level_up ON user_profiles;
CREATE TRIGGER trigger_level_up
  BEFORE UPDATE OF total_exp ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_level_up();

-- Update quests table to ensure proper relationships
ALTER TABLE quests DROP CONSTRAINT IF EXISTS quests_user_id_fkey;
ALTER TABLE quests ADD CONSTRAINT quests_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- Update achievements table to ensure proper relationships  
ALTER TABLE achievements DROP CONSTRAINT IF EXISTS achievements_user_id_fkey;
ALTER TABLE achievements ADD CONSTRAINT achievements_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- Create titles table if it doesn't exist
CREATE TABLE IF NOT EXISTS titles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL,
  rarity text NOT NULL DEFAULT 'Common',
  date_earned timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Add constraint for title rarity
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'titles_rarity_check'
  ) THEN
    ALTER TABLE titles ADD CONSTRAINT titles_rarity_check 
      CHECK (rarity = ANY (ARRAY['Common'::text, 'Rare'::text, 'Epic'::text, 'Legendary'::text]));
  END IF;
END $$;

-- Enable RLS on titles table
ALTER TABLE titles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for titles
DROP POLICY IF EXISTS "Users can read own titles" ON titles;
CREATE POLICY "Users can read own titles"
  ON titles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own titles" ON titles;
CREATE POLICY "Users can create own titles"
  ON titles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create skills table if it doesn't exist
CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  required_exp integer NOT NULL DEFAULT 0,
  is_unlocked boolean DEFAULT false,
  icon_name text DEFAULT 'Target',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on skills table
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for skills
DROP POLICY IF EXISTS "Users can read own skills" ON skills;
CREATE POLICY "Users can read own skills"
  ON skills FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own skills" ON skills;
CREATE POLICY "Users can create own skills"
  ON skills FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own skills" ON skills;
CREATE POLICY "Users can update own skills"
  ON skills FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_titles_user_id ON titles(user_id);
CREATE INDEX IF NOT EXISTS idx_skills_user_id ON skills(user_id);
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
CREATE INDEX IF NOT EXISTS idx_user_profiles_level ON user_profiles(level);
CREATE INDEX IF NOT EXISTS idx_user_profiles_total_exp ON user_profiles(total_exp);

-- Insert default skills for all users
INSERT INTO skills (user_id, name, description, category, required_exp, is_unlocked, icon_name)
SELECT 
  up.id,
  skill_data.name,
  skill_data.description,
  skill_data.category,
  skill_data.required_exp,
  false,
  skill_data.icon_name
FROM user_profiles up
CROSS JOIN (
  VALUES 
    ('Time Management', 'Better at managing time and priorities', 'Productivity', 500, 'Clock'),
    ('Focus Master', 'Maintain concentration for extended periods', 'Productivity', 1000, 'Target'),
    ('Efficiency Expert', 'Complete tasks with minimal effort', 'Productivity', 1500, 'Zap'),
    ('Endurance Boost', 'Increased physical stamina', 'Fitness', 750, 'Heart'),
    ('Strength Training', 'Enhanced muscle development', 'Fitness', 1200, 'Sword'),
    ('Flexibility Master', 'Improved mobility and range of motion', 'Fitness', 800, 'Zap'),
    ('Mental Clarity', 'Enhanced cognitive function', 'Mental', 600, 'Brain'),
    ('Stress Resistance', 'Better handling of pressure situations', 'Mental', 900, 'Heart'),
    ('Memory Palace', 'Exceptional memory retention', 'Mental', 1300, 'Brain')
) AS skill_data(name, description, category, required_exp, icon_name)
WHERE NOT EXISTS (
  SELECT 1 FROM skills s 
  WHERE s.user_id = up.id AND s.name = skill_data.name
);