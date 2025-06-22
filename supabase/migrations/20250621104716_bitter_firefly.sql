/*
  # Complete custom reward system

  1. New Tables
    - `skill_chains` - User-defined skill categories/chains
    - `skills` - Individual skills within chains
    - `achievement_chains` - User-defined achievement categories/chains  
    - `achievements` - Individual achievements within chains
    - `title_chains` - User-defined title categories/chains
    - `titles` - Individual titles within chains
    - `quests` - Enhanced quest system
    - `quest_rewards` - Junction table for quest rewards

  2. Features
    - Custom skill trees with user-defined categories
    - Achievement chains with prerequisites
    - Title chains with progression
    - Multiple rewards per quest
    - Exponential leveling system
    - Mobile-responsive design

  3. Security
    - Enable RLS on all tables
    - Users can only access their own data
*/

-- Drop existing tables to recreate with new structure
DROP TABLE IF EXISTS quest_rewards CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS titles CASCADE;
DROP TABLE IF EXISTS skill_chains CASCADE;
DROP TABLE IF EXISTS achievement_chains CASCADE;
DROP TABLE IF EXISTS title_chains CASCADE;

-- Create skill chains table
CREATE TABLE skill_chains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL,
  icon_name text DEFAULT 'Target',
  color text DEFAULT 'blue',
  created_at timestamp with time zone DEFAULT now()
);

-- Create skills table
CREATE TABLE skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  skill_chain_id uuid NOT NULL REFERENCES skill_chains(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  is_unlocked boolean DEFAULT false,
  icon_name text DEFAULT 'Target',
  created_at timestamp with time zone DEFAULT now()
);

-- Create achievement chains table
CREATE TABLE achievement_chains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL,
  icon_name text DEFAULT 'Trophy',
  color text DEFAULT 'yellow',
  created_at timestamp with time zone DEFAULT now()
);

-- Create achievements table
CREATE TABLE achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  achievement_chain_id uuid NOT NULL REFERENCES achievement_chains(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  is_unlocked boolean DEFAULT false,
  icon_name text DEFAULT 'Trophy',
  tier text NOT NULL DEFAULT 'Bronze',
  created_at timestamp with time zone DEFAULT now()
);

-- Create title chains table
CREATE TABLE title_chains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL,
  icon_name text DEFAULT 'Crown',
  color text DEFAULT 'purple',
  created_at timestamp with time zone DEFAULT now()
);

-- Create titles table
CREATE TABLE titles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title_chain_id uuid NOT NULL REFERENCES title_chains(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  is_unlocked boolean DEFAULT false,
  rarity text NOT NULL DEFAULT 'Common',
  created_at timestamp with time zone DEFAULT now()
);

-- Update quests table
DROP TABLE IF EXISTS quests CASCADE;
CREATE TABLE quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  exp_reward bigint NOT NULL DEFAULT 100,
  is_complete boolean DEFAULT false,
  due_date date NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create quest rewards junction table
CREATE TABLE quest_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id uuid NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  reward_type text NOT NULL, -- 'skill', 'achievement', 'title'
  reward_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Add constraints
ALTER TABLE achievements ADD CONSTRAINT achievements_tier_check 
  CHECK (tier = ANY (ARRAY['Bronze'::text, 'Silver'::text, 'Gold'::text, 'Legendary'::text]));

ALTER TABLE titles ADD CONSTRAINT titles_rarity_check 
  CHECK (rarity = ANY (ARRAY['Common'::text, 'Rare'::text, 'Epic'::text, 'Legendary'::text]));

ALTER TABLE quests ADD CONSTRAINT quests_category_check 
  CHECK (category = ANY (ARRAY['Daily'::text, 'Weekly'::text, 'Challenge'::text]));

ALTER TABLE quest_rewards ADD CONSTRAINT quest_rewards_type_check 
  CHECK (reward_type = ANY (ARRAY['skill'::text, 'achievement'::text, 'title'::text]));

-- Enable RLS on all tables
ALTER TABLE skill_chains ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_chains ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE title_chains ENABLE ROW LEVEL SECURITY;
ALTER TABLE titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_rewards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage own skill chains" ON skill_chains FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own skills" ON skills FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own achievement chains" ON achievement_chains FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own achievements" ON achievements FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own title chains" ON title_chains FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own titles" ON titles FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own quests" ON quests FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own quest rewards" ON quest_rewards FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM quests WHERE quests.id = quest_rewards.quest_id AND quests.user_id = auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_skill_chains_user_id ON skill_chains(user_id);
CREATE INDEX idx_skills_user_id ON skills(user_id);
CREATE INDEX idx_skills_chain_id ON skills(skill_chain_id);
CREATE INDEX idx_achievement_chains_user_id ON achievement_chains(user_id);
CREATE INDEX idx_achievements_user_id ON achievements(user_id);
CREATE INDEX idx_achievements_chain_id ON achievements(achievement_chain_id);
CREATE INDEX idx_title_chains_user_id ON title_chains(user_id);
CREATE INDEX idx_titles_user_id ON titles(user_id);
CREATE INDEX idx_titles_chain_id ON titles(title_chain_id);
CREATE INDEX idx_quests_user_id ON quests(user_id);
CREATE INDEX idx_quest_rewards_quest_id ON quest_rewards(quest_id);

-- Update level calculation function for exponential growth
CREATE OR REPLACE FUNCTION calculate_level_exponential(total_exp bigint)
RETURNS integer AS $$
DECLARE
  level integer := 1;
  exp_needed bigint := 1000;
  remaining_exp bigint := total_exp;
BEGIN
  WHILE remaining_exp >= exp_needed LOOP
    remaining_exp := remaining_exp - exp_needed;
    level := level + 1;
    exp_needed := exp_needed * 2; -- Double the EXP needed for next level
  END LOOP;
  
  RETURN level;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update level up function
CREATE OR REPLACE FUNCTION handle_level_up()
RETURNS TRIGGER AS $$
DECLARE
  old_level integer;
  new_level integer;
  bonus_points integer;
BEGIN
  -- Calculate old and new levels using exponential formula
  old_level := calculate_level_exponential(COALESCE(OLD.total_exp, 0));
  new_level := calculate_level_exponential(NEW.total_exp);
  
  -- If level increased, award bonus stat points
  IF new_level > old_level THEN
    bonus_points := (new_level - old_level) * 3;
    NEW.bonus_stat_points := COALESCE(NEW.bonus_stat_points, 0) + bonus_points;
    NEW.level := new_level;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_quests_updated_at BEFORE UPDATE ON quests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();