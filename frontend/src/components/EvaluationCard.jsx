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
} from 'lucide-react';

// ── Score Circular Arc Gauge ──────────────────────────────────────────────────
function ScoreArcGauge({ score, max }) {
  const pct = max > 0 ? Math.min(1, Math.max(0, score / max)) : 0;
  const r = 21;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;
  const color =
    pct >= 0.85 ? '#10b981' : pct >= 0.5 ? '#6366f1' : pct >= 0.25 ? '#f59e0b' : '#f43f5e';

  return (
    <div className="relative flex items-center justify-center shrink-0">
      <svg width="52" height="52" viewBox="0 0 52 52" className="transform -rotate-90">
        <circle
          cx="26"
          cy="26"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-[#DDD0C8]/40 dark:text-charcoal-700"
        />
        <circle
          cx="26"
          cy="26"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: 'stroke-dasharray 0.6s cubic-bezier(0.16,1,0.3,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xs font-black tracking-tight" style={{ color }}>
          {score}
        </span>
        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-400 -mt-0.5">/{max}</span>
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
      className="p-1.5 rounded-lg hover:bg-[#DDD0C8]/50 dark:hover:bg-charcoal-700 text-slate-500 hover:text-[#323232] dark:text-slate-300 dark:hover:text-white transition-colors"
      title="Copy text"
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

  const scoreTheme = isFullScore
    ? {
        borderTop: 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600',
        badge: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border-emerald-400 dark:border-emerald-700',
        label: 'Full Marks 🎉',
      }
    : isPartialScore
    ? {
        borderTop: 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500',
        badge: 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border-amber-400 dark:border-amber-700',
        label: 'Partial Credit ⚡',
      }
    : {
        borderTop: 'bg-gradient-to-r from-rose-500 via-red-500 to-rose-600',
        badge: 'bg-rose-100 dark:bg-rose-950 text-rose-900 dark:text-rose-200 border-rose-400 dark:border-rose-700',
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
      className="relative rounded-3xl border-2 border-[#DDD0C8] dark:border-charcoal-600 bg-[#fdfbf9] dark:bg-[#1f1f1f] shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden mb-6 animate-slideUp group"
    >
      {/* ── TOP ACCENT COLOR STRIP ── */}
      <div className={`h-2 w-full ${scoreTheme.borderTop}`} />

      {/* ── RE-EVALUATING OVERLAY ── */}
      {isReEvaluating && (
        <div className="absolute inset-0 bg-white/95 dark:bg-[#1f1f1f]/95 backdrop-blur-md z-30 flex flex-col items-center justify-center animate-fadeIn p-6">
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
      <div className="px-5 py-4 border-b border-[#DDD0C8] dark:border-charcoal-700 bg-gradient-to-r from-[#f5eee6] via-[#faf6f0] to-[#f5eee6] dark:from-[#2a2624] dark:via-[#22201e] dark:to-[#2a2624]">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Question Badge & Info */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Bold Question Number Badge with Gradient & Border */}
            <span className="font-black text-xs px-3.5 py-1.5 bg-[#323232] dark:bg-[#DDD0C8] text-[#DDD0C8] dark:text-[#323232] rounded-xl shadow-xs tracking-wider flex items-center space-x-1.5 border border-[#DDD0C8]/40 dark:border-charcoal-600">
              <span className="text-indigo-400 dark:text-indigo-600">●</span>
              <span>QUESTION {evaluation.question_no || '?'}</span>
            </span>

            {/* Marks Pill with subtle Ochre / Gold accent */}
            <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700/80 shadow-2xs">
              {maxMarks} {maxMarks === 1 ? 'Mark' : 'Marks'}
            </span>

            {/* Jump to Page Badge in Electric Indigo */}
            {pageNumbers.map((p) => (
              <button
                key={p}
                onClick={() => onJumpToPage(p)}
                className="inline-flex items-center space-x-1.5 text-xs font-extrabold text-indigo-700 dark:text-indigo-200 bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/90 border border-indigo-200 dark:border-indigo-700/80 px-2.5 py-1 rounded-xl shadow-2xs transition-all active:scale-95"
                title={`Jump answer sheet to Page ${p}`}
              >
                <ExternalLink className="w-3 h-3 text-indigo-500" />
                <span>Page {p}</span>
              </button>
            ))}

            {/* Score status tag */}
            <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border shadow-2xs ${scoreTheme.badge}`}>
              {scoreTheme.label}
            </span>

            {/* Flags */}
            {isFlagged && (
              <span className="inline-flex items-center space-x-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700">
                <AlertTriangle className="w-3 h-3 text-rose-600" />
                <span>{evaluation.flag_reason || 'Flagged'}</span>
              </span>
            )}

            {isOverridden && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700">
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
              className="p-2 rounded-xl text-slate-400 hover:text-[#323232] dark:hover:text-white hover:bg-[#DDD0C8]/40 dark:hover:bg-charcoal-700 transition-colors"
              title={collapsed ? 'Expand evaluation' : 'Collapse evaluation'}
            >
              {collapsed ? <Eye className="w-4 h-4 text-indigo-500" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confidence Strip */}
        <div className="mt-3 pt-2.5 border-t border-[#DDD0C8]/60 dark:border-charcoal-700 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20" />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              AI Confidence: <strong className="text-[#323232] dark:text-[#DDD0C8] font-black">{Math.round(confidence * 100)}%</strong>
            </span>
            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
              confidence >= 0.85
                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                : confidence >= 0.6
                ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                : 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700'
            }`}>
              {confidence >= 0.85 ? 'High Confidence' : confidence >= 0.6 ? 'Moderate' : 'Review Needed'}
            </span>
          </div>

          <div className="text-[11px] text-slate-400 dark:text-slate-400 font-semibold">
            Auto-graded by AI Examiner • Verified
          </div>
        </div>
      </div>

      {/* ── CARD BODY (COLLAPSIBLE) ── */}
      {!collapsed && (
        <div className="p-5 space-y-4 animate-fadeIn">

          {/* 1. Question Statement — Deep Indigo / Cobalt Themed Card */}
          {evaluation.question_text && (
            <div className="rounded-2xl p-4 bg-gradient-to-r from-indigo-50/90 via-slate-50 to-indigo-50/40 dark:from-[#1a1f36] dark:via-[#16192e] dark:to-[#1a1f36] border-2 border-indigo-200 dark:border-indigo-800/80 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-indigo-500" />
              <div className="pl-2">
                <div className="flex items-center space-x-2 mb-1.5">
                  <div className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                    ?
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                    Question Statement
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-indigo-50 leading-relaxed">
                  {evaluation.question_text}
                </p>
              </div>
            </div>
          )}

          {/* 2. Expected Key Points & Rubric — Warm Golden Amber Themed Card */}
          {(modelAnswer || keyPoints.length > 0) && (
            <div className="rounded-2xl p-4 bg-gradient-to-r from-amber-50/90 via-[#fffbf5] to-amber-50/50 dark:from-[#2e2313] dark:via-[#241c0f] dark:to-[#2e2313] border-2 border-amber-300 dark:border-amber-700/80 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-amber-500" />
              <div className="pl-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 rounded-md bg-amber-500 text-white flex items-center justify-center">
                      <BookOpen className="w-3 h-3" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 dark:text-amber-300">
                      Expected Model Answer & Rubric Key
                    </span>
                  </div>
                  {modelAnswer && <CopyBtn text={modelAnswer} />}
                </div>

                {modelAnswer && (
                  <p className="text-xs font-medium text-amber-950 dark:text-amber-100 bg-white/95 dark:bg-[#1a140b] p-3 rounded-xl border border-amber-200 dark:border-amber-800/80 leading-relaxed shadow-2xs">
                    {modelAnswer}
                  </p>
                )}

                {keyPoints.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5 items-center">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-400 mr-1">
                      Tested Concepts:
                    </span>
                    {keyPoints.map((kp, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-amber-100/90 dark:bg-amber-900/60 text-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-700/80 shadow-2xs flex items-center space-x-1"
                      >
                        <span className="text-emerald-600 dark:text-emerald-400 font-black">✓</span>
                        <span>{kp}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. Student Written Response — Parchment & Slate Notebook Transcript */}
          <div className="rounded-2xl p-4 bg-gradient-to-r from-[#faf6f0] via-[#f7f1e8] to-[#faf6f0] dark:from-[#262320] dark:via-[#1e1c1a] dark:to-[#262320] border-2 border-[#DDD0C8] dark:border-charcoal-600 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#323232] dark:bg-[#DDD0C8]" />
            <div className="pl-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 rounded-md bg-[#323232] dark:bg-[#DDD0C8] text-[#DDD0C8] dark:text-[#323232] flex items-center justify-center font-bold text-[10px]">
                    ✍️
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#323232] dark:text-[#DDD0C8]">
                    Student's Written Response (OCR Transcript)
                  </span>
                </div>
                <CopyBtn text={evaluation.transcribed_answer} />
              </div>

              <div className="font-mono text-xs sm:text-[13px] font-medium text-[#323232] dark:text-[#f0e6df] bg-white dark:bg-[#151413] p-4 rounded-xl border border-[#DDD0C8] dark:border-charcoal-700 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto custom-scrollbar shadow-inner">
                {evaluation.transcribed_answer || (
                  <span className="italic text-slate-400">No student response detected or blank answer</span>
                )}
              </div>
            </div>
          </div>

          {/* 4. 2-Column Vibrant Bento: Points Matched (Emerald) vs Missing Points (Rose) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Points Matched Card — Rich Emerald / Forest Jade */}
            <div className="rounded-2xl p-4 bg-gradient-to-br from-emerald-50 via-[#f0fdf4] to-teal-50/50 dark:from-[#0d261c] dark:via-[#091f16] dark:to-[#061811] border-2 border-emerald-300 dark:border-emerald-600/70 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-emerald-200/80 dark:border-emerald-800/80">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-emerald-950 dark:text-emerald-100 uppercase tracking-wide block">
                      Points Matched
                    </span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold">
                      Concepts verified in answer
                    </span>
                  </div>
                </div>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
                  {matchedPts.length}
                </span>
              </div>

              {matchedPts.length > 0 ? (
                <div className="space-y-2">
                  {matchedPts.map((pt, i) => (
                    <div
                      key={i}
                      className="flex items-start space-x-2.5 text-xs font-semibold text-emerald-950 dark:text-emerald-100 bg-white/95 dark:bg-[#133224] p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-700/60 shadow-2xs"
                    >
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 font-black" />
                      <span className="leading-snug">{pt}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs font-medium italic text-emerald-800/70 dark:text-emerald-300/70 py-2">
                  No matching rubric points identified.
                </p>
              )}
            </div>

            {/* Points Missed Card — Rich Crimson / Coral Rose */}
            <div className="rounded-2xl p-4 bg-gradient-to-br from-rose-50 via-[#fff1f2] to-red-50/50 dark:from-[#2e1219] dark:via-[#240d13] dark:to-[#1c080d] border-2 border-rose-300 dark:border-rose-600/70 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-rose-200/80 dark:border-rose-800/80">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
                    <XCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-rose-950 dark:text-rose-100 uppercase tracking-wide block">
                      Missing Points
                    </span>
                    <span className="text-[10px] text-rose-700 dark:text-rose-300 font-semibold">
                      Required criteria omitted
                    </span>
                  </div>
                </div>
                <span className={`text-xs font-black px-2.5 py-0.5 rounded-full shadow-xs text-white ${
                  missedPts.length > 0 ? 'bg-rose-600' : 'bg-emerald-600'
                }`}>
                  {missedPts.length}
                </span>
              </div>

              {missedPts.length > 0 ? (
                <div className="space-y-2">
                  {missedPts.map((pt, i) => (
                    <div
                      key={i}
                      className="flex items-start space-x-2.5 text-xs font-semibold text-rose-950 dark:text-rose-100 bg-white/95 dark:bg-[#38151f] p-2.5 rounded-xl border border-rose-200 dark:border-rose-700/60 shadow-2xs"
                    >
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span className="leading-snug">{pt}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-white/95 dark:bg-[#1b3323] border border-emerald-300 dark:border-emerald-700/60 text-xs font-bold text-emerald-800 dark:text-emerald-200 shadow-2xs">
                  <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Flawless! All required key points covered.</span>
                </div>
              )}
            </div>
          </div>

          {/* 5. AI Examiner Feedback Card — Royal Violet / Plum Gradient */}
          {evaluation.feedback && (
            <div className="rounded-2xl p-4 bg-gradient-to-r from-violet-50 via-purple-50/70 to-indigo-50/60 dark:from-[#251636] dark:via-[#1e112c] dark:to-[#17142b] border-2 border-purple-300 dark:border-purple-600/70 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-indigo-500 to-purple-600" />
              <div className="pl-2">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-black text-purple-950 dark:text-purple-200 uppercase tracking-wider">
                    AI Examiner Evaluation Notes & Reasoning
                  </span>
                </div>
                <p className="text-xs sm:text-[13px] font-medium text-purple-950 dark:text-purple-100 leading-relaxed bg-white/80 dark:bg-[#1a0f26]/80 p-3 rounded-xl border border-purple-200 dark:border-purple-800/60 shadow-2xs">
                  "{evaluation.feedback}"
                </p>
              </div>
            </div>
          )}

          {/* Teacher Comment Sticky Badge */}
          {comment && !showComment && (
            <div className="flex items-start justify-between gap-3 bg-amber-50/90 dark:bg-[#2b2214] border-2 border-amber-300 dark:border-amber-700/70 rounded-2xl p-3.5 shadow-2xs">
              <div className="flex items-start space-x-2.5">
                <MessageSquare className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[11px] font-black text-amber-900 dark:text-amber-300 uppercase tracking-wide block">
                    Teacher Grading Note
                  </span>
                  <p className="text-xs text-amber-950 dark:text-amber-100 font-medium leading-relaxed">{comment}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowComment(true)}
                className="text-xs font-bold text-amber-800 dark:text-amber-400 hover:underline shrink-0"
              >
                Edit Note
              </button>
            </div>
          )}

          {/* Teacher Comment Editor Drawer */}
          {showComment && (
            <div className="rounded-2xl p-4 bg-white dark:bg-charcoal-800 border-2 border-[#DDD0C8] dark:border-charcoal-600 shadow-md space-y-2.5 animate-fadeIn">
              <label className="text-[11px] font-extrabold text-[#323232] dark:text-[#DDD0C8] uppercase tracking-wider block">
                Add Teacher Note / Justification
              </label>
              <textarea
                ref={commentRef}
                rows={2}
                placeholder="Explain mark adjustment, feedback to student, or grading note..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border-2 border-[#DDD0C8] dark:border-charcoal-600 bg-[#faf8f6] dark:bg-charcoal-900 text-[#323232] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#323232]/30 resize-none font-medium"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => { setComment(evaluation.teacher_comment || ''); setShowComment(false); }}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-charcoal-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveComment}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#323232] hover:bg-[#1a1a1a] dark:bg-[#DDD0C8] dark:hover:bg-[#cfc0b6] text-white dark:text-[#323232] shadow-sm"
                >
                  Save Note
                </button>
              </div>
            </div>
          )}

          {/* ── TEACHER INTERACTIVE SCORING BAR ── */}
          <div className="pt-4 border-t-2 border-[#DDD0C8] dark:border-charcoal-700 bg-gradient-to-r from-[#f5efe8] via-[#faf6f0] to-[#f5efe8] dark:from-[#252220] dark:via-[#1e1c1b] dark:to-[#252220] -mx-5 -mb-5 p-5 flex flex-wrap items-center justify-between gap-3">
            {/* Left: Quick Score Presets & Stepper */}
            <div className="flex items-center flex-wrap gap-2.5">
              <span className="text-xs font-black uppercase tracking-wider text-[#323232] dark:text-[#DDD0C8]">
                Marks Awarded:
              </span>

              {/* 1-Click Score Presets with High-Contrast Themed Colors */}
              <div className="inline-flex items-center space-x-1 p-1 rounded-xl bg-white dark:bg-charcoal-900 border border-[#DDD0C8] dark:border-charcoal-600 shadow-2xs">
                <button
                  type="button"
                  onClick={() => handleSetExact(0)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                    marks === 0
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/60'
                  }`}
                  title="Assign 0 Marks"
                >
                  0
                </button>
                {maxMarks > 1 && (
                  <button
                    type="button"
                    onClick={() => handleSetExact(Math.round((maxMarks / 2) * 10) / 10)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                      marks > 0 && marks < maxMarks
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-950/60'
                    }`}
                    title="Assign Half Marks"
                  >
                    ½
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleSetExact(maxMarks)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                    marks === maxMarks
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60'
                  }`}
                  title="Assign Full Marks"
                >
                  Full
                </button>
              </div>

              {/* Tactile Stepper with number box */}
              <div className="flex items-center bg-white dark:bg-charcoal-900 border-2 border-[#DDD0C8] dark:border-charcoal-600 rounded-xl overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => handleStep(-0.5)}
                  disabled={marks <= 0}
                  className="px-3 py-1.5 text-slate-700 dark:text-slate-200 hover:bg-[#DDD0C8]/40 dark:hover:bg-charcoal-700 disabled:opacity-30 transition-colors font-black text-sm"
                  title="Decrease 0.5"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max={maxMarks}
                  value={marks}
                  onChange={handleInput}
                  className="w-14 text-center text-sm font-black text-[#323232] dark:text-[#DDD0C8] py-1 focus:outline-none bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => handleStep(0.5)}
                  disabled={marks >= maxMarks}
                  className="px-3 py-1.5 text-slate-700 dark:text-slate-200 hover:bg-[#DDD0C8]/40 dark:hover:bg-charcoal-700 disabled:opacity-30 transition-colors font-black text-sm"
                  title="Increase 0.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <span className="text-xs font-black text-slate-400">/ {maxMarks}</span>
              <span className={`text-xs font-black px-2.5 py-1 rounded-xl border shadow-2xs ${scoreTheme.badge}`}>
                {pct}%
              </span>
            </div>

            {/* Right: Reset, Note, Re-evaluate Actions */}
            <div className="flex items-center space-x-2">
              {isOverridden && (
                <button
                  type="button"
                  onClick={() => onReset(evaluation.id)}
                  className="inline-flex items-center space-x-1 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-[#DDD0C8]/40 dark:hover:bg-charcoal-700 rounded-xl border border-slate-300 dark:border-charcoal-600 transition-colors shadow-2xs"
                  title="Reset to AI marks"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Reset</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowComment((v) => !v)}
                className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                  comment
                    ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border-2 border-amber-400'
                    : 'bg-white dark:bg-charcoal-900 text-[#323232] dark:text-[#DDD0C8] hover:bg-[#DDD0C8]/30 border-2 border-[#DDD0C8] dark:border-charcoal-600'
                }`}
                title="Add teacher feedback note"
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                <span>Note</span>
              </button>

              <button
                type="button"
                onClick={() => onReEvaluate(evaluation.id)}
                disabled={isReEvaluating}
                className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-black text-white bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
                title="Re-run AI evaluation for this question"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isReEvaluating ? 'animate-spin' : ''}`} />
                <span>{isReEvaluating ? 'Grading…' : 'Re-evaluate'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
