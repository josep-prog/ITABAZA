const { supabase } = require("../config/db");

// Supabase table name
const TABLE_NAME = 'appointments';

// Appointment model functions
const AppointmentModel = {
  // Create a new appointment
  async create(appointmentData) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([appointmentData])
      .select();
    
    if (error) throw error;
    
    // Handle both 'id' and 'appointment_id' field names
    const appointment = data[0];
    if (appointment && appointment.appointment_id && !appointment.id) {
      appointment.id = appointment.appointment_id;
    }
    return appointment;
  },

  // Find appointment by ID (using id field primarily)
  async findById(id) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Get appointments by patient ID
  async findByPatientId(patientId) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get appointments by doctor ID
  async findByDoctorId(doctorId) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('doctor_id', doctorId)
      .order('appointment_date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get all appointments
  async findAll() {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get pending appointments
  async findPending() {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get appointments by date
  async findByDate(date) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('appointment_date', date)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Update appointment
  async update(id, updates) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  },

  // Delete appointment
  async delete(id) {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Get appointment statistics
  async getStats() {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('status, payment_status');
    
    if (error) throw error;
    
    const total = data.length;
    const pending = data.filter(app => !app.status).length;
    const paid = data.filter(app => app.payment_status).length;
    
    return { total, pending, paid };
  },

  // Get appointments by consultation type and patient
  async findByTypeAndPatient(appointmentType, patientId) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('consultation_type', appointmentType)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get appointments by doctor and date
  async findByDoctorAndDate(doctorId, date) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('appointment_date', date)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get available video call rooms for a specific date and time
  async getAvailableVideoRooms(appointmentDate, appointmentTime) {
    const { data, error } = await supabase
      .rpc('get_available_video_rooms', {
        p_appointment_date: appointmentDate,
        p_appointment_time: appointmentTime
      });
    
    if (error) throw error;
    return data;
  },

  // Assign video call room to appointment
  async assignVideoRoom(appointmentId, roomId, roomName, videoUrl) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({
        video_call_room_id: roomId,
        video_call_room_name: roomName,
        video_call_url: videoUrl
      })
      .eq('id', appointmentId)
      .select();
    
    if (error) throw error;
    return data[0];
  },

  // Get appointments with video call details
  async findVideoCallAppointments(patientId = null, doctorId = null) {
    let query = supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('consultation_type', 'video-call')
      .not('video_call_url', 'is', null);
    
    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    
    if (doctorId) {
      query = query.eq('doctor_id', doctorId);
    }
    
    const { data, error } = await query.order('appointment_date', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Get comprehensive appointment statistics
  async getStatistics() {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('status, payment_status, appointmentType, payment_amount');
    
    if (error) throw error;
    
    const total = data.length;
    const pending = data.filter(app => !app.status).length;
    const completed = data.filter(app => app.status).length;
    const paid = data.filter(app => app.payment_status).length;
    const unpaid = data.filter(app => !app.payment_status).length;
    const videoCalls = data.filter(app => app.appointmentType === 'video-call').length;
    const inPerson = data.filter(app => app.appointmentType === 'in-person').length;
    const totalRevenue = data
      .filter(app => app.payment_status && app.payment_amount)
      .reduce((sum, app) => sum + parseFloat(app.payment_amount || 0), 0);
    
    return {
      total,
      pending,
      completed,
      paid,
      unpaid,
      videoCalls,
      inPerson,
      totalRevenue
    };
  }
};

module.exports = {
  AppointmentModel
};



// APPOINTMENT MODEL
// {
//   "patientId":"64256f28b1fc4d36b5a12be7",
//   "doctorId":"6425319914291e303a3cf2c4",
//   "ageOfPatient":40,
//   "gender":"male",
//   "address":"Mumbai woribali",
//   "problemDescription":"having some problem related to neourology ",
//   "appointmentDate":"30-03-2023",
//   "createdAt":,
//   "updatedAt":,
//   "paymentStatus":false,
//   }
  

// appontmentid
// dateTime
// patientName
// payment
// doctorID
// doctorname
// patientName
// patientID
// problem