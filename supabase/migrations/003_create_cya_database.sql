CREATE TABLE IF NOT EXISTS cya_database (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  contact_number TEXT NOT NULL,
  social_media_link TEXT,
  invited_by TEXT,
  address JSONB NOT NULL DEFAULT '{}'
);

ALTER TABLE cya_database ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cya_database records"
  ON cya_database FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cya_database records"
  ON cya_database FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cya_database records"
  ON cya_database FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cya_database records"
  ON cya_database FOR DELETE
  USING (auth.uid() = user_id);
