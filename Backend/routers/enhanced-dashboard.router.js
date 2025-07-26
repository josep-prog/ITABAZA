const express = require('express');
const { AppointmentModel } = require('../models/appointment.model');
const { UserModel } = require('../models/user.model');
const { DoctorModel } = require('../models/doctor.model');

const dashboardRouter = express.Router();

// Patient Dashboard API
dashboardRouter.get('/patient/:patientId/dashboard', async (req, res) => {
    try {
        const { patientId } = req.params;
        
        // Get patient appointments with stats
        const appointments = await AppointmentModel.findByPatientId(patientId);
        
        const stats = {
            total_appointments: appointments.length,
            upcoming_appointments: appointments.filter(app => {
                const appointmentDate = new Date(app.appointment_date);
                const today = new Date();
                return appointmentDate >= today && app.status !== 'cancelled';
            }).length,
            completed_appointments: appointments.filter(app => app.status === 'completed').length,
            video_call_appointments: appointments.filter(app => app.consultation_type === 'video-call').length,
            total_documents: 0, // Would need to implement document counting
            support_tickets: 0  // Would need to implement support ticket counting
        };

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching patient dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard data',
            error: error.message
        });
    }
});

// Patient Appointments API
dashboardRouter.get('/patient/:patientId/appointments', async (req, res) => {
    try {
        const { patientId } = req.params;
        const { status, limit } = req.query;
        
        let appointments = await AppointmentModel.findByPatientId(patientId);
        
        // Filter by status if provided
        if (status && status !== 'all') {
            if (status === 'booked') {
                appointments = appointments.filter(app => app.status !== 'cancelled');
            } else {
                appointments = appointments.filter(app => app.status === status);
            }
        }
        
        // Apply limit if provided
        if (limit) {
            appointments = appointments.slice(0, parseInt(limit));
        }

        res.json({
            success: true,
            data: appointments
        });
    } catch (error) {
        console.error('Error fetching patient appointments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch appointments',
            error: error.message
        });
    }
});

// Get specific appointment details for patient
dashboardRouter.get('/patient/:patientId/appointments/:appointmentId', async (req, res) => {
    try {
        const { patientId, appointmentId } = req.params;
        
        const appointment = await AppointmentModel.findById(appointmentId);
        
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }
        
        // Verify the appointment belongs to the patient
        if (appointment.patient_id !== patientId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.json({
            success: true,
            data: appointment
        });
    } catch (error) {
        console.error('Error fetching appointment details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch appointment details',
            error: error.message
        });
    }
});

// Patient Documents API (placeholder)
dashboardRouter.get('/patient/:patientId/documents', async (req, res) => {
    try {
        // This would need to be implemented based on your document storage system
        res.json({
            success: true,
            data: []
        });
    } catch (error) {
        console.error('Error fetching patient documents:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch documents',
            error: error.message
        });
    }
});

// Doctor Dashboard API
dashboardRouter.get('/doctor/:doctorId/dashboard', async (req, res) => {
    try {
        const { doctorId } = req.params;
        
        // Get doctor appointments with stats
        const appointments = await AppointmentModel.findByDoctorId(doctorId);
        
        const today = new Date();
        const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        const stats = {
            total_appointments: appointments.length,
            total_patients: [...new Set(appointments.map(app => app.patient_id))].length,
            video_call_appointments: appointments.filter(app => app.consultation_type === 'video-call').length,
            today_appointments: appointments.filter(app => {
                const appointmentDate = new Date(app.appointment_date);
                return appointmentDate.toDateString() === today.toDateString();
            }).length,
            monthly_revenue: appointments
                .filter(app => {
                    const appointmentDate = new Date(app.appointment_date);
                    return appointmentDate >= thisMonth && app.payment_status && app.payment_amount;
                })
                .reduce((sum, app) => sum + parseFloat(app.payment_amount || 0), 0)
        };

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching doctor dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard data',
            error: error.message
        });
    }
});

// Doctor Patients API
dashboardRouter.get('/doctor/:doctorId/patients', async (req, res) => {
    try {
        const { doctorId } = req.params;
        
        const appointments = await AppointmentModel.findByDoctorId(doctorId);
        
        // Group appointments by patient and get patient details
        const patientStats = {};
        
        for (const appointment of appointments) {
            const patientId = appointment.patient_id;
            
            if (!patientStats[patientId]) {
                patientStats[patientId] = {
                    patient_id: patientId,
                    patient_first_name: appointment.patient_first_name,
                    patient_email: appointment.patient_email,
                    appointment_count: 0,
                    last_appointment_date: null,
                    last_problem_description: null
                };
            }
            
            patientStats[patientId].appointment_count++;
            
            // Update last appointment info
            const appointmentDate = new Date(appointment.appointment_date);
            const lastDate = patientStats[patientId].last_appointment_date ? 
                new Date(patientStats[patientId].last_appointment_date) : null;
            
            if (!lastDate || appointmentDate > lastDate) {
                patientStats[patientId].last_appointment_date = appointment.appointment_date;
                patientStats[patientId].last_problem_description = appointment.problem_description;
            }
        }
        
        const patients = Object.values(patientStats);

        res.json({
            success: true,
            data: patients
        });
    } catch (error) {
        console.error('Error fetching doctor patients:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch patients',
            error: error.message
        });
    }
});

// Video Call Appointments API
dashboardRouter.get('/video-appointments', async (req, res) => {
    try {
        const { patientId, doctorId } = req.query;
        
        const videoAppointments = await AppointmentModel.findVideoCallAppointments(patientId, doctorId);

        res.json({
            success: true,
            data: videoAppointments
        });
    } catch (error) {
        console.error('Error fetching video call appointments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch video call appointments',
            error: error.message
        });
    }
});

// Available Video Rooms API
dashboardRouter.get('/video-rooms/available', async (req, res) => {
    try {
        const { date, time } = req.query;
        
        if (!date || !time) {
            return res.status(400).json({
                success: false,
                message: 'Date and time parameters are required'
            });
        }
        
        const availableRooms = await AppointmentModel.getAvailableVideoRooms(date, time);

        res.json({
            success: true,
            data: availableRooms
        });
    } catch (error) {
        console.error('Error fetching available video rooms:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch available video rooms',
            error: error.message
        });
    }
});

// Support Ticket API (placeholder)
dashboardRouter.post('/support/ticket', async (req, res) => {
    try {
        const ticketData = req.body;
        
        // This would need to be implemented based on your support system
        console.log('Support ticket received:', ticketData);
        
        res.json({
            success: true,
            message: 'Support ticket submitted successfully'
        });
    } catch (error) {
        console.error('Error submitting support ticket:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit support ticket',
            error: error.message
        });
    }
});

module.exports = { dashboardRouter };
