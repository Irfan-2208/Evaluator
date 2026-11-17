import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import QuestionTable from '../components/QuestionTable';
import AnswerKeyEditor from '../components/AnswerKeyEditor';
import StudentTable from '../components/StudentTable';
import JobProgress from '../components/JobProgress';
import { examService } from '../services/examService';
import { studentService } from '../services/studentService';
import {
  Upload,
  Sparkles,
  FileText,
  KeyRound,
  Users,
  Download,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Layers,
  Lock,
  Scale,
  ShieldAlert,
  Sliders,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Collapsible Step Card ─────────────────────────────────────────────────
function StepCard({ step, title, icon: Icon, badge, locked, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-2xl border shadow-xs mb-5 overflow-hidden transition-all duration-300 ${
        locked
          ? 'border-slate-200 dark:border-slate-800 opacity-80'
          : 'border-slate-200 dark:border-slate-800'
      }`}
    >
      {/* Card Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          {/* Step number circle */}
          <span
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
              badge === 'done'
                ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300'
                : badge === 'saved'
                ? 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
            }`}
          >
            {badge === 'done' || badge === 'saved' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : locked ? (
              <Lock className="w-3.5 h-3.5" />
            ) : (
              step
            )}
          </span>
          <Icon
            className={`w-4 h-4 ${
              badge === 'done'
                ? 'text-emerald-600 dark:text-emerald-400'
                : locked
                ? 'text-slate-400'
                : 'text-indigo-600 dark:text-indigo-400'
            }`}
          />
          <span
            className={`text-sm font-semibold ${
              locked ? 'text-slate-400' : 'text-slate-900 dark:text-white'
            }`}
          >
            {title}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {badge === 'done' && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800">
              ✓ Confirmed
            </span>
          )}
          {badge === 'saved' && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
              ✓ Saved
            </span>
          )}
          {locked && (
            <span className="text-xs text-slate-400">Complete previous step first</span>
          )}
          {open ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>

      {/* Collapsible Body */}
      {open && (
        <div className="px-6 pb-6 border-t border-slate-100 dark:border-slate-800">
          <div className="pt-5">{children}</div>
        </div>
      )}
    </div>
  );
}

