-- Migration: Add video call functionality to appointments table
-- This adds video call URL and room assignment fields

-- Add video call related columns
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS video_call_url VARCHAR(500);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS video_call_room_id INTEGER;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS video_call_room_name VARCHAR(100);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_appointments_video_room ON appointments(video_call_room_id, appointment_date, appointment_time);
CREATE INDEX IF NOT EXISTS idx_appointments_consultation_type ON appointments(consultation_type);

-- Update existing appointments with video call URLs where consultation_type is 'video-call'
UPDATE appointments 
SET video_call_url = 'https://itabaza-videocall.onrender.com/' 
WHERE consultation_type = 'video-call' 
AND video_call_url IS NULL;

-- Function to assign video call rooms (1-23 rooms available)
CREATE OR REPLACE FUNCTION assign_video_call_room(
    p_appointment_date VARCHAR(20),
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
            AND appointment_time = p_appointment_time
            AND consultation_type = 'video-call'
            AND status != 'cancelled'
        ) THEN
            available_room := room_counter;
            EXIT;
        END IF;
    END LOOP;
    
    -- If no room is available, return NULL (this should be handled by the application)
    RETURN available_room;
END;
$$ LANGUAGE plpgsql;

-- Function to get video call room name
CREATE OR REPLACE FUNCTION get_video_call_room_name(room_id INTEGER)
RETURNS VARCHAR(100) AS $$
BEGIN
    RETURN 'ITABAZA-Room-' || LPAD(room_id::TEXT, 2, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to automatically assign room when creating video-call appointments
CREATE OR REPLACE FUNCTION auto_assign_video_room()
RETURNS TRIGGER AS $$
DECLARE
    assigned_room INTEGER;
    room_name VARCHAR(100);
BEGIN
    -- Only process video-call appointments
    IF NEW.consultation_type = 'video-call' THEN
        -- Get available room
        assigned_room := assign_video_call_room(NEW.appointment_date, NEW.appointment_time);
        
        IF assigned_room IS NOT NULL THEN
            -- Assign room and set video call URL
            NEW.video_call_room_id := assigned_room;
            NEW.video_call_room_name := get_video_call_room_name(assigned_room);
            NEW.video_call_url := 'https://itabaza-videocall.onrender.com/room/' || assigned_room;
        ELSE
            -- No room available - this should be handled by the application
            RAISE EXCEPTION 'No video call rooms available for the selected time slot';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic room assignment
DROP TRIGGER IF EXISTS trigger_auto_assign_video_room ON appointments;
CREATE TRIGGER trigger_auto_assign_video_room
    BEFORE INSERT ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION auto_assign_video_room();

-- Function to get available video call rooms for a specific date and time
CREATE OR REPLACE FUNCTION get_available_video_rooms(
    p_appointment_date VARCHAR(20),
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
            AND appointment_time = p_appointment_time
            AND consultation_type = 'video-call'
            AND status != 'cancelled'
        ) THEN
            room_id := room_counter;
            room_name := get_video_call_room_name(room_counter);
            video_url := 'https://itabaza-videocall.onrender.com/room/' || room_counter;
            RETURN NEXT;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON COLUMN appointments.video_call_url IS 'URL for the video call session';
COMMENT ON COLUMN appointments.video_call_room_id IS 'Room ID (1-23) for video calls';
COMMENT ON COLUMN appointments.video_call_room_name IS 'Human-readable room name';
COMMENT ON FUNCTION assign_video_call_room IS 'Assigns an available video call room for the given date and time';
COMMENT ON FUNCTION get_available_video_rooms IS 'Returns list of available video call rooms for specific date and time';

-- Insert test data to verify the functionality (optional, can be removed in production)
-- INSERT INTO appointments (
--     patient_id, doctor_id, patient_first_name, doc_first_name,
--     age_of_patient, gender, address, problem_description,
--     appointment_date, appointment_time, consultation_type,
--     status, payment_status
-- ) VALUES (
--     uuid_generate_v4(), uuid_generate_v4(), 'Test Patient', 'Test Doctor',
--     30, 'male', 'Test Address', 'Test consultation',
--     '2025-07-27', '09:00', 'video-call',
--     'completed', true
-- );
