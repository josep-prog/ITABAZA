import { FC, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Appointment {
  id: string;
  created_at: string;
  appointment_date: string;
  appointment_type: 'video' | 'in-person';
  doctor_name: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  patient_name?: string;
  room?: string;
  video_url?: string;
  appointment_code?: string;
}

const AppointmentRecord: FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .eq('user_id', user.id)
          .order('appointment_date', { ascending: true });

        if (error) throw error;
        setAppointments(data || []);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user]);

  const getStatusColor = (status: Appointment['status']) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status];
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Appointment Record</h1>
      {appointments.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <p className="text-gray-500">No appointments found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="bg-white rounded-xl shadow p-6 flex flex-col gap-2 border border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold capitalize text-blue-700">{appointment.appointment_type === 'video' ? 'Video Call' : 'In-person'}</span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusColor(appointment.status)}`}>{appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}</span>
              </div>
              <div className="text-gray-700 text-sm mb-1"><b>Doctor Name:</b> {appointment.doctor_name || '-'}</div>
              <div className="text-gray-700 text-sm mb-1"><b>Patient Name:</b> {appointment.patient_name || '-'}</div>
              <div className="text-gray-700 text-sm mb-1"><b>Time:</b> {appointment.appointment_date ? new Date(appointment.appointment_date).toLocaleString() : '-'}</div>
              {appointment.appointment_type === 'in-person' ? (
                <div className="text-gray-700 text-sm mb-1"><b>Room:</b> {appointment.room || '-'}</div>
              ) : (
                <div className="text-gray-700 text-sm mb-1"><b>Video URL:</b> {appointment.video_url ? <a href={appointment.video_url} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Join Call</a> : '-'}</div>
              )}
              <div className="text-gray-700 text-sm mb-1"><b>Appointment ID:</b> {appointment.appointment_code || appointment.id}</div>
              <div className="flex justify-between items-center mt-3 gap-2">
                <button className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition">Message</button>
                <button className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition">Details</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentRecord; 