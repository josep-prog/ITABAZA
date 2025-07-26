import { baseURL, handleApiResponse, getAuthHeaders } from './baseURL.js';

// Doctor-specific authentication functions
function getDoctorAuthHeaders() {
    const token = localStorage.getItem('doctorToken') || sessionStorage.getItem('doctorToken');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
}

function getCurrentDoctorFromStorage() {
    const doctorInfo = localStorage.getItem('doctorInfo') || sessionStorage.getItem('doctorInfo');
    return doctorInfo ? JSON.parse(doctorInfo) : null;
}

document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.sidebar-menu .nav-link');
    const pageContents = document.querySelectorAll('.page-content');
    const doctorNameElem = document.getElementById('doctorName');
    const doctorEmailElem = document.getElementById('doctorEmail');
    const appointmentGrid = document.getElementById('appointmentGrid');
    const videoCallsGrid = document.getElementById('videoCallsGrid');
    const patientsGrid = document.getElementById('patientsGrid');

    const doctorInfo = getCurrentDoctor();
    if (!doctorInfo) {
        console.log('❌ No doctor info found, redirecting to login');
        logout();
        return;
    }

    console.log('✅ Doctor info loaded:', doctorInfo);
    doctorNameElem.textContent = doctorInfo.doctor_name || `${doctorInfo.first_name} ${doctorInfo.last_name}`;
    doctorEmailElem.textContent = doctorInfo.email;
    refreshDashboard();

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            setActivePage(link.dataset.page);
        });
    });

    async function refreshDashboard() {
        try {
            console.log('🔍 Refreshing dashboard for doctor:', doctorInfo.id);
            const response = await fetch(`${baseURL}/api/dashboard/doctor/${doctorInfo.id}/dashboard`, {
                headers: getDoctorAuthHeaders(),
            });
            
            console.log('Dashboard response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await handleApiResponse(response);
            console.log('Dashboard data received:', data);
            
            if (!data.success) {
                throw new Error('Failed to fetch dashboard data');
            }

            const dashboardData = data.data;
            document.getElementById('totalAppointments').textContent = dashboardData.total_appointments || 0;
            document.getElementById('totalPatients').textContent = dashboardData.total_patients || 0;
            document.getElementById('videoCallAppointments').textContent = dashboardData.video_call_appointments || 0;
            document.getElementById('monthlyRevenue').textContent = `$${dashboardData.monthly_revenue || 0}`;

            console.log('✅ Dashboard stats updated successfully');
            await populateAppointments();
            await populateVideoCallAppointments();
            await populatePatients();
        } catch (error) {
            console.error('❌ Error fetching dashboard data:', error);
            showErrorMessage('Failed to load dashboard data. Please try again.');
        }
    }

    function setActivePage(pageId) {
        navLinks.forEach(link => link.classList.remove('active'));
        pageContents.forEach(content => content.classList.remove('active'));

        const activeLink = [...navLinks].find(link => link.dataset.page === pageId);
        const activeContent = document.getElementById(`${pageId}-page`);

        if (activeLink && activeContent) {
            activeLink.classList.add('active');
            activeContent.classList.add('active');
            
            const pageTitles = {
                'appointments': 'My Appointments',
                'video-calls': 'Video Call Appointments',
                'patients': 'My Patients',
                'documents': 'Documents'
            };
            
            const pageSubtitles = {
                'appointments': 'Manage your patient appointments',
                'video-calls': 'Join video calls with patients',
                'patients': 'View your patient list',
                'documents': 'Manage patient documents'
            };
            
            document.getElementById('pageTitle').textContent = pageTitles[pageId] || 'Dashboard';
            document.getElementById('pageSubtitle').textContent = pageSubtitles[pageId] || 'Manage your practice';
        }
    }

    async function populateAppointments() {
        try {
            const response = await fetch(`${baseURL}/api/appointments/doctor/${doctorInfo.id}`, {
                headers: getDoctorAuthHeaders(),
            });
            const data = await handleApiResponse(response);
            
            if (!data.success || !data.data || data.data.length === 0) {
                appointmentGrid.innerHTML = '<div class="empty-state"><p>No appointments found</p></div>';
                return;
            }

            appointmentGrid.innerHTML = '';
            
            data.data.forEach(appointment => {
                const appointmentCard = createDoctorAppointmentCard(appointment);
                appointmentGrid.appendChild(appointmentCard);
            });
            
            // Add event listeners for View buttons
            document.querySelectorAll('.view-appointment-btn').forEach(btn => {
                btn.addEventListener('click', async function() {
                    const appointmentId = this.getAttribute('data-appointment-id');
                    await showAppointmentDetailsModal(appointmentId);
                });
            });
        } catch (error) {
            console.error('Error fetching appointments:', error);
            appointmentGrid.innerHTML = '<div class="error-state"><p>Error loading appointments. Please try again.</p></div>';
        }
    }

    async function populateVideoCallAppointments() {
        try {
            const response = await fetch(`${baseURL}/api/appointments/doctor/${doctorInfo.id}?consultation_type=video-call`, {
                headers: getDoctorAuthHeaders(),
            });
            const data = await handleApiResponse(response);
            
            if (!data.success || !data.data || data.data.length === 0) {
                videoCallsGrid.innerHTML = '<div class="empty-state"><p>No video call appointments found</p></div>';
                return;
            }

            videoCallsGrid.innerHTML = '';
            
            data.data.filter(appointment => appointment.consultation_type === 'video-call').forEach(appointment => {
                const appointmentCard = createVideoCallAppointmentCard(appointment);
                videoCallsGrid.appendChild(appointmentCard);
            });
        } catch (error) {
            console.error('Error fetching video call appointments:', error);
            videoCallsGrid.innerHTML = '<div class="error-state"><p>Error loading video call appointments. Please try again.</p></div>';
        }
    }

    async function populatePatients() {
        try {
            const response = await fetch(`${baseURL}/api/dashboard/doctor/${doctorInfo.id}/patients`, {
                headers: getDoctorAuthHeaders(),
            });
            const data = await handleApiResponse(response);
            
            if (!data.success || !data.data || data.data.length === 0) {
                patientsGrid.innerHTML = '<div class="empty-state"><p>No patients found</p></div>';
                return;
            }

            patientsGrid.innerHTML = '';
            
            data.data.forEach(patient => {
                const patientCard = createPatientCard(patient);
                patientsGrid.appendChild(patientCard);
            });
        } catch (error) {
            console.error('Error fetching patients:', error);
            patientsGrid.innerHTML = '<div class="error-state"><p>Error loading patients. Please try again.</p></div>';
        }
    }

    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.onclick = logout;

    function logout() {
        localStorage.removeItem('doctorToken');
        localStorage.removeItem('doctorInfo');
        sessionStorage.removeItem('doctorToken');
        sessionStorage.removeItem('doctorInfo');
        window.location.href = './login.html';
    }

    function getCurrentDoctor() {
        return getCurrentDoctorFromStorage();
    }

    function createDoctorAppointmentCard(appointment) {
        const card = document.createElement('div');
        card.className = `appointment-card ${appointment.status}`;

        const statusBadge = getStatusBadge(appointment.status);
        const typeBadge = getTypeBadge(appointment.consultation_type);
        
        // Show video call link for video appointments that have URLs (regardless of payment for testing)
        const showVideoLink = (appointment.consultation_type === 'video-call' || appointment.appointmentType === 'video-call') && 
                             appointment.video_call_url;

        card.innerHTML = `
            <div class="appointment-header">
                <h3 class="appointment-patient">${appointment.patient_first_name}</h3>
                <div class="appointment-time">${appointment.appointment_date} ${appointment.appointment_time || ''}</div>
            </div>
            <div class="appointment-details">
                <div class="appointment-detail">
                    <i class="fas fa-calendar-day"></i>
                    <span>${appointment.appointment_date}</span>
                </div>
                <div class="appointment-detail">
                    <i class="fas fa-clock"></i>
                    <span>${appointment.slot_time}</span>
                </div>
                <div class="appointment-detail">
                    <i class="fas fa-notes-medical"></i>
                    <span>${appointment.problem_description.substring(0, 30)}...</span>
                </div>
                <div class="appointment-detail">
                    ${statusBadge}
                    ${typeBadge}
                </div>
                ${showVideoLink ? `
                <div class="appointment-detail video-call-info">
                    <i class="fas fa-video" style="color: #007bff;"></i>
                    <span><strong>Room:</strong> ${appointment.video_call_room_name}</span>
                </div>
                ` : ''}
            </div>
            <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 15px;">
                ${showVideoLink ? `
                <a href="${appointment.video_call_url}" target="_blank" class="btn btn-success" 
                   style="text-decoration: none; display: inline-flex; align-items: center; gap: 5px;">
                    <i class="fas fa-video"></i> Join Video Call
                </a>
                ` : ''}
                <button class="btn btn-primary complete-appointment-btn" data-appointment-id="${appointment.id}">
                    Mark Complete
                </button>
                <button class="btn btn-secondary view-appointment-btn" data-appointment-id="${appointment.id}">View Details</button>
            </div>
        `;
        return card;
    }

    function createVideoCallAppointmentCard(appointment) {
        const card = document.createElement('div');
        card.className = `appointment-card ${appointment.status}`;

        const showVideoLink = appointment.payment_status && appointment.video_call_url;
        
        card.innerHTML = `
            <div class="appointment-header">
                <h3 class="appointment-patient">${appointment.patient_first_name}</h3>
                <div class="appointment-time">${appointment.appointment_date} ${appointment.slot_time}</div>
            </div>
            <div class="video-call-info">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <div>
                        <strong><i class="fas fa-video"></i> Video Call Appointment</strong>
                        ${appointment.video_call_room_name ? `<br><small>Room: ${appointment.video_call_room_name}</small>` : ''}
                    </div>
                    <div class="badge ${appointment.payment_status ? 'status-confirmed' : 'status-pending'}">
                        ${appointment.payment_status ? 'Paid' : 'Pending Payment'}
                    </div>
                </div>
                <div style="margin-top: 15px;">
                    ${showVideoLink ? `
                    <a href="${appointment.video_call_url}" target="_blank" class="btn btn-success" 
                       style="text-decoration: none; display: inline-flex; align-items: center; gap: 5px; width: 100%; justify-content: center;">
                        <i class="fas fa-video"></i> Join Video Call
                    </a>
                    ` : `
                    <div style="text-align: center; padding: 10px; background: #fff3cd; border-radius: 4px; color: #856404;">
                        <i class="fas fa-clock"></i> Video call link will be available after payment confirmation
                    </div>
                    `}
                </div>
            </div>
            <div style="margin-top: 15px; display: flex; gap: 10px; justify-content: flex-end;">
                <button class="btn btn-secondary view-appointment-btn" data-appointment-id="${appointment.id}">View Details</button>
            </div>
        `;
        return card;
    }

    function createPatientCard(patient) {
        const card = document.createElement('div');
        card.className = 'appointment-card';

        card.innerHTML = `
            <div class="appointment-header">
                <h3 class="appointment-patient">${patient.patient_first_name}</h3>
                <div class="appointment-time">Patient ID: ${patient.patient_id.substring(0, 8)}...</div>
            </div>
            <div class="appointment-details">
                <div class="appointment-detail">
                    <i class="fas fa-envelope"></i>
                    <span>${patient.patient_email || 'N/A'}</span>
                </div>
                <div class="appointment-detail">
                    <i class="fas fa-calendar-check"></i>
                    <span>Appointments: ${patient.appointment_count || 0}</span>
                </div>
                <div class="appointment-detail">
                    <i class="fas fa-clock"></i>
                    <span>Last Visit: ${patient.last_appointment_date || 'N/A'}</span>
                </div>
                <div class="appointment-detail">
                    <i class="fas fa-notes-medical"></i>
                    <span>Last Issue: ${patient.last_problem_description ? patient.last_problem_description.substring(0, 30) + '...' : 'N/A'}</span>
                </div>
            </div>
            <div style="margin-top: 15px; display: flex; gap: 10px; justify-content: flex-end;">
                <button class="btn btn-secondary view-patient-btn" data-patient-id="${patient.patient_id}">View History</button>
            </div>
        `;
        return card;
    }

    function getStatusBadge(status) {
        const badges = {
            'pending': '<span class="badge status-pending">Pending</span>',
            'confirmed': '<span class="badge status-confirmed">Confirmed</span>',
            'completed': '<span class="badge status-completed">Completed</span>',
            'cancelled': '<span class="badge status-cancelled">Cancelled</span>'
        };
        return badges[status] || '<span class="badge">Unknown</span>';
    }

    function getTypeBadge(type) {
        const badges = {
            'video-call': '<span class="badge type-virtual">Virtual</span>',
            'in-person': '<span class="badge type-in-person">In-Person</span>'
        };
        return badges[type] || '<span class="badge">Unknown</span>';
    }

    // Utility functions
    function showSuccessMessage(message) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-success';
        alert.textContent = message;
        alert.style.position = 'fixed';
        alert.style.top = '20px';
        alert.style.right = '20px';
        alert.style.zIndex = '9999';
        alert.style.padding = '10px 20px';
        alert.style.backgroundColor = '#d4edda';
        alert.style.color = '#155724';
        alert.style.borderRadius = '5px';
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }

    function showErrorMessage(message) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-error';
        alert.textContent = message;
        alert.style.position = 'fixed';
        alert.style.top = '20px';
        alert.style.right = '20px';
        alert.style.zIndex = '9999';
        alert.style.padding = '10px 20px';
        alert.style.backgroundColor = '#f8d7da';
        alert.style.color = '#721c24';
        alert.style.borderRadius = '5px';
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }

    // Refresh button functionality
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshDashboard);
    }

    // Modal logic for appointment details
    async function showAppointmentDetailsModal(appointmentId) {
        const modal = document.getElementById('appointmentDetailsModal');
        const body = document.getElementById('appointmentDetailsBody');
        const docsList = document.getElementById('appointmentDocumentsList');
        body.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading details...</div>';
        docsList.innerHTML = '';
        modal.style.display = 'flex';
        
        try {
            const response = await fetch(`${baseURL}/api/appointments/view/${appointmentId}`, {
                headers: getDoctorAuthHeaders(),
            });
            const data = await handleApiResponse(response);
            if (!data.success || !data.appointment) throw new Error('No details found');
            
            const appt = data.appointment;
            let videoCallSection = '';
            if (appt.consultation_type === 'video-call' && appt.payment_status && appt.video_call_url) {
                videoCallSection = `
                    <br><hr style="margin: 15px 0;">
                    <div style="background: #e7f3ff; padding: 15px; border-radius: 8px; border-left: 4px solid #007bff;">
                        <h4 style="margin-top: 0; color: #007bff;"><i class="fas fa-video"></i> Video Call Information</h4>
                        <p><strong>Room:</strong> ${appt.video_call_room_name}</p>
                        <p><strong>Video Call URL:</strong> <a href="${appt.video_call_url}" target="_blank" 
                           style="color: #007bff; font-weight: bold;">Join Video Call</a></p>
                        <div style="margin-top: 10px;">
                            <a href="${appt.video_call_url}" target="_blank" 
                               class="btn btn-success" style="text-decoration: none; padding: 8px 16px; border-radius: 4px; color: white;">
                                <i class="fas fa-video"></i> Join Now
                            </a>
                        </div>
                    </div>
                `;
            } else if (appt.consultation_type === 'video-call' && !appt.payment_status) {
                videoCallSection = `
                    <br><hr style="margin: 15px 0;">
                    <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
                        <h4 style="margin-top: 0; color: #856404;"><i class="fas fa-exclamation-triangle"></i> Video Call Pending</h4>
                        <p>Video call link will be available after payment confirmation.</p>
                    </div>
                `;
            }
            
            body.innerHTML = `
                <strong>Date:</strong> ${appt.appointment_date}<br>
                <strong>Time:</strong> ${appt.slot_time || appt.appointment_time || 'TBD'}<br>
                <strong>Patient:</strong> ${appt.patient_first_name}<br>
                <strong>Type:</strong> ${appt.consultation_type}<br>
                <strong>Status:</strong> ${appt.status}<br>
                <strong>Payment Status:</strong> ${appt.payment_status ? 'Paid' : 'Pending'}<br>
                <strong>Description:</strong> ${appt.problem_description || ''}<br>
                ${videoCallSection}
            `;
            
            // No documents section for doctor view - they can manage documents separately
            docsList.innerHTML = '<li>Document management available in Documents section</li>';
        } catch (err) {
            body.innerHTML = '<span style="color:red;">Failed to load appointment details.</span>';
            docsList.innerHTML = '';
        }
    }
    
    // Modal close logic
    const closeModalBtn = document.getElementById('closeAppointmentModal');
    if (closeModalBtn) {
        closeModalBtn.onclick = function() {
            document.getElementById('appointmentDetailsModal').style.display = 'none';
        };
    }
    
    window.onclick = function(event) {
        const modal = document.getElementById('appointmentDetailsModal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
});
