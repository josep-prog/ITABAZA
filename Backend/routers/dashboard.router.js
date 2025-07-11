const express = require('express');
const router = express.Router();
const { supabase } = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        // Allow common document types
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, images, and Word documents are allowed.'));
        }
    }
});

// =====================================================
// DOCTOR AUTHENTICATION
// =====================================================

// Doctor login
router.post('/doctor/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Check if doctor exists and is active
        const { data: doctor, error } = await supabase
            .from('doctors')
            .select('*')
            .eq('email', email)
            .eq('status', true)
            .single();

        if (error || !doctor) {
            return res.status(401).json({ error: 'Invalid credentials or doctor not approved' });
        }

        // For now, we'll use a simple password check since doctors table doesn't have password field
        // In production, you should add password field to doctors table
        const isValidPassword = true; // Temporary - implement proper password validation

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { doctorId: doctor.id, email: doctor.email, type: 'doctor' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Save session to database
        const sessionData = {
            doctor_id: doctor.id,
            session_token: token,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        };

        await supabase
            .from('doctor_sessions')
            .insert([sessionData]);

        res.json({
            success: true,
            token,
            doctor: {
                id: doctor.id,
                name: doctor.doctor_name,
                email: doctor.email,
                department_id: doctor.department_id
            }
        });
    } catch (error) {
        console.error('Doctor login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// =====================================================
// DASHBOARD DATA ENDPOINTS
// =====================================================

// Get doctor dashboard data
router.get('/doctor/:doctorId/dashboard', async (req, res) => {
    try {
        const { doctorId } = req.params;

        // Get basic statistics from existing tables
        const { data: appointments, error: appointmentError } = await supabase
            .from('appointments')
            .select('*')
            .eq('doctor_id', doctorId);

        if (appointmentError) {
            throw appointmentError;
        }

        const totalAppointments = appointments?.length || 0;
        const pendingAppointments = appointments?.filter(a => a.status === 'pending').length || 0;
        const completedAppointments = appointments?.filter(a => a.status === 'completed').length || 0;
        const todayAppointments = appointments?.filter(a => {
            const today = new Date().toISOString().split('T')[0];
            return a.appointment_date === today;
        }).length || 0;

        res.json({
            success: true,
            data: {
                total_appointments: totalAppointments,
                pending_appointments: pendingAppointments,
                completed_appointments: completedAppointments,
                today_appointments: todayAppointments,
                upcoming_appointments: appointments?.filter(a => {
                    const today = new Date().toISOString().split('T')[0];
                    return a.appointment_date > today;
                }).length || 0,
                total_documents: 0, // Will be 0 until document table is created
                support_tickets: 0 // Will be 0 until support table is created
            }
        });
    } catch (error) {
        console.error('Error fetching doctor dashboard data:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

// Get patient dashboard data
router.get('/patient/:patientId/dashboard', async (req, res) => {
    try {
        const { patientId } = req.params;

        // Get basic statistics from existing tables
        const { data: appointments, error: appointmentError } = await supabase
            .from('appointments')
            .select('*')
            .eq('patient_id', patientId);

        if (appointmentError) {
            throw appointmentError;
        }

        const totalAppointments = appointments?.length || 0;
        const pendingAppointments = appointments?.filter(a => a.status === 'pending').length || 0;
        const completedAppointments = appointments?.filter(a => a.status === 'completed').length || 0;
        const upcomingAppointments = appointments?.filter(a => {
            const today = new Date().toISOString().split('T')[0];
            return a.appointment_date >= today;
        }).length || 0;

        res.json({
            success: true,
            data: {
                total_appointments: totalAppointments,
                upcoming_appointments: upcomingAppointments,
                pending_appointments: pendingAppointments,
                completed_appointments: completedAppointments,
                total_documents: 0, // Will be 0 until document table is created
                support_tickets: 0 // Will be 0 until support table is created
            }
        });
    } catch (error) {
        console.error('Error fetching patient dashboard data:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

// =====================================================
// APPOINTMENTS ENDPOINTS
// =====================================================

// Get doctor appointments
router.get('/doctor/:doctorId/appointments', async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { status, page = 1, limit = 10 } = req.query;

        let query = supabase
            .from('appointments')
            .select('*')
            .eq('doctor_id', doctorId)
            .order('appointment_date', { ascending: false })
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        const { data: appointments, error } = await query
            .range((page - 1) * limit, page * limit - 1);

        if (error) {
            throw error;
        }

        res.json({
            success: true,
            data: appointments,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: appointments.length
            }
        });
    } catch (error) {
        console.error('Error fetching doctor appointments:', error);
        res.status(500).json({ error: 'Failed to fetch appointments' });
    }
});

// Get patient appointments
router.get('/patient/:patientId/appointments', async (req, res) => {
    try {
        const { patientId } = req.params;
        const { status, page = 1, limit = 10 } = req.query;

        let query = supabase
            .from('appointments')
            .select(`
                *,
                doctors:doctor_id (
                    doctor_name,
                    qualifications,
                    department_id
                ),
                departments:doctors.department_id (
                    dept_name
                )
            `)
            .eq('patient_id', patientId)
            .order('appointment_date', { ascending: false })
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        const { data: appointments, error } = await query
            .range((page - 1) * limit, page * limit - 1);

        if (error) {
            throw error;
        }

        res.json({
            success: true,
            data: appointments,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: appointments.length
            }
        });
    } catch (error) {
        console.error('Error fetching patient appointments:', error);
        res.status(500).json({ error: 'Failed to fetch appointments' });
    }
});

// Update appointment status
router.put('/appointment/:appointmentId/status', async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { status } = req.body;

        const { data, error } = await supabase
            .from('appointments')
            .update({ status })
            .eq('id', appointmentId)
            .select();

        if (error) {
            throw error;
        }

        res.json({
            success: true,
            data: data[0]
        });
    } catch (error) {
        console.error('Error updating appointment status:', error);
        res.status(500).json({ error: 'Failed to update appointment status' });
    }
});

// =====================================================
// DOCUMENTS ENDPOINTS
// =====================================================

// Upload document (disabled until documents table is created)
router.post('/doctor/:doctorId/documents/upload', upload.single('document'), async (req, res) => {
    res.status(501).json({ error: 'Document upload not implemented yet. Please create documents table first.' });
    return;
    // Original code below:
    try {
        const { doctorId } = req.params;
        const { appointmentId, patientId, documentType, description } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Upload file to Supabase Storage
        const fileName = `${Date.now()}_${file.originalname}`;
        const filePath = `documents/${doctorId}/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            throw uploadError;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('documents')
            .getPublicUrl(filePath);

        // Save document record to database
        const { data: documentData, error: dbError } = await supabase
            .rpc('upload_document', {
                p_appointment_id: appointmentId,
                p_doctor_id: doctorId,
                p_patient_id: patientId,
                p_document_name: file.originalname,
                p_document_type: documentType,
                p_document_url: publicUrl,
                p_file_size: file.size,
                p_mime_type: file.mimetype,
                p_description: description
            });

        if (dbError) {
            throw dbError;
        }

        res.json({
            success: true,
            message: 'Document uploaded successfully',
            documentId: documentData
        });
    } catch (error) {
        console.error('Error uploading document:', error);
        res.status(500).json({ error: 'Failed to upload document' });
    }
});

// Get doctor documents (disabled until documents table is created)
router.get('/doctor/:doctorId/documents', async (req, res) => {
    res.json({
        success: true,
        data: [],
        message: 'Documents table not created yet'
    });
    return;
    // Original code below:
    try {
        const { doctorId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const { data: documents, error } = await supabase
            .from('documents')
            .select(`
                *,
                appointments:appointment_id (
                    appointment_date,
                    patient_first_name
                ),
                users:patient_id (
                    first_name,
                    last_name
                )
            `)
            .eq('doctor_id', doctorId)
            .order('created_at', { ascending: false })
            .range((page - 1) * limit, page * limit - 1);

        if (error) {
            throw error;
        }

        res.json({
            success: true,
            data: documents,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: documents.length
            }
        });
    } catch (error) {
        console.error('Error fetching doctor documents:', error);
        res.status(500).json({ error: 'Failed to fetch documents' });
    }
});

// Get patient documents
router.get('/patient/:patientId/documents', async (req, res) => {
    try {
        const { patientId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const { data: documents, error } = await supabase
            .from('documents')
            .select(`
                *,
                doctors:doctor_id (
                    doctor_name,
                    qualifications
                ),
                appointments:appointment_id (
                    appointment_date
                )
            `)
            .eq('patient_id', patientId)
            .eq('is_accessible_to_patient', true)
            .order('created_at', { ascending: false })
            .range((page - 1) * limit, page * limit - 1);

        if (error) {
            throw error;
        }

        res.json({
            success: true,
            data: documents,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: documents.length
            }
        });
    } catch (error) {
        console.error('Error fetching patient documents:', error);
        res.status(500).json({ error: 'Failed to fetch documents' });
    }
});

// =====================================================
// SUPPORT TICKETS ENDPOINTS
// =====================================================

// Create support ticket (disabled until support_tickets table is created)
router.post('/support/ticket', async (req, res) => {
    res.status(501).json({ error: 'Support tickets not implemented yet. Please create support_tickets table first.' });
    return;
    // Original code below:
    try {
        const { userId, userType, userName, userEmail, ticketType, subject, description, priority } = req.body;

        const { data: ticketId, error } = await supabase
            .rpc('create_support_ticket', {
                p_user_id: userId,
                p_user_type: userType,
                p_user_name: userName,
                p_user_email: userEmail,
                p_ticket_type: ticketType,
                p_subject: subject,
                p_description: description,
                p_priority: priority || 'medium'
            });

        if (error) {
            throw error;
        }

        res.json({
            success: true,
            message: 'Support ticket created successfully',
            ticketId: ticketId
        });
    } catch (error) {
        console.error('Error creating support ticket:', error);
        res.status(500).json({ error: 'Failed to create support ticket' });
    }
});

// Get user support tickets
router.get('/support/tickets/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { userType, page = 1, limit = 10 } = req.query;

        const { data: tickets, error } = await supabase
            .from('support_tickets')
            .select('*')
            .eq('user_id', userId)
            .eq('user_type', userType)
            .order('created_at', { ascending: false })
            .range((page - 1) * limit, page * limit - 1);

        if (error) {
            throw error;
        }

        res.json({
            success: true,
            data: tickets,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: tickets.length
            }
        });
    } catch (error) {
        console.error('Error fetching support tickets:', error);
        res.status(500).json({ error: 'Failed to fetch support tickets' });
    }
});

module.exports = router;
