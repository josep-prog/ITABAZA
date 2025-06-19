import React from 'react';
import { Download, Star, Clock } from 'lucide-react';

const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 overflow-hidden">
      {/* Background Shapes */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full opacity-20 transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full opacity-30 transform translate-x-1/4"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-br from-blue-300 to-blue-500 rounded-full opacity-25 transform translate-x-1/4 translate-y-1/4"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>WELCOME TO REAL SYNC SERVICES</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              No Compromise
              <br />
              <span className="text-gray-800">When It Comes to</span>
              <br />
              <span className="text-gray-700">Your Well-being</span>
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed max-w-md">
              Connecting you to Trusted Doctors, Empowering
              <br />
              Your Health Choices
            </p>

            <button className="inline-flex items-center space-x-3 bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
              <Download className="w-5 h-5" />
              <span>Download Our App</span>
            </button>
          </div>

          {/* Right Content - Doctor Image with UI Elements */}
          <div className="relative">
            {/* Main Doctor Image */}
            <div className="relative z-10">
              <div className="w-80 h-96 mx-auto bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl shadow-2xl overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Professional Doctor"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Doctor Info Card */}
            <div className="absolute top-8 -left-4 bg-white rounded-2xl shadow-lg p-4 z-20 animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-lg">SR</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Skyler Ruby</p>
                  <p className="text-sm text-gray-500">Dentist</p>
                </div>
              </div>
            </div>

            {/* Appointment Card */}
            <div className="absolute bottom-12 -right-4 bg-white rounded-2xl shadow-lg p-4 z-20">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Star className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">Dr. Holly Lawrence</p>
                    <p className="text-xs text-gray-500">Cardiologist</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                  <Clock className="w-3 h-3" />
                  <span>Sun, May 24, 08:00pm - 9:00pm</span>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute top-1/2 -left-8 w-4 h-4 bg-blue-300 rounded-full opacity-60 animate-bounce"></div>
            <div className="absolute top-1/4 left-1/2 w-3 h-3 bg-blue-400 rounded-full opacity-80 animate-pulse"></div>
            <div className="absolute bottom-1/3 -right-6 w-5 h-5 bg-blue-200 rounded-full opacity-70 animate-bounce delay-300"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;