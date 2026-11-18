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
  ChevronDown,
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
} from 'lucide-react';

// ── Collapsible Accordion Section ─────────────────────────────────────────────
function AccordionSection({
  icon: Icon,
  title,
  badge,
  badgeColor = 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
  borderColor = 'border-slate-200 dark:border-slate-700',
  headerBg = 'bg-slate-50/80 dark:bg-slate-800/50',
  defaultOpen = false,
  children,
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`rounded-xl border ${borderColor} overflow-hidden transition-all duration-200`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between px-3 py-2.5 ${headerBg} hover:brightness-[0.97] dark:hover:brightness-110 transition-all duration-150`}
      >
        <div className="flex items-center space-x-2">
          {Icon && <Icon className="w-3.5 h-3.5 text-current opacity-60" />}
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{title}</span>
          {badge !== undefined && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${badgeColor}`}>
              {badge}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="animate-slideUp">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Score Circular Arc ─────────────────────────────────────────────────────────
function ScoreArc({ score, max }) {
  const pct = max > 0 ? Math.min(1, score / max) : 0;
  const r = 20;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;
  const color =
    pct >= 0.8 ? '#10b981' : pct >= 0.5 ? '#6366f1' : pct >= 0.3 ? '#f59e0b' : '#ef4444';

  return (
    <svg width="52" height="52" viewBox="0 0 52 52" className="shrink-0">
      <circle
        cx="26" cy="26" r={r}
        fill="none" stroke="currentColor" strokeWidth="4"
        className="text-slate-100 dark:text-slate-800"
      />
      <circle
        cx="26" cy="26" r={r}
        fill="none" stroke={color} strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        transform="rotate(-90 26 26)"
        style={{ transition: 'stroke-dasharray 0.6s cubic-bezier(0.16,1,0.3,1)' }}
      />
      <text x="26" y="30" textAnchor="middle" fontSize="10" fontWeight="700" fill={color}>
        {score}/{max}
      </text>
    </svg>
  );
}

// ── Confidence Bar ─────────────────────────────────────────────────────────────
function ConfidenceBar({ value }) {
  const pct = Math.round(value * 100);
  const color = pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-indigo-500' : 'bg-amber-500';
  const label = pct >= 80 ? 'High' : pct >= 60 ? 'Med' : 'Low';

  return (
    <div className="flex items-center space-x-2">
      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 w-7">{label}</span>
      <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 w-7 text-right">{pct}%</span>
    </div>
  );
}

// ── Re-evaluate Loading Overlay ───────────────────────────────────────────────
function ReEvalOverlay() {
  return (
    <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-2xl animate-fadeIn">
      <div className="relative mb-3">
        <div className="w-11 h-11 rounded-full border-4 border-indigo-100 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400 animate-spin" />
        <Brain className="w-4 h-4 text-indigo-600 dark:text-indigo-400 absolute inset-0 m-auto" />
      </div>
      <p className="text-xs font-bold text-slate-700 dark:text-slate-200 animate-pulse">Re-evaluating with AI…</p>
      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Analyzing answer content</p>
      {/* Fake progress shimmer */}
      <div className="mt-4 w-36 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full w-3/5 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 rounded-full bg-[length:200%_100%] animate-shimmer" />
      </div>
    </div>
  );
}

// ── Copy Button ───────────────────────────────────────────────────────────────
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
      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
      title="Copy"
    >
      {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

// ── Main EvaluationCard ───────────────────────────────────────────────────────
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

  const pct = maxMarks > 0 ? Math.round((marks / maxMarks) * 100) : 0;
  const scoreColor =
    pct >= 80 ? 'text-emerald-600 dark:text-emerald-400'
    : pct >= 50 ? 'text-indigo-600 dark:text-indigo-400'
    : pct >= 30 ? 'text-amber-500 dark:text-amber-400'
    : 'text-rose-600 dark:text-rose-400';

  const handleStep = (delta) => {
    const next = Math.max(0, Math.min(maxMarks, Math.round((marks + delta) * 10) / 10));
    setMarks(next);
    onOverride(evaluation.id, next, comment);
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

  const cardBorder = isFlagged
    ? 'border-amber-300 dark:border-amber-700/50 ring-1 ring-amber-100 dark:ring-amber-500/10'
    : isOverridden
    ? 'border-indigo-300 dark:border-indigo-700/50 ring-1 ring-indigo-100 dark:ring-indigo-500/10'
    : 'border-slate-200 dark:border-slate-800';

  return (
    <div
      id={`eval-card-${evaluation.id}`}
      data-eval-id={String(evaluation.id)}
      className={`relative rounded-2xl border bg-white dark:bg-slate-900 shadow-sm hover:shadow-lg overflow-hidden transition-all duration-300 animate-slideUp ${cardBorder}`}
    >
      {isReEvaluating && <ReEvalOverlay />}

      {/* ══ CARD HEADER ══ */}
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50/60 dark:from-slate-800/90 dark:via-slate-900 dark:to-slate-800/60 px-4 py-3 border-b border-slate-200/60 dark:border-slate-800">
        <div className="flex items-start justify-between gap-3">

          {/* Left cluster */}
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
            {/* Q badge */}
            <span className="font-black text-sm text-white bg-indigo-600 dark:bg-indigo-500 px-2.5 py-0.5 rounded-lg shadow-sm tracking-wide shrink-0">
              Q{evaluation.question_no || '?'}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium shrink-0">
              {maxMarks} {maxMarks === 1 ? 'mark' : 'marks'}
            </span>

            {/* Page jump pills */}
            {pageNumbers.map((p) => (
              <button
                key={p}
                onClick={() => onJumpToPage(p)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 border border-indigo-200 dark:border-indigo-800/60 px-2 py-0.5 rounded-full transition-all duration-150 active:scale-95 shrink-0"
                title={`Go to Page ${p}`}
              >
                <ExternalLink className="w-3 h-3" /> pg.{p}
              </button>
            ))}

            {/* State badges */}
            {isFlagged && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 rounded-full shrink-0">
                <AlertTriangle className="w-3 h-3" />
                {evaluation.flag_reason || 'Flagged'}
              </span>
            )}
            {isOverridden && (
              <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 px-2 py-0.5 rounded-full shrink-0">
                ✎ Modified
              </span>
            )}
          </div>

          {/* Right: arc gauge + collapse toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <ScoreArc score={marks} max={maxMarks} />
            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={collapsed ? 'Expand' : 'Collapse'}
            >
              {collapsed ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* AI Confidence strip */}
        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
              AI Confidence
            </span>
            <span className={`text-[10px] font-bold ${scoreColor}`}>{pct}%</span>
          </div>
          <ConfidenceBar value={confidence} />
        </div>
      </div>

      {/* ══ BODY (collapsible) ══ */}
      {!collapsed && (
        <div className="p-3.5 space-y-2.5 animate-fadeIn">

          {/* Question text */}
          {evaluation.question_text && (
            <div className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3">
              <FileText className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-0.5">
                  Question
                </span>
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">{evaluation.question_text}</p>
              </div>
            </div>
          )}

          {/* Student's Answer — open by default */}
          <AccordionSection
            icon={ClipboardList}
            title="Student's Answer"
            defaultOpen={true}
            borderColor="border-slate-200 dark:border-slate-700/60"
            headerBg="bg-slate-50/80 dark:bg-slate-800/50"
          >
            <div className="relative p-3 bg-white dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800">
              <div className="absolute top-2 right-2">
                <CopyBtn text={evaluation.transcribed_answer || ''} />
              </div>
              <pre className="text-xs text-slate-800 dark:text-slate-200 font-mono leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto custom-scrollbar pr-7">
                {evaluation.transcribed_answer || (
                  <span className="italic text-slate-400 dark:text-slate-500">No answer transcribed</span>
                )}
              </pre>
            </div>
          </AccordionSection>

          {/* Expected Answer / Key Points */}
          {(evaluation.model_answer || (evaluation.key_points && evaluation.key_points.length > 0)) && (
            <AccordionSection
              icon={BookOpen}
              title="Expected Answer"
              defaultOpen={false}
              borderColor="border-indigo-200 dark:border-indigo-900/50"
              headerBg="bg-indigo-50/60 dark:bg-indigo-950/20"
            >
              <div className="p-3 space-y-2 border-t border-indigo-100 dark:border-indigo-900/30 bg-white dark:bg-slate-950/60">
                {evaluation.model_answer && (
                  <p className="text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
                    {evaluation.model_answer}
                  </p>
                )}
                {evaluation.key_points && evaluation.key_points.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide block mb-1.5">
                      Key Points
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {evaluation.key_points.map((kp, i) => (
                        <span
                          key={i}
                          className="text-[11px] bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60 text-indigo-800 dark:text-indigo-300 px-2 py-0.5 rounded-lg"
                        >
                          {kp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </AccordionSection>
          )}

          {/* Points Matched */}
          <AccordionSection
            icon={CheckCircle2}
            title="Points Matched"
            badge={matchedPts.length}
            badgeColor={
              matchedPts.length > 0
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }
            defaultOpen={matchedPts.length > 0}
            borderColor="border-emerald-200 dark:border-emerald-900/40"
            headerBg="bg-emerald-50/70 dark:bg-emerald-950/20"
          >
            <div className="p-3 border-t border-emerald-100 dark:border-emerald-900/20 bg-white dark:bg-slate-950/60">
              {matchedPts.length > 0 ? (
                <ul className="space-y-1.5">
                  {matchedPts.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-emerald-500 shrink-0" />
                      <span className="text-xs text-emerald-900 dark:text-emerald-200 leading-snug">{pt}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs italic text-emerald-500/70 dark:text-emerald-400/60">No key points matched.</p>
              )}
            </div>
          </AccordionSection>

          {/* Missing Points */}
          <AccordionSection
            icon={XCircle}
            title="Missing Points"
            badge={missedPts.length}
            badgeColor={
              missedPts.length > 0
                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }
            defaultOpen={missedPts.length > 0}
            borderColor="border-rose-200 dark:border-rose-900/40"
            headerBg="bg-rose-50/70 dark:bg-rose-950/20"
          >
            <div className="p-3 border-t border-rose-100 dark:border-rose-900/20 bg-white dark:bg-slate-950/60">
              {missedPts.length > 0 ? (
                <ul className="space-y-1.5">
                  {missedPts.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <XCircle className="w-3.5 h-3.5 mt-0.5 text-rose-500 shrink-0" />
                      <span className="text-xs text-rose-900 dark:text-rose-200 leading-snug">{pt}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs italic text-rose-500/70 dark:text-rose-400/60">No missing points.</p>
              )}
            </div>
          </AccordionSection>

          {/* AI Feedback */}
          {evaluation.feedback && (
            <AccordionSection
              icon={Sparkles}
              title="AI Feedback"
              defaultOpen={false}
              borderColor="border-violet-200 dark:border-violet-900/40"
              headerBg="bg-violet-50/60 dark:bg-violet-950/20"
            >
              <div className="p-3 border-t border-violet-100 dark:border-violet-900/20 bg-white dark:bg-slate-950/60">
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{evaluation.feedback}</p>
              </div>
            </AccordionSection>
          )}

          {/* Existing teacher note */}
          {comment && !showComment && (
            <div className="flex items-start gap-2 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl p-3">
              <MessageSquare className="w-3.5 h-3.5 mt-0.5 text-amber-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide block mb-0.5">Teacher Note</span>
                <p className="text-xs text-amber-900 dark:text-amber-200 leading-snug">{comment}</p>
              </div>
              <button
                onClick={() => setShowComment(true)}
                className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline shrink-0 font-medium"
              >
                Edit
              </button>
            </div>
          )}

          {/* Comment input */}
          {showComment && (
            <div className="animate-fadeIn space-y-2">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">
                Teacher Note / Justification
              </label>
              <textarea
                ref={commentRef}
                rows={3}
                placeholder="Add a note or justification for marks..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none custom-scrollbar"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveComment}
                  className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Save Note
                </button>
                <button
                  onClick={() => { setComment(evaluation.teacher_comment || ''); setShowComment(false); }}
                  className="px-3 py-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* ── TEACHER CONTROL BAR ── */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-3">

              {/* Marks stepper */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Marks</span>
                <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
                  <button
                    type="button"
                    onClick={() => handleStep(-0.5)}
                    disabled={marks <= 0}
                    className="px-2.5 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors"
                    title="−0.5"
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
                    className="w-14 text-center text-sm font-bold text-slate-900 dark:text-white py-1.5 focus:outline-none bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => handleStep(0.5)}
                    disabled={marks >= maxMarks}
                    className="px-2.5 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors"
                    title="+0.5"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <span className="text-xs text-slate-400 dark:text-slate-500">/ {maxMarks}</span>
                <span className={`text-xs font-bold ${scoreColor}`}>{pct}%</span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5">
                {isOverridden && (
                  <button
                    onClick={() => onReset(evaluation.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title="Reset to AI marks"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                )}

                <button
                  onClick={() => setShowComment((v) => !v)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg transition-colors ${
                    comment
                      ? 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title={comment ? 'Edit teacher note' : 'Add teacher note'}
                >
                  <MessageSquare className="w-3 h-3" />
                  Note
                </button>

                <button
                  onClick={() => onReEvaluate(evaluation.id)}
                  disabled={isReEvaluating}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-50"
                  title="Re-run AI evaluation"
                >
                  <RefreshCw className={`w-3 h-3 ${isReEvaluating ? 'animate-spin' : ''}`} />
                  {isReEvaluating ? 'Evaluating…' : 'Re-evaluate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
