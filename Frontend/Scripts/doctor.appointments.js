import { getAuthHeaders, handleApiResponse } from './baseURL.js';
import { logoutDoctor, getCurrentDoctor, isDoctorAuthenticated } from './doctor.login.js';

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!isDoctorAuthenticated()) {
        window.location.href = './unified-login.html';
        return;
    }

    // Load appointments data
    loadAppointmentsData();

    // Set up event listeners
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('logoutBtn').addEventListener('click', function() {
        swal({
            title: "Are you sure?",
            text: "You will be logged out of your account",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then((willLogout) => {
            if (willLogout) {
                logoutDoctor();
            }
        });
    });
}

async function loadAppointmentsData() {
    try {
        const doctor = getCurrentDoctor();
        if (!doctor) return;

        const response = await fetch(`/appointment/byDoctor/${doctor.id}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        const data = await handleApiResponse(response);
        displayAppointments(data || []);
    } catch (error) {
        console.error('Error loading appointments:', error);
        document.getElementById('appointmentsList').innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Failed to load appointments</p>
            </div>
        `;
    }
}

function displayAppointments(appointments) {
    const container = document.getElementById('appointmentsList');

    if (!appointments || appointments.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-times"></i>
                <p>No appointments found</p>
            </div>
        `;
        return;
    }

    container.innerHTML = appointments.map((appointment) => `
        <div class="appointment-item">
            <div class="appointment-info">
                <h4>${appointment.patient_first_name || appointment.patient_name || 'Unknown Patient'}</h4>
                <p><i class="fas fa-calendar"></i> ${appointment.appointment_date || 'No date'}</p>
                <p><i class="fas fa-clock"></i> ${appointment.slot_time || appointment.appointment_time || 'No time'}</p>
                <p><i class="fas fa-notes-medical"></i> ${appointment.problem_description || 'No description'}</p>
            </div>
            <div class="appointment-status ${getStatusClass(appointment.status)}">
                ${getStatusText(appointment.status)}
            </div>
            <div class="appointment-actions">
                <button class="btn-view" onclick="viewAppointment('${appointment.id || appointment.appointment_id}')"
                        title="View patient details and booking information">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="btn-complete" onclick="completeAppointment('${appointment.id || appointment.appointment_id}')"
                        ${appointment.status === 'completed' ? 'disabled' : ''}
                        title="Mark appointment as completed">
                    <i class="fas fa-check-circle"></i> Complete
                </button>
            </div>
        </div>
    `).join('');
}

function getStatusClass(status) {
    switch (status) {
        case true: return 'status-completed';
        case false: return 'status-pending';
        default: return 'status-pending';
    }
}

function getStatusText(status) {
    switch (status) {
        case 'completed': return 'Completed';
        case 'pending': return 'Pending';
        case 'confirmed': return 'Confirmed';
        case true: return 'Completed';
        case false: return 'Pending';
        default: return 'Unknown';
    }
}

// View appointment details function
window.viewAppointment = async function(appointmentId) {
    try {
        const response = await fetch(`/appointment/view/${appointmentId}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch appointment details');
        }
        
        const data = await response.json();
        
        if (data.success) {
            showAppointmentModal(data.appointment, data.patient);
        } else {
            swal('Error', 'Failed to load appointment details', 'error');
        }
    } catch (error) {
        console.error('Error viewing appointment:', error);
        swal('Error', 'Failed to load appointment details', 'error');
    }
};

// Complete appointment function
window.completeAppointment = async function(appointmentId) {
    try {
        const result = await swal({
            title: "Mark as Complete?",
            text: "Are you sure you want to mark this appointment as completed?",
            icon: "warning",
            buttons: {
                cancel: "Cancel",
                confirm: {
                    text: "Yes, Complete",
                    value: true,
                    visible: true,
                    className: "btn-confirm",
                    closeModal: true
                }
            },
            dangerMode: false,
        });
        
        if (result) {
            const response = await fetch(`/appointment/complete/${appointmentId}`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
            });
            
            if (!response.ok) {
                throw new Error('Failed to complete appointment');
            }
            
            const data = await response.json();
            
            if (data.success) {
                swal('Success', 'Appointment marked as completed!', 'success');
                // Reload appointments to reflect the change
                loadAppointmentsData();
            } else {
                swal('Error', 'Failed to complete appointment', 'error');
            }
        }
    } catch (error) {
        console.error('Error completing appointment:', error);
        swal('Error', 'Failed to complete appointment', 'error');
    }
};

// Show appointment details modal
function showAppointmentModal(appointment, patient) {
    const modalContent = `
        <div class="appointment-modal">
            <div class="modal-header">
                <h2>Appointment Details</h2>
            </div>
            <div class="modal-body">
                <div class="patient-details-section">
                    <h3><i class="fas fa-user"></i> Patient Details</h3>
                    <div class="details-grid">
                        <div class="detail-item">
                            <label>Name:</label>
                            <span>${patient?.first_name || appointment.patient_first_name || 'N/A'} ${patient?.last_name || ''}</span>
                        </div>
                        <div class="detail-item">
                            <label>Email:</label>
                            <span>${patient?.email || appointment.patient_email || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Phone:</label>
                            <span>${patient?.mobile || appointment.patient_phone || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Age:</label>
                            <span>${appointment.age_of_patient || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Gender:</label>
                            <span>${appointment.gender || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Address:</label>
                            <span>${appointment.address || 'N/A'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="problem-description-section">
                    <h3><i class="fas fa-notes-medical"></i> Problem Description</h3>
                    <div class="problem-text">
                        ${appointment.problem_description || 'No description provided'}
                    </div>
                </div>
                
                <div class="appointment-info-section">
                    <h3><i class="fas fa-calendar-alt"></i> Appointment Information</h3>
                    <div class="details-grid">
                        <div class="detail-item">
                            <label>Date:</label>
                            <span>${appointment.appointment_date || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Time:</label>
                            <span>${appointment.slot_time || appointment.appointment_time || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Status:</label>
                            <span class="status ${getStatusClass(appointment.status)}">
                                ${getStatusText(appointment.status)}
                            </span>
                        </div>
                        <div class="detail-item">
                            <label>Payment Status:</label>
                            <span class="payment-status ${appointment.payment_status ? 'paid' : 'unpaid'}">
                                ${appointment.payment_status ? 'Paid' : 'Unpaid'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    swal({
        title: "",
        content: {
            element: "div",
            attributes: {
                innerHTML: modalContent
            }
        },
        className: "appointment-details-modal",
        buttons: {
            close: {
                text: "Close",
                value: false,
                visible: true,
                className: "btn-close"
            }
        }
    });
}
