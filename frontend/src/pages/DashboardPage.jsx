import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { examService } from '../services/examService';
import {
  Plus,
  Search,
  BookOpen,
  Users,
  Award,
  ChevronRight,
  TrendingUp,
  FileCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [exams, setExams] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadExams() {
      try {
        const data = await examService.listExams();
        setExams(data);
      } catch (err) {
        toast.error('Failed to load exams');
      } finally {
        setIsLoading(false);
      }
    }
    loadExams();
  }, []);

  const filteredExams = exams.filter((e) => {
    const q = search.toLowerCase();
    return (
      (e.title || '').toLowerCase().includes(q) ||
      (e.subject || '').toLowerCase().includes(q) ||
      (e.class_name || '').toLowerCase().includes(q)
    );
  });

  const totalExams = exams.length;
  const totalSubmissions = exams.reduce((acc, e) => acc + (e.total_submissions || 0), 0);
  const totalEvaluated = exams.reduce((acc, e) => acc + (e.evaluated_count || 0), 0);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Teacher Dashboard</h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage your exams, upload answer sheets, and review AI evaluations.
            </p>
          </div>

          <Link
            to="/exams/new"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Create New Exam
          </Link>
        </div>

        {/* Aggregate Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Active Exams</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">{totalExams}</h3>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Submissions</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">{totalSubmissions}</h3>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Evaluated & Reviewed</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">{totalEvaluated}</h3>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-slate-900">Your Exams</h2>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, subject, class..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-xs pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg w-64 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Exams Grid */}
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent mx-auto"></div>
            <p className="text-xs text-slate-400 mt-3">Loading exams...</p>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-800">No exams found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {search
                ? 'Try adjusting your search criteria.'
                : 'Get started by creating your first exam to evaluate student papers.'}
            </p>
            {!search && (
              <Link
                to="/exams/new"
                className="inline-flex items-center mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Create Exam
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExams.map((exam) => (
              <Link
                key={exam.id}
                to={`/exams/${exam.id}`}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:border-indigo-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                      {exam.subject || 'General'}
                    </span>
                    <span className="text-[11px] text-slate-400">Class: {exam.class_name || 'N/A'}</span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {exam.title}
                  </h3>

                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-[10px] text-slate-400">Total Marks</p>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">{exam.total_marks || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400">Students</p>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">{exam.total_submissions || 0}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400">Class Avg</p>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">
                        {exam.class_average ? `${exam.class_average}` : '—'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500 group-hover:text-indigo-600">
                  <span>Open Exam Console</span>
                  <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
