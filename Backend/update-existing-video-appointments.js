const { supabase } = require('./config/db');

async function updateExistingVideoAppointments() {
  console.log('🔄 Updating existing video-call appointments with video URLs...');
  
  try {
    // Get all video-call appointments without video_call_url
    const { data: videoAppointments, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .or('consultation_type.eq.video-call,appointmentType.eq.video-call')
      .is('video_call_url', null);
    
    if (fetchError) {
      console.error('❌ Error fetching appointments:', fetchError.message);
      return;
    }
    
    console.log(`📊 Found ${videoAppointments.length} video-call appointments without URLs`);
    
    if (videoAppointments.length === 0) {
      console.log('✅ No appointments need updating');
      return;
    }
    
    // Update each appointment with video call data
    for (let i = 0; i < videoAppointments.length; i++) {
      const appointment = videoAppointments[i];
      const roomId = Math.floor(Math.random() * 10000) + 1;
      const appointmentDate = appointment.appointment_date || new Date().toISOString().split('T')[0];
      const dateStr = appointmentDate.replace(/-/g, '');
      const roomName = `iTABAZA-Room-${dateStr}-${roomId.toString().padStart(4, '0')}`;
      const roomUrl = `https://meet.jit.si/itabaza-${roomName.toLowerCase().replace(/-/g, '')}`;
      
      const { error: updateError } = await supabase
        .from('appointments')
        .update({
          video_call_room_id: roomId,
          video_call_room_name: roomName,
          video_call_url: roomUrl
        })
        .eq('id', appointment.id);
      
      if (updateError) {
        console.error(`❌ Error updating appointment ${appointment.id}:`, updateError.message);
      } else {
        console.log(`✅ Updated appointment ${appointment.id}:`);
        console.log(`   Patient: ${appointment.patient_first_name}`);
        console.log(`   Date: ${appointment.appointment_date}`);
        console.log(`   Room: ${roomName}`);
        console.log(`   URL: ${roomUrl}`);
      }
    }
    
    console.log('🎉 Finished updating existing video-call appointments');
    
  } catch (error) {
    console.error('❌ Error in updating process:', error);
  }
}

async function testVideoCallAppointmentCreation() {
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
      console.error('❌ Error creating test appointment:', createError.message);
    } else {
      console.log('✅ Test appointment created successfully:');
      console.log('📹 Video call URL:', created[0].video_call_url);
      console.log('🏠 Room name:', created[0].video_call_room_name);
      console.log('🆔 Room ID:', created[0].video_call_room_id);
      
      // Clean up test appointment
      await supabase
        .from('appointments')
        .delete()
        .eq('id', created[0].id);
      
      console.log('🧹 Test appointment cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Error testing appointment creation:', error);
  }
}

async function verifyVideoCallAppointments() {
  console.log('🔍 Verifying video-call appointments...');
  
  try {
    // Get all video-call appointments
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('id, consultation_type, appointmentType, video_call_url, video_call_room_name, payment_status, status, patient_first_name, appointment_date')
      .or('consultation_type.eq.video-call,appointmentType.eq.video-call');
    
    if (error) {
      console.error('❌ Error fetching appointments:', error.message);
      return;
    }
    
    console.log(`📊 Total video-call appointments: ${appointments.length}`);
    
    const withUrls = appointments.filter(app => app.video_call_url);
    const withoutUrls = appointments.filter(app => !app.video_call_url);
    
    console.log(`✅ Appointments with video URLs: ${withUrls.length}`);
    console.log(`❌ Appointments without video URLs: ${withoutUrls.length}`);
    
    if (withUrls.length > 0) {
      console.log('\n📹 Sample appointments with video URLs:');
      withUrls.slice(0, 3).forEach((app, index) => {
        console.log(`${index + 1}. ${app.patient_first_name} - ${app.appointment_date}`);
        console.log(`   Room: ${app.video_call_room_name}`);
        console.log(`   URL: ${app.video_call_url}`);
      });
    }
    
    if (withoutUrls.length > 0) {
      console.log('\n⚠️ Appointments missing video URLs:');
      withoutUrls.forEach((app, index) => {
        console.log(`${index + 1}. ${app.patient_first_name} - ${app.appointment_date} (ID: ${app.id})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error verifying appointments:', error);
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting video call appointment update process...\n');
  
  try {
    // Step 1: Update existing appointments
    await updateExistingVideoAppointments();
    
    console.log('\n');
    
    // Step 2: Test creating new appointment 
    await testVideoCallAppointmentCreation();
    
    console.log('\n');
    
    // Step 3: Verify all appointments
    await verifyVideoCallAppointments();
    
  } catch (error) {
    console.error('❌ Main execution error:', error);
  } finally {
    console.log('\n🏁 Video call appointment update process completed');
    process.exit();
  }
}

main();
