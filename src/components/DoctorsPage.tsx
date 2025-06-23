import React, { useState } from 'react';
import { Star, MapPin, Clock, Calendar, Search, Filter, Heart, Award, Users, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DoctorsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const navigate = useNavigate();
  const [slotModalDoctor, setSlotModalDoctor] = useState<any>(null);

  const specialties = [
    'All', 'Cardiology', 'Dermatology', 'Neurology', 'Pediatrics', 
    'Orthopedics', 'Psychiatry', 'Radiology', 'Surgery', 'Internal Medicine',
    'Gynecology', 'Ophthalmology', 'ENT', 'Oncology', 'Endocrinology',
    'Gastroenterology', 'Pulmonology', 'Urology', 'Anesthesiology', 'Emergency Medicine'
  ];

  const districts = [
    'All',
    'Gasabo', 'Kicukiro', 'Nyarugenge', // Kigali City
    'Bugesera', 'Gatsibo', 'Kayonza', 'Kirehe', 'Ngoma', 'Nyagatare', 'Rwamagana', // Eastern
    'Burera', 'Gakenke', 'Gicumbi', 'Musanze', 'Rulindo', // Northern
    'Gisagara', 'Huye', 'Kamonyi', 'Muhanga', 'Nyamagabe', 'Nyanza', 'Nyaruguru', 'Ruhango', // Southern
    'Karongi', 'Ngororero', 'Nyabihu', 'Nyamasheke', 'Rubavu', 'Rusizi', 'Rutsiro', // Western
  ];

  const doctors = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      specialty: 'Cardiology',
      image: 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.9,
      reviews: 127,
      experience: '15 years',
      location: 'New York',
      availability: 'Available Today',
      price: '$150',
      about: 'Specialized in preventive cardiology and heart disease management with over 15 years of experience.',
      languages: ['English', 'Spanish'],
      education: 'Harvard Medical School',
      certifications: ['Board Certified Cardiologist', 'Fellow of American College of Cardiology'],
      slots: ['Today 10:00', 'Today 14:00', 'Today 16:00']
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      specialty: 'Dermatology',
      image: 'https://images.pexels.com/photos/6749778/pexels-photo-6749778.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.8,
      reviews: 89,
      experience: '12 years',
      location: 'Los Angeles',
      availability: 'Next Available: Tomorrow',
      price: '$120',
      about: 'Expert in cosmetic and medical dermatology, specializing in skin cancer prevention and treatment.',
      languages: ['English', 'Mandarin'],
      education: 'Stanford University School of Medicine',
      certifications: ['Board Certified Dermatologist', 'Mohs Surgery Specialist'],
      slots: ['Tomorrow 09:00', 'Tomorrow 13:00', 'Tomorrow 15:00']
    },
    {
      id: 3,
      name: 'Dr. Emily Rodriguez',
      specialty: 'Pediatrics',
      image: 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.9,
      reviews: 156,
      experience: '10 years',
      location: 'Chicago',
      availability: 'Available Today',
      price: '$100',
      about: 'Compassionate pediatrician focused on comprehensive child healthcare and development.',
      languages: ['English', 'Spanish', 'Portuguese'],
      education: 'Johns Hopkins School of Medicine',
      certifications: ['Board Certified Pediatrician', 'Pediatric Emergency Medicine'],
      slots: ['Today 11:00', 'Today 15:00', 'Today 17:00']
    },
    {
      id: 4,
      name: 'Dr. James Wilson',
      specialty: 'Orthopedics',
      image: 'https://images.pexels.com/photos/5452274/pexels-photo-5452274.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.7,
      reviews: 94,
      experience: '18 years',
      location: 'Houston',
      availability: 'Next Available: Monday',
      price: '$180',
      about: 'Orthopedic surgeon specializing in sports medicine and joint replacement procedures.',
      languages: ['English'],
      education: 'Mayo Clinic School of Medicine',
      certifications: ['Board Certified Orthopedic Surgeon', 'Sports Medicine Specialist'],
      slots: ['Monday 10:00', 'Monday 14:00', 'Monday 16:00']
    },
    {
      id: 5,
      name: 'Dr. Lisa Thompson',
      specialty: 'Neurology',
      image: 'https://images.pexels.com/photos/5452268/pexels-photo-5452268.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.8,
      reviews: 73,
      experience: '14 years',
      location: 'Phoenix',
      availability: 'Available Today',
      price: '$200',
      about: 'Neurologist with expertise in stroke prevention, epilepsy management, and headache disorders.',
      languages: ['English', 'French'],
      education: 'UCLA School of Medicine',
      certifications: ['Board Certified Neurologist', 'Stroke Specialist'],
      slots: ['Today 10:00', 'Today 14:00', 'Today 16:00']
    },
    {
      id: 6,
      name: 'Dr. Robert Kim',
      specialty: 'Internal Medicine',
      image: 'https://images.pexels.com/photos/5452299/pexels-photo-5452299.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.9,
      reviews: 112,
      experience: '16 years',
      location: 'Philadelphia',
      availability: 'Next Available: Tomorrow',
      price: '$130',
      about: 'Internal medicine physician focused on preventive care and chronic disease management.',
      languages: ['English', 'Korean'],
      education: 'University of Pennsylvania School of Medicine',
      certifications: ['Board Certified Internal Medicine', 'Geriatric Medicine Specialist'],
      slots: ['Tomorrow 09:00', 'Tomorrow 13:00', 'Tomorrow 15:00']
    },
    {
      id: 7,
      name: 'Dr. Amanda Foster',
      specialty: 'Gynecology',
      image: 'https://images.pexels.com/photos/5407206/pexels-photo-5407206.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.9,
      reviews: 203,
      experience: '13 years',
      location: 'Miami',
      availability: 'Available Today',
      price: '$140',
      about: 'Women\'s health specialist with expertise in reproductive health and minimally invasive surgery.',
      languages: ['English', 'Spanish'],
      education: 'Columbia University College of Physicians',
      certifications: ['Board Certified OB/GYN', 'Minimally Invasive Surgery Specialist'],
      slots: ['Today 10:00', 'Today 14:00', 'Today 16:00']
    },
    {
      id: 8,
      name: 'Dr. David Martinez',
      specialty: 'Ophthalmology',
      image: 'https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.8,
      reviews: 145,
      experience: '20 years',
      location: 'Boston',
      availability: 'Next Available: Wednesday',
      price: '$160',
      about: 'Eye specialist with extensive experience in cataract surgery and retinal disorders.',
      languages: ['English', 'Spanish'],
      education: 'Massachusetts Eye and Ear Infirmary',
      certifications: ['Board Certified Ophthalmologist', 'Retinal Surgery Specialist'],
      slots: ['Wednesday 10:00', 'Wednesday 14:00', 'Wednesday 16:00']
    },
    {
      id: 9,
      name: 'Dr. Jennifer Park',
      specialty: 'ENT',
      image: 'https://images.pexels.com/photos/5407764/pexels-photo-5407764.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.7,
      reviews: 98,
      experience: '11 years',
      location: 'Seattle',
      availability: 'Available Today',
      price: '$135',
      about: 'Ear, nose, and throat specialist focusing on sinus disorders and hearing problems.',
      languages: ['English', 'Korean'],
      education: 'University of Washington School of Medicine',
      certifications: ['Board Certified ENT', 'Rhinology Specialist'],
      slots: ['Today 10:00', 'Today 14:00', 'Today 16:00']
    },
    {
      id: 10,
      name: 'Dr. Thomas Anderson',
      specialty: 'Oncology',
      image: 'https://images.pexels.com/photos/5452276/pexels-photo-5452276.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.9,
      reviews: 167,
      experience: '22 years',
      location: 'Denver',
      availability: 'Next Available: Friday',
      price: '$250',
      about: 'Medical oncologist specializing in breast cancer and immunotherapy treatments.',
      languages: ['English'],
      education: 'University of Colorado School of Medicine',
      certifications: ['Board Certified Medical Oncologist', 'Immunotherapy Specialist'],
      slots: ['Friday 10:00', 'Friday 14:00', 'Friday 16:00']
    },
    {
      id: 11,
      name: 'Dr. Maria Gonzalez',
      specialty: 'Endocrinology',
      image: 'https://images.pexels.com/photos/5407033/pexels-photo-5407033.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.8,
      reviews: 134,
      experience: '17 years',
      location: 'Atlanta',
      availability: 'Available Today',
      price: '$170',
      about: 'Endocrinologist specializing in diabetes management and thyroid disorders.',
      languages: ['English', 'Spanish'],
      education: 'Emory University School of Medicine',
      certifications: ['Board Certified Endocrinologist', 'Diabetes Educator'],
      slots: ['Today 10:00', 'Today 14:00', 'Today 16:00']
    },
    {
      id: 12,
      name: 'Dr. Kevin O\'Brien',
      specialty: 'Gastroenterology',
      image: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.7,
      reviews: 89,
      experience: '14 years',
      location: 'San Diego',
      availability: 'Next Available: Tuesday',
      price: '$155',
      about: 'Gastroenterologist with expertise in inflammatory bowel disease and liver disorders.',
      languages: ['English'],
      education: 'UC San Diego School of Medicine',
      certifications: ['Board Certified Gastroenterologist', 'Hepatology Specialist'],
      slots: ['Tuesday 10:00', 'Tuesday 14:00', 'Tuesday 16:00']
    },
    {
      id: 13,
      name: 'Dr. Rachel Williams',
      specialty: 'Pulmonology',
      image: 'https://images.pexels.com/photos/5407071/pexels-photo-5407071.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.8,
      reviews: 76,
      experience: '12 years',
      location: 'Dallas',
      availability: 'Available Today',
      price: '$145',
      about: 'Pulmonologist specializing in asthma, COPD, and sleep disorders.',
      languages: ['English'],
      education: 'UT Southwestern Medical School',
      certifications: ['Board Certified Pulmonologist', 'Sleep Medicine Specialist'],
      slots: ['Today 10:00', 'Today 14:00', 'Today 16:00']
    },
    {
      id: 14,
      name: 'Dr. Hassan Ahmed',
      specialty: 'Urology',
      image: 'https://images.pexels.com/photos/5327656/pexels-photo-5327656.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.9,
      reviews: 142,
      experience: '19 years',
      location: 'San Antonio',
      availability: 'Next Available: Thursday',
      price: '$175',
      about: 'Urologist with expertise in kidney stones, prostate disorders, and minimally invasive surgery.',
      languages: ['English', 'Arabic'],
      education: 'UT Health San Antonio',
      certifications: ['Board Certified Urologist', 'Robotic Surgery Specialist'],
      slots: ['Thursday 10:00', 'Thursday 14:00', 'Thursday 16:00']
    },
    {
      id: 15,
      name: 'Dr. Catherine Lee',
      specialty: 'Psychiatry',
      image: 'https://images.pexels.com/photos/5407047/pexels-photo-5407047.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.8,
      reviews: 198,
      experience: '16 years',
      location: 'New York',
      availability: 'Available Today',
      price: '$200',
      about: 'Psychiatrist specializing in anxiety disorders, depression, and cognitive behavioral therapy.',
      languages: ['English', 'Mandarin'],
      education: 'NYU School of Medicine',
      certifications: ['Board Certified Psychiatrist', 'CBT Specialist'],
      slots: ['Today 10:00', 'Today 14:00', 'Today 16:00']
    },
    {
      id: 16,
      name: 'Dr. Mark Thompson',
      specialty: 'Anesthesiology',
      image: 'https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.7,
      reviews: 67,
      experience: '21 years',
      location: 'Los Angeles',
      availability: 'Next Available: Monday',
      price: '$300',
      about: 'Anesthesiologist with expertise in cardiac anesthesia and pain management.',
      languages: ['English'],
      education: 'UCLA David Geffen School of Medicine',
      certifications: ['Board Certified Anesthesiologist', 'Pain Management Specialist'],
      slots: ['Monday 10:00', 'Monday 14:00', 'Monday 16:00']
    },
    {
      id: 17,
      name: 'Dr. Priya Patel',
      specialty: 'Emergency Medicine',
      image: 'https://images.pexels.com/photos/5407764/pexels-photo-5407764.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.9,
      reviews: 234,
      experience: '9 years',
      location: 'Chicago',
      availability: 'Available Now',
      price: '$220',
      about: 'Emergency medicine physician with expertise in trauma care and critical care medicine.',
      languages: ['English', 'Hindi', 'Gujarati'],
      education: 'Northwestern University Feinberg School',
      certifications: ['Board Certified Emergency Medicine', 'Advanced Trauma Life Support'],
      slots: ['Now 10:00', 'Now 14:00', 'Now 16:00']
    },
    {
      id: 18,
      name: 'Dr. Benjamin Clark',
      specialty: 'Radiology',
      image: 'https://images.pexels.com/photos/5452274/pexels-photo-5452274.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.8,
      reviews: 91,
      experience: '18 years',
      location: 'Houston',
      availability: 'Next Available: Tomorrow',
      price: '$190',
      about: 'Radiologist specializing in diagnostic imaging and interventional radiology procedures.',
      languages: ['English'],
      education: 'Baylor College of Medicine',
      certifications: ['Board Certified Radiologist', 'Interventional Radiology Specialist'],
      slots: ['Tomorrow 10:00', 'Tomorrow 14:00', 'Tomorrow 16:00']
    },
    {
      id: 19,
      name: 'Dr. Samantha Davis',
      specialty: 'Surgery',
      image: 'https://images.pexels.com/photos/5407206/pexels-photo-5407206.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.9,
      reviews: 178,
      experience: '23 years',
      location: 'Phoenix',
      availability: 'Next Available: Next Week',
      price: '$400',
      about: 'General surgeon with expertise in laparoscopic surgery and surgical oncology.',
      languages: ['English'],
      education: 'University of Arizona College of Medicine',
      certifications: ['Board Certified General Surgeon', 'Laparoscopic Surgery Specialist'],
      slots: ['Next Week 10:00', 'Next Week 14:00', 'Next Week 16:00']
    },
    {
      id: 20,
      name: 'Dr. Alexander Petrov',
      specialty: 'Neurology',
      image: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.8,
      reviews: 156,
      experience: '25 years',
      location: 'Boston',
      availability: 'Next Available: Friday',
      price: '$230',
      about: 'Neurologist specializing in movement disorders, Parkinson\'s disease, and deep brain stimulation.',
      languages: ['English', 'Russian'],
      education: 'Harvard Medical School',
      certifications: ['Board Certified Neurologist', 'Movement Disorders Specialist'],
      slots: ['Friday 10:00', 'Friday 14:00', 'Friday 16:00']
    }
  ];

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'All' || doctor.specialty === selectedSpecialty;
    const matchesLocation = selectedLocation === 'All' || doctor.location === selectedLocation;
    
    return matchesSearch && matchesSpecialty && matchesLocation;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Find Your Perfect Doctor
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Connect with experienced healthcare professionals across all medical specialties
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-2xl shadow-lg p-6 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search doctors or specialties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Specialty Filter */}
              <div className="relative">
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  {specialties.map(specialty => (
                    <option key={specialty} value={specialty}>{specialty}</option>
                  ))}
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>

              {/* Location Filter */}
              <div className="relative">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  {districts.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
                <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl mb-4">
                <Stethoscope className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">500+</h3>
              <p className="text-gray-600">Expert Doctors</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-2xl mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">50K+</h3>
              <p className="text-gray-600">Happy Patients</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-50 rounded-2xl mb-4">
                <Award className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">25+</h3>
              <p className="text-gray-600">Specialties</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-2xl mb-4">
                <Heart className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">24/7</h3>
              <p className="text-gray-600">Care Available</p>
            </div>
          </div>
        </div>
      </section>

      {/* Doctors Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Available Doctors ({filteredDoctors.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDoctors.map((doctor) => (
              <div key={doctor.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                {/* Doctor Image */}
                <div className="relative h-48 bg-gradient-to-br from-blue-400 to-blue-600">
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      doctor.availability.includes('Today') || doctor.availability.includes('Now')
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {doctor.availability}
                    </span>
                  </div>
                </div>

                {/* Doctor Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{doctor.name}</h3>
                      <p className="text-blue-600 font-medium">{doctor.specialty}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 mb-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-gray-900">{doctor.rating}</span>
                      </div>
                      <p className="text-xs text-gray-500">({doctor.reviews} reviews)</p>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{doctor.about}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Award className="w-4 h-4" />
                      <span>{doctor.experience} experience</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{doctor.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>Consultation: {doctor.price}</span>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                      onClick={() => setSlotModalDoctor(doctor)}
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Book Now</span>
                    </button>
                    <button className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors duration-200">
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredDoctors.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No doctors found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or filters</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Can't Find the Right Doctor?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Our healthcare coordinators are here to help you find the perfect match for your needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200">
              Get Help Finding a Doctor
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-200">
              Emergency Care
            </button>
          </div>
        </div>
      </section>

      {/* Modal for slot selection */}
      {slotModalDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Select a Time Slot for {slotModalDoctor.name}</h2>
            <div className="flex flex-col gap-2 mb-4">
              {slotModalDoctor.slots && slotModalDoctor.slots.length > 0 ? (
                slotModalDoctor.slots.map((slot: string) => (
                  <button
                    key={slot}
                    className="w-full py-2 px-4 rounded bg-blue-100 hover:bg-blue-600 hover:text-white transition"
                    onClick={() => {
                      setSlotModalDoctor(null);
                      navigate('/appointment', {
                        state: {
                          type: 'video',
                          selectedDoctor: slotModalDoctor,
                          selectedSlot: slot
                        }
                      });
                    }}
                  >
                    {slot}
                  </button>
                ))
              ) : (
                <div>No available slots</div>
              )}
            </div>
            <button
              className="w-full py-2 px-4 rounded bg-gray-200 hover:bg-gray-300"
              onClick={() => setSlotModalDoctor(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorsPage;