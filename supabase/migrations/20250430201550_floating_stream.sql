/*
  # Create dependents table and security policies

  1. New Tables
    - `dependents`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - References profiles
      - `full_name` (text)
      - `relationship` (text)
      - `age` (integer)
      - `gender` (text)
      - `skin_concerns` (text[])
      - `has_routine` (boolean)
      - `current_products` (text[])
      - `sunscreen_frequency` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on dependents table
    - Add policies for authenticated users
*/

CREATE TABLE dependents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  relationship text NOT NULL,
  age integer NOT NULL,
  gender text NOT NULL DEFAULT 'prefer-not-to-say',
  skin_concerns text[] DEFAULT '{}',
  has_routine boolean NOT NULL DEFAULT false,
  current_products text[] DEFAULT '{}',
  sunscreen_frequency text NOT NULL DEFAULT 'sometimes',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE dependents ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own dependents"
  ON dependents FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dependents"
  ON dependents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dependents"
  ON dependents FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own dependents"
  ON dependents FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_dependents_updated_at
  BEFORE UPDATE ON dependents
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();