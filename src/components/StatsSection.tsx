import React from 'react';
import { Users, Guitar as Hospital, Clock, MapPin } from 'lucide-react';

const StatsSection: React.FC = () => {
  const stats = [
    {
      icon: Users,
      number: '90',
      label: 'Best Doctor',
      description: 'Highly qualified medical professionals'
    },
    {
      icon: Hospital,
      number: '1500+',
      label: 'Patient Capacity',
      description: 'Daily patient care capacity'
    },
    {
      icon: Clock,
      number: '24 hours',
      label: 'Availability',
      description: 'Round-the-clock medical support'
    },
    {
      icon: MapPin,
      number: '15',
      label: 'Clinic Location',
      description: 'Convenient locations nationwide'
    }
  ];

  return (
    <section className="bg-white py-16 -mt-8 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl mb-4 group-hover:bg-blue-100 transition-colors duration-200">
                <stat.icon className="w-8 h-8 text-blue-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl lg:text-4xl font-bold text-gray-900">
                  {stat.number}
                </h3>
                <p className="text-lg font-semibold text-gray-700">
                  {stat.label}
                </p>
                <p className="text-sm text-gray-500 hidden lg:block">
                  {stat.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;