import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { studentService } from '../services/studentService';
import {
  Download,
  Printer,
  ArrowLeft,
  Award,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  FileSpreadsheet,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReportPage() {
  const { examId, submissionId } = useParams();
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadReport() {
      try {
        const data = await studentService.getReport(submissionId);
        setReportData(data);
      } catch (err) {
        toast.error('Failed to load student report');
      } finally {
        setIsLoading(false);
      }
    }
    loadReport();
  }, [submissionId]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="py-20 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent mx-auto"></div>
          <p className="text-xs text-slate-400 mt-3">Loading report...</p>
        </div>
      </Layout>
    );
  }

  if (!reportData) {
    return (
      <Layout>
        <div className="p-8 text-center text-slate-500">Report not found</div>
      </Layout>
    );
  }

  const { student, exam, performance, questions, strengths, weak_areas, overall_remark, improvement_suggestions } =
    reportData;

  const pdfUrl = studentService.getReportPdfUrl(submissionId);
  const csvUrl = studentService.getReportCsvUrl(submissionId);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8 w-full print:p-0 print:max-w-none">
        {/* Navigation and Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 print:hidden">
          <Link
            to={`/exams/${examId}/students/${submissionId}/review`}
            className="inline-flex items-center text-xs text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back to Review
          </Link>

          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg shadow-2xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              Print Report
            </button>

            <a
              href={csvUrl}
              download
              className="inline-flex items-center px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg shadow-2xs transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
              Download CSV
            </a>

            <a
              href={pdfUrl}
              download
              className="inline-flex items-center px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download PDF Report
            </a>
          </div>
        </div>

        {/* Printable Official Report Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 print:border-none print:shadow-none print:p-0">
          {/* Header */}
          <div className="border-b border-slate-200 pb-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Official Academic Assessment Report
                </span>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
                  AI Examiner Performance Report
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automated Multi-Modal Evaluation with Teacher Verification
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400">Class Rank</span>
                <div className="text-2xl font-black text-indigo-700">#{performance.rank}</div>
              </div>
            </div>
          </div>

          {/* Student & Exam Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 rounded-xl p-4 border border-slate-100 mb-6 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Student Name</span>
              <span className="font-bold text-slate-900 mt-0.5 block">{student.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Roll / ID</span>
              <span className="font-bold text-slate-900 mt-0.5 block">{student.roll_number}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Class / Section</span>
              <span className="font-bold text-slate-900 mt-0.5 block">{student.class_name}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Exam Title</span>
              <span className="font-bold text-slate-900 mt-0.5 block">{exam.title}</span>
            </div>
          </div>

          {/* Big Score Summary Banner */}
          <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-xl p-6 mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs text-indigo-200 uppercase font-semibold tracking-wider">
                Total Score Awarded
              </p>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-4xl font-extrabold">{performance.total_marks}</span>
                <span className="text-lg text-indigo-300">/ {performance.max_marks}</span>
                <span className="text-lg font-bold text-emerald-400 ml-2">
                  ({performance.percentage}%)
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-xs text-indigo-200 font-medium">Letter Grade</p>
                <p className="text-2xl font-black text-white">{performance.grade}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
                <Award className="w-7 h-7" />
              </div>
            </div>
          </div>

          {/* Question-Wise Evaluation Table */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Question-Wise Detailed Breakdown
            </h3>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-2.5 px-3 w-12">Q#</th>
                    <th className="py-2.5 px-3">Question</th>
                    <th className="py-2.5 px-3 w-16 text-center">Max</th>
                    <th className="py-2.5 px-3 w-16 text-center">AI Marks</th>
                    <th className="py-2.5 px-3 w-24 text-center">Final Marks</th>
                    <th className="py-2.5 px-3">Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {questions.map((q, idx) => (
                    <tr
                      key={idx}
                      className={q.is_overridden ? 'bg-amber-50/60 font-medium' : 'hover:bg-slate-50/50'}
                    >
                      <td className="py-2.5 px-3 font-bold text-slate-900">{q.question_no}</td>
                      <td className="py-2.5 px-3 text-slate-700 max-w-xs">{q.question_text}</td>
                      <td className="py-2.5 px-3 text-center text-slate-500">{q.max_marks}</td>
                      <td className="py-2.5 px-3 text-center text-slate-500">{q.ai_marks}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-900">
                        {q.final_marks}
                        {q.is_overridden && (
                          <span className="block text-[10px] text-amber-700 font-normal">
                            (Adjusted)
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 leading-normal">{q.feedback}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Overall Remark */}
          <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
              Teacher & AI Evaluation Remark
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed">{overall_remark}</p>
          </div>

          {/* Strengths & Weak Areas Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Strengths */}
            {strengths && strengths.length > 0 && (
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/70">
                <div className="flex items-center text-xs font-bold text-emerald-900 mb-2">
                  <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
                  Key Strengths
                </div>
                <ul className="list-disc list-inside space-y-1 text-xs text-emerald-950">
                  {strengths.map((st, i) => (
                    <li key={i}>{st}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Weak Areas */}
            {weak_areas && weak_areas.length > 0 && (
              <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200/70">
                <div className="flex items-center text-xs font-bold text-rose-900 mb-2">
                  <AlertTriangle className="w-4 h-4 mr-1.5 text-rose-600" />
                  Areas for Improvement
                </div>
                <ul className="list-disc list-inside space-y-1 text-xs text-rose-950">
                  {weak_areas.map((wa, i) => (
                    <li key={i}>{wa}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Improvement Suggestions */}
          {improvement_suggestions && improvement_suggestions.length > 0 && (
            <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200/70">
              <div className="flex items-center text-xs font-bold text-indigo-900 mb-2">
                <Lightbulb className="w-4 h-4 mr-1.5 text-indigo-600" />
                Actionable Recommendations for the Student
              </div>
              <ul className="list-disc list-inside space-y-1 text-xs text-indigo-950">
                {improvement_suggestions.map((sugg, i) => (
                  <li key={i}>{sugg}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
            <span>Generated by AI Examiner Assessment Platform</span>
            <span>Verified and Approved by Teacher</span>
          </div>
        </div>
      </div>
    </Layout>
  );
}
