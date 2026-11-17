import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import {
  GraduationCap,
  LayoutDashboard,
  FileText,
  LogOut,
  User,
  PlusCircle,
  Sun,
  Moon,
} from 'lucide-react';

export default function Layout({ children, fullHeight = false }) {
  const { teacher, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div
      className={`bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 ${
        fullHeight ? 'h-screen overflow-hidden' : 'min-h-screen'
      }`}
    >
      {/* Top Navbar */}
      <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs flex-shrink-0 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/dashboard" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                  AI Examiner
                </span>
                <span className="ml-2 text-xs font-semibold px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 rounded-full border border-indigo-200 dark:border-indigo-800">
                  v1.2
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* New Exam Button */}
            <Link
              to="/exams/new"
              className="inline-flex items-center px-3.5 py-1.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none transition-all duration-200 active:scale-95"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              New Exam
            </Link>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-amber-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 active:rotate-45"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-amber-400 transition-transform duration-200" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-600 transition-transform duration-200" />
              )}
            </button>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

            {/* Teacher Profile */}
            <div className="flex items-center space-x-2 text-sm text-slate-700 dark:text-slate-300">
              <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-slate-700 flex items-center justify-center font-bold text-xs">
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
