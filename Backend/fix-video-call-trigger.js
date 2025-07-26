const { supabase } = require('./config/db');

async function createVideoCallTriggerFunction() {
  console.log('🔧 Creating auto_assign_video_room trigger function...');

  try {
    // First, let's create the auto_assign_video_room function
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION public.auto_assign_video_room()
      RETURNS TRIGGER AS $$
      DECLARE
        room_counter INTEGER;
        room_name TEXT;
        room_url TEXT;
      BEGIN
        -- Only process if this is a video-call appointment
        IF NEW.consultation_type = 'video-call' OR NEW.appointmentType = 'video-call' THEN
          
          -- Generate a simple room counter based on date
          SELECT COALESCE(MAX(video_call_room_id), 0) + 1 
          INTO room_counter 
          FROM appointments 
          WHERE appointment_date = NEW.appointment_date 
          AND (consultation_type = 'video-call' OR appointmentType = 'video-call');
          
          -- Generate room name and URL
          room_name := 'Video-Room-' || TO_CHAR(NEW.appointment_date, 'YYYYMMDD') || '-' || LPAD(room_counter::TEXT, 3, '0');
          room_url := 'https://meet.jit.si/' || 'itabaza-' || LOWER(REPLACE(room_name, '-', ''));
          
          -- Assign values
          NEW.video_call_room_id := room_counter;
          NEW.video_call_room_name := room_name;
          NEW.video_call_url := room_url;
          
          RAISE NOTICE 'Assigned video room: % with URL: %', room_name, room_url;
        END IF;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;

    // Execute using rpc to run raw SQL
    const { data: functionResult, error: functionError } = await supabase.rpc('exec_sql', { 
      sql: createFunctionSQL 
    });

    if (functionError) {
      console.log('❌ Error creating function with rpc:', functionError.message);
      
      // Try alternative approach - create a test appointment to trigger the creation
      console.log('🔄 Trying alternative approach...');
      
      // Let's manually assign video call data for existing appointments
      await assignVideoCallDataManually();
      
    } else {
      console.log('✅ Function created successfully');
      
      // Now let's test it by creating a test video-call appointment
      await testVideoCallCreation();
    }

  } catch (error) {
    console.error('❌ Error in main function:', error);
    
    // Fallback: manually assign video call data
    console.log('🔄 Falling back to manual assignment...');
    await assignVideoCallDataManually();
  }
}

async function assignVideoCallDataManually() {
  console.log('📝 Manually assigning video call data to existing appointments...');
  
  try {
    // Get all video-call appointments without video_call_url
    const { data: videoAppointments, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .or('consultation_type.eq.video-call,appointmentType.eq.video-call')
      .is('video_call_url', null);
    
    if (fetchError) {
      console.log('❌ Error fetching appointments:', fetchError.message);
      return;
    }
    
    console.log(`📊 Found ${videoAppointments.length} video-call appointments without URLs`);
    
    // Update each appointment with video call data
    for (let i = 0; i < videoAppointments.length; i++) {
      const appointment = videoAppointments[i];
      const roomCounter = i + 1;
      const dateStr = appointment.appointment_date.replace(/-/g, '');
      const roomName = `Video-Room-${dateStr}-${roomCounter.toString().padStart(3, '0')}`;
      const roomUrl = `https://meet.jit.si/itabaza-${roomName.toLowerCase().replace(/-/g, '')}`;
      
      const { error: updateError } = await supabase
        .from('appointments')
        .update({
          video_call_room_id: roomCounter,
          video_call_room_name: roomName,
          video_call_url: roomUrl
        })
        .eq('id', appointment.id);
      
      if (updateError) {
        console.log(`❌ Error updating appointment ${appointment.id}:`, updateError.message);
      } else {
        console.log(`✅ Updated appointment ${appointment.id} with room: ${roomName}`);
        console.log(`   URL: ${roomUrl}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error in manual assignment:', error);
  }
}

async function testVideoCallCreation() {
  console.log('🧪 Testing video call appointment creation...');
  
  try {
    // Create a test video-call appointment
    const testAppointment = {
      patient_first_name: 'Test Patient',
      patient_email: 'test@example.com',
      age_of_patient: 30,
      gender: 'male',
      address: 'Test Address',
      doc_first_name: 'Test Doctor',
      problem_description: 'Test video call appointment',
      appointment_date: '2025-07-27',
      slot_time: '10:00',
      consultation_type: 'video-call',
      status: 'pending',
      payment_status: false
    };
    
    const { data: created, error: createError } = await supabase
      .from('appointments')
      .insert([testAppointment])
      .select();
    
    if (createError) {
      console.log('❌ Error creating test appointment:', createError.message);
    } else {
      console.log('✅ Test appointment created:', created[0]);
      console.log('📹 Video call URL:', created[0].video_call_url);
      console.log('🏠 Room name:', created[0].video_call_room_name);
    }
    
  } catch (error) {
    console.error('❌ Error testing appointment creation:', error);
  }
}

async function createSimpleTriggerFunction() {
  console.log('🔧 Creating simplified trigger function...');
  
  try {
    // Create the function by updating existing appointments first
    await assignVideoCallDataManually();
    
    // Then create a simple client-side function to handle future appointments
    console.log('✅ Manual assignment completed. Future appointments will need client-side handling.');
    
  } catch (error) {
    console.error('❌ Error in simplified approach:', error);
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting video call URL fix...');
  
  try {
    // Try to create the trigger function
    await createVideoCallTriggerFunction();
    
  } catch (error) {
    console.error('❌ Main execution error:', error);
  } finally {
    console.log('🏁 Video call URL fix completed');
    process.exit();
  }
}

main();
