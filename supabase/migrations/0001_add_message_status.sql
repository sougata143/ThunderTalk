-- Add message status fields
ALTER TABLE public.messages
ADD COLUMN delivered_at timestamp with time zone,
ADD COLUMN read_at timestamp with time zone;

-- Update trigger for message status
CREATE OR REPLACE FUNCTION public.handle_message_status()
RETURNS trigger AS $$
BEGIN
  IF NEW.is_read = true AND OLD.is_read = false THEN
    NEW.read_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER message_status_trigger
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_message_status(); 