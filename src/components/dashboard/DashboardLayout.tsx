import { FC, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, FileText, MessageSquare } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: FC<DashboardLayoutProps> = ({ children }) => {
  const location = useLocation();

  const sidebarItems = [
    {
      title: 'Appointment Record',
      icon: <Calendar className="w-5 h-5" />,
      path: '/dashboard/appointments'
    },
    {
      title: 'Documents',
      icon: <FileText className="w-5 h-5" />,
      path: '/dashboard/documents'
    },
    {
      title: 'Messages',
      icon: <MessageSquare className="w-5 h-5" />,
      path: '/dashboard/messages'
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h2 className="text-xl font-semibold text-purple-600">Dashboard</h2>
        </div>
        <nav className="mt-4">
          {sidebarItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors ${
                location.pathname === item.path
                  ? 'bg-purple-100 text-purple-600 border-r-4 border-purple-600'
                  : 'text-gray-600'
              }`}
            >
              {item.icon}
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout; 