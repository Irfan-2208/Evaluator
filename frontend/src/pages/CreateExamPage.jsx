import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { examService } from '../services/examService';
import { BookOpen, ArrowLeft, Sparkles, Scale, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreateExamPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    class_name: '',
    total_marks: '',
    description: '',
    grading_strictness: 'moderate',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        title: formData.title,
        subject: formData.subject,
        class_name: formData.class_name,
        total_marks: formData.total_marks ? parseFloat(formData.total_marks) : null,
        description: formData.description,
        grading_strictness: formData.grading_strictness,
      };

      const created = await examService.createExam(payload);
      toast.success('Exam created! Now upload question paper.');
      navigate(`/exams/${created.id}`);
    } catch (err) {
      toast.error('Failed to create exam');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8 w-full animate-fadeIn">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to Dashboard
        </button>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 transition-colors">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">Create New Exam</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Set up exam basic details. You can upload Question Paper in the next step.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Exam Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Midterm Physics Exam 2026"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Physics"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Class / Grade</label>
                <input
                  type="text"
                  placeholder="e.g. Grade 10-A"
                  value={formData.class_name}
                  onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Total Marks (Optional)</label>
              <input
                type="number"
                placeholder="e.g. 50"
                value={formData.total_marks}
                onChange={(e) => setFormData({ ...formData, total_marks: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              />
            </div>

            {/* Strictness Level Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Evaluation Strictness Level
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, grading_strictness: 'lenient' })}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    formData.grading_strictness === 'lenient'
                      ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 ring-2 ring-emerald-500/30'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-bold text-xs text-slate-900 dark:text-white">Lenient</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Generous partial credit, forgiving of minor slips.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, grading_strictness: 'moderate' })}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    formData.grading_strictness === 'moderate'
                      ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-500/30'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 mb-1">
                    <Scale className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span className="font-bold text-xs text-slate-900 dark:text-white">Moderate (Default)</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Standard balanced grading matching rubric.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, grading_strictness: 'strict' })}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    formData.grading_strictness === 'strict'
                      ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 ring-2 ring-rose-500/30'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 mb-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    <span className="font-bold text-xs text-slate-900 dark:text-white">Strict</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    High academic rigor, deductions for any omission.
                  </p>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description (Optional)</label>
              <textarea
                rows={3}
                placeholder="Notes or instructions for this examination..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all duration-200 disabled:opacity-50 active:scale-95"
              >
                {isLoading ? 'Creating Exam...' : 'Create Exam & Continue →'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
