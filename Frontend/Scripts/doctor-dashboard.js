// Base URL configuration
// Production: Backend deployed on Render
const baseURL = 'https://itabaza.onrender.com';

// Global variables
let currentDoctorInfo = null;
let currentAppointments = [];
let currentDocuments = [];
let currentSupportTickets = [];

// Doctor authentication headers
function getDoctorAuthHeaders() {
    const token = localStorage.getItem('doctorToken') || sessionStorage.getItem('doctorToken');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
}

// Get doctor auth headers for file uploads (without content-type)
function getDoctorAuthHeadersForUpload() {
    const token = localStorage.getItem('doctorToken') || sessionStorage.getItem('doctorToken');
    return {
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
}

// Get current doctor ID
function getCurrentDoctorId() {
    const doctorInfo = getCurrentDoctorFromStorage();
    return doctorInfo ? doctorInfo.id : 'sample-doctor-id'; // Fallback for testing
}

// Get doctor info from storage
function getCurrentDoctorFromStorage() {
    const doctorInfo = localStorage.getItem('doctorInfo') || sessionStorage.getItem('doctorInfo');
    return doctorInfo ? JSON.parse(doctorInfo) : null;
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('Doctor Dashboard initializing...');
    
    // Add global error handler for unhandled promise rejections
    window.addEventListener('unhandledrejection', function(event) {
        console.error('Unhandled promise rejection:', event.reason);
        // Prevent the default browser behavior
        event.preventDefault();
    });
    
    // Check if user is logged in
    if (!isUserLoggedIn()) {
        redirectToLogin();
        return;
    }
    
    // Load doctor info
    loadDoctorInfo();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load initial data
    loadDashboardData();
    
    console.log('Doctor Dashboard initialized successfully');

    const logoutBtn = document.getElementById('logoutBtn');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                performCompleteLogout();
            }
        });
    }
});

// Check if user is logged in
function isUserLoggedIn() {
    const token = localStorage.getItem('doctorToken') || sessionStorage.getItem('doctorToken');
    const doctorInfo = localStorage.getItem('doctorInfo') || sessionStorage.getItem('doctorInfo');
    
    if (!token || !doctorInfo) {
        return false;
    }
    
    try {
        // Parse doctor info to verify it's valid
        const doctor = JSON.parse(doctorInfo);
        return doctor && doctor.id;
    } catch (error) {
        console.error('Error parsing doctor info:', error);
        return false;
    }
}

// Redirect to login page
function redirectToLogin() {
    showAlert('Please log in to access the doctor dashboard', 'error');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 2000);
}

// Load doctor information
function loadDoctorInfo() {
    const doctorInfo = getCurrentDoctorFromStorage();
    console.log('Loading doctor info:', doctorInfo); // Debug log
    
    if (doctorInfo) {
        // Try multiple possible field names for doctor name
        let doctorName = 'Dr. Unknown';
        
        if (doctorInfo.doctor_name) {
            doctorName = doctorInfo.doctor_name;
        } else if (doctorInfo.name) {
            doctorName = doctorInfo.name;
        } else if (doctorInfo.first_name) {
            const lastName = doctorInfo.last_name ? ` ${doctorInfo.last_name}` : '';
            doctorName = `${doctorInfo.first_name}${lastName}`;
        } else if (doctorInfo.fullName) {
            doctorName = doctorInfo.fullName;
        }
        
        // Ensure it starts with "Dr." if it doesn't already
        if (!doctorName.toLowerCase().startsWith('dr.')) {
            doctorName = `Dr. ${doctorName}`;
        }
        
        const specialty = doctorInfo.qualifications || 
                         doctorInfo.specialty || 
                         doctorInfo.specialization ||
                         'General Practitioner';
        
        const doctorNameElement = document.getElementById('doctorName');
        const doctorSpecialtyElement = document.getElementById('doctorSpecialty');
        
        if (doctorNameElement) {
            doctorNameElement.textContent = doctorName;
        }
        if (doctorSpecialtyElement) {
            doctorSpecialtyElement.textContent = specialty;
        }
        
        currentDoctorInfo = doctorInfo;
        
        console.log('Doctor name set to:', doctorName);
        console.log('Doctor specialty set to:', specialty);
    } else {
        console.warn('No doctor info found in storage');
        
        // Set fallback while trying to load from API
        const doctorNameElement = document.getElementById('doctorName');
        const doctorSpecialtyElement = document.getElementById('doctorSpecialty');
        
        if (doctorNameElement) {
            doctorNameElement.textContent = 'Dr. Unknown';
        }
        if (doctorSpecialtyElement) {
            doctorSpecialtyElement.textContent = 'General Practitioner';
        }
        
        // Try to load from API if no local data
        loadDoctorInfoFromAPI();
    }
}

