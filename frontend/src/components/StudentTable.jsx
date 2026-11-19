import React, { useState } from 'react';
import { Search } from 'lucide-react';

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
    uploaded: { text: 'Uploaded', class: 'bg-[#DDD0C8]/40 dark:bg-[#3d2f2a] text-[#323232] dark:text-[#DDD0C8] border-[#DDD0C8] dark:border-[#5c4a40]' },
    processing: { text: 'Processing...', class: 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700 animate-pulse' },
    evaluated: { text: 'Evaluated', class: 'bg-[#DDD0C8]/80 dark:bg-[#4A3830] text-[#323232] dark:text-[#DDD0C8] border-[#cbb89f] dark:border-[#6b5248]' },
    reviewed: { text: 'Reviewed', class: 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
    finalized: { text: 'Finalized', class: 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
  };

  return (
    <div className="bg-white dark:bg-[#252525] rounded-2xl border-2 border-[#DDD0C8] dark:border-[#4A3830] shadow-sm overflow-hidden transition-colors">
      {/* Header & Search */}
      <div className="px-5 py-4 border-b border-[#DDD0C8] dark:border-[#4A3830] flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-[#faf6f0] via-[#f7f1e8] to-[#faf6f0] dark:from-[#2e2018] dark:via-[#261b14] dark:to-[#2e2018]">
        <div>
          <h3 className="text-sm font-bold text-[#323232] dark:text-[#DDD0C8]">Student Answer Sheets</h3>
          <p className="text-xs text-[#6b5248] dark:text-[#cbb89f] mt-0.5">
            Uploaded answer sheets and their real-time evaluation status.
          </p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#8c7268] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student or roll..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs pl-8 pr-3.5 py-1.5 border border-[#DDD0C8] dark:border-[#5c4a40] rounded-xl w-56 bg-white dark:bg-[#1e1510] text-[#323232] dark:text-[#ede4da] focus:outline-none focus:border-[#323232] dark:focus:border-[#DDD0C8] shadow-2xs font-medium"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#f5eee6] dark:bg-[#2e2018] border-b border-[#DDD0C8] dark:border-[#4A3830] text-[#323232] dark:text-[#DDD0C8] font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Student</th>
              <th className="py-3 px-4">Roll No</th>
              <th className="py-3 px-4">Class</th>
              <th className="py-3 px-4">Pages</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Score</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DDD0C8]/60 dark:divide-[#4A3830]/70">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-10 text-[#8c7268] dark:text-[#cbb89f]/70 bg-[#faf8f6] dark:bg-[#231a17] italic">
                  {submissions.length === 0
                    ? 'No student answer sheets uploaded yet.'
                    : 'No students matching search filter.'}
                </td>
              </tr>
            ) : (
              filtered.map((s) => {
                const badge = statusBadges[s.submission_status] || statusBadges.uploaded;
                return (
                  <tr key={s.id} className="hover:bg-[#faf6f0] dark:hover:bg-[#2e2018]/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-[#323232] dark:text-[#DDD0C8]">
                      {s.student_name || s.ai_detected_name || 'Unnamed Student'}
                    </td>
                    <td className="py-3 px-4 text-[#52403a] dark:text-[#cbb89f]">
                      {s.roll_number || s.ai_detected_roll || '—'}
                    </td>
                    <td className="py-3 px-4 text-[#52403a] dark:text-[#cbb89f]">
                      {s.class_name || '—'}
                    </td>
                    <td className="py-3 px-4 text-[#8c7268] dark:text-[#b0998e]">
                      {s.total_pages > 0 ? `${s.total_pages} pgs` : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${badge.class}`}
                      >
                        {badge.text}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {s.submission_status === 'uploaded' || s.submission_status === 'processing' ? (
                        <span className="text-[#8c7268] italic">Pending</span>
                      ) : (
                        <span className="font-black text-[#323232] dark:text-[#DDD0C8]">
                          {s.total_score != null ? `${s.total_score} marks` : '—'}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {s.submission_status === 'evaluated' || s.submission_status === 'reviewed' || s.submission_status === 'finalized' ? (
                        <a
                          href={`/exams/${examId}/submissions/${s.id}/review`}
                          className="inline-flex items-center text-xs font-bold px-3 py-1 bg-[#323232] hover:bg-[#1a1a1a] dark:bg-[#DDD0C8] dark:hover:bg-[#cbb89f] text-white dark:text-[#323232] rounded-xl shadow-xs transition-all active:scale-95 mr-2"
                        >
                          Review
                        </a>
                      ) : null}
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
