import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import PageViewer from '../components/PageViewer';
import EvaluationCard from '../components/EvaluationCard';
import ScoreSummary from '../components/ScoreSummary';
import { useEvaluation } from '../hooks/useEvaluation';
import { ArrowLeft, BookOpen, Layers, CheckCircle2 } from 'lucide-react';

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

  // Active page state for left-hand viewer
  const [currentPage, setCurrentPage] = useState(1);
  const [highlightedPage, setHighlightedPage] = useState(null);
  const [reEvaluatingId, setReEvaluatingId] = useState(null);

  // Mobile tab state
  const [mobileTab, setMobileTab] = useState('sheet'); // 'sheet' | 'evaluation'

  // When teacher clicks a question card or page badge, jump left viewer to that page!
  const handleJumpToPage = (pageNum) => {
    if (pageNum && pageNum > 0) {
      setCurrentPage(pageNum);
      setHighlightedPage(pageNum);
      // If on mobile, switch to sheet tab
      if (window.innerWidth < 768) {
        setMobileTab('sheet');
      }
    }
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
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent mx-auto"></div>
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

        {/* Mobile View Toggle Tabs */}
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

      {/* Main Split-Screen Container */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden h-[calc(100vh-6.5rem)]">
        {/* LEFT 50%: Student Answer Sheet Page Viewer */}
        <div
          className={`w-full md:w-1/2 h-full flex flex-col ${
            mobileTab === 'sheet' ? 'flex' : 'hidden md:flex'
          }`}
        >
          <PageViewer
            images={pageImageUrls}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            highlightedPage={highlightedPage}
          />
        </div>

        {/* RIGHT 50%: Evaluation & Teacher Override Panel */}
        <div
          className={`w-full md:w-1/2 h-full flex flex-col bg-slate-100 overflow-hidden ${
            mobileTab === 'evaluation' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {/* Sticky Top Bar: Live Score, Percentage, Grade, Status, Finalize */}
          <ScoreSummary
            submission={submission}
            scoreSummary={scoreSummary}
            onFinalize={finalize}
            onUpdateHeader={updateHeader}
            isSaving={isSaving}
          />

          {/* Scrollable Question Cards List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {evaluations.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
                <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-medium">No question evaluations generated yet.</p>
              </div>
            ) : (
              evaluations.map((ev) => (
                <EvaluationCard
                  key={ev.id}
                  evaluation={ev}
                  onOverride={overrideMarks}
                  onReset={resetToAiMarks}
                  onReEvaluate={handleReEvaluate}
                  onJumpToPage={handleJumpToPage}
                  isReEvaluating={reEvaluatingId === ev.id}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
