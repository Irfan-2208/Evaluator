import React from 'react';
import { useJob } from '../hooks/useJob';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function JobProgress({ jobId, onComplete, title = 'Processing Document' }) {
  const { status, progress, currentStep, errorMessage } = useJob(jobId, onComplete);

  if (!jobId) return null;

  const isDone = status === 'done';
  const isFailed = status === 'failed';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 my-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          {isDone ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
          ) : isFailed ? (
            <AlertCircle className="w-6 h-6 text-rose-600 flex-shrink-0" />
          ) : (
            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin flex-shrink-0" />
          )}
          <div>
            <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {isDone
                ? 'Completed successfully'
                : isFailed
                ? `Error: ${errorMessage || 'Processing failed'}`
                : currentStep || 'Working with Gemini Vision...'}
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
          {progress}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ${
            isFailed
              ? 'bg-rose-500'
              : isDone
              ? 'bg-emerald-500'
              : 'bg-indigo-600'
          }`}
          style={{ width: `${Math.max(5, Math.min(100, progress))}%` }}
        />
      </div>

      {isFailed && (
        <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
          {errorMessage || 'Failed to complete job. Please check server logs and retry.'}
        </div>
      )}
    </div>
  );
}
