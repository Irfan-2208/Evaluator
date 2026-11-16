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
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Collapsible Step Card ─────────────────────────────────────────────────
function StepCard({ step, title, icon: Icon, badge, locked, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={`bg-white rounded-2xl border shadow-xs mb-5 overflow-hidden transition-all ${
        locked ? 'border-slate-200 opacity-80' : 'border-slate-200'
      }`}
    >
      {/* Card Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          {/* Step number circle */}
          <span
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
              badge === 'done'
                ? 'bg-emerald-100 text-emerald-700'
                : badge === 'saved'
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-slate-100 text-slate-500'
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
              badge === 'done' ? 'text-emerald-600' : locked ? 'text-slate-400' : 'text-indigo-600'
            }`}
          />
          <span
            className={`text-sm font-semibold ${
              locked ? 'text-slate-400' : 'text-slate-900'
            }`}
          >
            {title}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {badge === 'done' && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
              ✓ Confirmed
            </span>
          )}
          {badge === 'saved' && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
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
        <div className="px-6 pb-6 border-t border-slate-100">
          <div className="pt-5">{children}</div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function ExamDetailPage() {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answerKeys, setAnswerKeys] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

  // ── Handlers (unchanged logic) ───────────────────────────────────────────

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

  // Derive step completion states
  const questionsConfirmed = questions.length > 0;
  const keyConfirmed = answerKeys.length > 0;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {/* Navigation Breadcrumb */}
        <Link
          to="/dashboard"
          className="inline-flex items-center text-xs text-slate-500 hover:text-slate-800 mb-5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to Dashboard
        </Link>

        {/* Exam Title & Stats Banner */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 shadow-md mb-7 text-white">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-xs font-semibold px-2.5 py-0.5 bg-white/20 rounded-md border border-white/30">
                  {exam?.subject || 'Subject'}
                </span>
                <span className="text-xs text-indigo-200">Class: {exam?.class_name || 'N/A'}</span>
              </div>
              <h1 className="text-2xl font-bold">{exam?.title}</h1>
              <div className="flex items-center space-x-4 mt-2 text-xs text-indigo-200">
                <span>📋 {questions.length} Questions</span>
                <span>🔑 {answerKeys.length} Answer Keys</span>
                <span>👨‍🎓 {submissions.length} Students</span>
              </div>
            </div>

            <a
              href={studentService.getExamCsvUrl(examId)}
              download
              className="inline-flex items-center px-3 py-1.5 bg-white/15 hover:bg-white/25 border border-white/30 text-xs font-medium rounded-lg text-white transition-colors"
              title="Download class summary CSV"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export Class CSV
            </a>
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
          {/* Upload area — always visible so teacher can re-upload */}
          <div className="bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-400 p-6 text-center transition-colors mb-4">
            <FileText className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700 mb-0.5">
              {questionsConfirmed ? 'Re-upload Question Paper' : 'Upload Question Paper'}
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
              PDF or image — Gemini Vision will extract all questions and marks automatically.
            </p>
            <label className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer transition-colors">
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
            <div className="flex items-center space-x-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 mb-4">
              <Lock className="w-3.5 h-3.5 flex-shrink-0 text-amber-500" />
              <span>Tip: Confirm your questions first so the AI can map answers correctly. You can still upload a key below.</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Option A: Upload Key */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-slate-800 font-semibold text-sm mb-1">
                  <Upload className="w-4 h-4 text-indigo-500" />
                  <span>Upload Official Answer Key</span>
                </div>
                <p className="text-xs text-slate-500">
                  Have an official key or solution doc? Upload it — Gemini will extract and map answers.
                </p>
              </div>
              <label className="inline-flex items-center justify-center mt-4 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs cursor-pointer transition-colors">
                <KeyRound className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
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
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl border border-indigo-200 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-indigo-900 font-semibold text-sm mb-1">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Generate Ideal Answers with AI</span>
                </div>
                <p className="text-xs text-slate-600">
                  No answer key? Gemini will solve the question paper and generate model answers with marking rubrics.
                </p>
              </div>
              <button
                type="button"
                onClick={handleGenerateAK}
                className="inline-flex items-center justify-center mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
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
            <div className="flex items-center space-x-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 mb-4">
              <Lock className="w-3.5 h-3.5 flex-shrink-0 text-amber-500" />
              <span>Tip: Set up your answer key first so Gemini can grade each question accurately.</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Single sheet */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-sm text-slate-900 mb-1">Upload Single Answer Sheet</h3>
                <p className="text-xs text-slate-500">
                  Upload one student's handwritten PDF. Gemini Vision reads handwriting, detects name/roll, and grades every question.
                </p>
              </div>
              <label className="inline-flex items-center justify-center mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer transition-colors">
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
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-sm text-slate-900 mb-1">Bulk Upload Answer Sheets</h3>
                <p className="text-xs text-slate-500">
                  Upload multiple PDFs at once. All sheets are converted and graded in a background queue.
                </p>
              </div>
              <label className="inline-flex items-center justify-center mt-4 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs cursor-pointer transition-colors">
                <Layers className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
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
              title="AI Grading Student Answer Sheet (Vision + Rubrics)"
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
