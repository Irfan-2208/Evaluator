import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  GraduationCap,
  LayoutDashboard,
  FileText,
  LogOut,
  User,
  PlusCircle,
} from 'lucide-react';

export default function Layout({ children }) {
  const { teacher, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Exams', path: '/exams', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="font-bold text-lg text-slate-900 tracking-tight">AI Examiner</span>
                <span className="ml-2 text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
                  v1.0
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/exams/new"
              className="inline-flex items-center px-3.5 py-1.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-colors"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              New Exam
            </Link>

            <div className="h-6 w-px bg-slate-200" />

            <div className="flex items-center space-x-2 text-sm text-slate-700">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                <User className="w-4 h-4" />
              </div>
              <span className="font-medium hidden sm:inline">{teacher?.full_name || teacher?.email || 'Teacher'}</span>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
