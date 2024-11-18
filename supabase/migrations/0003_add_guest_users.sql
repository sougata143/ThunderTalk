-- Add guest flag to profiles
ALTER TABLE profiles
ADD COLUMN is_guest BOOLEAN DEFAULT false;

-- Add phone_number column if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'profiles' 
                  AND column_name = 'phone_number') THEN
        ALTER TABLE profiles ADD COLUMN phone_number TEXT;
    END IF;
END $$;

-- Create index on phone_number
CREATE INDEX IF NOT EXISTS profiles_phone_number_idx ON profiles(phone_number);

-- Function to create or get guest profile
CREATE OR REPLACE FUNCTION get_or_create_guest_profile(
  phone_number_param TEXT,
  full_name_param TEXT
) RETURNS UUID AS $$
DECLARE
  profile_id UUID;
BEGIN
  -- Try to find existing profile
  SELECT id INTO profile_id
  FROM profiles
  WHERE phone_number = phone_number_param;
  
  -- If not found, create new guest profile
  IF profile_id IS NULL THEN
    INSERT INTO profiles (
      id,
      phone_number,
      full_name,
      is_guest,
      created_at,
      updated_at,
      last_seen,
      is_online
    )
    VALUES (
      gen_random_uuid(),
      phone_number_param,
      full_name_param,
      true,
      NOW(),
      NOW(),
      NOW(),
      false
    )
    RETURNING id INTO profile_id;
  END IF;
  
  RETURN profile_id;
END;
$$ LANGUAGE plpgsql; 