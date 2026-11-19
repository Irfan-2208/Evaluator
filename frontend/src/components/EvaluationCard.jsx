import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  Sparkles,
  BookOpen,
  FileText,
  ClipboardList,
  Eye,
  EyeOff,
  Copy,
  Check,
  Brain,
  Minus,
  Plus,
  Scale,
  Award,
  ArrowRight,
  Split,
  LayoutGrid,
  Lightbulb,
} from 'lucide-react';

// ── Score Circular Arc Gauge ──────────────────────────────────────────────────
function ScoreArcGauge({ score, max }) {
  const pct = max > 0 ? Math.min(1, Math.max(0, score / max)) : 0;
  const r = 20;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;
  const color =
    pct >= 0.8 ? '#10b981' : pct >= 0.5 ? '#6366f1' : pct >= 0.25 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative flex items-center justify-center shrink-0">
      <svg width="48" height="48" viewBox="0 0 48 48" className="transform -rotate-90">
        <circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          className="text-slate-100 dark:text-charcoal-700"
        />
        <circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: 'stroke-dasharray 0.6s cubic-bezier(0.16,1,0.3,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[11px] font-black" style={{ color }}>
          {score}
        </span>
        <span className="text-[8px] font-bold text-slate-400 -mt-0.5">/{max}</span>
      </div>
    </div>
  );
}

// ── Copy Button with Confirmation ─────────────────────────────────────────────
function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text || '').then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        });
      }}
      className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-charcoal-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
      title="Copy answer text"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

