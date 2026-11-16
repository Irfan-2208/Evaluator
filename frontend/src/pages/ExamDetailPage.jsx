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
  Layers,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ExamDetailPage() {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('questions'); // 'questions' | 'key' | 'students'
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

  // Handle Question Paper Upload
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

  // Handle Answer Key Upload
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

  // Handle Generate AI Answer Key
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

  // Handle Single Student Answer Sheet Upload
  const handleUploadStudentSheet = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      toast.loading('Uploading student answer sheet...', { id: 'sub-upload' });
      const res = await studentService.uploadSubmission(examId, file);
      toast.success('Uploaded! AI grading started...', { id: 'sub-upload' });
      setSubJobId(res.job_id);
      if (res.submission_id) {
        setLastUploadedSubId(res.submission_id);
      }
      loadData();
    } catch (err) {
      toast.error('Failed to upload student answer sheet', { id: 'sub-upload' });
    }
  };

  // Handle Bulk Upload
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

  // Questions mutations
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
      setActiveTab('key');
    } catch (err) {
      toast.error('Failed to confirm questions');
    }
  };

  // Answer Key mutations
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
      setActiveTab('students');
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

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {/* Navigation Breadcrumb */}
        <Link
          to="/dashboard"
          className="inline-flex items-center text-xs text-slate-500 hover:text-slate-800 mb-4 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to Dashboard
        </Link>

        {/* Exam Title & Stats Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">
                  {exam?.subject || 'Subject'}
                </span>
                <span className="text-xs text-slate-400">Class: {exam?.class_name || 'N/A'}</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 mt-1">{exam?.title}</h1>
            </div>

            {/* Actions: Export Exam CSV */}
            <div className="flex items-center space-x-3">
              <a
                href={studentService.getExamCsvUrl(examId)}
                download
                className="inline-flex items-center px-3 py-1.5 border border-slate-300 text-xs font-medium rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                title="Download class summary CSV"
              >
                <Download className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                Export Class CSV
              </a>
            </div>
          </div>
        </div>

        {/* Workflow Stepper Tabs */}
        <div className="flex border-b border-slate-200 mb-6 bg-white rounded-xl px-2 py-1.5 shadow-2xs">
          <button
            onClick={() => setActiveTab('questions')}
            className={`flex-1 flex items-center justify-center py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'questions'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4 mr-1.5" />
            1. Question Paper ({questions.length})
          </button>

          <button
            onClick={() => setActiveTab('key')}
            className={`flex-1 flex items-center justify-center py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'key'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <KeyRound className="w-4 h-4 mr-1.5" />
            2. Answer Key ({answerKeys.length})
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`flex-1 flex items-center justify-center py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'students'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4 mr-1.5" />
            3. Student Papers ({submissions.length})
          </button>
        </div>

        {/* TAB 1: QUESTION PAPER */}
        {activeTab === 'questions' && (
          <div className="space-y-6">
            {/* Upload Area */}
            <div className="bg-white rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-400 p-8 text-center transition-colors">
              <Upload className="w-10 h-10 text-indigo-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">Upload Question Paper</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Upload a PDF or image of the exam. Gemini Vision will read and extract all questions
                and marks automatically.
              </p>
              <label className="inline-flex items-center mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer transition-colors">
                <FileText className="w-4 h-4 mr-1.5" />
                Select Question Paper (PDF / Image)
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={handleUploadQP}
                  className="hidden"
                />
              </label>
            </div>

            {/* Background Job Progress for Question Paper */}
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

            {/* Editable Question Table */}
            <QuestionTable
              questions={questions}
              onUpdateQuestion={handleUpdateQuestion}
              onAddQuestion={handleAddQuestion}
              onDeleteQuestion={handleDeleteQuestion}
              onConfirmAll={handleConfirmQuestions}
            />
          </div>
        )}

        {/* TAB 2: ANSWER KEY */}
        {activeTab === 'key' && (
          <div className="space-y-6">
            {/* Options: Upload File or Generate with AI */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Option A: Upload Key */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex items-center space-x-2 text-indigo-600 font-bold text-sm mb-1">
                    <Upload className="w-4 h-4" />
                    <span>Upload Official Answer Key</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    If you have an official answer key or solution document, upload it and Gemini
                    will extract and map answers to questions.
                  </p>
                </div>

                <label className="inline-flex items-center justify-center mt-4 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs cursor-pointer transition-colors">
                  <KeyRound className="w-4 h-4 mr-1.5 text-indigo-600" />
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
              <div className="bg-gradient-to-br from-indigo-50/70 to-violet-50/70 rounded-xl border border-indigo-200/80 p-6 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex items-center space-x-2 text-indigo-900 font-bold text-sm mb-1">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Generate Ideal Answers with AI</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Don't have an answer key? Gemini will automatically solve the question paper and
                    generate model answers and strict marking rubrics for you to edit.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateAK}
                  className="inline-flex items-center justify-center mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                >
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  Generate AI Model Answers
                </button>
              </div>
            </div>

            {/* Answer Key Job Progress */}
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

            {/* Answer Key Editor */}
            <AnswerKeyEditor
              answerKeys={answerKeys}
              onUpdateKey={handleUpdateAnswerKey}
              onConfirmAll={handleConfirmAnswerKey}
            />
          </div>
        )}

        {/* TAB 3: STUDENT PAPERS */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            {/* Upload Area: Single & Bulk */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Single Student Sheet */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 mb-1">Upload Single Answer Sheet</h3>
                  <p className="text-xs text-slate-500">
                    Upload a student's handwritten or printed PDF answer sheet. Gemini Vision will
                    read handwriting, detect name/roll, and grade each question.
                  </p>
                </div>

                <label className="inline-flex items-center justify-center mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 mr-1.5" />
                  Select Student Sheet (PDF)
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleUploadStudentSheet}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Bulk Upload Sheets */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 mb-1">Bulk Upload Answer Sheets</h3>
                  <p className="text-xs text-slate-500">
                    Upload multiple student answer sheets at once. All papers are converted and
                    evaluated in a background queue.
                  </p>
                </div>

                <label className="inline-flex items-center justify-center mt-4 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs cursor-pointer transition-colors">
                  <Layers className="w-4 h-4 mr-1.5 text-indigo-600" />
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

            {/* Submission Job Progress */}
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

            {/* Student Submissions Table */}
            <StudentTable
              submissions={submissions}
              examId={examId}
              onDeleteSubmission={handleDeleteSubmission}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}
