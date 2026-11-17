import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

export default function EvaluationCard({
  evaluation,
  onOverride,
  onReset,
  onReEvaluate,
  onJumpToPage,
  isReEvaluating = false,
}) {
  const [marks, setMarks] = useState(evaluation.final_marks ?? evaluation.ai_marks ?? 0);
  const [comment, setComment] = useState(evaluation.teacher_comment || '');
  const [isEditingComment, setIsEditingComment] = useState(false);

  useEffect(() => {
    setMarks(evaluation.final_marks ?? evaluation.ai_marks ?? 0);
    setComment(evaluation.teacher_comment || '');
  }, [evaluation]);

  const maxMarks = evaluation.max_marks || 1.0;
  const isOverridden = evaluation.is_overridden || false;
  const isFlagged = evaluation.is_flagged || false;
  const confidence = evaluation.confidence ?? 0.9;
  const pageNumbers = evaluation.page_numbers || [];

  const handleStepMarks = (delta) => {
    const nextVal = Math.max(0, Math.min(maxMarks, Math.round((marks + delta) * 10) / 10));
    setMarks(nextVal);
    onOverride(evaluation.id, nextVal, comment);
  };

  const handleDirectInput = (e) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      const clamped = Math.max(0, Math.min(maxMarks, val));
      setMarks(clamped);
      onOverride(evaluation.id, clamped, comment);
    }
  };

  const handleSaveComment = () => {
    onOverride(evaluation.id, marks, comment);
    setIsEditingComment(false);
  };

  return (
    <div
      id={`eval-card-${evaluation.id}`}
      className={`rounded-2xl border transition-all duration-300 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md overflow-hidden mb-4 ${
        isFlagged
          ? 'border-amber-300 dark:border-amber-600/80 ring-1 ring-amber-200 dark:ring-amber-500/20'
          : isOverridden
          ? 'border-indigo-300 dark:border-indigo-600/80 ring-1 ring-indigo-200 dark:ring-indigo-500/20'
          : 'border-slate-200 dark:border-slate-800'
      }`}
    >
      {/* Card Header */}
      <div className="bg-slate-50/80 dark:bg-slate-800/80 px-4 py-3 border-b border-slate-200/70 dark:border-slate-750 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 shadow-2xs">
            Q{evaluation.question_no || '?'}
          </span>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            [Max: {maxMarks} {maxMarks === 1 ? 'mark' : 'marks'}]
          </span>

          {/* Page badge(s) that scroll viewer */}
          {pageNumbers.map((p) => (
            <button
              key={p}
              onClick={() => onJumpToPage(p)}
              className="inline-flex items-center text-[11px] font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded-full transition-all duration-200 cursor-pointer active:scale-95"
              title={`Scroll answer sheet to Page ${p}`}
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Page {p}
            </button>
          ))}
        </div>

        {/* Confidence & Flag Badges */}
        <div className="flex items-center space-x-2">
          {isFlagged && (
            <span
              className="inline-flex items-center text-[11px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-md"
              title={evaluation.flag_reason || 'Attention needed'}
            >
              <AlertTriangle className="w-3 h-3 mr-1 text-amber-600 dark:text-amber-400" />
              {evaluation.flag_reason || 'Flagged'}
            </span>
          )}

          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
              confidence >= 0.8
                ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50'
                : confidence >= 0.6
                ? 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50'
                : 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50'
            }`}
          >
            {Math.round(confidence * 100)}% Conf.
          </span>
        </div>
      </div>

      <div className="p-4 space-y-3.5">
        {/* Question Text */}
        {evaluation.question_text && (
          <div className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50/70 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="font-semibold text-slate-900 dark:text-white">Question: </span>
            {evaluation.question_text}
          </div>
        )}

        {/* Student Transcribed Answer */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            <span>Student's Transcribed Answer:</span>
          </div>
          <div className="text-xs bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl p-3 font-mono text-slate-800 dark:text-slate-200 leading-relaxed max-h-36 overflow-y-auto custom-scrollbar whitespace-pre-wrap">
            {evaluation.transcribed_answer || (
              <span className="text-slate-400 dark:text-slate-500 italic">No answer transcribed</span>
            )}
          </div>
        </div>

        {/* Model Answer & Key Points Accordion */}
        {(evaluation.model_answer || (evaluation.key_points && evaluation.key_points.length > 0)) && (
          <div className="text-xs bg-indigo-50/40 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-xl p-2.5">
            {evaluation.model_answer && (
              <div className="mb-1.5">
                <span className="font-semibold text-indigo-950 dark:text-indigo-200">Model Answer: </span>
                <span className="text-indigo-900 dark:text-indigo-300">{evaluation.model_answer}</span>
              </div>
            )}
            {evaluation.key_points && evaluation.key_points.length > 0 && (
              <div className="flex flex-wrap items-center gap-1 mt-1">
                <span className="font-semibold text-indigo-950 dark:text-indigo-200 mr-1">Key Points:</span>
                {evaluation.key_points.map((kp, idx) => (
                  <span
                    key={idx}
                    className="bg-white/80 dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300 px-1.5 py-0.5 rounded text-[10px]"
                  >
                    {kp}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Key Points Matched vs Missed */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {/* Matched */}
          <div className="bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/50 rounded-xl p-2.5">
            <div className="flex items-center font-semibold text-emerald-800 dark:text-emerald-300 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />
              Points Matched ({evaluation.key_points_matched?.length || 0})
            </div>
            {evaluation.key_points_matched && evaluation.key_points_matched.length > 0 ? (
              <ul className="list-disc list-inside space-y-0.5 text-emerald-900 dark:text-emerald-200 text-[11px]">
                {evaluation.key_points_matched.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            ) : (
              <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 italic">None matched</p>
            )}
          </div>

          {/* Missed */}
          <div className="bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-900/50 rounded-xl p-2.5">
            <div className="flex items-center font-semibold text-rose-800 dark:text-rose-300 mb-1">
              <XCircle className="w-3.5 h-3.5 mr-1 text-rose-600 dark:text-rose-400" />
              Points Missed ({evaluation.key_points_missed?.length || 0})
            </div>
            {evaluation.key_points_missed && evaluation.key_points_missed.length > 0 ? (
              <ul className="list-disc list-inside space-y-0.5 text-rose-900 dark:text-rose-200 text-[11px]">
                {evaluation.key_points_missed.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            ) : (
              <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80 italic">No points missed</p>
            )}
          </div>
        </div>

        {/* AI Feedback */}
        {evaluation.feedback && (
          <div className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5">
            <span className="font-semibold text-slate-900 dark:text-white flex items-center mb-0.5">
              <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400 mr-1" />
              AI Feedback:
            </span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{evaluation.feedback}</p>
          </div>
        )}

        {/* Teacher Override & Control Bar */}
        <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Marks Control */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Marks:</span>

            <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800 shadow-2xs">
              <button
                type="button"
                onClick={() => handleStepMarks(-0.5)}
                disabled={marks <= 0}
                className="px-2.5 py-1 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 font-bold text-sm transition-colors"
                title="Decrease 0.5"
              >
                -
              </button>

              <input
                type="number"
                step="0.5"
                min="0"
                max={maxMarks}
                value={marks}
                onChange={handleDirectInput}
                className="w-14 text-center text-xs font-bold text-slate-900 dark:text-white py-1 focus:outline-none bg-transparent"
              />

              <button
                type="button"
                onClick={() => handleStepMarks(0.5)}
                disabled={marks >= maxMarks}
                className="px-2.5 py-1 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 font-bold text-sm transition-colors"
                title="Increase 0.5"
              >
                +
              </button>
            </div>

            <span className="text-xs text-slate-400">/ {maxMarks}</span>

            {isOverridden && (
              <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 px-2 py-0.5 rounded-full">
                Modified
              </span>
            )}
          </div>

          {/* Action Buttons: Reset, Comment, Re-evaluate */}
          <div className="flex items-center space-x-1.5">
            {isOverridden && (
              <button
                onClick={() => onReset(evaluation.id)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                title="Reset to AI marks"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={() => setIsEditingComment(!isEditingComment)}
              className={`p-1.5 rounded transition-colors ${
                comment
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Add / Edit Comment"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onReEvaluate(evaluation.id)}
              disabled={isReEvaluating}
              className="inline-flex items-center text-xs font-semibold px-2.5 py-1 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-md transition-colors disabled:opacity-40"
              title="Re-run AI evaluation for this question"
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${isReEvaluating ? 'animate-spin' : ''}`} />
              Re-evaluate
            </button>
          </div>
        </div>

        {/* Expandable Teacher Comment Box */}
        {isEditingComment && (
          <div className="pt-2 animate-fadeIn">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Teacher note / justification..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="flex-1 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                onClick={handleSaveComment}
                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
