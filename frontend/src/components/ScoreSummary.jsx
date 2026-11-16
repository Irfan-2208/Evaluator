import React, { useState } from 'react';
import { Check, Edit2, Award, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ScoreSummary({
  submission,
  scoreSummary,
  onFinalize,
  onUpdateHeader,
  isSaving = false,
}) {
  const navigate = useNavigate();
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [name, setName] = useState(submission?.student_name || '');
  const [roll, setRoll] = useState(submission?.roll_number || '');
  const [className, setClassName] = useState(submission?.class_name || '');

  const { totalAwarded, maxTotal, percentage, grade } = scoreSummary;
  const status = submission?.submission_status || 'uploaded';
  const isFinalized = status === 'finalized';

  const handleSaveHeader = () => {
    onUpdateHeader(name, roll, className);
    setIsEditingStudent(false);
  };

  const gradeColors = {
    'A+': 'bg-emerald-100 text-emerald-800 border-emerald-300',
    A: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    B: 'bg-blue-50 text-blue-700 border-blue-200',
    C: 'bg-amber-50 text-amber-700 border-amber-200',
    D: 'bg-orange-50 text-orange-700 border-orange-200',
    F: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const statusColors = {
    uploaded: 'bg-slate-100 text-slate-700 border-slate-300',
    processing: 'bg-indigo-100 text-indigo-700 border-indigo-300',
    evaluated: 'bg-blue-100 text-blue-800 border-blue-300',
    reviewed: 'bg-amber-100 text-amber-800 border-amber-300',
    finalized: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  };

  return (
    <div className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-20 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Student Details with inline edit */}
        <div className="flex items-center space-x-3">
          {isEditingStudent ? (
            <div className="flex items-center space-x-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
              <input
                type="text"
                placeholder="Student Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-xs px-2 py-1 border border-slate-300 rounded w-28 bg-white focus:outline-none"
              />
              <input
                type="text"
                placeholder="Roll No"
                value={roll}
                onChange={(e) => setRoll(e.target.value)}
                className="text-xs px-2 py-1 border border-slate-300 rounded w-20 bg-white focus:outline-none"
              />
              <input
                type="text"
                placeholder="Class"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="text-xs px-2 py-1 border border-slate-300 rounded w-16 bg-white focus:outline-none"
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
            <div className="flex items-center space-x-2">
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-sm text-slate-900">
                    {submission?.student_name || submission?.ai_detected_name || 'Student Name'}
                  </span>
                  <button
                    onClick={() => {
                      setName(submission?.student_name || '');
                      setRoll(submission?.roll_number || '');
                      setClassName(submission?.class_name || '');
                      setIsEditingStudent(true);
                    }}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                    title="Edit Student Info"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>
                <div className="text-[11px] text-slate-500 space-x-2">
                  <span>Roll: {submission?.roll_number || submission?.ai_detected_roll || '—'}</span>
                  <span>•</span>
                  <span>Class: {submission?.class_name || '—'}</span>
                </div>
              </div>

              {/* Status Chip */}
              <span
                className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  statusColors[status] || statusColors.uploaded
                }`}
              >
                {status}
              </span>
            </div>
          )}
        </div>

        {/* Live Score Counter & Actions */}
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="flex items-baseline space-x-1.5 justify-end">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                {totalAwarded}
              </span>
              <span className="text-xs font-semibold text-slate-400">/ {maxTotal}</span>
              <span className="text-xs font-bold text-slate-600 ml-1">({percentage}%)</span>
            </div>

            {/* Micro progress bar */}
            <div className="w-32 bg-slate-100 rounded-full h-1.5 overflow-hidden ml-auto mt-0.5">
              <div
                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
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
                navigate(`/exams/${submission.exam_id}/students/${submission.id}/report`)
              }
              className="inline-flex items-center px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <Award className="w-3.5 h-3.5 mr-1.5" />
              View Report
            </button>
          ) : (
            <button
              onClick={onFinalize}
              disabled={isSaving}
              className="inline-flex items-center px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
              {isSaving ? 'Finalizing...' : 'Approve & Finalize'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
