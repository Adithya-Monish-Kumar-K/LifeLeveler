/*
  # Create user_profiles table

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `name` (text, not null)
      - `email` (text, not null, unique)
      - `avatar_url` (text, optional)
      - `total_exp` (bigint, default 0)
      - `level` (integer, default 1)
      - `active_title_id` (text, optional)
      - `stats` (jsonb, default empty object)
      - `titles` (jsonb, default empty array)
      - `quests` (jsonb, default empty array)
      - `skills` (jsonb, default empty array)
      - `achievements` (jsonb, default empty array)
      - `created_at` (timestamp with timezone, default now)
      - `updated_at` (timestamp with timezone, default now)

  2. Security
    - Enable RLS on `user_profiles` table
    - Add policy for users to view their own profile
    - Add policy for users to insert their own profile
    - Add policy for users to update their own profile
*/

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  avatar_url text,
  total_exp bigint DEFAULT 0 NOT NULL,
  level integer DEFAULT 1 NOT NULL,
  active_title_id text,
  stats jsonb DEFAULT '{}'::jsonb NOT NULL,
  titles jsonb DEFAULT '[]'::jsonb NOT NULL,
  quests jsonb DEFAULT '[]'::jsonb NOT NULL,
  skills jsonb DEFAULT '[]'::jsonb NOT NULL,
  achievements jsonb DEFAULT '[]'::jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id);