import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

function AppointmentPage() {
  const location = useLocation();
  const navType = location.state?.type;
  const navDoctor = location.state?.selectedDoctor;
  const navSlot = location.state?.selectedSlot;

  const [type, setType] = useState(navType || '');
  const [selectedDoctor, setSelectedDoctor] = useState<any>(navDoctor || null);
  const [selectedSlot, setSelectedSlot] = useState(navSlot || '');
  const [step, setStep] = useState(navType && navDoctor ? 2 : 0); // 2 = problem description step
  const [problem, setProblem] = useState('');
  const [desc, setDesc] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [visitFirst, setVisitFirst] = useState('yes');
  const [preferredDoctor, setPreferredDoctor] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<any>(null);
  const [doctorSpecialty, setDoctorSpecialty] = useState('');
  const [hospitalDistrict, setHospitalDistrict] = useState('');
  const [hospitalSector, setHospitalSector] = useState('');
  const [hospitalCell, setHospitalCell] = useState('');
  const [hospitalSearch, setHospitalSearch] = useState('');

  const { user } = useAuth();

  // Dummy data for doctors and hospitals (only today slots)
  const doctors = [
    { name: 'Dr. Sarah Johnson', specialty: 'Cardiology', rating: 4.9, photo: 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&w=80', slots: ['Today 10:00', 'Today 14:00', 'Today 16:00'] },
    { name: 'Dr. Michael Chen', specialty: 'Dermatology', rating: 4.8, photo: 'https://images.pexels.com/photos/6749778/pexels-photo-6749778.jpeg?auto=compress&w=80', slots: ['Today 11:00', 'Today 15:00', 'Today 17:00'] },
  ];
  const hospitals = [
    { name: 'City Hospital', address: '123 Main St', photo: 'https://images.pexels.com/photos/3259629/pexels-photo-3259629.jpeg?auto=compress&w=80', specialties: ['Cardiology', 'Dermatology'], slots: ['Today 10:00', 'Today 14:00'], distance: '2km', district: 'Central', sector: 'A', cell: 'Alpha' },
    { name: 'Green Clinic', address: '456 Oak Ave', photo: 'https://images.pexels.com/photos/236380/pexels-photo-236380.jpeg?auto=compress&w=80', specialties: ['Pediatrics', 'Neurology'], slots: ['Today 12:00', 'Today 16:00'], distance: '5km', district: 'West', sector: 'B', cell: 'Beta' },
  ];
  const problems = ['General Checkup', 'Fever', 'Headache', 'Skin Rash', 'Other'];

  // Handlers
  function handleTypeSelect(t: string) {
    setType(t);
    setStep(1);
    setSelectedDoctor(null);
    setSelectedSlot('');
    setSelectedHospital(null);
    setDoctorSpecialty('');
    setHospitalDistrict('');
    setHospitalSector('');
    setHospitalCell('');
    setHospitalSearch('');
  }
  function handleDoctorSelect(doc: any, slot: string) {
    setSelectedDoctor(doc);
    setSelectedSlot(slot);
    setStep(2);
  }
  function handleHospitalSelect(hosp: any, slot: string) {
    setSelectedHospital(hosp);
    setSelectedSlot(slot);
    setStep(2);
  }
  function handleProblemSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStep(3);
  }
  async function createAppointment() {
    if (!user) {
      alert('You must be logged in to book an appointment.');
      return;
    }
    const appointmentCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    const data = {
      user_id: user.id,
      doctor_id: null,
      appointment_date: selectedSlot, // ensure this is a valid timestamp string
      appointment_type: type === 'video' ? 'video' : 'in-person',
      status: 'pending',
      room: type === 'inperson' ? 'Room 12' : null, // You can set this dynamically
      video_url: type === 'video' ? 'https://your-meeting-url.com' : null, // Set dynamically if needed
      patient_name: name,
      doctor_name: selectedDoctor?.name || (selectedHospital?.name || null),
      appointment_code: appointmentCode,
      feedback: null
    };
    const { error } = await supabase.from('appointments').insert([data]);
    if (error) {
      alert('Error booking appointment: ' + error.message);
    } else {
      alert('Appointment booked! Your code: ' + appointmentCode);
    }
  }
  function handlePaymentSubmit(e: React.FormEvent) {
    e.preventDefault();
    setConfirmed(true);
    createAppointment();
  }
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  }

  // UI
  return (
    <div className="min-h-screen bg-blue-50 py-8 px-2">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        {/* Header Section */}
        <h1 className="text-2xl font-bold text-blue-700 mb-2 text-center">Book Your Appointment</h1>
        <p className="text-gray-600 mb-6 text-center">Choose between a virtual consultation or an in-person visit. Follow the steps below to complete your booking.</p>

        {/* Step 0: Type Selection */}
        {step === 0 && (
          <>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex-1 border rounded-xl p-6 flex flex-col items-center bg-blue-50 shadow">
                <span className="text-4xl mb-2">📹</span>
                <h2 className="font-semibold mb-2 text-blue-700">Video Call Appointment</h2>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg mt-auto w-full" onClick={() => handleTypeSelect('video')}>Book Video Call</button>
              </div>
              <div className="flex-1 border rounded-xl p-6 flex flex-col items-center bg-green-50 shadow">
                <span className="text-4xl mb-2">🏥</span>
                <h2 className="font-semibold mb-2 text-green-700">In-Person Appointment</h2>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg mt-auto w-full" onClick={() => handleTypeSelect('inperson')}>Book In-Person Visit</button>
              </div>
            </div>
            {/* Step-by-step experience guide */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-blue-50 rounded-xl p-6 shadow">
                <h3 className="text-lg font-bold text-blue-700 mb-2 flex items-center gap-2"><span>📹</span> Video Call Appointment Flow</h3>
                <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2">
                  <li><b>Confirm Video Consultation:</b> System confirms your selection and explains the process.</li>
                  <li><b>Choose Doctor & Time:</b> Filterable list of doctors, sorted by today's availability and specialty. Select a doctor and time slot.</li>
                  <li><b>Describe Your Condition:</b> Fill a structured form with your reason for visit and symptoms.</li>
                  <li><b>Payment & Confirmation:</b> Receive payment code (1043577), upload proof, and submit. After approval, you'll get a meeting URL, doctor details, and appointment code.</li>
                </ol>
              </div>
              <div className="bg-green-50 rounded-xl p-6 shadow">
                <h3 className="text-lg font-bold text-green-700 mb-2 flex items-center gap-2"><span>🏥</span> In-Person Appointment Flow</h3>
                <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2">
                  <li><b>Confirm In-Person Visit:</b> System confirms your preference and explains the process.</li>
                  <li><b>Find Hospital & Time:</b> Location-aware hospital finder, filter by district/sector/cell or search. Select a hospital and time slot.</li>
                  <li><b>Describe Your Condition:</b> Fill a structured form with your reason for visit, symptoms, and extra fields for physical visits.</li>
                  <li><b>Payment & Confirmation:</b> Receive payment code (1043577), upload proof, and submit. After approval, you'll get room details, meeting time, and appointment code.</li>
                </ol>
              </div>
            </div>
          </>
        )}

        {/* Step 1: Select Doctor or Hospital */}
        {step === 1 && type === 'video' && (
          <div>
            <h2 className="font-semibold text-lg mb-2 text-blue-700">Step 1: Choose a Doctor for Video Call</h2>
            <p className="text-gray-600 mb-4 text-sm">Select a specialty to filter doctors. Only today's available slots are shown, sorted by most open slots.</p>
            <div className="mb-4 flex gap-2 items-center">
              <label className="text-sm">Specialty:</label>
              <select className="border rounded px-2 py-1" value={doctorSpecialty} onChange={e => setDoctorSpecialty(e.target.value)}>
                <option value="">All</option>
                {[...new Set(doctors.map(d => d.specialty))].map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              {doctors
                .filter(doc => !doctorSpecialty || doc.specialty === doctorSpecialty)
                .sort((a, b) => b.slots.length - a.slots.length)
                .map(doc => (
                <div key={doc.name} className="flex items-center border rounded-lg p-3 mb-2 bg-blue-50">
                  <img src={doc.photo} alt={doc.name} className="w-12 h-12 rounded-full mr-3" />
                  <div className="flex-1">
                    <div className="font-semibold">{doc.name}</div>
                    <div className="text-xs text-gray-500">{doc.specialty} • ⭐{doc.rating}</div>
                    <div className="flex gap-2 mt-1">
                      {doc.slots.map(slot => (
                        <button key={slot} className="text-xs bg-blue-200 px-2 py-1 rounded" onClick={() => handleDoctorSelect(doc, slot)}>{slot}</button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {step === 1 && type === 'inperson' && (
          <div>
            <h2 className="font-semibold text-lg mb-2 text-green-700">Step 1: Find a Hospital for In-Person Visit</h2>
            <p className="text-gray-600 mb-4 text-sm">Filter by location or search by name. Only today's available slots are shown, sorted by most open slots.</p>
            <div className="mb-2 flex gap-2 flex-wrap">
              <input className="border rounded px-2 py-1" placeholder="Search hospital name..." value={hospitalSearch} onChange={e => setHospitalSearch(e.target.value)} />
              <select className="border rounded px-2 py-1" value={hospitalDistrict} onChange={e => setHospitalDistrict(e.target.value)}>
                <option value="">District</option>
                {[...new Set(hospitals.map(h => h.district))].map(d => <option key={d}>{d}</option>)}
              </select>
              <select className="border rounded px-2 py-1" value={hospitalSector} onChange={e => setHospitalSector(e.target.value)}>
                <option value="">Sector</option>
                {[...new Set(hospitals.filter(h => !hospitalDistrict || h.district === hospitalDistrict).map(h => h.sector))].map(s => <option key={s}>{s}</option>)}
              </select>
              <select className="border rounded px-2 py-1" value={hospitalCell} onChange={e => setHospitalCell(e.target.value)}>
                <option value="">Cell</option>
                {[...new Set(hospitals.filter(h => (!hospitalDistrict || h.district === hospitalDistrict) && (!hospitalSector || h.sector === hospitalSector)).map(h => h.cell))].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="mb-4">
              {hospitals
                .filter(h => !hospitalSearch || h.name.toLowerCase().includes(hospitalSearch.toLowerCase()))
                .filter(h => !hospitalDistrict || h.district === hospitalDistrict)
                .filter(h => !hospitalSector || h.sector === hospitalSector)
                .filter(h => !hospitalCell || h.cell === hospitalCell)
                .sort((a, b) => b.slots.length - a.slots.length)
                .map(h => (
                <div key={h.name} className="flex items-center border rounded-lg p-3 mb-2 bg-green-50">
                  <img src={h.photo} alt={h.name} className="w-12 h-12 rounded-full mr-3" />
                  <div className="flex-1">
                    <div className="font-semibold">{h.name}</div>
                    <div className="text-xs text-gray-500">{h.address} • {h.distance}</div>
                    <div className="flex gap-2 mt-1">
                      {h.slots.map(slot => (
                        <button key={slot} className="text-xs bg-green-200 px-2 py-1 rounded" onClick={() => handleHospitalSelect(h, slot)}>{slot}</button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Problem Description */}
        {step === 2 && (
          <form onSubmit={handleProblemSubmit} className="space-y-4">
            <h2 className="font-semibold text-lg mb-2 text-blue-700">Describe Your Problem</h2>
            {/* Show selected doctor/hospital and slot */}
            {type === 'video' && selectedDoctor && (
              <div className="bg-blue-50 rounded p-3 text-sm mb-2">
                <div><b>Doctor:</b> {selectedDoctor.name} ({selectedDoctor.specialty})</div>
                {selectedSlot && <div><b>Time:</b> {selectedSlot}</div>}
              </div>
            )}
            {type === 'inperson' && selectedHospital && (
              <div className="bg-green-50 rounded p-3 text-sm mb-2">
                <div><b>Hospital:</b> {selectedHospital.name} ({selectedHospital.address})</div>
                <div><b>Time:</b> {selectedSlot}</div>
              </div>
            )}
            <div className="flex gap-2">
              <input className="flex-1 border rounded px-2 py-1" placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} required />
              <input className="flex-1 border rounded px-2 py-1" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <select className="w-full border rounded px-2 py-1" value={problem} onChange={e => setProblem(e.target.value)} required>
              <option value="">Primary reason for visit</option>
              {problems.map(p => <option key={p}>{p}</option>)}
            </select>
            <textarea className="w-full border rounded px-2 py-1" placeholder="Describe your symptoms or concerns" value={desc} onChange={e => setDesc(e.target.value)} required />
            {type === 'inperson' && (
              <div className="flex gap-2">
                <select className="flex-1 border rounded px-2 py-1" value={visitFirst} onChange={e => setVisitFirst(e.target.value)}>
                  <option value="yes">First visit?</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
                <input className="flex-1 border rounded px-2 py-1" placeholder="Preferred Doctor (optional)" value={preferredDoctor} onChange={e => setPreferredDoctor(e.target.value)} />
              </div>
            )}
            <div>
              <label className="block text-sm mb-1">Upload medical reports (optional):</label>
              <input type="file" onChange={handleFileChange} />
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full">Continue to Payment</button>
          </form>
        )}

        {/* Step 3: Payment */}
        {step === 3 && !confirmed && (
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <h2 className="font-semibold text-lg mb-2 text-blue-700">Payment</h2>
            <div className="bg-blue-50 rounded p-3 text-sm mb-2">
              <div>Payment Code: <span className="font-bold">1043577</span></div>
              <div>Amount Due: <span className="font-bold">$20</span></div>
              <div>Instructions: Pay via mobile money or bank transfer. Upload proof below.</div>
            </div>
            <div>
              <label className="block text-sm mb-1">Upload payment proof:</label>
              <input type="file" onChange={handleFileChange} required />
              {file && <div className="mt-2 text-xs">Selected: {file.name}</div>}
            </div>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg w-full">Submit Payment</button>
          </form>
        )}

        {/* Step 4: Confirmation */}
        {confirmed && (
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-green-700 mb-2">Your appointment request has been successfully submitted!</h2>
            <p className="mb-4">Please wait for payment approval. You will receive confirmation with:</p>
            <ul className="text-left mb-4 text-sm mx-auto max-w-xs">
              {type === 'video' ? (
                <>
                  <li>• Virtual meeting URL</li>
                  <li>• Doctor's name</li>
                  <li>• Appointment code</li>
                  <li>• Personalized greeting with your name</li>
                </>
              ) : (
                <>
                  <li>• Physical room number</li>
                  <li>• Exact meeting time</li>
                  <li>• Doctor's name</li>
                  <li>• Hospital name and address</li>
                  <li>• Appointment code</li>
                  <li>• Personalized greeting with your name</li>
                </>
              )}
            </ul>
            <div className="text-blue-700 font-semibold">Thank you, {name || 'Patient'}!</div>
            <div className="mt-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg" onClick={() => { setStep(0); setConfirmed(false); setType(''); }}>Book Another Appointment</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AppointmentPage;
