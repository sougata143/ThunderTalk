-- Add reactions column to messages table
ALTER TABLE messages
ADD COLUMN reactions JSONB DEFAULT '{}'::jsonb;

-- Create function to handle reaction updates
CREATE OR REPLACE FUNCTION handle_message_reaction()
RETURNS trigger AS $$
BEGIN
  -- Ensure reactions is initialized if null
  IF NEW.reactions IS NULL THEN
    NEW.reactions := '{}'::jsonb;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for reaction handling
CREATE TRIGGER message_reaction_trigger
  BEFORE INSERT OR UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION handle_message_reaction(); 