import React, { useState } from 'react';
import { Check, Edit2, Award, CheckCircle, Scale, ShieldAlert, Sparkles } from 'lucide-react';
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

  const gradeColors = {
    'A+': 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    A: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    B: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    C: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    D: 'bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    F: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  };

  const statusColors = {
    uploaded: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
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
      color: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
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
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 sticky top-0 z-20 shadow-xs flex-shrink-0 transition-colors duration-200">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Student Details with inline edit */}
        <div className="flex items-center space-x-3">
          {isEditingStudent ? (
            <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <input
                type="text"
                placeholder="Student Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-xs px-2 py-1 border border-slate-300 dark:border-slate-600 rounded w-28 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Roll No"
                value={roll}
                onChange={(e) => setRoll(e.target.value)}
                className="text-xs px-2 py-1 border border-slate-300 dark:border-slate-600 rounded w-20 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Class"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="text-xs px-2 py-1 border border-slate-300 dark:border-slate-600 rounded w-16 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none"
              />
              <button
                onClick={handleSaveHeader}
                className="p-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                title="Save"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2.5">
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {submission?.student_name || submission?.ai_detected_name || 'Student Name'}
                  </span>
                  <button
                    onClick={() => {
                      setName(submission?.student_name || '');
                      setRoll(submission?.roll_number || '');
                      setClassName(submission?.class_name || '');
                      setIsEditingStudent(true);
                    }}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    title="Edit Student Info"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 space-x-2">
                  <span>Roll: {submission?.roll_number || submission?.ai_detected_roll || '—'}</span>
                  <span>•</span>
                  <span>Class: {submission?.class_name || '—'}</span>
                </div>
              </div>

              {/* Status Chip */}
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  statusColors[status] || statusColors.uploaded
                }`}
              >
                {status}
              </span>

              {/* Strictness Badge */}
              <span
                className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${strictCfg.color}`}
                title={`Evaluated with ${strictCfg.label} Strictness`}
              >
                <StrictIcon className="w-3 h-3 mr-1" />
                {strictCfg.label}
              </span>
            </div>
          )}
        </div>

        {/* Live Score Counter & Actions */}
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="flex items-baseline space-x-1.5 justify-end">
              <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">
                {totalAwarded}
              </span>
              <span className="text-xs font-semibold text-slate-400">/ {maxTotal}</span>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 ml-1">
                ({percentage}%)
              </span>
            </div>

            {/* Micro progress bar */}
            <div className="w-32 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden ml-auto mt-0.5">
              <div
                className="bg-indigo-600 dark:bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, percentage)}%` }}
              />
            </div>
          </div>

          {/* Grade Badge */}
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm border shadow-2xs ${
              gradeColors[grade] || gradeColors.F
            }`}
            title={`Grade: ${grade}`}
          >
            {grade}
          </div>

          {/* Approve & Finalize / View Report Button */}
          {isFinalized ? (
            <button
              onClick={() =>
                navigate(
                  `/exams/${submission.exam_id}/students/${submission.id}/report`
                )
              }
              className="inline-flex items-center px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all duration-200 active:scale-95"
            >
              <Award className="w-3.5 h-3.5 mr-1" />
              View Report Card
            </button>
          ) : (
            <button
              onClick={onFinalize}
              disabled={isSaving}
              className="inline-flex items-center px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg shadow-sm disabled:opacity-50 transition-all duration-200 active:scale-95"
            >
              <CheckCircle className="w-3.5 h-3.5 mr-1" />
              {isSaving ? 'Finalizing...' : 'Approve & Finalize'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
