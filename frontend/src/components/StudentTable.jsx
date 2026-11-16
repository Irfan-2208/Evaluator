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
    uploaded: { text: 'Uploaded', class: 'bg-slate-100 text-slate-700 border-slate-200' },
    processing: { text: 'Processing...', class: 'bg-indigo-50 text-indigo-700 border-indigo-200 animate-pulse' },
    evaluated: { text: 'Evaluated', class: 'bg-blue-50 text-blue-700 border-blue-200' },
    reviewed: { text: 'Reviewed', class: 'bg-amber-50 text-amber-700 border-amber-200' },
    finalized: { text: 'Finalized', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header & Search */}
      <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Student Answer Sheets</h3>
          <p className="text-xs text-slate-500 mt-0.5">
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
            className="text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg w-56 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Student</th>
              <th className="py-3 px-4">Roll No</th>
              <th className="py-3 px-4">Class</th>
              <th className="py-3 px-4">Pages</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Score</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-400 italic">
                  {search ? 'No students match your search.' : 'No answer sheets uploaded yet.'}
                </td>
              </tr>
            ) : (
              filtered.map((s) => {
                const badge = statusBadges[s.submission_status] || statusBadges.uploaded;
                return (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Student Name */}
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {s.student_name || s.ai_detected_name || (
                        <span className="text-slate-400 italic">Unidentified</span>
                      )}
                    </td>

                    {/* Roll No */}
                    <td className="py-3 px-4 text-slate-600 font-mono">
                      {s.roll_number || s.ai_detected_roll || '—'}
                    </td>

                    {/* Class */}
                    <td className="py-3 px-4 text-slate-600">
                      {s.class_name || '—'}
                    </td>

                    {/* Pages */}
                    <td className="py-3 px-4 text-slate-600">
                      {s.total_pages || (s.page_image_paths?.length || 0)} pgs
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badge.class}`}
                      >
                        {badge.text}
                      </span>
                    </td>

                    {/* Score */}
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {s.submission_status in { evaluated: 1, reviewed: 1, finalized: 1 } ? (
                        <span>
                          {s.total_marks} / {s.max_marks}{' '}
                          <span className="text-slate-400 font-normal">({s.percentage}%)</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right space-x-2">
                      <Link
                        to={`/exams/${examId}/students/${s.id}/review`}
                        className="inline-flex items-center text-xs px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-md border border-indigo-200 transition-colors"
                      >
                        Review
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Link>

                      {s.submission_status === 'finalized' && (
                        <Link
                          to={`/exams/${examId}/students/${s.id}/report`}
                          className="inline-flex items-center text-xs px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium rounded-md border border-emerald-200 transition-colors"
                        >
                          Report
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={() => onDeleteSubmission(s.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
