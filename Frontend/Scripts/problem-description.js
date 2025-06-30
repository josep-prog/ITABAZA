import { baseURL } from './baseURL.js';

class ProblemDescriptionManager {
    constructor() {
        this.appointmentData = {};
        this.init();
    }

    init() {
        this.loadStoredData();
        this.setupEventListeners();
        this.updateSummary();
    }

    loadStoredData() {
        const doctorData = sessionStorage.getItem('selectedDoctor');
        const slot = sessionStorage.getItem('selectedSlot');
        const date = sessionStorage.getItem('selectedDate');
        const consultationType = sessionStorage.getItem('consultationType');
        
        if (!doctorData || !slot || !date) {
            // Redirect back if missing data
            window.location.href = 'book.appointment.html';
            return;
        }
        
        this.appointmentData = {
            doctor: JSON.parse(doctorData),
            slot: slot,
            date: date,
            consultationType: consultationType || 'in-person'
        };
    }

    setupEventListeners() {
        const form = document.getElementById('problem-form');
        const problemDescription = document.getElementById('problem-description');
        const charCount = document.getElementById('char-count');
        const continueBtn = document.getElementById('continue-btn');

        // Character count for problem description
        problemDescription.addEventListener('input', () => {
            const count = problemDescription.value.length;
            const maxLength = 1000;
            charCount.textContent = `${count}/${maxLength} characters`;
            
            if (count > maxLength * 0.9) {
                charCount.className = 'character-count warning';
            } else if (count > maxLength * 0.95) {
                charCount.className = 'character-count danger';
            } else {
                charCount.className = 'character-count';
            }
        });

        // Symptom selection
        const symptomItems = document.querySelectorAll('.symptom-item');
        symptomItems.forEach(item => {
            item.addEventListener('click', () => {
                const checkbox = item.querySelector('input[type="checkbox"]');
                checkbox.checked = !checkbox.checked;
                item.classList.toggle('selected', checkbox.checked);
            });
        });

        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmission();
        });
    }

    updateSummary() {
        if (!this.appointmentData.doctor) return;

        document.getElementById('summary-doctor').textContent = this.appointmentData.doctor.doctor_name;
        document.getElementById('summary-date').textContent = this.formatDate(this.appointmentData.date);
        document.getElementById('summary-time').textContent = this.appointmentData.slot;
        
        const consultationTypeText = this.appointmentData.consultationType === 'video-call' ? 'Video Call' : 'In-Person';
        document.getElementById('summary-type').textContent = consultationTypeText;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    async handleFormSubmission() {
        const form = document.getElementById('problem-form');
        const formData = new FormData(form);
        
        // Validate required fields
        const age = formData.get('age');
        const gender = formData.get('gender');
        const problemDescription = formData.get('problemDescription');
        
        if (!age || !gender || !problemDescription) {
            alert('Please fill in all required fields.');
            return;
        }

        // Collect form data
        const symptoms = Array.from(form.querySelectorAll('input[name="symptoms"]:checked'))
            .map(checkbox => checkbox.value);
        
        const appointmentDetails = {
            ...this.appointmentData,
            patientAge: age,
            patientGender: gender,
            problemDescription: problemDescription,
            symptoms: symptoms,
            medicalHistory: formData.get('medicalHistory') || '',
            medications: formData.get('medications') || '',
            timestamp: new Date().toISOString()
        };

        // Store appointment details
        sessionStorage.setItem('appointmentDetails', JSON.stringify(appointmentDetails));
        
        // Navigate to payment page
        window.location.href = 'payment.html';
    }

    validateForm() {
        const age = document.getElementById('patient-age').value;
        const gender = document.getElementById('patient-gender').value;
        const problemDescription = document.getElementById('problem-description').value;

        const errors = [];

        if (!age || age < 1 || age > 120) {
            errors.push('Please enter a valid age (1-120 years).');
        }

        if (!gender) {
            errors.push('Please select your gender.');
        }

        if (!problemDescription || problemDescription.trim().length < 10) {
            errors.push('Please provide a detailed description of your problem (at least 10 characters).');
        }

        if (errors.length > 0) {
            alert('Please correct the following errors:\n' + errors.join('\n'));
            return false;
        }

        return true;
    }
}

// Initialize the problem description manager
window.problemDescriptionManager = new ProblemDescriptionManager(); 