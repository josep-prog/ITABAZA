-- Migration: Fix video call functionality for appointments table
-- This fixes data type mismatches and ensures proper video call URL generation

-- First, drop existing functions and triggers to avoid conflicts
DROP TRIGGER IF EXISTS trigger_auto_assign_video_room ON appointments;
DROP FUNCTION IF EXISTS auto_assign_video_room();
DROP FUNCTION IF EXISTS assign_video_call_room(VARCHAR, VARCHAR);
DROP FUNCTION IF EXISTS get_available_video_rooms(VARCHAR, VARCHAR);
DROP FUNCTION IF EXISTS get_video_call_room_name(INTEGER);

-- Add video call related columns (if they don't exist)
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS video_call_url VARCHAR(500);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS video_call_room_id INTEGER;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS video_call_room_name VARCHAR(100);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_appointments_video_room ON appointments(video_call_room_id, appointment_date, appointment_time);
CREATE INDEX IF NOT EXISTS idx_appointments_consultation_type ON appointments(consultation_type);

-- Function to assign video call rooms (1-23 rooms available) - FIXED DATA TYPES
CREATE OR REPLACE FUNCTION assign_video_call_room(
    p_appointment_date DATE,
    p_appointment_time VARCHAR(20)
)
RETURNS INTEGER AS $$
DECLARE
    available_room INTEGER;
    room_counter INTEGER;
BEGIN
    -- Loop through rooms 1-23 to find an available one
    FOR room_counter IN 1..23 LOOP
        -- Check if room is available at this time
        IF NOT EXISTS (
            SELECT 1 FROM appointments 
            WHERE video_call_room_id = room_counter 
            AND appointment_date = p_appointment_date 
            AND (appointment_time = p_appointment_time OR slot_time = p_appointment_time)
            AND (consultation_type = 'video-call' OR "appointmentType" = 'video-call')
            AND status != 'cancelled'
        ) THEN
            available_room := room_counter;
            EXIT;
        END IF;
    END LOOP;
    
    -- If no room is available, assign a random room (fallback)
    IF available_room IS NULL THEN
        available_room := (RANDOM() * 22)::INTEGER + 1;
    END IF;
    
    RETURN available_room;
END;
$$ LANGUAGE plpgsql;

-- Function to get video call room name
CREATE OR REPLACE FUNCTION get_video_call_room_name(room_id INTEGER)
RETURNS VARCHAR(100) AS $$
BEGIN
    RETURN 'iTABAZA-Room-' || LPAD(room_id::TEXT, 2, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to automatically assign room when creating video-call appointments - FIXED
CREATE OR REPLACE FUNCTION auto_assign_video_room()
RETURNS TRIGGER AS $$
DECLARE
    assigned_room INTEGER;
    room_name VARCHAR(100);
    room_url VARCHAR(500);
    appointment_time_value VARCHAR(20);
BEGIN
    -- Only process video-call appointments
    IF NEW.consultation_type = 'video-call' OR NEW."appointmentType" = 'video-call' THEN
        -- Use appointment_time or slot_time, whichever is available
        appointment_time_value := COALESCE(NEW.appointment_time, NEW.slot_time, '09:00');
        
        -- Get available room
        assigned_room := assign_video_call_room(NEW.appointment_date, appointment_time_value);
        
        -- Generate room name and URL
        room_name := get_video_call_room_name(assigned_room);
        room_url := 'https://meet.jit.si/itabaza-' || LOWER(REPLACE(room_name, '-', ''));
        
        -- Assign room and set video call URL
        NEW.video_call_room_id := assigned_room;
        NEW.video_call_room_name := room_name;
        NEW.video_call_url := room_url;
        
        -- Log the assignment (optional, for debugging)
        RAISE NOTICE 'Assigned video room % with URL % for appointment on %', room_name, room_url, NEW.appointment_date;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic room assignment
CREATE TRIGGER trigger_auto_assign_video_room
    BEFORE INSERT ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION auto_assign_video_room();

-- Function to get available video call rooms for a specific date and time - FIXED
CREATE OR REPLACE FUNCTION get_available_video_rooms(
    p_appointment_date DATE,
    p_appointment_time VARCHAR(20)
)
RETURNS TABLE(room_id INTEGER, room_name VARCHAR(100), video_url VARCHAR(500)) AS $$
DECLARE
    room_counter INTEGER;
BEGIN
    FOR room_counter IN 1..23 LOOP
        -- Check if room is available
        IF NOT EXISTS (
            SELECT 1 FROM appointments 
            WHERE video_call_room_id = room_counter 
            AND appointment_date = p_appointment_date 
            AND (appointment_time = p_appointment_time OR slot_time = p_appointment_time)
            AND (consultation_type = 'video-call' OR "appointmentType" = 'video-call')
            AND status != 'cancelled'
        ) THEN
            room_id := room_counter;
            room_name := get_video_call_room_name(room_counter);
            video_url := 'https://meet.jit.si/itabaza-' || LOWER(REPLACE(room_name, '-', ''));
            RETURN NEXT;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Update existing video-call appointments that don't have video URLs
UPDATE appointments 
SET 
    video_call_room_id = (RANDOM() * 22)::INTEGER + 1,
    video_call_room_name = get_video_call_room_name((RANDOM() * 22)::INTEGER + 1),
    video_call_url = 'https://meet.jit.si/itabaza-itabazaroom' || LPAD(((RANDOM() * 22)::INTEGER + 1)::TEXT, 2, '0')
WHERE (consultation_type = 'video-call' OR "appointmentType" = 'video-call')
AND video_call_url IS NULL;

-- Comments for documentation
COMMENT ON COLUMN appointments.video_call_url IS 'URL for the video call session using Jitsi Meet';
COMMENT ON COLUMN appointments.video_call_room_id IS 'Room ID (1-23) for video calls';
COMMENT ON COLUMN appointments.video_call_room_name IS 'Human-readable room name';
COMMENT ON FUNCTION assign_video_call_room IS 'Assigns an available video call room for the given date and time';
COMMENT ON FUNCTION get_available_video_rooms IS 'Returns list of available video call rooms for specific date and time';
COMMENT ON FUNCTION auto_assign_video_room IS 'Trigger function that automatically assigns video rooms on appointment creation';

-- Verify the setup with a test query (optional)
-- SELECT 
--     id, 
--     consultation_type, 
--     video_call_room_id, 
--     video_call_room_name, 
--     video_call_url 
-- FROM appointments 
-- WHERE consultation_type = 'video-call' OR "appointmentType" = 'video-call';
