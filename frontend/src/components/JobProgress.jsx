import React, { useState, useEffect, useRef } from 'react';
import { useJob } from '../hooks/useJob';
import { CheckCircle2, AlertCircle, Loader2, Clock } from 'lucide-react';

export default function JobProgress({ jobId, onComplete, title = 'Processing Document' }) {
  const { status, progress, currentStep, errorMessage } = useJob(jobId, onComplete);

  const [completedSteps, setCompletedSteps] = useState([]);
  const prevStep = useRef('');

  // Reset when a new job starts
  useEffect(() => {
    setCompletedSteps([]);
    prevStep.current = '';
  }, [jobId]);

  // Accumulate completed steps as currentStep changes
  useEffect(() => {
    if (currentStep && currentStep !== prevStep.current && prevStep.current) {
      setCompletedSteps((prev) => {
        if (prev.includes(prevStep.current)) return prev;
        return [...prev, prevStep.current];
      });
    }
    prevStep.current = currentStep;
  }, [currentStep]);

  if (!jobId) return null;

  const isDone = status === 'done';
  const isFailed = status === 'failed';
  const isActive = !isDone && !isFailed;

  return (
    <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm my-4 overflow-hidden transition-colors">
      {/* Scanning animation bar at the top — only while active */}
      {isActive && (
        <div className="absolute top-0 left-0 right-0 h-0.5 overflow-hidden">
          <div className="animate-scanline h-full w-1/3 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
        </div>
      )}
      {isDone && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-500" />
      )}
      {isFailed && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-rose-500" />
      )}

      <div className="p-5">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            {isDone ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            ) : isFailed ? (
              <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
            ) : (
              <Loader2 className="w-5 h-5 text-indigo-500 dark:text-indigo-400 animate-spin flex-shrink-0" />
            )}
            <span className="text-sm font-semibold text-slate-900 dark:text-white">{title}</span>
          </div>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-md ${
              isDone
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                : isFailed
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
            }`}
          >
            {isDone ? '✓ Done' : isFailed ? 'Failed' : `${progress}%`}
          </span>
        </div>

        {/* Step Log */}
        <div className="space-y-1.5 mb-4">
          {/* Completed steps */}
          {completedSteps.map((step, i) => (
            <div
              key={i}
              className="flex items-center space-x-2 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 rounded-xl px-3 py-1.5 animate-fadeIn"
            >
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-500" />
              <span className="font-medium">{step}</span>
            </div>
          ))}

          {/* Current active step */}
          {isActive && currentStep && (
            <div className="flex items-center space-x-2 text-xs text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 rounded-xl px-3 py-1.5 animate-pulse">
              <Loader2 className="w-3.5 h-3.5 flex-shrink-0 text-indigo-500 dark:text-indigo-400 animate-spin" />
              <span className="font-semibold">{currentStep}</span>
            </div>
          )}

          {/* Idle/waiting placeholder */}
          {isActive && !currentStep && (
            <div className="flex items-center space-x-2 text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-1.5">
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Initializing...</span>
            </div>
          )}

          {/* Done final state */}
          {isDone && (
            <div className="flex items-center space-x-2 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl px-3 py-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-500" />
              <span className="font-semibold">Completed successfully</span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              isFailed
                ? 'bg-rose-500'
                : isDone
                ? 'bg-emerald-500'
                : 'bg-gradient-to-r from-indigo-500 to-violet-500'
            }`}
            style={{ width: `${Math.max(5, Math.min(100, progress))}%` }}
          />
        </div>

        {/* Error detail */}
        {isFailed && (
          <div className="mt-3 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300">
            {errorMessage || 'Failed to complete job. Please check server logs and retry.'}
          </div>
        )}
      </div>
    </div>
  );
}
