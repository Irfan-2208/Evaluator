import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from '../components/ThemeToggle';
import { GraduationCap, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('t@school.com');
  const [password, setPassword] = useState('pass123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(email, password);
      toast.success('Welcome back, Teacher!');
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          'Failed to sign in. Please verify your credentials or check backend connection.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f5f1] via-[#ede5dc] to-[#DDD0C8] dark:from-[#181818] dark:via-[#222222] dark:to-[#323232] flex flex-col items-center justify-center p-4 relative transition-colors duration-200">
      {/* Top Right Theme Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md bg-white/95 dark:bg-[#252525]/95 rounded-2xl shadow-xl dark:shadow-2xl p-8 border border-[#DDD0C8] dark:border-charcoal-600 transition-colors duration-200">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-tr from-[#323232] to-[#4c4c4c] rounded-2xl flex items-center justify-center text-[#DDD0C8] mx-auto mb-3 shadow-lg shadow-black/15 border border-[#DDD0C8]/40">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#323232] dark:text-white tracking-tight">AI Examiner</h1>
          <p className="text-xs text-slate-500 dark:text-[#cbb89f] mt-1 font-medium">
            Intelligent Automated Grading with Teacher Oversight
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#323232] dark:text-slate-300 mb-1">Teacher Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teacher@school.com"
                className="w-full pl-9 pr-3 py-2 text-xs border border-[#DDD0C8] dark:border-charcoal-600 rounded-xl bg-[#faf8f5] dark:bg-charcoal-800 text-[#323232] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#323232]/20 dark:focus:ring-[#DDD0C8]/20 focus:border-[#323232] dark:focus:border-[#DDD0C8] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#323232] dark:text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs border border-[#DDD0C8] dark:border-charcoal-600 rounded-xl bg-[#faf8f5] dark:bg-charcoal-800 text-[#323232] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#323232]/20 dark:focus:ring-[#DDD0C8]/20 focus:border-[#323232] dark:focus:border-[#DDD0C8] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-[#323232] hover:bg-[#202020] dark:bg-[#DDD0C8] dark:hover:bg-[#cfc0b6] text-white dark:text-[#323232] text-xs font-bold rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:opacity-50 mt-2"
          >
            <span>{isLoading ? 'Signing in...' : 'Sign In as Teacher'}</span>
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#DDD0C8]/60 dark:border-charcoal-700 text-center">
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Default credentials: <span className="font-mono text-[#323232] dark:text-[#DDD0C8] font-bold">t@school.com</span> /{' '}
            <span className="font-mono text-[#323232] dark:text-[#DDD0C8] font-bold">pass123</span>
          </p>
        </div>
      </div>
    </div>
  );
}
