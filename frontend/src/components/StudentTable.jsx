import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, FileText, CheckCircle, Clock, Trash2, ArrowRight } from 'lucide-react';

export default function StudentTable({
  submissions = [],
  examId,
  onDeleteSubmission,
}) {
  const [search, setSearch] = useState('');

  const filtered = submissions.filter((s) => {
    const q = search.toLowerCase();
    const name = (s.student_name || s.ai_detected_name || '').toLowerCase();
    const roll = (s.roll_number || s.ai_detected_roll || '').toLowerCase();
    return name.includes(q) || roll.includes(q);
  });

  const statusBadges = {
    uploaded: { text: 'Uploaded', class: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700' },
    processing: { text: 'Processing...', class: 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 animate-pulse' },
    evaluated: { text: 'Evaluated', class: 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
    reviewed: { text: 'Reviewed', class: 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
    finalized: { text: 'Finalized', class: 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
      {/* Header & Search */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/50">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Student Answer Sheets</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Uploaded answer sheets and their real-time evaluation status.
          </p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student or roll..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs pl-8 pr-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg w-56 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/70 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Student</th>
              <th className="py-3 px-4">Roll No</th>
              <th className="py-3 px-4">Class</th>
              <th className="py-3 px-4">Pages</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Score</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-10 text-slate-400 dark:text-slate-500 italic">
                  {submissions.length === 0
                    ? 'No student answer sheets uploaded yet.'
                    : 'No students matching search filter.'}
                </td>
              </tr>
            ) : (
              filtered.map((s) => {
                const badge = statusBadges[s.submission_status] || statusBadges.uploaded;
                return (
                  <tr key={s.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      {s.student_name || s.ai_detected_name || 'Unnamed Student'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {s.roll_number || s.ai_detected_roll || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {s.class_name || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                      {s.total_pages > 0 ? `${s.total_pages} pgs` : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badge.class}`}
                      >
                        {badge.text}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {s.submission_status === 'uploaded' || s.submission_status === 'processing' ? (
                        <span className="text-slate-400 italic">Pending</span>
                      ) : (
                        <span className="font-bold text-slate-900 dark:text-white">
                          {s.total_marks ?? 0} / {s.max_marks ?? 0}{' '}
                          <span className="text-slate-500 font-normal">({s.percentage ?? 0}%)</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Link
                        to={`/exams/${examId}/students/${s.id}/review`}
                        className="inline-flex items-center text-xs font-semibold px-3 py-1 bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-lg transition-colors"
                      >
                        Review
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => onDeleteSubmission(s.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
                        title="Delete submission"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
