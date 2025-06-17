/*
  # Create profiles table and security policies

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key) - References auth.users
      - `full_name` (text)
      - `phone_number` (text)
      - `location` (text)
      - `gender` (text)
      - `age` (integer)
      - `is_for_self` (boolean)
      - `skin_concerns` (text[])
      - `has_routine` (boolean)
      - `current_products` (text[])
      - `sunscreen_frequency` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on profiles table
    - Add policies for authenticated users
*/

CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text NOT NULL,
  phone_number text UNIQUE NOT NULL,
  location text NOT NULL,
  gender text NOT NULL DEFAULT 'prefer-not-to-say',
  age integer NOT NULL DEFAULT 0,
  is_for_self boolean NOT NULL DEFAULT true,
  skin_concerns text[] DEFAULT '{}',
  has_routine boolean NOT NULL DEFAULT false,
  current_products text[] DEFAULT '{}',
  sunscreen_frequency text NOT NULL DEFAULT 'sometimes',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create function to handle updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();