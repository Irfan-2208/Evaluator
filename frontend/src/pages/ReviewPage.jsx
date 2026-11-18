import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import EvaluationCard from '../components/EvaluationCard';
import ScoreSummary from '../components/ScoreSummary';
import ThemeToggle from '../components/ThemeToggle';
import { useEvaluation } from '../hooks/useEvaluation';
import {
  ArrowLeft,
  BookOpen,
  FileQuestion,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';

// ─── Left panel: all page images stacked vertically with its OWN scrollbar ───────────
function ScrollablePageStrip({ images, activePageRef, currentPage, containerRef, onPageSelect }) {
  const [scale, setScale] = useState(1);
  const thumbRefs = useRef({});

  const formatUrl = (url) => {
    if (!url) return '';
    let clean = String(url).replace(/\\/g, '/');
    if (!clean.startsWith('http') && !clean.startsWith('/')) clean = '/' + clean;
    return clean;
  };

  // Keep active thumbnail scrolled into view in the bottom bar
  useEffect(() => {
    const activeThumb = thumbRefs.current[currentPage];
    if (activeThumb && activeThumb.scrollIntoView) {
      activeThumb.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
    }
  }, [currentPage]);

  if (!images || images.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500 transition-colors">
        <FileQuestion className="w-16 h-16 stroke-1 mb-2 text-indigo-500 animate-pulse" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Loading answer sheet...</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Images are rendering or synchronizing</p>
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 flex flex-col bg-slate-200/60 dark:bg-slate-950 text-slate-800 dark:text-slate-200 select-none overflow-hidden transition-colors duration-200">
      {/* Top Toolbar — Fixed & Non-scrolling */}
      <div className="h-11 bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between flex-shrink-0 z-10 shadow-2xs transition-colors duration-200">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Answer Sheet</span>
          <span className="text-[11px] font-bold px-2 py-0.5 bg-indigo-600 text-white rounded-md">
            Page {currentPage} of {images.length}
          </span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setScale((s) => Math.max(0.4, s - 0.2))}
            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-slate-600 dark:text-slate-400 min-w-[42px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale((s) => Math.min(3.0, s + 0.2))}
            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setScale(1)}
            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors ml-1"
            title="Reset Zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── SEPARATE LEFT SCROLL CONTAINER ── */}
      <div
        ref={containerRef}
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar px-5 py-5 space-y-6 bg-slate-200/50 dark:bg-slate-950 transition-colors duration-200"
      >
        {images.map((imgUrl, idx) => {
          const pageNum = idx + 1;
          const isActive = currentPage === pageNum;
          return (
            <div
              key={pageNum}
              data-page-number={pageNum}
              ref={(el) => {
                if (activePageRef && activePageRef.current) {
                  activePageRef.current[pageNum] = el;
                }
              }}
              className={`relative transition-all duration-300 rounded-xl p-1.5 ${
                isActive
                  ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-200 dark:ring-offset-slate-950 bg-indigo-50/50 dark:bg-slate-900/60 shadow-md'
                  : 'opacity-85 hover:opacity-100'
              }`}
              style={{ transformOrigin: 'top center', transform: `scale(${scale})` }}
            >
              {/* Page Number Label */}
              <div
                className={`inline-block mb-1 text-[11px] font-bold px-2.5 py-0.5 rounded shadow-xs ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                }`}
              >
                Page {pageNum}
              </div>

              <img
                src={formatUrl(imgUrl)}
                alt={`Answer Sheet Page ${pageNum}`}
                className="w-full h-auto rounded-lg border border-slate-300 dark:border-slate-800 shadow-md dark:shadow-2xl bg-white block"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          );
        })}
        {/* Bottom padding to allow comfortable scroll */}
        <div className="h-20" />
      </div>

      {/* ── BOTTOM THUMBNAIL QUICK-JUMP STRIP ── */}
      {images.length > 1 && (
        <div className="h-[76px] bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 px-3 py-1.5 flex items-center space-x-2.5 overflow-x-auto flex-shrink-0 z-10 custom-scrollbar transition-colors duration-200">
          {images.map((imgUrl, idx) => {
            const pageNum = idx + 1;
            const isSelected = currentPage === pageNum;
            return (
              <button
                key={pageNum}
                ref={(el) => {
                  thumbRefs.current[pageNum] = el;
                }}
                type="button"
                onClick={() => onPageSelect?.(pageNum)}
                className={`relative flex-shrink-0 h-14 w-11 rounded-lg border-2 overflow-hidden transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 ring-2 ring-indigo-500/50 scale-105 shadow-md -translate-y-0.5'
                    : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 opacity-70 hover:opacity-100'
                }`}
                title={`Jump to Page ${pageNum}`}
              >
                <img
                  src={formatUrl(imgUrl)}
                  alt={`Thumbnail ${pageNum}`}
                  className="w-full h-full object-cover object-top bg-white"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <span
                  className={`absolute bottom-0 inset-x-0 text-[10px] font-bold py-0.5 text-center transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800/85 text-slate-200'
                  }`}
                >
                  {pageNum}
                </span>
              </button>
            );
          })}
        </div>
      )}
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

  const [currentPage, setCurrentPage] = useState(1);
  const [reEvaluatingId, setReEvaluatingId] = useState(null);
  const [mobileTab, setMobileTab] = useState('sheet');

  // Dedicated refs for internal element positioning & independent scrolling
  const leftScrollContainerRef = useRef(null);
  const pageElemRefs = useRef({});
  const cardRefs = useRef({});
  const rightScrollRef = useRef(null);
  const observerRef = useRef(null);
  const leftObserverRef = useRef(null);
  const isScrollingInternal = useRef(false);

  // ── Sync Left Strip when Right Side Scrolls (WITHOUT scrolling the whole page) ──
  const setupObserver = useCallback(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (isScrollingInternal.current) return;

        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length === 0) return;

        const evalId = visible[0].target.dataset.evalId;
        const ev = evaluations.find((e) => String(e.id) === evalId);
        if (!ev || !ev.page_numbers || ev.page_numbers.length === 0) return;

        const targetPage = ev.page_numbers[0];
        if (targetPage === currentPage) return;

        setCurrentPage(targetPage);

        // Smoothly scroll ONLY the left container (NEVER the window!)
        const pageEl = pageElemRefs.current[targetPage];
        const container = leftScrollContainerRef.current;
        if (container && pageEl) {
          const targetOffset = pageEl.offsetTop - 16;
          container.scrollTo({ top: targetOffset, behavior: 'smooth' });
        }
      },
      {
        root: rightScrollRef.current,
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

  // ── Sync Current Page when Left Sheet is Scrolled ──
  useEffect(() => {
    if (leftObserverRef.current) leftObserverRef.current.disconnect();

    const container = leftScrollContainerRef.current;
    if (!container) return;

    leftObserverRef.current = new IntersectionObserver(
      (entries) => {
        if (isScrollingInternal.current) return;

        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => {
            const containerTop = container.getBoundingClientRect().top;
            return (
              Math.abs(a.boundingClientRect.top - containerTop) -
              Math.abs(b.boundingClientRect.top - containerTop)
            );
          });

        if (visible.length === 0) return;
        const pageNum = parseInt(visible[0].target.dataset.pageNumber, 10);
        if (pageNum && pageNum !== currentPage) {
          setCurrentPage(pageNum);
        }
      },
      {
        root: container,
        threshold: 0.15,
      }
    );

    Object.values(pageElemRefs.current).forEach((el) => {
      if (el) leftObserverRef.current.observe(el);
    });

    return () => {
      if (leftObserverRef.current) leftObserverRef.current.disconnect();
    };
  }, [submission?.page_image_urls, currentPage]);

  useEffect(() => {
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
      if (leftObserverRef.current) leftObserverRef.current.disconnect();
    };
  }, []);

  // ── Teacher clicks page badge on card: scroll ONLY the left container ──
  const handleJumpToPage = (pageNum) => {
    if (!pageNum || pageNum <= 0) return;
    setCurrentPage(pageNum);

    const pageEl = pageElemRefs.current[pageNum];
    const container = leftScrollContainerRef.current;
    if (container && pageEl) {
      isScrollingInternal.current = true;
      const targetOffset = pageEl.offsetTop - 16;
      container.scrollTo({ top: targetOffset, behavior: 'smooth' });
      setTimeout(() => {
        isScrollingInternal.current = false;
      }, 700);
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
      <Layout fullHeight={true}>
        <div className="h-full flex flex-col items-center justify-center py-20 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent mx-auto" />
          <p className="text-xs text-slate-400 mt-3">Loading student evaluation and page scans...</p>
        </div>
      </Layout>
    );
  }

  const pageImageUrls = submission?.page_image_urls || [];

  return (
    <Layout fullHeight={true}>
      {/* Breadcrumb Header Bar — Fixed & Non-scrolling */}
      <div className="bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs flex-shrink-0 z-10 transition-colors duration-200">
        <Link
          to={`/exams/${examId}`}
          className="inline-flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to Exam Console
        </Link>

        <div className="flex items-center space-x-3">
          {/* Dual Theme Switcher (Light & Dark options both visible) */}
          <ThemeToggle />

          {/* Mobile View Switcher */}
          <div className="flex md:hidden bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setMobileTab('sheet')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                mobileTab === 'sheet'
                  ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Answer Sheet
            </button>
            <button
              onClick={() => setMobileTab('evaluation')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                mobileTab === 'evaluation'
                  ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Evaluation ({evaluations.length})
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN SPLIT-SCREEN CONTAINER (h-full min-h-0 overflow-hidden) ── */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
        {/* ── LEFT 50%: Dedicated Scrollable Answer Sheet ── */}
        <div
          className={`w-full md:w-1/2 h-full min-h-0 flex flex-col overflow-hidden border-r border-slate-200 dark:border-slate-800 ${
            mobileTab === 'sheet' ? 'flex' : 'hidden md:flex'
          }`}
        >
          <ScrollablePageStrip
            images={pageImageUrls}
            currentPage={currentPage}
            activePageRef={pageElemRefs}
            containerRef={leftScrollContainerRef}
            onPageSelect={handleJumpToPage}
          />
        </div>

        {/* ── RIGHT 50%: Dedicated Scrollable Evaluation Cards ── */}
        <div
          className={`w-full md:w-1/2 h-full min-h-0 flex flex-col bg-slate-100 dark:bg-slate-950 overflow-hidden transition-colors duration-200 ${
            mobileTab === 'evaluation' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {/* Top Score Summary — Fixed Header for Right Panel */}
          <ScoreSummary
            submission={submission}
            scoreSummary={scoreSummary}
            onFinalize={finalize}
            onUpdateHeader={updateHeader}
            isSaving={isSaving}
          />

          {/* ── SEPARATE RIGHT SCROLL CONTAINER ── */}
          <div
            ref={rightScrollRef}
            className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-4"
          >
            {evaluations.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-400 dark:text-slate-500">
                <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-medium">No question evaluations generated yet.</p>
              </div>
            ) : (
              evaluations.map((ev) => (
                <div
                  key={ev.id}
                  ref={(el) => {
                    cardRefs.current[ev.id] = el;
                  }}
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
