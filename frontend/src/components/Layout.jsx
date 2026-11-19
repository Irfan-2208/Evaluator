import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from './ThemeToggle';
import {
  GraduationCap,
  LayoutDashboard,
  FileText,
  LogOut,
  User,
  PlusCircle,
} from 'lucide-react';

export default function Layout({ children, fullHeight = false }) {
  const { teacher, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div
      className={`bg-[#f6f2ee] dark:bg-[#231a17] text-[#323232] dark:text-[#DDD0C8] flex flex-col font-sans transition-colors duration-200 ${
        fullHeight ? 'h-screen overflow-hidden' : 'min-h-screen'
      }`}
    >
      {/* Top Navbar */}
      <header className="bg-[#f0ebe5]/95 dark:bg-[#2e2320]/95 backdrop-blur-md border-b border-[#DDD0C8] dark:border-[#4A3830] sticky top-0 z-30 shadow-xs flex-shrink-0 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/dashboard" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#3d2f2a] to-[#5c4a40] flex items-center justify-center text-[#DDD0C8] shadow-md shadow-black/15 group-hover:scale-105 transition-transform duration-200 border border-[#DDD0C8]/30">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="font-bold text-lg text-[#323232] dark:text-white tracking-tight">
                  AI Examiner
                </span>
                <span className="ml-2 text-xs font-bold px-2 py-0.5 bg-[#DDD0C8]/60 dark:bg-[#3d2f2a] text-[#323232] dark:text-[#DDD0C8] rounded-full border border-[#DDD0C8] dark:border-[#5c4a40]">
                  v1.2
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* New Exam Button */}
            <Link
              to="/exams/new"
              className="inline-flex items-center px-3.5 py-1.5 border border-transparent text-sm font-semibold rounded-xl shadow-sm text-white dark:text-[#323232] bg-[#323232] hover:bg-[#1f1f1f] dark:bg-[#DDD0C8] dark:hover:bg-[#cfc0b6] focus:outline-none transition-all duration-200 active:scale-95 shadow-xs"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              New Exam
            </Link>

            {/* Dual Theme Switcher (Light & Dark options both visible) */}
            <ThemeToggle />

            <div className="h-6 w-px bg-[#DDD0C8] dark:bg-charcoal-600" />

            {/* Teacher Profile */}
            <div className="flex items-center space-x-2 text-sm text-[#323232] dark:text-[#ede4da]">
              <div className="w-8 h-8 rounded-full bg-[#DDD0C8]/60 dark:bg-[#3d2f2a] text-[#323232] dark:text-[#DDD0C8] border border-[#DDD0C8] dark:border-[#5c4a40] flex items-center justify-center font-bold text-xs">
                {teacher?.full_name ? teacher.full_name[0].toUpperCase() : <User className="w-4 h-4" />}
              </div>
              <span className="font-medium hidden sm:inline text-xs sm:text-sm">
                {teacher?.full_name || teacher?.email || 'Teacher'}
              </span>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors duration-200"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col ${fullHeight ? 'min-h-0 overflow-hidden' : ''}`}>
        {children}
      </main>
    </div>
  );
}
