import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Calendar, Clock, FileText, Home, FolderPlus } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-blue-600">Study Buddy</h1>
          <p className="text-sm text-gray-500">Your learning companion</p>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link 
                to="/" 
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  isActive('/') 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Home className="mr-3 h-5 w-5" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                to="/assignments" 
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  isActive('/assignments') 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Calendar className="mr-3 h-5 w-5" />
                Assignments
              </Link>
            </li>
            <li>
              <Link 
                to="/resources" 
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  isActive('/resources') 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <BookOpen className="mr-3 h-5 w-5" />
                Resources
              </Link>
            </li>
            <li>
              <Link 
                to="/study-timer" 
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  isActive('/study-timer') 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Clock className="mr-3 h-5 w-5" />
                Study Timer
              </Link>
            </li>
            <li>
              <Link 
                to="/notes" 
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  isActive('/notes') 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FileText className="mr-3 h-5 w-5" />
                Notes
              </Link>
            </li>
            <li>
              <Link 
                to="/courses" 
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  isActive('/courses') 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FolderPlus className="mr-3 h-5 w-5" />
                Courses
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;