// ─── Main ExamDetailPage ───────────────────────────────────────────────────
export default function ExamDetailPage() {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answerKeys, setAnswerKeys] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStrictness, setIsUpdatingStrictness] = useState(false);

  // Active Job IDs for polling
  const [qpJobId, setQpJobId] = useState(null);
  const [akJobId, setAkJobId] = useState(null);
  const [subJobId, setSubJobId] = useState(null);
  const [lastUploadedSubId, setLastUploadedSubId] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [examData, qData, akData, subData] = await Promise.all([
        examService.getExam(examId),
        examService.listQuestions(examId),
        examService.listAnswerKeys(examId),
        studentService.listSubmissions(examId),
      ]);
      setExam(examData);
      setQuestions(qData);
      setAnswerKeys(akData);
      setSubmissions(subData);
    } catch (err) {
      toast.error('Failed to load exam details');
    } finally {
      setIsLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Strictness Selector Handler ──
  const handleStrictnessChange = async (newStrictness) => {
    if (!exam || exam.grading_strictness === newStrictness) return;
    try {
      setIsUpdatingStrictness(true);
      await examService.updateExam(examId, { grading_strictness: newStrictness });
      setExam((prev) => ({ ...prev, grading_strictness: newStrictness }));
      toast.success(`Evaluation strictness set to ${newStrictness.toUpperCase()}!`);
    } catch (err) {
      toast.error('Failed to update strictness level');
    } finally {
      setIsUpdatingStrictness(false);
    }
  };

  // ── Handlers ──
  const handleUploadQP = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      toast.loading('Uploading question paper...', { id: 'qp-upload' });
      const res = await examService.uploadQuestionPaper(examId, file);
      toast.success('Question paper uploaded! AI extracting questions...', { id: 'qp-upload' });
      setQpJobId(res.job_id);
    } catch (err) {
      toast.error('Failed to upload question paper', { id: 'qp-upload' });
    }
  };

  const handleUploadAK = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      toast.loading('Uploading answer key...', { id: 'ak-upload' });
      const res = await examService.uploadAnswerKey(examId, file);
      toast.success('Answer key uploaded! AI mapping solutions...', { id: 'ak-upload' });
      setAkJobId(res.job_id);
    } catch (err) {
      toast.error('Failed to upload answer key', { id: 'ak-upload' });
    }
  };

  const handleGenerateAK = async () => {
    try {
      toast.loading('Starting AI model answer generation...', { id: 'ak-gen' });
      const res = await examService.generateAnswerKey(examId);
      toast.success('Generating model answers with Gemini...', { id: 'ak-gen' });
      setAkJobId(res.job_id);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to generate answer key', { id: 'ak-gen' });
    }
  };

  const handleUploadStudentSheet = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      toast.loading('Uploading student answer sheet...', { id: 'sub-upload' });
      const res = await studentService.uploadSubmission(examId, file);
      toast.success('Uploaded! AI grading started...', { id: 'sub-upload' });
      setSubJobId(res.job_id);
      if (res.submission_id) setLastUploadedSubId(res.submission_id);
      loadData();
    } catch (err) {
      toast.error('Failed to upload student answer sheet', { id: 'sub-upload' });
    }
  };

  const handleBulkUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      toast.loading(`Uploading ${files.length} answer sheets...`, { id: 'bulk-upload' });
      const res = await studentService.bulkUploadSubmissions(examId, files);
      toast.success(res.message, { id: 'bulk-upload' });
      loadData();
    } catch (err) {
      toast.error('Bulk upload failed', { id: 'bulk-upload' });
    }
  };

  const handleUpdateQuestion = async (qId, updatedData) => {
    try {
      await examService.updateQuestion(examId, qId, updatedData);
      setQuestions((prev) => prev.map((q) => (q.id === qId ? updatedData : q)));
    } catch (err) {
      toast.error('Failed to update question');
    }
  };

  const handleAddQuestion = async () => {
    try {
      const newQ = await examService.createQuestion(examId, {
        question_no: `${questions.length + 1}`,
        question_text: 'New question',
        max_marks: 2.0,
        question_type: 'short',
        sub_parts: [],
      });
      setQuestions([...questions, newQ]);
      toast.success('Question added');
    } catch (err) {
      toast.error('Failed to add question');
    }
  };

  const handleDeleteQuestion = async (qId) => {
    try {
      await examService.deleteQuestion(examId, qId);
      setQuestions(questions.filter((q) => q.id !== qId));
      toast.success('Question deleted');
    } catch (err) {
      toast.error('Failed to delete question');
    }
  };

  const handleConfirmQuestions = async () => {
    try {
      await examService.confirmQuestions(examId);
      toast.success('Questions confirmed! Next: Setup Answer Key');
      loadData();
    } catch (err) {
      toast.error('Failed to confirm questions');
    }
  };

  const handleUpdateAnswerKey = async (akId, updatedData) => {
    try {
      await examService.updateAnswerKey(examId, akId, updatedData);
      setAnswerKeys((prev) => prev.map((ak) => (ak.id === akId ? updatedData : ak)));
    } catch (err) {
      toast.error('Failed to update answer key');
    }
  };

  const handleConfirmAnswerKey = async () => {
    try {
      await examService.confirmAnswerKey(examId);
      toast.success('Answer key confirmed! Ready to evaluate student sheets.');
      loadData();
    } catch (err) {
      toast.error('Failed to confirm answer key');
    }
  };

  const handleDeleteSubmission = async (subId) => {
    if (!window.confirm('Are you sure you want to delete this submission?')) return;
    try {
      await studentService.deleteSubmission(subId);
      setSubmissions(submissions.filter((s) => s.id !== subId));
      toast.success('Submission deleted');
    } catch (err) {
      toast.error('Failed to delete submission');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="py-20 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent mx-auto"></div>
          <p className="text-xs text-slate-400 mt-3">Loading exam workspace...</p>
        </div>
      </Layout>
    );
  }

  const questionsConfirmed = questions.length > 0;
  const keyConfirmed = answerKeys.length > 0;
  const currentStrictness = exam?.grading_strictness || 'moderate';

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {/* Navigation Breadcrumb */}
        <Link
          to="/dashboard"
          className="inline-flex items-center text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white mb-5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to Dashboard
        </Link>

        {/* Exam Title & Stats Banner */}
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 rounded-2xl p-6 shadow-md mb-6 text-white relative overflow-hidden">
          <div className="flex flex-wrap items-start justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-xs font-semibold px-2.5 py-0.5 bg-white/20 rounded-md border border-white/30 backdrop-blur-xs">
                  {exam?.subject || 'Subject'}
                </span>
                <span className="text-xs text-indigo-200">Class: {exam?.class_name || 'N/A'}</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">{exam?.title}</h1>
              <div className="flex items-center space-x-4 mt-2 text-xs text-indigo-200">
                <span>📋 {questions.length} Questions</span>
                <span>🔑 {answerKeys.length} Answer Keys</span>
                <span>👨‍🎓 {submissions.length} Students</span>
              </div>
            </div>

            <a
              href={studentService.getExamCsvUrl(examId)}
              download
              className="inline-flex items-center px-3 py-1.5 bg-white/15 hover:bg-white/25 border border-white/30 text-xs font-medium rounded-lg text-white transition-all active:scale-95"
              title="Download class summary CSV"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export Class CSV
            </a>
          </div>
        </div>

        {/* ── Strictness Level Control Card ── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs mb-6 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">AI Evaluation Strictness</h2>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Configure how strictly Gemini grades answers
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Lenient Option */}
            <button
              type="button"
              onClick={() => handleStrictnessChange('lenient')}
              disabled={isUpdatingStrictness}
              className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                currentStrictness === 'lenient'
                  ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 ring-2 ring-emerald-500/30'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-bold text-xs text-slate-900 dark:text-white">Lenient</span>
                {currentStrictness === 'lenient' && (
                  <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 rounded-full ml-auto">
                    Active
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                Generous partial credit, forgiving of minor phrasing or calculation slips.
              </p>
            </button>

            {/* Moderate Option */}
            <button
              type="button"
              onClick={() => handleStrictnessChange('moderate')}
              disabled={isUpdatingStrictness}
              className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                currentStrictness === 'moderate'
                  ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-500/30'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <Scale className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="font-bold text-xs text-slate-900 dark:text-white">Moderate (Standard)</span>
                {currentStrictness === 'moderate' && (
                  <span className="text-[10px] bg-indigo-600 text-white font-bold px-1.5 rounded-full ml-auto">
                    Active
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                Balanced grading following standard rubric and step credit.
              </p>
            </button>

            {/* Strict Option */}
            <button
              type="button"
              onClick={() => handleStrictnessChange('strict')}
              disabled={isUpdatingStrictness}
              className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                currentStrictness === 'strict'
                  ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 ring-2 ring-rose-500/30'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span className="font-bold text-xs text-slate-900 dark:text-white">Strict</span>
                {currentStrictness === 'strict' && (
                  <span className="text-[10px] bg-rose-600 text-white font-bold px-1.5 rounded-full ml-auto">
                    Active
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                High academic rigor. Full marks require complete steps and exact terminology.
              </p>
            </button>
          </div>
        </div>

        {/* ── STEP 1: Question Paper ─────────────────────────────────────── */}
        <StepCard
          step="1"
          title={`Question Paper ${questions.length > 0 ? `(${questions.length} questions)` : ''}`}
          icon={FileText}
          badge={questionsConfirmed ? 'done' : null}
          defaultOpen={true}
        >
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400 p-6 text-center transition-colors mb-4">
            <FileText className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-0.5">
              {questionsConfirmed ? 'Re-upload Question Paper' : 'Upload Question Paper'}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-400 max-w-sm mx-auto mb-4">
              PDF or image — Gemini Vision extracts all questions, parts, and marks automatically.
            </p>
            <label className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer transition-all active:scale-95">
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              Select Question Paper (PDF / Image)
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={handleUploadQP}
                className="hidden"
              />
            </label>
          </div>

          {qpJobId && (
            <JobProgress
              jobId={qpJobId}
              title="Extracting Questions with Gemini Vision"
              onComplete={() => {
                toast.success('Question extraction complete!');
                loadData();
              }}
            />
          )}

          <QuestionTable
            questions={questions}
            onUpdateQuestion={handleUpdateQuestion}
            onAddQuestion={handleAddQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            onConfirmAll={handleConfirmQuestions}
          />
        </StepCard>

        {/* ── STEP 2: Answer Key ─────────────────────────────────────────── */}
        <StepCard
          step="2"
          title={`Answer Key ${answerKeys.length > 0 ? `(${answerKeys.length} entries)` : ''}`}
          icon={KeyRound}
          badge={keyConfirmed ? 'saved' : null}
          locked={false}
          defaultOpen={questionsConfirmed}
        >
          {!questionsConfirmed && (
            <div className="flex items-center space-x-2 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-lg px-4 py-2.5 mb-4">
              <Lock className="w-3.5 h-3.5 flex-shrink-0 text-amber-500" />
              <span>Tip: Confirm your questions first so the AI can map solutions properly. You can still upload a key below.</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Option A: Upload Key */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-slate-800 dark:text-white font-semibold text-sm mb-1">
                  <Upload className="w-4 h-4 text-indigo-500" />
                  <span>Upload Official Answer Key</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Have an official key or solution doc? Upload it — Gemini extracts and maps answers.
                </p>
              </div>
              <label className="inline-flex items-center justify-center mt-4 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg shadow-2xs cursor-pointer transition-all active:scale-95">
                <KeyRound className="w-3.5 h-3.5 mr-1.5 text-indigo-600 dark:text-indigo-400" />
                Upload Key (PDF / Image)
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={handleUploadAK}
                  className="hidden"
                />
              </label>
            </div>

            {/* Option B: Generate with AI */}
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/40 rounded-xl border border-indigo-200 dark:border-indigo-900/60 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-indigo-900 dark:text-indigo-200 font-semibold text-sm mb-1">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Generate Ideal Answers with AI</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  No answer key? Gemini will solve the paper and generate model answers with step-by-step rubrics.
                </p>
              </div>
              <button
                type="button"
                onClick={handleGenerateAK}
                className="inline-flex items-center justify-center mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Generate AI Model Answers
              </button>
            </div>
          </div>

          {akJobId && (
            <JobProgress
              jobId={akJobId}
              title="Processing Answer Key with Gemini AI"
              onComplete={() => {
                toast.success('Answer key updated!');
                loadData();
              }}
            />
          )}

          <AnswerKeyEditor
            answerKeys={answerKeys}
            onUpdateKey={handleUpdateAnswerKey}
            onConfirmAll={handleConfirmAnswerKey}
          />
        </StepCard>

        {/* ── STEP 3: Student Answer Sheets ─────────────────────────────── */}
        <StepCard
          step="3"
          title={`Student Answer Sheets ${submissions.length > 0 ? `(${submissions.length} uploaded)` : ''}`}
          icon={Users}
          badge={null}
          locked={false}
          defaultOpen={keyConfirmed}
        >
          {!keyConfirmed && (
            <div className="flex items-center space-x-2 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-lg px-4 py-2.5 mb-4">
              <Lock className="w-3.5 h-3.5 flex-shrink-0 text-amber-500" />
              <span>Tip: Set up your answer key first so Gemini can grade each question accurately against your rubrics.</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Single sheet */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-1">
                  Upload Single Answer Sheet
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Upload one student's handwritten PDF. Gemini reads handwriting, detects name/roll, and grades every question.
                </p>
              </div>
              <label className="inline-flex items-center justify-center mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer transition-all active:scale-95">
                <Upload className="w-3.5 h-3.5 mr-1.5" />
                Select Student Sheet (PDF)
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleUploadStudentSheet}
                  className="hidden"
                />
              </label>
            </div>

            {/* Bulk upload */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-1">
                  Bulk Upload Answer Sheets
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Upload multiple PDFs at once. All sheets are converted and graded in a background queue.
                </p>
              </div>
              <label className="inline-flex items-center justify-center mt-4 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg shadow-2xs cursor-pointer transition-all active:scale-95">
                <Layers className="w-3.5 h-3.5 mr-1.5 text-indigo-600 dark:text-indigo-400" />
                Select Multiple PDFs
                <input
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={handleBulkUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {subJobId && (
            <JobProgress
              jobId={subJobId}
              title={`AI Grading Student Answer Sheet (${currentStrictness.toUpperCase()} Strictness)`}
              onComplete={() => {
                toast.success('Evaluation complete! Opening review console...');
                loadData();
                if (lastUploadedSubId) {
                  setTimeout(() => {
                    navigate(`/exams/${examId}/students/${lastUploadedSubId}/review`);
                  }, 500);
                }
              }}
            />
          )}

          <StudentTable
            submissions={submissions}
            examId={examId}
            onDeleteSubmission={handleDeleteSubmission}
          />
        </StepCard>
      </div>
    </Layout>
  );
}
