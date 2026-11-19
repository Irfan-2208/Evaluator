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
    <div className="relative bg-white dark:bg-[#252525] rounded-2xl border-2 border-[#DDD0C8] dark:border-[#4A3830] shadow-sm my-4 overflow-hidden transition-colors">
      {/* Scanning animation bar at the top — only while active */}
      {isActive && (
        <div className="absolute top-0 left-0 right-0 h-0.5 overflow-hidden">
          <div className="animate-scanline h-full w-1/3 bg-gradient-to-r from-transparent via-[#cbb89f] to-transparent" />
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
              <Loader2 className="w-5 h-5 text-[#6b5248] dark:text-[#cbb89f] animate-spin flex-shrink-0" />
            )}
            <span className="text-sm font-bold text-[#323232] dark:text-[#DDD0C8]">{title}</span>
          </div>
          <span
            className={`text-xs font-bold px-3 py-1 rounded-xl border shadow-2xs ${
              isDone
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : isFailed
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                : 'bg-[#DDD0C8]/60 dark:bg-[#3d2f2a] text-[#323232] dark:text-[#DDD0C8] border-[#DDD0C8] dark:border-[#5c4a40]'
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
            <div className="flex items-center space-x-2 text-xs text-[#323232] dark:text-[#DDD0C8] bg-[#DDD0C8]/30 dark:bg-[#3d2f2a] border border-[#DDD0C8] dark:border-[#5c4a40] rounded-xl px-3 py-1.5 animate-pulse">
              <Loader2 className="w-3.5 h-3.5 flex-shrink-0 text-[#6b5248] dark:text-[#cbb89f] animate-spin" />
              <span className="font-bold">{currentStep}</span>
            </div>
          )}

          {/* Idle/waiting placeholder */}
          {isActive && !currentStep && (
            <div className="flex items-center space-x-2 text-xs text-[#8c7268] dark:text-[#b0998e] bg-[#faf8f6] dark:bg-[#2e2018]/50 border border-[#DDD0C8] dark:border-[#4A3830] rounded-xl px-3 py-1.5">
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Initializing...</span>
            </div>
          )}

          {/* Done final state */}
          {isDone && (
            <div className="flex items-center space-x-2 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl px-3 py-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-500" />
              <span className="font-bold">Completed successfully</span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-[#DDD0C8]/40 dark:bg-[#3d2f2a] rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${
              isFailed
                ? 'bg-rose-500'
                : isDone
                ? 'bg-emerald-500'
                : 'bg-gradient-to-r from-[#323232] via-[#5c4a40] to-[#cbb89f] dark:from-[#cbb89f] dark:to-[#DDD0C8]'
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
