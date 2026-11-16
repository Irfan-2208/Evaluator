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
      className={`rounded-xl border transition-all duration-200 bg-white shadow-sm overflow-hidden mb-4 ${
        isFlagged
          ? 'border-amber-300 ring-1 ring-amber-200'
          : isOverridden
          ? 'border-indigo-300 ring-1 ring-indigo-200'
          : 'border-slate-200'
      }`}
    >
      {/* Card Header */}
      <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200/70 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-sm text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
            Q{evaluation.question_no || '?'}
          </span>
          <span className="text-xs font-semibold text-slate-500">
            [Max: {maxMarks} {maxMarks === 1 ? 'mark' : 'marks'}]
          </span>

          {/* Page badge(s) that jump viewer */}
          {pageNumbers.map((p) => (
            <button
              key={p}
              onClick={() => onJumpToPage(p)}
              className="inline-flex items-center text-[11px] font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
              title={`Jump to Page ${p}`}
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
              className="inline-flex items-center text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md"
              title={evaluation.flag_reason || 'Attention needed'}
            >
              <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" />
              {evaluation.flag_reason || 'Flagged'}
            </span>
          )}

          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
              confidence >= 0.8
                ? 'text-emerald-700 bg-emerald-50'
                : confidence >= 0.6
                ? 'text-blue-700 bg-blue-50'
                : 'text-rose-700 bg-rose-50'
            }`}
          >
            {Math.round(confidence * 100)}% Conf.
          </span>
        </div>
      </div>

      <div className="p-4 space-y-3.5">
        {/* Question Text */}
        {evaluation.question_text && (
          <div className="text-xs text-slate-700 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
            <span className="font-semibold text-slate-800">Question: </span>
            {evaluation.question_text}
          </div>
        )}

        {/* Student Transcribed Answer */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
            <span>Student's Transcribed Answer:</span>
          </div>
          <div className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-3 font-mono text-slate-800 leading-relaxed max-h-36 overflow-y-auto whitespace-pre-wrap">
            {evaluation.transcribed_answer || (
              <span className="text-slate-400 italic">No answer transcribed</span>
            )}
          </div>
        </div>

        {/* Model Answer & Key Points Accordion */}
        {(evaluation.model_answer || (evaluation.key_points && evaluation.key_points.length > 0)) && (
          <div className="text-xs bg-indigo-50/40 border border-indigo-100 rounded-lg p-2.5">
            {evaluation.model_answer && (
              <div className="mb-1.5">
                <span className="font-semibold text-indigo-950">Model Answer: </span>
                <span className="text-indigo-900">{evaluation.model_answer}</span>
              </div>
            )}
            {evaluation.key_points && evaluation.key_points.length > 0 && (
              <div className="flex flex-wrap items-center gap-1 mt-1">
                <span className="font-semibold text-indigo-950 mr-1">Key Points:</span>
                {evaluation.key_points.map((kp, idx) => (
                  <span
                    key={idx}
                    className="bg-white/80 border border-indigo-200 text-indigo-800 px-1.5 py-0.5 rounded text-[10px]"
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
          <div className="bg-emerald-50/60 border border-emerald-200/70 rounded-lg p-2.5">
            <div className="flex items-center font-semibold text-emerald-800 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              Points Matched ({evaluation.key_points_matched?.length || 0})
            </div>
            {evaluation.key_points_matched && evaluation.key_points_matched.length > 0 ? (
              <ul className="list-disc list-inside space-y-0.5 text-emerald-900 text-[11px]">
                {evaluation.key_points_matched.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            ) : (
              <p className="text-[11px] text-emerald-600/80 italic">None matched</p>
            )}
          </div>

          {/* Missed */}
          <div className="bg-rose-50/60 border border-rose-200/70 rounded-lg p-2.5">
            <div className="flex items-center font-semibold text-rose-800 mb-1">
              <XCircle className="w-3.5 h-3.5 mr-1 text-rose-600" />
              Points Missed ({evaluation.key_points_missed?.length || 0})
            </div>
            {evaluation.key_points_missed && evaluation.key_points_missed.length > 0 ? (
              <ul className="list-disc list-inside space-y-0.5 text-rose-900 text-[11px]">
                {evaluation.key_points_missed.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            ) : (
              <p className="text-[11px] text-rose-600/80 italic">No points missed</p>
            )}
          </div>
        </div>

        {/* AI Feedback */}
        {evaluation.feedback && (
          <div className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2.5">
            <span className="font-semibold text-slate-900 flex items-center mb-0.5">
              <Sparkles className="w-3 h-3 text-indigo-600 mr-1" />
              AI Feedback:
            </span>
            <p className="text-slate-600 leading-relaxed">{evaluation.feedback}</p>
          </div>
        )}

        {/* Teacher Override & Control Bar */}
        <div className="pt-2 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-3">
          {/* Marks Control */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-700">Marks:</span>

            <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white shadow-2xs">
              <button
                type="button"
                onClick={() => handleStepMarks(-0.5)}
                disabled={marks <= 0}
                className="px-2.5 py-1 text-slate-700 hover:bg-slate-100 disabled:opacity-30 font-bold text-sm transition-colors"
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
                className="w-14 text-center font-bold text-sm text-slate-900 border-x border-slate-300 py-1 focus:outline-none focus:bg-indigo-50/40"
              />

              <button
                type="button"
                onClick={() => handleStepMarks(0.5)}
                disabled={marks >= maxMarks}
                className="px-2.5 py-1 text-slate-700 hover:bg-slate-100 disabled:opacity-30 font-bold text-sm transition-colors"
                title="Increase 0.5"
              >
                +
              </button>
            </div>

            <span className="text-xs text-slate-400">/ {maxMarks}</span>

            {/* AI Marks Reference Badge */}
            <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              AI: {evaluation.ai_marks}
            </span>

            {isOverridden && (
              <button
                type="button"
                onClick={() => onReset(evaluation.id)}
                className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 flex items-center transition-colors"
                title="Reset to AI marks"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsEditingComment(!isEditingComment)}
              className={`text-xs px-2.5 py-1 rounded-md border flex items-center transition-colors ${
                comment
                  ? 'border-indigo-300 text-indigo-700 bg-indigo-50 hover:bg-indigo-100'
                  : 'border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
              title="Add Teacher Comment"
            >
              <MessageSquare className="w-3.5 h-3.5 mr-1" />
              {comment ? 'Edit Comment' : 'Comment'}
            </button>

            <button
              type="button"
              onClick={() => onReEvaluate(evaluation.id)}
              disabled={isReEvaluating}
              className="text-xs px-2.5 py-1 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50 flex items-center disabled:opacity-50 transition-colors"
              title="Re-run Gemini evaluation for this single question"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isReEvaluating ? 'animate-spin' : ''}`} />
              Re-evaluate
            </button>
          </div>
        </div>

        {/* Comment Box Dropdown */}
        {isEditingComment && (
          <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add teacher note or reason for mark change..."
              className="w-full text-xs p-2 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
            />
            <div className="flex justify-end space-x-2 mt-2">
              <button
                type="button"
                onClick={() => setIsEditingComment(false)}
                className="text-xs px-2.5 py-1 text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveComment}
                className="text-xs px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium shadow-2xs"
              >
                Save Comment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