// Load doctor information from API as fallback
async function loadDoctorInfoFromAPI() {
    try {
        const doctorId = getCurrentDoctorId();
        const response = await fetch(`${baseURL}/api/doctor/${doctorId}`, {
            headers: getDoctorAuthHeaders()
        });
        
        if (response.ok) {
            const data = await response.json();
            const doctorInfo = data.doctor || data;
            
            // Update display with API data
            const doctorName = doctorInfo.doctor_name || 
                              doctorInfo.name || 
                              (doctorInfo.first_name ? (doctorInfo.first_name + ' ' + (doctorInfo.last_name || '')) : null) ||
                              doctorInfo.fullName ||
                              'Dr. Unknown';
            
            const specialty = doctorInfo.qualifications || 
                             doctorInfo.specialty || 
                             doctorInfo.specialization ||
                             'General Practitioner';
            
            document.getElementById('doctorName').textContent = doctorName;
            document.getElementById('doctorSpecialty').textContent = specialty;
            
            // Save to storage for future use
            localStorage.setItem('doctorInfo', JSON.stringify(doctorInfo));
            currentDoctorInfo = doctorInfo;
            
            console.log('Doctor info loaded from API:', doctorName);
        } else {
            console.error('Failed to load doctor info from API');
            // Set fallback display
            document.getElementById('doctorName').textContent = 'Dr. Unknown';
            document.getElementById('doctorSpecialty').textContent = 'General Practitioner';
        }
    } catch (error) {
        console.error('Error loading doctor info from API:', error);
        // Set fallback display
        document.getElementById('doctorName').textContent = 'Dr. Unknown';
        document.getElementById('doctorSpecialty').textContent = 'General Practitioner';
    }
}

// Setup all event listeners
function setupEventListeners() {
    // Sidebar navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.dataset.section;
            showSection(section);
            
            // Update active nav link
            document.querySelectorAll('.nav-link').forEach(navLink => {
                navLink.classList.remove('active');
            });
            this.classList.add('active');
        });
    });

    // Form submissions
    document.getElementById('uploadForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        await uploadDocument();
    });

    document.getElementById('supportForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        await createSupportTicket();
    });

    // Filters
    document.getElementById('appointmentStatusFilter').addEventListener('change', function() {
        filterAppointments();
    });

    document.getElementById('appointmentDateFilter').addEventListener('change', function() {
        filterAppointments();
    });
}