// ── Main EvaluationCard Component ─────────────────────────────────────────────
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
  const [showComment, setShowComment] = useState(false);
  const [viewTab, setViewTab] = useState('bento'); // 'bento' | 'compare' | 'rubric'
  const [collapsed, setCollapsed] = useState(false);
  const commentRef = useRef(null);

  useEffect(() => {
    setMarks(evaluation.final_marks ?? evaluation.ai_marks ?? 0);
    setComment(evaluation.teacher_comment || '');
  }, [evaluation]);

  useEffect(() => {
    if (showComment && commentRef.current) commentRef.current.focus();
  }, [showComment]);

  const maxMarks = evaluation.max_marks || 1.0;
  const isOverridden = evaluation.is_overridden || false;
  const isFlagged = evaluation.is_flagged || false;
  const confidence = evaluation.confidence ?? 0.9;
  const pageNumbers = evaluation.page_numbers || [];
  const matchedPts = evaluation.key_points_matched || [];
  const missedPts = evaluation.key_points_missed || [];
  const modelAnswer = evaluation.model_answer || '';
  const keyPoints = evaluation.key_points || [];

  const pct = maxMarks > 0 ? Math.round((marks / maxMarks) * 100) : 0;

  // Grade color theme based on score percentage
  const isFullScore = pct >= 95;
  const isPartialScore = pct >= 40 && pct < 95;
  const isLowScore = pct < 40;

  const scoreTheme = isFullScore
    ? {
        borderTop: 'bg-emerald-500',
        badge: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300',
        label: 'Full Marks 🎉',
      }
    : isPartialScore
    ? {
        borderTop: 'bg-amber-500',
        badge: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300',
        label: 'Partial Credit ⚡',
      }
    : {
        borderTop: 'bg-rose-500',
        badge: 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-300',
        label: 'Needs Review ⚠️',
      };

  const handleStep = (delta) => {
    const next = Math.max(0, Math.min(maxMarks, Math.round((marks + delta) * 10) / 10));
    setMarks(next);
    onOverride(evaluation.id, next, comment);
  };

  const handleSetExact = (val) => {
    const clamped = Math.max(0, Math.min(maxMarks, val));
    setMarks(clamped);
    onOverride(evaluation.id, clamped, comment);
  };

  const handleInput = (e) => {
    const v = parseFloat(e.target.value);
    if (!isNaN(v)) {
      const c = Math.max(0, Math.min(maxMarks, v));
      setMarks(c);
      onOverride(evaluation.id, c, comment);
    }
  };

  const handleSaveComment = () => {
    onOverride(evaluation.id, marks, comment);
    setShowComment(false);
  };

  return (
    <div
      id={`eval-card-${evaluation.id}`}
      data-eval-id={String(evaluation.id)}
      className="relative rounded-3xl border border-[#DDD0C8] dark:border-charcoal-700 bg-white dark:bg-[#252525] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden mb-5 animate-slideUp group"
    >
      {/* ── TOP ACCENT COLOR STRIP ── */}
      <div className={`h-1.5 w-full ${scoreTheme.borderTop}`} />

      {/* ── RE-EVALUATING OVERLAY ── */}
      {isReEvaluating && (
        <div className="absolute inset-0 bg-white/95 dark:bg-[#252525]/95 backdrop-blur-md z-30 flex flex-col items-center justify-center animate-fadeIn p-6">
          <div className="relative mb-3">
            <div className="w-12 h-12 rounded-full border-4 border-[#DDD0C8] dark:border-charcoal-600 border-t-indigo-600 dark:border-t-indigo-400 animate-spin" />
            <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400 absolute inset-0 m-auto animate-pulse" />
          </div>
          <p className="text-sm font-extrabold text-[#323232] dark:text-white">AI Examiner is Re-Evaluating...</p>
          <p className="text-xs text-slate-400 mt-1">Re-analyzing student handwriting & matching rubric</p>
          <div className="mt-4 w-44 h-1.5 bg-slate-100 dark:bg-charcoal-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full animate-shimmer" style={{ width: '70%' }} />
          </div>
        </div>
      )}

      {/* ── CARD HEADER BAR ── */}
      <div className="px-5 py-4 border-b border-[#DDD0C8]/60 dark:border-charcoal-700 bg-gradient-to-r from-[#faf8f6] via-white to-[#faf8f6] dark:from-charcoal-800/80 dark:via-[#252525] dark:to-charcoal-800/80">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Question Badge & Info */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Colorful Question Number Badge */}
            <span className="font-black text-xs px-3 py-1 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl shadow-xs tracking-wide">
              Q{evaluation.question_no || '?'}
            </span>

            {/* Marks Pill */}
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-[#DDD0C8]/50 dark:bg-charcoal-700 text-[#323232] dark:text-[#DDD0C8] border border-[#DDD0C8]/70 dark:border-charcoal-600">
              {maxMarks} {maxMarks === 1 ? 'Mark' : 'Marks'}
            </span>

            {/* Jump to Page Badge */}
            {pageNumbers.map((p) => (
              <button
                key={p}
                onClick={() => onJumpToPage(p)}
                className="inline-flex items-center space-x-1 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800/80 px-2.5 py-0.5 rounded-lg transition-all active:scale-95"
                title={`Jump answer sheet to Page ${p}`}
              >
                <ExternalLink className="w-3 h-3" />
                <span>Page {p}</span>
              </button>
            ))}

            {/* Score status tag */}
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${scoreTheme.badge}`}>
              {scoreTheme.label}
            </span>

            {/* Flags */}
            {isFlagged && (
              <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                <AlertTriangle className="w-3 h-3" />
                <span>{evaluation.flag_reason || 'Flagged'}</span>
              </span>
            )}

            {isOverridden && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                ✎ Teacher Adjusted
              </span>
            )}
          </div>

          {/* Right: Score Gauge & Collapse Toggle */}
          <div className="flex items-center space-x-3 shrink-0">
            <ScoreArcGauge score={marks} max={maxMarks} />
            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-[#323232] dark:hover:text-white hover:bg-[#DDD0C8]/40 dark:hover:bg-charcoal-700 transition-colors"
              title={collapsed ? 'Expand evaluation' : 'Collapse evaluation'}
            >
              {collapsed ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confidence bar & Quick View Switcher Row */}
        <div className="mt-3 pt-2.5 border-t border-[#DDD0C8]/50 dark:border-charcoal-700 flex flex-wrap items-center justify-between gap-3">
          {/* AI Confidence Indicator */}
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              AI Confidence: <span className="text-[#323232] dark:text-white font-extrabold">{Math.round(confidence * 100)}%</span>
            </span>
          </div>

          {/* CREATIVE VIEW SWITCHER (NO DROPDOWNS!) */}
          <div className="inline-flex items-center p-0.5 rounded-xl bg-[#DDD0C8]/40 dark:bg-charcoal-800 border border-[#DDD0C8]/60 dark:border-charcoal-600">
            <button
              type="button"
              onClick={() => setViewTab('bento')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                viewTab === 'bento'
                  ? 'bg-white dark:bg-charcoal-700 text-[#323232] dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-indigo-500" />
              <span>Evaluation Bento</span>
            </button>

            <button
              type="button"
              onClick={() => setViewTab('compare')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                viewTab === 'compare'
                  ? 'bg-white dark:bg-charcoal-700 text-[#323232] dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              <Split className="w-3.5 h-3.5 text-emerald-500" />
              <span>Side-by-Side</span>
            </button>

            <button
              type="button"
              onClick={() => setViewTab('rubric')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                viewTab === 'rubric'
                  ? 'bg-white dark:bg-charcoal-700 text-[#323232] dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Model & Key</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── CARD BODY (COLLAPSIBLE) ── */}
      {!collapsed && (
        <div className="p-5 space-y-4 animate-fadeIn">

          {/* 1. Question Statement */}
          {evaluation.question_text && (
            <div className="rounded-2xl p-3.5 bg-gradient-to-r from-slate-50 to-indigo-50/40 dark:from-charcoal-800/90 dark:to-charcoal-800/40 border border-slate-200 dark:border-charcoal-600">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-1">
                Question Statement
              </span>
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                {evaluation.question_text}
              </p>
            </div>
          )}

          {/* ── VIEW TAB 1: EVALUATION BENTO (NO DROPDOWNS!) ── */}
          {viewTab === 'bento' && (
            <div className="space-y-3.5 animate-fadeIn">
              {/* Student Answer Card (Clean Transcript style) */}
              <div className="rounded-2xl p-4 bg-[#faf8f5] dark:bg-charcoal-800/60 border border-[#DDD0C8] dark:border-charcoal-600 relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Student's Written Response
                    </span>
                  </div>
                  <CopyBtn text={evaluation.transcribed_answer} />
                </div>
                <div className="font-mono text-xs text-[#323232] dark:text-slate-200 bg-white dark:bg-charcoal-900 p-3.5 rounded-xl border border-[#DDD0C8]/60 dark:border-charcoal-700 leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto custom-scrollbar">
                  {evaluation.transcribed_answer || (
                    <span className="italic text-slate-400">No student response detected or blank answer</span>
                  )}
                </div>
              </div>

              {/* 2-Column Bento Tiles: Points Matched (Green) vs Missing Points (Rose) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Points Matched Card */}
                <div className="rounded-2xl p-4 bg-gradient-to-br from-emerald-50/90 via-emerald-50/40 to-white dark:from-emerald-950/40 dark:via-charcoal-800 dark:to-charcoal-800 border border-emerald-200 dark:border-emerald-800/60 shadow-2xs">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-black text-emerald-900 dark:text-emerald-200">
                        Points Matched
                      </span>
                    </div>
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                      {matchedPts.length}
                    </span>
                  </div>

                  {matchedPts.length > 0 ? (
                    <div className="space-y-1.5">
                      {matchedPts.map((pt, i) => (
                        <div key={i} className="flex items-start space-x-2 text-xs text-emerald-950 dark:text-emerald-200 bg-white/80 dark:bg-charcoal-900/60 p-2 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="leading-snug">{pt}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs italic text-emerald-700/70 dark:text-emerald-400/70 py-2">
                      No matching rubric points identified.
                    </p>
                  )}
                </div>

                {/* Points Missed Card */}
                <div className="rounded-2xl p-4 bg-gradient-to-br from-rose-50/90 via-rose-50/40 to-white dark:from-rose-950/40 dark:via-charcoal-800 dark:to-charcoal-800 border border-rose-200 dark:border-rose-800/60 shadow-2xs">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-900/60 flex items-center justify-center text-rose-700 dark:text-rose-300">
                        <XCircle className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-black text-rose-900 dark:text-rose-200">
                        Missing Points
                      </span>
                    </div>
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-rose-600 text-white">
                      {missedPts.length}
                    </span>
                  </div>

                  {missedPts.length > 0 ? (
                    <div className="space-y-1.5">
                      {missedPts.map((pt, i) => (
                        <div key={i} className="flex items-start space-x-2 text-xs text-rose-950 dark:text-rose-200 bg-white/80 dark:bg-charcoal-900/60 p-2 rounded-xl border border-rose-100 dark:border-rose-900/40">
                          <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                          <span className="leading-snug">{pt}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs italic text-rose-600/70 dark:text-rose-400/70 py-2">
                      Excellent! No required key points missed.
                    </p>
                  )}
                </div>
              </div>

              {/* AI Examiner Feedback Card (Lavender/Purple Gradient) */}
              {evaluation.feedback && (
                <div className="rounded-2xl p-4 bg-gradient-to-r from-violet-50/90 via-purple-50/50 to-indigo-50/50 dark:from-purple-950/40 dark:via-charcoal-800 dark:to-charcoal-800 border border-purple-200 dark:border-purple-800/60 shadow-2xs">
                  <div className="flex items-center space-x-2 mb-1.5">
                    <div className="w-5 h-5 rounded-md bg-purple-100 dark:bg-purple-900/70 flex items-center justify-center text-purple-700 dark:text-purple-300">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-black text-purple-900 dark:text-purple-200 uppercase tracking-wide">
                      AI Examiner Evaluation Notes
                    </span>
                  </div>
                  <p className="text-xs text-purple-950 dark:text-slate-200 leading-relaxed pl-7">
                    {evaluation.feedback}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── VIEW TAB 2: SIDE-BY-SIDE COMPARISON ── */}
          {viewTab === 'compare' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
              {/* Left Column: Student Answer */}
              <div className="rounded-2xl p-4 bg-[#faf8f5] dark:bg-charcoal-800 border border-[#DDD0C8] dark:border-charcoal-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>Student Wrote</span>
                  </span>
                  <CopyBtn text={evaluation.transcribed_answer} />
                </div>
                <div className="font-mono text-xs text-[#323232] dark:text-slate-200 bg-white dark:bg-charcoal-900 p-3 rounded-xl border border-slate-200 dark:border-charcoal-700 min-h-[120px] whitespace-pre-wrap">
                  {evaluation.transcribed_answer || 'No answer recorded'}
                </div>
              </div>

              {/* Right Column: Model / Expected Answer */}
              <div className="rounded-2xl p-4 bg-amber-50/50 dark:bg-charcoal-800 border border-amber-200 dark:border-amber-800/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Expected Model Answer</span>
                  </span>
                  <CopyBtn text={modelAnswer} />
                </div>
                <div className="text-xs text-amber-950 dark:text-slate-200 bg-white dark:bg-charcoal-900 p-3 rounded-xl border border-amber-200/80 dark:border-charcoal-700 min-h-[120px] leading-relaxed">
                  {modelAnswer || 'No specific model answer provided for this question'}
                </div>
              </div>
            </div>
          )}

          {/* ── VIEW TAB 3: FULL RUBRIC & KEY POINTS ── */}
          {viewTab === 'rubric' && (
            <div className="rounded-2xl p-4 bg-gradient-to-r from-amber-50/70 to-orange-50/50 dark:from-charcoal-800 dark:to-charcoal-800 border border-amber-200 dark:border-charcoal-600 space-y-3 animate-fadeIn">
              <div>
                <span className="text-[11px] font-black uppercase text-amber-800 dark:text-amber-300 tracking-wider block mb-1">
                  Expected Solution Rubric
                </span>
                <p className="text-xs text-[#323232] dark:text-slate-200 leading-relaxed bg-white/80 dark:bg-charcoal-900 p-3 rounded-xl border border-amber-200 dark:border-charcoal-700">
                  {modelAnswer || 'Standard evaluation rubric applied'}
                </p>
              </div>

              {keyPoints.length > 0 && (
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-amber-800 dark:text-amber-400 tracking-wider block mb-1.5">
                    Key Evaluation Concepts
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {keyPoints.map((kp, i) => (
                      <span
                        key={i}
                        className="text-xs font-bold px-3 py-1 bg-white dark:bg-charcoal-900 text-[#323232] dark:text-amber-200 rounded-xl border border-amber-200 dark:border-charcoal-700 shadow-2xs"
                      >
                        ✓ {kp}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Teacher Comment Sticky Badge */}
          {comment && !showComment && (
            <div className="flex items-start justify-between gap-3 bg-amber-50/80 dark:bg-charcoal-800 border border-amber-200 dark:border-charcoal-600 rounded-2xl p-3.5">
              <div className="flex items-start space-x-2.5">
                <MessageSquare className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] font-black text-amber-800 dark:text-amber-300 uppercase tracking-wide block">
                    Teacher Grading Note
                  </span>
                  <p className="text-xs text-[#323232] dark:text-slate-200 font-medium leading-relaxed">{comment}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowComment(true)}
                className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline shrink-0"
              >
                Edit Note
              </button>
            </div>
          )}

          {/* Teacher Comment Editor Drawer */}
          {showComment && (
            <div className="rounded-2xl p-4 bg-white dark:bg-charcoal-800 border border-[#DDD0C8] dark:border-charcoal-600 shadow-sm space-y-2.5 animate-fadeIn">
              <label className="text-[11px] font-extrabold text-[#323232] dark:text-slate-300 uppercase tracking-wider block">
                Add Teacher Note / Justification
              </label>
              <textarea
                ref={commentRef}
                rows={2}
                placeholder="Explain mark adjustment, feedback to student, or grading note..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-[#DDD0C8] dark:border-charcoal-600 bg-[#faf8f6] dark:bg-charcoal-900 text-[#323232] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#323232]/20 resize-none"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => { setComment(evaluation.teacher_comment || ''); setShowComment(false); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-charcoal-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveComment}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#323232] hover:bg-[#1a1a1a] dark:bg-[#DDD0C8] dark:hover:bg-[#cfc0b6] text-white dark:text-[#323232]"
                >
                  Save Note
                </button>
              </div>
            </div>
          )}

          {/* ── TEACHER INTERACTIVE SCORING BAR ── */}
          <div className="pt-3.5 border-t border-[#DDD0C8]/60 dark:border-charcoal-700 flex flex-wrap items-center justify-between gap-3">
            {/* Left: Quick Score Presets & Stepper */}
            <div className="flex items-center flex-wrap gap-2.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Marks:
              </span>

              {/* 1-Click Score Presets */}
              <div className="inline-flex items-center space-x-1 p-0.5 rounded-xl bg-slate-100 dark:bg-charcoal-800 border border-slate-200 dark:border-charcoal-700">
                <button
                  type="button"
                  onClick={() => handleSetExact(0)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-extrabold transition-all ${
                    marks === 0
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-charcoal-700'
                  }`}
                  title="Assign 0 Marks"
                >
                  0
                </button>
                {maxMarks > 1 && (
                  <button
                    type="button"
                    onClick={() => handleSetExact(Math.round((maxMarks / 2) * 10) / 10)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-extrabold transition-all ${
                      marks > 0 && marks < maxMarks
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-charcoal-700'
                    }`}
                    title="Assign Half Marks"
                  >
                    ½
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleSetExact(maxMarks)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-extrabold transition-all ${
                    marks === maxMarks
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-charcoal-700'
                  }`}
                  title="Assign Full Marks"
                >
                  Full
                </button>
              </div>

              {/* Stepper with number box */}
              <div className="flex items-center bg-white dark:bg-charcoal-800 border border-[#DDD0C8] dark:border-charcoal-600 rounded-xl overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => handleStep(-0.5)}
                  disabled={marks <= 0}
                  className="px-2.5 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-charcoal-700 disabled:opacity-30 transition-colors font-bold text-sm"
                  title="Decrease 0.5"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max={maxMarks}
                  value={marks}
                  onChange={handleInput}
                  className="w-12 text-center text-xs font-black text-[#323232] dark:text-white py-1 focus:outline-none bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => handleStep(0.5)}
                  disabled={marks >= maxMarks}
                  className="px-2.5 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-charcoal-700 disabled:opacity-30 transition-colors font-bold text-sm"
                  title="Increase 0.5"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              <span className="text-xs font-bold text-slate-400">/ {maxMarks}</span>
              <span className={`text-xs font-black px-2 py-0.5 rounded-lg border ${scoreTheme.badge}`}>
                {pct}%
              </span>
            </div>

            {/* Right: Reset, Note, Re-evaluate Actions */}
            <div className="flex items-center space-x-2">
              {isOverridden && (
                <button
                  type="button"
                  onClick={() => onReset(evaluation.id)}
                  className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-charcoal-700 rounded-xl transition-colors"
                  title="Reset to AI marks"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowComment((v) => !v)}
                className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  comment
                    ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                    : 'bg-slate-100 dark:bg-charcoal-800 text-slate-600 dark:text-slate-300 hover:bg-[#DDD0C8]/40 border border-slate-200 dark:border-charcoal-700'
                }`}
                title="Add teacher feedback note"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Note</span>
              </button>

              <button
                type="button"
                onClick={() => onReEvaluate(evaluation.id)}
                disabled={isReEvaluating}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
                title="Re-run AI evaluation for this question"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isReEvaluating ? 'animate-spin' : ''}`} />
                <span>{isReEvaluating ? 'Grading...' : 'Re-evaluate'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
