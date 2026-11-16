import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import EvaluationCard from '../components/EvaluationCard';
import ScoreSummary from '../components/ScoreSummary';
import { useEvaluation } from '../hooks/useEvaluation';
import { ArrowLeft, BookOpen, FileQuestion, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

// ─── Left panel: all page images stacked vertically, auto-scrolls ───────────
function ScrollablePageStrip({ images, activePageRef, currentPage }) {
  const [scale, setScale] = useState(1);

  const formatUrl = (url) => {
    if (!url) return '';
    let clean = String(url).replace(/\\/g, '/');
    if (!clean.startsWith('http') && !clean.startsWith('/')) clean = '/' + clean;
    return clean;
  };

  if (!images || images.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400">
        <FileQuestion className="w-16 h-16 stroke-1 mb-2 text-indigo-400 animate-pulse" />
        <p className="text-sm font-semibold text-slate-200">Loading answer sheet...</p>
        <p className="text-xs text-slate-400 mt-1">Images are rendering or synchronizing</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-900 border-r border-slate-700 select-none">
      {/* Toolbar */}
      <div className="h-11 bg-slate-800/90 border-b border-slate-700/80 px-4 flex items-center justify-between flex-shrink-0">
        <span className="text-xs font-semibold text-slate-300">
          Answer Sheet — {images.length} page{images.length !== 1 ? 's' : ''}
        </span>
        {/* Page indicator pill */}
        <span className="text-xs font-bold px-2.5 py-0.5 bg-indigo-600 text-white rounded-md">
          Page {currentPage} / {images.length}
        </span>
        {/* Zoom controls */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setScale((s) => Math.max(0.4, s - 0.2))}
            className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-slate-400 min-w-[42px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale((s) => Math.min(3.0, s + 0.2))}
            className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setScale(1)}
            className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition-colors ml-1"
            title="Reset Zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Vertically scrollable page strip — this is the key part */}
      <div className="flex-1 overflow-y-auto overflow-x-auto bg-slate-950/90 px-4 py-4 space-y-6">
        {images.map((imgUrl, idx) => {
          const pageNum = idx + 1;
          const isActive = currentPage === pageNum;
          return (
            <div
              key={pageNum}
              ref={(el) => {
                // Store ref so parent can scrollIntoView this page
                if (activePageRef && activePageRef.current) {
                  activePageRef.current[pageNum] = el;
                }
              }}
              className={`relative transition-all duration-300 ${
                isActive
                  ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-950 rounded-sm'
                  : 'opacity-70 hover:opacity-90'
              }`}
              style={{ transformOrigin: 'top center', transform: `scale(${scale})` }}
            >
              {/* Page label */}
              <div
                className={`absolute -top-5 left-0 text-[10px] font-bold px-2 py-0.5 rounded ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                Page {pageNum}
              </div>
              <img
                src={formatUrl(imgUrl)}
                alt={`Page ${pageNum}`}
                className="w-full h-auto rounded-sm border border-slate-700 shadow-xl bg-white block"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          );
        })}
        {/* Bottom spacer so last page can scroll to top */}
        <div className="h-[60vh]" />
      </div>
    </div>
  );
}

// ─── Main ReviewPage ─────────────────────────────────────────────────────────
export default function ReviewPage() {
  const { examId, submissionId } = useParams();
  const {
    submission,
    evaluations,
    isLoading,
    isSaving,
    scoreSummary,
    overrideMarks,
    resetToAiMarks,
    reEvaluate,
    finalize,
    updateHeader,
  } = useEvaluation(submissionId);

  // Which page is "active" in the left strip
  const [currentPage, setCurrentPage] = useState(1);
  const [reEvaluatingId, setReEvaluatingId] = useState(null);
  const [mobileTab, setMobileTab] = useState('sheet');

  // Refs: left page elements (keyed by page number), right card elements (keyed by eval id)
  const pageElemRefs = useRef({});   // { [pageNum]: DOM element }
  const cardRefs = useRef({});       // { [evalId]: DOM element }
  const rightScrollRef = useRef(null);
  const observerRef = useRef(null);
  const isUserScrollingLeft = useRef(false); // prevent feedback loop

  // ── When right side scrolls: sync left strip ────────────────────────────
  const setupObserver = useCallback(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (isUserScrollingLeft.current) return;

        // Pick the topmost intersecting card
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length === 0) return;

        const evalId = visible[0].target.dataset.evalId;
        const ev = evaluations.find((e) => String(e.id) === evalId);
        if (!ev || !ev.page_numbers || ev.page_numbers.length === 0) return;

        const targetPage = ev.page_numbers[0];
        if (targetPage === currentPage) return; // no change needed

        setCurrentPage(targetPage);

        // Scroll the left strip to that page image
        const pageEl = pageElemRefs.current[targetPage];
        if (pageEl) {
          pageEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      },
      {
        root: rightScrollRef.current,
        // Card must enter the top ~40% of the right panel to trigger
        rootMargin: '-5% 0px -55% 0px',
        threshold: 0,
      }
    );

    Object.values(cardRefs.current).forEach((el) => {
      if (el) observerRef.current.observe(el);
    });
  }, [evaluations, currentPage]);

  useEffect(() => {
    if (evaluations.length > 0) {
      const t = setTimeout(setupObserver, 150);
      return () => clearTimeout(t);
    }
  }, [evaluations, setupObserver]);

  useEffect(() => {
    return () => { if (observerRef.current) observerRef.current.disconnect(); };
  }, []);

  // ── Manual jump when teacher clicks a page badge on a card ──────────────
  const handleJumpToPage = (pageNum) => {
    if (!pageNum || pageNum <= 0) return;
    setCurrentPage(pageNum);
    // Scroll left strip to that page
    const pageEl = pageElemRefs.current[pageNum];
    if (pageEl) {
      isUserScrollingLeft.current = true;
      pageEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => { isUserScrollingLeft.current = false; }, 900);
    }
    if (window.innerWidth < 768) setMobileTab('sheet');
  };

  const handleReEvaluate = async (evalId) => {
    setReEvaluatingId(evalId);
    await reEvaluate(evalId);
    setReEvaluatingId(null);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="py-20 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent mx-auto" />
          <p className="text-xs text-slate-400 mt-3">Loading student evaluation and page scans...</p>
        </div>
      </Layout>
    );
  }

  const pageImageUrls = submission?.page_image_urls || [];

  return (
    <Layout>
      {/* Breadcrumb Header */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-2 flex items-center justify-between text-xs">
        <Link
          to={`/exams/${examId}`}
          className="inline-flex items-center text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to Exam Console
        </Link>

        {/* Mobile toggle */}
        <div className="flex md:hidden bg-slate-200/80 rounded-lg p-0.5">
          <button
            onClick={() => setMobileTab('sheet')}
            className={`px-3 py-1 rounded-md text-xs font-semibold ${
              mobileTab === 'sheet' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            Answer Sheet
          </button>
          <button
            onClick={() => setMobileTab('evaluation')}
            className={`px-3 py-1 rounded-md text-xs font-semibold ${
              mobileTab === 'evaluation' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            Evaluation ({evaluations.length})
          </button>
        </div>
      </div>

      {/* Main Split-Screen */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden h-[calc(100vh-6.5rem)]">

        {/* ── LEFT: Vertically scrollable page strip ── */}
        <div
          className={`w-full md:w-1/2 h-full flex flex-col ${
            mobileTab === 'sheet' ? 'flex' : 'hidden md:flex'
          }`}
        >
          <ScrollablePageStrip
            images={pageImageUrls}
            currentPage={currentPage}
            activePageRef={pageElemRefs}
          />
        </div>

        {/* ── RIGHT: Evaluation cards ── */}
        <div
          className={`w-full md:w-1/2 h-full flex flex-col bg-slate-100 overflow-hidden ${
            mobileTab === 'evaluation' ? 'flex' : 'hidden md:flex'
          }`}
        >
          <ScoreSummary
            submission={submission}
            scoreSummary={scoreSummary}
            onFinalize={finalize}
            onUpdateHeader={updateHeader}
            isSaving={isSaving}
          />

          {/* Scrollable cards list — this drives left-side scroll */}
          <div ref={rightScrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {evaluations.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
                <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-medium">No question evaluations generated yet.</p>
              </div>
            ) : (
              evaluations.map((ev) => (
                <div
                  key={ev.id}
                  ref={(el) => { cardRefs.current[ev.id] = el; }}
                  data-eval-id={String(ev.id)}
                >
                  <EvaluationCard
                    evaluation={ev}
                    onOverride={overrideMarks}
                    onReset={resetToAiMarks}
                    onReEvaluate={handleReEvaluate}
                    onJumpToPage={handleJumpToPage}
                    isReEvaluating={reEvaluatingId === ev.id}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
