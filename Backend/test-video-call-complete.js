const { supabase } = require('./config/db');

async function testVideoCallSystem() {
  console.log('🔍 Testing Video Call System Comprehensively...\n');
  
  try {
    // Step 1: Check database schema
    console.log('1️⃣ Checking database schema...');
    const { data: sampleRecord, error: schemaError } = await supabase
      .from('appointments')
      .select('*')
      .limit(1);
    
    if (schemaError) {
      console.error('❌ Schema error:', schemaError.message);
      return;
    }
    
    if (sampleRecord && sampleRecord.length > 0) {
      const columns = Object.keys(sampleRecord[0]);
      const videoColumns = columns.filter(col => col.includes('video'));
      console.log('✅ Video-related columns found:', videoColumns);
    } else {
      console.log('⚠️ No records found to check schema');
    }
    
    // Step 2: Test function existence
    console.log('\n2️⃣ Testing database functions...');
    try {
      const { data: funcTest, error: funcError } = await supabase.rpc('get_available_video_rooms', {
        p_appointment_date: '2025-07-27',
        p_appointment_time: '10:00'
      });
      
      if (funcError) {
        console.log('❌ Function test failed:', funcError.message);
      } else {
        console.log('✅ get_available_video_rooms function works');
      }
    } catch (err) {
      console.log('❌ Function test error:', err.message);
    }
    
    // Step 3: Check existing video appointments
    console.log('\n3️⃣ Checking existing video appointments...');
    const { data: existingVideo, error: videoError } = await supabase
      .from('appointments')
      .select('id, consultation_type, appointmentType, video_call_url, video_call_room_name, patient_first_name, appointment_date')
      .or('consultation_type.eq.video-call,appointmentType.eq.video-call');
    
    if (videoError) {
      console.error('❌ Error checking video appointments:', videoError.message);
    } else {
      console.log(`📊 Found ${existingVideo.length} video appointments:`);
      existingVideo.forEach((apt, i) => {
        console.log(`  ${i+1}. ${apt.patient_first_name} - ${apt.consultation_type || apt.appointmentType} - URL: ${apt.video_call_url ? '✅' : '❌'}`);
      });
    }
    
    // Step 4: Create test appointment manually (without relying on trigger)
    console.log('\n4️⃣ Creating test video appointment manually...');
    
    // Get sample doctor and patient
    const { data: doctors } = await supabase.from('doctors').select('id, doctor_name').limit(1);
    const { data: patients } = await supabase.from('users').select('id, first_name, email').limit(1);
    
    // Generate video call data manually
    const roomId = Math.floor(Math.random() * 23) + 1;
    const dateStr = '20250727';
    const roomName = `iTABAZA-Room-${roomId.toString().padStart(2, '0')}`;
    const roomUrl = `https://meet.jit.si/itabaza-${roomName.toLowerCase().replace(/-/g, '')}`;
    
    const testAppointment = {
      patient_id: patients?.[0]?.id || null,
      doctor_id: doctors?.[0]?.id || null,
      patient_first_name: patients?.[0]?.first_name || 'Test Patient',
      patient_email: patients?.[0]?.email || 'test@example.com',
      age_of_patient: 30,
      gender: 'male',
      address: 'Test Address',
      doc_first_name: doctors?.[0]?.doctor_name || 'Test Doctor',
      problem_description: 'Manual test video call appointment',
      appointment_date: '2025-07-27',
      slot_time: '15:00',
      consultation_type: 'video-call',
      status: 'confirmed',
      payment_status: true,
      // Add video call data manually
      video_call_room_id: roomId,
      video_call_room_name: roomName,
      video_call_url: roomUrl
    };
    
    console.log('📝 Creating appointment with manual video data:');
    console.log(`   Room ID: ${roomId}`);
    console.log(`   Room Name: ${roomName}`);
    console.log(`   Room URL: ${roomUrl}`);
    
    const { data: created, error: createError } = await supabase
      .from('appointments')
      .insert([testAppointment])
      .select();
    
    if (createError) {
      console.error('❌ Error creating test appointment:', createError.message);
    } else {
      console.log('✅ Test appointment created successfully!');
      console.log(`   Appointment ID: ${created[0].id}`);
      console.log(`   Video URL in DB: ${created[0].video_call_url}`);
      console.log(`   Room Name in DB: ${created[0].video_call_room_name}`);
    }
    
    // Step 5: Test API endpoint
    console.log('\n5️⃣ Testing API endpoints...');
    if (created && created[0]) {
      try {
        // Test the appointment view endpoint
        const appointmentId = created[0].id;
        const response = await fetch(`http://localhost:8080/api/appointments/view/${appointmentId}`);
        const apiData = await response.json();
        
        if (apiData.success) {
          console.log('✅ API endpoint works');
          console.log(`   API returned video URL: ${apiData.appointment.video_call_url}`);
        } else {
          console.log('❌ API endpoint failed:', apiData.message);
        }
      } catch (apiError) {
        console.log('❌ API test failed - server might not be running:', apiError.message);
      }
    }
    
    // Step 6: Update existing appointments
    console.log('\n6️⃣ Updating existing video appointments without URLs...');
    const appointmentsToUpdate = existingVideo.filter(apt => !apt.video_call_url);
    
    console.log(`📝 Found ${appointmentsToUpdate.length} appointments to update`);
    
    for (let i = 0; i < appointmentsToUpdate.length; i++) {
      const apt = appointmentsToUpdate[i];
      const newRoomId = Math.floor(Math.random() * 23) + 1;
      const newRoomName = `iTABAZA-Room-${newRoomId.toString().padStart(2, '0')}`;
      const newRoomUrl = `https://meet.jit.si/itabaza-${newRoomName.toLowerCase().replace(/-/g, '')}`;
      
      const { error: updateError } = await supabase
        .from('appointments')
        .update({
          video_call_room_id: newRoomId,
          video_call_room_name: newRoomName,
          video_call_url: newRoomUrl
        })
        .eq('id', apt.id);
      
      if (updateError) {
        console.log(`❌ Error updating appointment ${apt.id}:`, updateError.message);
      } else {
        console.log(`✅ Updated ${apt.patient_first_name}'s appointment with ${newRoomName}`);
      }
    }
    
    // Step 7: Final verification
    console.log('\n7️⃣ Final verification...');
    const { data: finalCheck } = await supabase
      .from('appointments')
      .select('*')
      .or('consultation_type.eq.video-call,appointmentType.eq.video-call');
    
    const withUrls = finalCheck.filter(apt => apt.video_call_url);
    const withoutUrls = finalCheck.filter(apt => !apt.video_call_url);
    
    console.log(`📊 Final Results:`);
    console.log(`   Total video appointments: ${finalCheck.length}`);
    console.log(`   ✅ With URLs: ${withUrls.length}`);
    console.log(`   ❌ Without URLs: ${withoutUrls.length}`);
    
    if (withUrls.length > 0) {
      console.log('\n📹 Sample appointments with video URLs:');
      withUrls.slice(0, 3).forEach((apt, i) => {
        console.log(`   ${i+1}. ${apt.patient_first_name} (${apt.appointment_date})`);
        console.log(`      Room: ${apt.video_call_room_name}`);
        console.log(`      URL: ${apt.video_call_url}`);
      });
    }
    
    console.log('\n🎉 Video call system test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  
  process.exit();
}

testVideoCallSystem();