// Show specific section
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(`${sectionId}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update page title
    const titles = {
        'dashboard': 'Dashboard',
        'appointments': 'Appointments',
        'documents': 'Documents',
        'support': 'Support'
    };
    
    document.getElementById('pageTitle').textContent = titles[sectionId] || 'Dashboard';
    
    // Load section-specific data
    loadSectionData(sectionId);
}

// Load data for specific section
function loadSectionData(sectionId) {
    switch(sectionId) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'appointments':
            loadAppointments();
            break;
        case 'documents':
            loadDocuments();
            loadPatientsForUpload();
            break;
        case 'support':
            loadSupportTickets();
            break;
    }
}

// Load dashboard statistics
async function loadDashboardData() {
    try {
        const doctorId = getCurrentDoctorId();
        
        // Try authenticated route first, fallback to test route
        let appointmentsResponse;
        try {
            console.log('Fetching appointments for doctor ID:', doctorId);
            appointmentsResponse = await fetch(`${baseURL}/doctor/appointments/${doctorId}`, {
                headers: getDoctorAuthHeaders()
            });
            
            // If response is not ok (403, 401, etc.), try fallback
            if (!appointmentsResponse.ok) {
                console.log('Authentication failed with status:', appointmentsResponse.status, 'trying test route');
                appointmentsResponse = await fetch(`${baseURL}/doctor/appointments-test/${doctorId}`);
            }
        } catch (authError) {
            console.log('Fetch failed, trying test route:', authError);
            // Fallback to test route
            appointmentsResponse = await fetch(`${baseURL}/doctor/appointments-test/${doctorId}`);
        }
        
        if (appointmentsResponse.ok) {
            const appointmentsData = await appointmentsResponse.json();
            const appointments = appointmentsData.appointments || [];
            
            // Calculate statistics
            const today = new Date().toISOString().split('T')[0];
            const todayAppointments = appointments.filter(app => 
                app.appointment_date === today
            ).length;
            
            const uniquePatients = new Set(appointments.map(app => app.patient_id)).size;
            
            // Update dashboard stats
            document.getElementById('totalAppointments').textContent = appointments.length;
            document.getElementById('todayAppointments').textContent = todayAppointments;
            document.getElementById('totalPatients').textContent = uniquePatients;
            
            // Load recent appointments
            loadRecentAppointments(appointments.slice(0, 5));
        } else {
            console.error('Failed to load appointments:', appointmentsResponse.status);
            // Set default values
            document.getElementById('totalAppointments').textContent = '0';
            document.getElementById('todayAppointments').textContent = '0';
            document.getElementById('totalPatients').textContent = '0';
        }
        
        // Load documents count
        try {
            const documentsResponse = await fetch(`${baseURL}/api/dashboard/doctor/${doctorId}/documents`, {
                headers: getDoctorAuthHeaders()
            });
            
            if (documentsResponse.ok) {
                const documentsData = await documentsResponse.json();
                const documents = documentsData.data || [];
                document.getElementById('totalDocuments').textContent = documents.length;
            } else {
                document.getElementById('totalDocuments').textContent = '0';
            }
        } catch (docError) {
            console.error('Error loading documents:', docError);
            document.getElementById('totalDocuments').textContent = '0';
        }
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showAlert('Error loading dashboard data', 'error');
    }
}

// Load recent appointments for dashboard
function loadRecentAppointments(appointments) {
    const tbody = document.getElementById('recentAppointments');
    tbody.innerHTML = '';
    
    if (appointments.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    <div class="icon">📅</div>
                    <h3>No Recent Appointments</h3>
                    <p>You don't have any recent appointments.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    appointments.forEach(appointment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${appointment.patient_first_name || 'Unknown Patient'}</td>
            <td>${formatDate(appointment.appointment_date)}</td>
            <td>${appointment.slot_time || 'N/A'}</td>
            <td><span class="status-badge ${appointment.status}">${appointment.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view" onclick="viewAppointment('${appointment.id}')">View</button>
                    <button class="action-btn edit" onclick="updateAppointmentStatus('${appointment.id}', 'completed')">Complete</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Load all appointments
async function loadAppointments() {
    try {
        const doctorId = getCurrentDoctorId();
        
        // Try authenticated route first, fallback to test route
        let response;
        try {
            response = await fetch(`${baseURL}/doctor/appointments/${doctorId}`, {
                headers: getDoctorAuthHeaders()
            });
            
            // If response is not ok (403, 401, etc.), try fallback
            if (!response.ok) {
                console.log('Authentication failed with status:', response.status, 'trying test route');
                response = await fetch(`${baseURL}/doctor/appointments-test/${doctorId}`);
            }
        } catch (authError) {
            console.log('Fetch failed, trying test route:', authError);
            // Fallback to test route
            response = await fetch(`${baseURL}/doctor/appointments-test/${doctorId}`);
        }
        
        if (response.ok) {
            const data = await response.json();
            currentAppointments = data.appointments || [];
            renderAppointments(currentAppointments);
        } else {
            throw new Error('Failed to load appointments');
        }
    } catch (error) {
        console.error('Error loading appointments:', error);
        showAlert('Error loading appointments', 'error');
        
        // Show empty state
        const tbody = document.getElementById('appointmentsList');
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <div class="icon">📅</div>
                    <h3>No Appointments Found</h3>
                    <p>Unable to load appointments. Please try again.</p>
                </td>
            </tr>
        `;
    }
}

