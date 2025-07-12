import { baseURL, handleApiResponse, getAuthHeaders } from './baseURL.js';

document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.sidebar-menu .nav-link');
    const pageContents = document.querySelectorAll('.page-content');
    const patientNameElem = document.getElementById('patientName');
    const patientEmailElem = document.getElementById('patientEmail');
    const appointmentGrid = document.getElementById('appointmentGrid');
    const documentsTableBody = document.getElementById('documentsTableBody');

    const patientInfo = getCurrentPatient();
    if (!patientInfo) {
        logout();
    }

    patientNameElem.textContent = `${patientInfo.first_name} ${patientInfo.last_name}`;
    patientEmailElem.textContent = patientInfo.email;
    refreshDashboard();

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            setActivePage(link.dataset.page);
        });
    });

    async function refreshDashboard() {
        try {
            const response = await fetch(`${baseURL}/api/dashboard/patient/${patientInfo.id}/dashboard`, {
                headers: getAuthHeaders(),
            });
            const data = await handleApiResponse(response);
            if (!data.success) {
                throw new Error('Failed to fetch dashboard data');
            }

            const dashboardData = data.data;
            document.getElementById('totalAppointments').textContent = dashboardData.total_appointments || 0;
            document.getElementById('upcomingAppointments').textContent = dashboardData.upcoming_appointments || 0;
            document.getElementById('totalDocuments').textContent = dashboardData.total_documents || 0;
            document.getElementById('supportTickets').textContent = dashboardData.support_tickets || 0;

            populateAppointments(dashboardData);
            populateDocuments();
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
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
            document.getElementById('pageTitle').textContent = activeLink.querySelector('span').textContent;
            document.getElementById('pageSubtitle').textContent = `View your ${pageId}`;
        }
    }

    async function populateAppointments() {
        try {
            const response = await fetch(`${baseURL}/api/dashboard/patient/${patientInfo.id}/appointments?limit=5`, {
                headers: getAuthHeaders(),
            });
            const data = await handleApiResponse(response);
            
            if (!data.success || !data.data || data.data.length === 0) {
                appointmentGrid.innerHTML = '<p>No appointments to show</p>';
                return;
            }

            appointmentGrid.innerHTML = '';
            
            data.data.forEach(appointment => {
                const appointmentCard = createAppointmentCard(appointment);
                appointmentGrid.appendChild(appointmentCard);
            });
        } catch (error) {
            console.error('Error fetching appointments:', error);
            appointmentGrid.innerHTML = '<p>Error loading appointments</p>';
        }
    }

    async function populateDocuments() {
        try {
            const response = await fetch(`${baseURL}/api/dashboard/patient/${patientInfo.id}/documents`, {
                headers: getAuthHeaders(),
            });
            const data = await handleApiResponse(response);
            if (!data.success) {
                throw new Error('Failed to fetch documents');
            }

            documentsTableBody.innerHTML = '';
            data.data.forEach(document => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${document.document_name}</td>
                    <td>${document.document_type}</td>
                    <td>${document.doctors.doctor_name}</td>
                    <td>${document.appointments.appointment_date}</td>
                    <td>
                        <button class='btn btn-secondary' onclick='viewDocument(${document.document_url})'>View</button>
                    </td>
                `;
                documentsTableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error fetching documents:', error);
        }
    }

    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.onclick = logout;

    function logout() {
        localStorage.removeItem('patientToken');
        localStorage.removeItem('patientInfo');
        sessionStorage.removeItem('patientToken');
        sessionStorage.removeItem('patientInfo');
        window.location.href = './login.html';
    }

    function getCurrentPatient() {
        const patientInfo = localStorage.getItem('patientInfo');
        return patientInfo ? JSON.parse(patientInfo) : null;
    }

    function getAuthHeaders() {
        const token = localStorage.getItem('patientToken');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    async function handleApiResponse(response) {
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Unknown error occurred');
        }
        return data;
    }

    function createAppointmentCard(appointment) {
        const card = document.createElement('div');
        card.className = `appointment-card ${appointment.status}`;

        const statusBadge = getStatusBadge(appointment.status);
        const typeBadge = getTypeBadge(appointment.consultation_type);

        card.innerHTML = `
            <div class="appointment-header">
                <h3 class="appointment-doctor">Dr. ${appointment.doc_first_name}</h3>
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
});

