import React, { useState } from 'react';
import { Check, Edit2, Award, CheckCircle, Scale, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ScoreSummary({
  submission,
  scoreSummary,
  onFinalize,
  onUpdateHeader,
  isSaving = false,
  strictness = 'moderate',
}) {
  const navigate = useNavigate();
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [name, setName] = useState(submission?.student_name || '');
  const [roll, setRoll] = useState(submission?.roll_number || '');
  const [className, setClassName] = useState(submission?.class_name || '');

  const { totalAwarded, maxTotal, percentage, grade } = scoreSummary;
  const status = submission?.submission_status || 'uploaded';
  const isFinalized = status === 'finalized';
  const currentStrictness = submission?.grading_strictness || strictness || 'moderate';

  const handleSaveHeader = () => {
    onUpdateHeader(name, roll, className);
    setIsEditingStudent(false);
  };

  const gradeGradients = {
    'A+': 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20',
    A: 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-md shadow-emerald-500/20',
    B: 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20',
    C: 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-amber-500/20',
    D: 'bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow-md shadow-orange-500/20',
    F: 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-md shadow-rose-500/20',
  };

  const statusColors = {
    uploaded: 'bg-slate-100 dark:bg-charcoal-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-charcoal-600',
    processing: 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800',
    evaluated: 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800',
    reviewed: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    finalized: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
  };

  const strictnessInfo = {
    lenient: {
      label: 'Lenient',
      icon: Sparkles,
      color: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    },
    moderate: {
      label: 'Moderate',
      icon: Scale,
      color: 'bg-[#DDD0C8]/60 dark:bg-charcoal-700 text-[#323232] dark:text-[#DDD0C8] border-[#DDD0C8] dark:border-charcoal-600',
    },
    strict: {
      label: 'Strict',
      icon: ShieldAlert,
      color: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    },
  };

  const strictCfg = strictnessInfo[currentStrictness.toLowerCase()] || strictnessInfo.moderate;
  const StrictIcon = strictCfg.icon;

  return (
    <div className="bg-white/95 dark:bg-[#252525]/95 backdrop-blur-md border-b border-[#DDD0C8] dark:border-charcoal-700 px-4 py-3 sticky top-0 z-20 shadow-xs flex-shrink-0 transition-colors duration-200">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Student Details with inline edit */}
        <div className="flex items-center space-x-3">
          {/* Avatar Icon */}
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-500/20 shrink-0">
            {submission?.student_name ? submission.student_name.charAt(0).toUpperCase() : 'S'}
          </div>

          {isEditingStudent ? (
            <div className="flex items-center space-x-2 bg-[#faf8f6] dark:bg-charcoal-800 p-1.5 rounded-xl border border-[#DDD0C8] dark:border-charcoal-600">
              <input
                type="text"
                placeholder="Student Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-xs px-2.5 py-1 border border-[#DDD0C8] dark:border-charcoal-600 rounded-lg w-28 bg-white dark:bg-charcoal-900 text-[#323232] dark:text-slate-100 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Roll No"
                value={roll}
                onChange={(e) => setRoll(e.target.value)}
                className="text-xs px-2.5 py-1 border border-[#DDD0C8] dark:border-charcoal-600 rounded-lg w-20 bg-white dark:bg-charcoal-900 text-[#323232] dark:text-slate-100 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Class"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="text-xs px-2.5 py-1 border border-[#DDD0C8] dark:border-charcoal-600 rounded-lg w-20 bg-white dark:bg-charcoal-900 text-[#323232] dark:text-slate-100 focus:outline-none"
              />
              <button
                onClick={handleSaveHeader}
                className="p-1.5 bg-[#323232] dark:bg-[#DDD0C8] text-white dark:text-[#323232] rounded-lg hover:opacity-90"
                title="Save changes"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-sm text-[#323232] dark:text-white">
                  {submission?.student_name || submission?.ai_detected_name || 'Student Name'}
                </span>
                <button
                  onClick={() => {
                    setName(submission?.student_name || '');
                    setRoll(submission?.roll_number || '');
                    setClassName(submission?.class_name || '');
                    setIsEditingStudent(true);
                  }}
                  className="text-slate-400 hover:text-[#323232] dark:hover:text-white transition-colors"
                  title="Edit Student Info"
                >
                  <Edit2 className="w-3 h-3" />
                </button>

                {/* Status Pill */}
                <span
                  className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    statusColors[status] || statusColors.uploaded
                  }`}
                >
                  {status}
                </span>

                {/* Strictness Pill */}
                <span
                  className={`inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full border ${strictCfg.color}`}
                  title={`Grading Strictness: ${strictCfg.label}`}
                >
                  <StrictIcon className="w-2.5 h-2.5 mr-1" />
                  {strictCfg.label}
                </span>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 space-x-2 mt-0.5">
                <span>Roll: <strong className="text-[#323232] dark:text-slate-300">{submission?.roll_number || submission?.ai_detected_roll || '—'}</strong></span>
                <span>•</span>
                <span>Class: <strong className="text-[#323232] dark:text-slate-300">{submission?.class_name || '—'}</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* Live Score Counter & Finalize Button */}
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="flex items-baseline space-x-1.5 justify-end">
              <span className="font-black text-xl text-[#323232] dark:text-white tracking-tight">
                {totalAwarded}
              </span>
              <span className="text-xs font-bold text-slate-400">/ {maxTotal}</span>
              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 ml-1">
                ({percentage}%)
              </span>
            </div>

            {/* Vibrant progress bar */}
            <div className="w-32 bg-[#f4efe9] dark:bg-charcoal-800 rounded-full h-2 overflow-hidden ml-auto mt-1 border border-[#DDD0C8]/50 dark:border-charcoal-700">
              <div
                className="bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, percentage)}%` }}
              />
            </div>
          </div>

          {/* Vibrant Grade Badge */}
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-base border border-white/20 ${
              gradeGradients[grade] || gradeGradients.F
            }`}
            title={`Grade: ${grade}`}
          >
            {grade}
          </div>

          {/* Action Button: View Report Card or Approve & Finalize */}
          {isFinalized ? (
            <button
              onClick={() =>
                navigate(
                  `/exams/${submission.exam_id}/students/${submission.id}/report`
                )
              }
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-md transition-all duration-200 active:scale-95"
            >
              <Award className="w-4 h-4 mr-1.5" />
              View Report Card
            </button>
          ) : (
            <button
              onClick={onFinalize}
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#323232] to-[#4c4c4c] dark:from-[#DDD0C8] dark:to-[#cbb89f] text-white dark:text-[#323232] text-xs font-bold rounded-xl shadow-md disabled:opacity-50 transition-all duration-200 active:scale-95"
            >
              <CheckCircle className="w-4 h-4 mr-1.5" />
              {isSaving ? 'Finalizing...' : 'Approve & Finalize'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