// Render appointments table
function renderAppointments(appointments) {
    const tbody = document.getElementById('appointmentsList');
    tbody.innerHTML = '';
    
    if (appointments.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <div class="icon">📅</div>
                    <h3>No Appointments</h3>
                    <p>You don't have any appointments matching the current filter.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    appointments.forEach(appointment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${appointment.patient_first_name || 'Unknown Patient'}</td>
            <td>${formatDate(appointment.appointment_date)}</td>
            <td>${appointment.slot_time || 'N/A'}</td>
            <td><span class="status-badge ${appointment.status}">${appointment.status}</span></td>
            <td>${appointment.problem_description || 'N/A'}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view" onclick="viewAppointment('${appointment.id}')">View</button>
                    <button class="action-btn edit" onclick="updateAppointmentStatus('${appointment.id}', 'completed')">Complete</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Filter appointments
function filterAppointments() {
    const statusFilter = document.getElementById('appointmentStatusFilter').value;
    const dateFilter = document.getElementById('appointmentDateFilter').value;
    
    let filteredAppointments = currentAppointments;
    
    if (statusFilter) {
        filteredAppointments = filteredAppointments.filter(app => app.status === statusFilter);
    }
    
    if (dateFilter) {
        filteredAppointments = filteredAppointments.filter(app => app.appointment_date === dateFilter);
    }
    
    renderAppointments(filteredAppointments);
}

// Load patients for upload dropdown
async function loadPatientsForUpload() {
    try {
        const response = await fetch(`${baseURL}/user/get-all-users`, {
            headers: getDoctorAuthHeaders()
        });
        
        if (response.ok) {
            const data = await response.json();
            const patients = data.data || [];
            
            const select = document.getElementById('patientSelect');
            select.innerHTML = '<option value="">Choose a patient...</option>';
            
            patients.forEach(patient => {
                const option = document.createElement('option');
                option.value = patient.id;
                option.textContent = `${patient.first_name} ${patient.last_name} (${patient.email})`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading patients:', error);
        showAlert('Error loading patients', 'error');
    }
}

// Upload document
async function uploadDocument() {
    const patientId = document.getElementById('patientSelect').value;
    const documentType = document.getElementById('documentType').value;
    const documentFile = document.getElementById('documentFile').files[0];
    const description = document.getElementById('description').value;
    
    if (!patientId || !documentType || !documentFile) {
        showAlert('Please fill in all required fields', 'error');
        return;
    }
    
    // File size validation (5MB limit)
    if (documentFile.size > 5 * 1024 * 1024) {
        showAlert('File size must be less than 5MB', 'error');
        return;
    }
    
    try {
        const uploadBtn = document.getElementById('uploadBtn');
        uploadBtn.disabled = true;
        uploadBtn.innerHTML = '⏳ Uploading...';
        
        const formData = new FormData();
        formData.append('document', documentFile);
        formData.append('patientId', patientId);
        formData.append('documentType', documentType);
        formData.append('description', description);
        
        const doctorId = getCurrentDoctorId();
        const response = await fetch(`${baseURL}/api/dashboard/doctor/${doctorId}/documents/upload`, {
            method: 'POST',
            headers: getDoctorAuthHeadersForUpload(),
            body: formData
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                showAlert('Document uploaded successfully!', 'success');
                document.getElementById('uploadForm').reset();
                loadDocuments(); // Refresh documents list
            } else {
                throw new Error(result.error || result.details || 'Upload failed');
            }
        } else {
            let errorResult = {};
            try {
                errorResult = await response.json();
            } catch (e) {}
            throw new Error(errorResult.error || errorResult.details || 'Upload failed');
        }
    } catch (error) {
        console.error('Upload error:', error);
        showAlert('Upload failed: ' + error.message, 'error');
    } finally {
        const uploadBtn = document.getElementById('uploadBtn');
        uploadBtn.disabled = false;
        uploadBtn.innerHTML = '📤 Upload Document';
    }
}

// Load documents
async function loadDocuments() {
    try {
        const doctorId = getCurrentDoctorId();
        const response = await fetch(`${baseURL}/api/dashboard/doctor/${doctorId}/documents`, {
            headers: getDoctorAuthHeaders()
        });
        
        if (response.ok) {
            const data = await response.json();
            currentDocuments = data.data || [];
            renderDocuments(currentDocuments);
        } else {
            throw new Error('Failed to load documents');
        }
    } catch (error) {
        console.error('Error loading documents:', error);
        showAlert('Error loading documents', 'error');
        
        // Show empty state
        const tbody = document.getElementById('documentsList');
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    <div class="icon">📄</div>
                    <h3>No Documents Found</h3>
                    <p>Unable to load documents. Please try again.</p>
                </td>
            </tr>
        `;
    }
}

// Render documents table
function renderDocuments(documents) {
    const tbody = document.getElementById('documentsList');
    tbody.innerHTML = '';
    
    if (documents.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    <div class="icon">📄</div>
                    <h3>No Documents</h3>
                    <p>No documents have been uploaded yet.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    documents.forEach(doc => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${doc.document_name || 'Unknown'}</td>
            <td>${doc.users ? `${doc.users.first_name} ${doc.users.last_name}` : 'Unknown Patient'}</td>
            <td>${doc.document_type || 'Unknown'}</td>
            <td>${formatDate(doc.uploaded_at)}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view" onclick="viewDocument('${doc.file_url}')">View</button>
                    <button class="action-btn delete" onclick="deleteDocument('${doc.id}')">Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Create support ticket
async function createSupportTicket() {
    const ticketType = document.getElementById('ticketType').value;
    const priority = document.getElementById('ticketPriority').value;
    const subject = document.getElementById('ticketSubject').value;
    const description = document.getElementById('ticketDescription').value;
    
    if (!ticketType || !subject || !description) {
        showAlert('Please fill in all required fields', 'error');
        return;
    }
    
    try {
        const supportBtn = document.getElementById('supportBtn');
        supportBtn.disabled = true;
        supportBtn.innerHTML = '⏳ Creating...';
        
        const doctorInfo = getCurrentDoctorFromStorage();
        const ticketData = {
            userId: doctorInfo ? doctorInfo.id : 'unknown',
            userType: 'doctor',
            userName: doctorInfo ? doctorInfo.doctor_name : 'Unknown Doctor',
            userEmail: doctorInfo ? doctorInfo.email : 'unknown@example.com',
            ticketType: ticketType,
            subject: subject,
            description: description,
            priority: priority
        };
        
        console.log('Creating support ticket with data:', ticketData);
        
        let response;
        try {
            response = await fetch(`${baseURL}/api/dashboard/support/ticket`, {
                method: 'POST',
                headers: getDoctorAuthHeaders(),
                body: JSON.stringify(ticketData)
            });
            
            // If auth fails, try test endpoint
            if (!response.ok && (response.status === 401 || response.status === 403)) {
                console.log('Auth failed, trying test endpoint...');
                response = await fetch(`${baseURL}/api/dashboard/support/ticket-test`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(ticketData)
                });
            }
        } catch (fetchError) {
            console.log('Fetch failed, trying test endpoint:', fetchError);
            response = await fetch(`${baseURL}/api/dashboard/support/ticket-test`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ticketData)
            });
        }
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                showAlert('Support ticket created successfully!', 'success');
                document.getElementById('supportForm').reset();
                loadSupportTickets(); // Refresh tickets list
            } else {
                throw new Error(result.error || 'Failed to create ticket');
            }
        } else {
            const errorText = await response.text();
            console.error('Response error:', errorText);
            throw new Error('Failed to create ticket');
        }
    } catch (error) {
        console.error('Error creating support ticket:', error);
        showAlert('Error creating support ticket: ' + error.message, 'error');
    } finally {
        const supportBtn = document.getElementById('supportBtn');
        supportBtn.disabled = false;
        supportBtn.innerHTML = '🎫 Create Ticket';
    }
}

// Load support tickets
async function loadSupportTickets() {
    try {
        const doctorInfo = getCurrentDoctorFromStorage();
        const userId = doctorInfo ? doctorInfo.id : 'unknown';
        
        const response = await fetch(`${baseURL}/api/dashboard/support/tickets/${userId}?userType=doctor`, {
            headers: getDoctorAuthHeaders()
        });
        
        if (response.ok) {
            const data = await response.json();
            currentSupportTickets = data.data || [];
            renderSupportTickets(currentSupportTickets);
        } else {
            throw new Error('Failed to load support tickets');
        }
    } catch (error) {
        console.error('Error loading support tickets:', error);
        showAlert('Error loading support tickets', 'error');
        
        // Show empty state
        const tbody = document.getElementById('supportTicketsList');
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <div class="icon">🎫</div>
                    <h3>No Support Tickets</h3>
                    <p>You haven't created any support tickets yet.</p>
                </td>
            </tr>
        `;
    }
}

// Render support tickets table
function renderSupportTickets(tickets) {
    const tbody = document.getElementById('supportTicketsList');
    tbody.innerHTML = '';
    
    if (tickets.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <div class="icon">🎫</div>
                    <h3>No Support Tickets</h3>
                    <p>You haven't created any support tickets yet.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tickets.forEach(ticket => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${ticket.id}</td>
            <td>${ticket.subject}</td>
            <td>${ticket.ticket_type}</td>
            <td><span class="status-badge ${ticket.priority}">${ticket.priority}</span></td>
            <td><span class="status-badge ${ticket.status}">${ticket.status || 'open'}</span></td>
            <td>${formatDate(ticket.created_at)}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view" onclick="viewTicket('${ticket.id}')">View</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Utility functions
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

function showAlert(message, type) {
    const alertMessage = document.getElementById('alertMessage');
    alertMessage.textContent = message;
    alertMessage.className = `alert ${type}`;
    alertMessage.style.display = 'block';
    
    setTimeout(() => {
        alertMessage.style.display = 'none';
    }, 5000);
}

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
    
    // Create and show modal using a simple alert-style modal
    const modalDiv = document.createElement('div');
    modalDiv.className = 'custom-modal-overlay';
    modalDiv.innerHTML = `
        <div class="custom-modal">
            ${modalContent}
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeCustomModal()">Close</button>
                <button class="btn btn-primary" onclick="completeAppointment('${appointment.id}')">Mark Complete</button>
                <button class="btn btn-success" onclick="joinVideoCall('${appointment.id}')" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); border: none; padding: 10px 20px; border-radius: 6px; color: white; font-weight: 500; cursor: pointer;">
                    <i class="fas fa-video" style="margin-right: 8px;"></i>
                    Join Video Call
                </button>
            </div>
        </div>
    `;
    
    // Add styles for the modal
    const style = document.createElement('style');
    style.textContent = `
        .custom-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        }
        .custom-modal {
            background: white;
            border-radius: 12px;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        .appointment-modal .modal-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 12px 12px 0 0;
        }
        .appointment-modal .modal-header h2 {
            margin: 0;
            font-size: 1.5rem;
        }
        .appointment-modal .modal-body {
            padding: 20px;
        }
        .patient-details-section, .problem-description-section, .appointment-info-section {
            margin-bottom: 25px;
        }
        .patient-details-section h3, .problem-description-section h3, .appointment-info-section h3 {
            color: #333;
            margin-bottom: 15px;
            font-size: 1.2rem;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        .detail-item {
            display: flex;
            flex-direction: column;
        }
        .detail-item label {
            font-weight: 600;
            color: #555;
            margin-bottom: 5px;
        }
        .detail-item span {
            color: #333;
            padding: 8px;
            background: #f8f9fa;
            border-radius: 4px;
        }
        .problem-text {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            line-height: 1.6;
        }
        .status.status-pending { background: #fff3cd; color: #856404; }
        .status.status-confirmed { background: #d1ecf1; color: #0c5460; }
        .status.status-completed { background: #d4edda; color: #155724; }
        .payment-status.paid { background: #d4edda; color: #155724; }
        .payment-status.unpaid { background: #f8d7da; color: #721c24; }
        .modal-footer {
            padding: 20px;
            border-top: 1px solid #dee2e6;
            display: flex;
            gap: 10px;
            justify-content: flex-end;
        }
        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
        }
        .btn-secondary {
            background: #6c757d;
            color: white;
        }
        .btn-primary {
            background: #007bff;
            color: white;
        }
        .btn:hover {
            opacity: 0.9;
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(modalDiv);
    
    // Close modal when clicking outside
    modalDiv.addEventListener('click', function(e) {
        if (e.target === modalDiv) {
            closeCustomModal();
        }
    });
}

// Helper functions for modal
function getStatusClass(status) {
    switch (status) {
        case 'completed': return 'status-completed';
        case 'pending': return 'status-pending';
        case 'confirmed': return 'status-confirmed';
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

// Close custom modal
function closeCustomModal() {
    const modal = document.querySelector('.custom-modal-overlay');
    if (modal) {
        modal.remove();
    }
}

// Complete appointment function
async function completeAppointment(appointmentId) {
    try {
        const result = confirm('Are you sure you want to mark this appointment as completed?');
        
        if (result) {
            const response = await fetch(`${baseURL}/appointment/complete/${appointmentId}`, {
                method: 'PATCH',
                headers: getDoctorAuthHeaders(),
            });
            
            if (!response.ok) {
                throw new Error('Failed to complete appointment');
            }
            
            const data = await response.json();
            
            if (data.success) {
                showAlert('Appointment marked as completed!', 'success');
                closeCustomModal();
                // Reload appointments to reflect the change
                loadAppointments();
                loadDashboardData();
            } else {
                showAlert('Failed to complete appointment', 'error');
            }
        }
    } catch (error) {
        console.error('Error completing appointment:', error);
        showAlert('Failed to complete appointment', 'error');
    }
}

// Action functions
async function viewAppointment(appointmentId) {
    try {
        const response = await fetch(`${baseURL}/appointment/view/${appointmentId}`, {
            method: 'GET',
            headers: getDoctorAuthHeaders(),
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch appointment details');
        }
        
        const data = await response.json();
        
        if (data.success) {
            showAppointmentModal(data.appointment, data.patient);
        } else {
            showAlert('Failed to load appointment details', 'error');
        }
    } catch (error) {
        console.error('Error viewing appointment:', error);
        showAlert('Failed to load appointment details', 'error');
    }
}

function updateAppointmentStatus(appointmentId, newStatus) {
    showAlert(`Updating appointment status to ${newStatus}...`, 'info');
    // Implement status update
}

function viewDocument(documentUrl) {
    if (documentUrl) {
        window.open(documentUrl, '_blank');
    } else {
        showAlert('Document URL not available', 'error');
    }
}

function deleteDocument(documentId) {
    if (confirm('Are you sure you want to delete this document?')) {
        showAlert('Deleting document...', 'info');
        // Implement document deletion
    }
}

function viewTicket(ticketId) {
    showAlert('Viewing ticket details...', 'info');
    // Implement ticket details view
}

// Join video call function
function joinVideoCall(appointmentId) {
    const videoCallUrl = 'https://itabaza-videocall.onrender.com/';
    console.log('Doctor joining video call for appointment:', appointmentId);
    console.log('Opening video call URL:', videoCallUrl);
    
    // Open video call in new tab
    window.open(videoCallUrl, '_blank');
    
    // Show confirmation message
    showAlert('Opening video call application. Please wait for the page to load.', 'info');
}

// Make functions globally accessible for inline onclick handlers
window.joinVideoCall = joinVideoCall;
window.closeCustomModal = closeCustomModal;
window.completeAppointment = completeAppointment;
window.viewAppointment = viewAppointment;
window.updateAppointmentStatus = updateAppointmentStatus;
window.viewDocument = viewDocument;
window.deleteDocument = deleteDocument;
window.viewTicket = viewTicket;
window.toggleSidebar = toggleSidebar;
window.refreshData = refreshData;
window.showSection = showSection;
window.loadAppointments = loadAppointments;
window.loadDocuments = loadDocuments;
window.loadSupportTickets = loadSupportTickets;

// Global functions
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('expanded');
}

function refreshData() {
    showAlert('Refreshing data...', 'info');
    loadDashboardData();
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        logoutDoctor();
        window.location.href = 'https://itabaza-2qjt.vercel.app/login.html';
    }
}
window.logout = logout;

function logoutDoctor() {
    localStorage.removeItem('doctorToken');
    localStorage.removeItem('doctorInfo');
    sessionStorage.removeItem('doctorToken');
    sessionStorage.removeItem('doctorInfo');
}

// Complete logout function that clears all possible session data
function performCompleteLogout() {
    try {
        // Clear all possible authentication and session data
        const keysToRemove = [
            // Doctor-specific keys
            'doctorToken',
            'doctorInfo',
            'doctorId',
            'doctorSessionId',
            
            // General user keys
            'token',
            'userToken',
            'authToken',
            'accessToken',
            'userInfo',
            'userData',
            'userName',
            'userEmail',
            'userId',
            'sessionToken',
            'refreshToken',
            
            // Admin keys
            'admin',
            'adminToken',
            'adminInfo',
            
            // Patient keys
            'patientToken',
            'patientInfo',
            'patientId',
            
            // Any other potential session keys
            'isLoggedIn',
            'loginTime',
            'userRole',
            'userType',
            'profileImage',
            'userProfileImage'
        ];
        
        // Clear from localStorage
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
        });
        
        // Clear from sessionStorage
        keysToRemove.forEach(key => {
            sessionStorage.removeItem(key);
        });
        
        // Make logout API call to server (if backend supports it)
        try {
            fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include' // Include cookies
            }).catch(e => {
                console.log('Logout API call failed (this is normal if not implemented):', e);
            });
        } catch (e) {
            console.log('Could not make logout API call:', e);
        }
        
        // Show logout message
        showAlert('You have been successfully logged out', 'success');
        
        // Force reload to clear any cached data and redirect
        setTimeout(() => {
            // Clear any remaining data and redirect
            window.location.replace('https://itabaza-2qjt.vercel.app/login.html');
        }, 1000);
        
    } catch (error) {
        console.error('Error during logout:', error);
        // Even if there's an error, still redirect to login
        window.location.replace('https://itabaza-2qjt.vercel.app/login.html');
    }
}

// Make functions globally available
window.showSection = showSection;
window.toggleSidebar = toggleSidebar;
window.refreshData = refreshData;
window.loadAppointments = loadAppointments;
window.loadDocuments = loadDocuments;
window.loadSupportTickets = loadSupportTickets;
window.viewAppointment = viewAppointment;
window.updateAppointmentStatus = updateAppointmentStatus;
window.viewDocument = viewDocument;
window.deleteDocument = deleteDocument;
window.viewTicket = viewTicket;
window.completeAppointment = completeAppointment;
window.closeCustomModal = closeCustomModal;
