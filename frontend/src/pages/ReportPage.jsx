import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { studentService } from '../services/studentService';
import {
  Download,
  ArrowLeft,
  Award,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  GraduationCap,
  Calendar,
  Sparkles,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReportPage() {
  const { examId, submissionId } = useParams();
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

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

  const handleDownloadPdf = async () => {
    try {
      setIsDownloadingPdf(true);
      toast.loading('Preparing official PDF report...', { id: 'pdf-dl' });
      await studentService.downloadReportPdf(submissionId, reportData?.student?.name);
      toast.success('Performance report downloaded as PDF!', { id: 'pdf-dl' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to download PDF report', { id: 'pdf-dl' });
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="py-20 text-center">
          <div className="animate-spin rounded-full h-9 w-9 border-4 border-[#323232] dark:border-[#DDD0C8] border-t-transparent mx-auto" />
          <p className="text-xs text-slate-400 mt-3 font-semibold">Generating student performance report...</p>
        </div>
      </Layout>
    );
  }

  if (!reportData) {
    return (
      <Layout>
        <div className="p-12 text-center text-slate-500 font-semibold">Performance report not found</div>
      </Layout>
    );
  }

  const { student, exam, performance, questions, strengths, weak_areas, overall_remark, improvement_suggestions } =
    reportData;

  const gradeBadgeColors = {
    'A+': 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white',
    A: 'bg-gradient-to-br from-emerald-500 to-green-600 text-white',
    B: 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white',
    C: 'bg-gradient-to-br from-amber-400 to-orange-500 text-white',
    D: 'bg-gradient-to-br from-orange-500 to-rose-500 text-white',
    F: 'bg-gradient-to-br from-rose-500 to-red-600 text-white',
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8 w-full print:p-0 print:max-w-none animate-fadeIn space-y-6">
        {/* Navigation and Action Bar (PDF Download Only) */}
        <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
          <Link
            to={`/exams/${examId}/students/${submissionId}/review`}
            className="inline-flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-[#323232] dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Back to Interactive Review
          </Link>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="inline-flex items-center px-4 py-2 bg-[#323232] hover:bg-[#1a1a1a] dark:bg-[#DDD0C8] dark:hover:bg-[#cfc0b6] text-white dark:text-[#323232] text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-60"
              title="Download AI Examiner Performance Report strictly in PDF format"
            >
              {isDownloadingPdf ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5 mr-1.5" />
              )}
              <span>{isDownloadingPdf ? 'Generating PDF...' : 'Download Report (PDF)'}</span>
            </button>
          </div>
        </div>

        {/* Printable Official Report Card */}
        <div className="bg-white dark:bg-[#252525] rounded-3xl border border-[#DDD0C8] dark:border-charcoal-700 shadow-xl p-8 sm:p-10 print:border-none print:shadow-none print:p-0 transition-colors">
          {/* Header */}
          <div className="border-b border-[#DDD0C8] dark:border-charcoal-700 pb-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#DDD0C8]/40 dark:bg-charcoal-800 border border-[#DDD0C8] dark:border-charcoal-600 text-[10px] font-black uppercase tracking-wider text-[#323232] dark:text-[#DDD0C8] mb-2">
                  <GraduationCap className="w-3 h-3 text-[#323232] dark:text-[#DDD0C8]" />
                  <span>Official Academic Assessment Report</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#323232] dark:text-white tracking-tight">
                  AI Examiner Performance Report
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  Automated Multi-Modal Evaluation with Human-in-the-Loop Teacher Verification
                </p>
              </div>

              <div className="text-left sm:text-right p-3 rounded-2xl bg-[#faf8f6] dark:bg-charcoal-800 border border-[#DDD0C8] dark:border-charcoal-600 shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Class Rank</span>
                <div className="text-2xl font-black text-[#323232] dark:text-[#DDD0C8]">#{performance.rank}</div>
              </div>
            </div>
          </div>

          {/* Student & Exam Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#faf8f6] dark:bg-charcoal-800/80 rounded-2xl p-5 border border-[#DDD0C8] dark:border-charcoal-600 mb-6 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Student Name</span>
              <span className="font-black text-sm text-[#323232] dark:text-white mt-1 block">{student.name}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Roll / ID</span>
              <span className="font-extrabold text-[#323232] dark:text-white mt-1 block">{student.roll_number}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Class / Section</span>
              <span className="font-extrabold text-[#323232] dark:text-white mt-1 block">{student.class_name}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Exam Subject</span>
              <span className="font-extrabold text-[#323232] dark:text-white mt-1 block">{exam.subject || exam.title}</span>
            </div>
          </div>

          {/* Big Score Summary Banner (Styled in Beige #DDD0C8 & Dark Grey #323232) */}
          <div className="bg-gradient-to-r from-[#323232] via-[#3d3d3d] to-[#484848] text-white rounded-2xl p-6 sm:p-8 mb-8 flex flex-wrap items-center justify-between gap-6 shadow-xl border border-[#DDD0C8]/40 relative overflow-hidden">
            {/* Subtle decorative glow */}
            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-[#DDD0C8]/10 blur-xl pointer-events-none" />

            <div className="relative z-10 space-y-1">
              <p className="text-[11px] text-[#DDD0C8] uppercase font-bold tracking-wider">
                Total Score Awarded
              </p>
              <div className="flex items-baseline space-x-2.5">
                <span className="text-4xl sm:text-5xl font-black tracking-tight text-white">{performance.total_marks}</span>
                <span className="text-xl text-[#DDD0C8] font-bold">/ {performance.max_marks}</span>
                <span className="text-lg font-black text-emerald-400 ml-2">
                  ({performance.percentage}%)
                </span>
              </div>
            </div>

            <div className="relative z-10 flex items-center space-x-5">
              <div className="text-right">
                <p className="text-[11px] text-[#DDD0C8] uppercase font-bold tracking-wider">Letter Grade</p>
                <p className="text-3xl font-black text-white">{performance.grade}</p>
              </div>
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl border-2 border-white/20 shadow-lg ${
                  gradeBadgeColors[performance.grade] || 'bg-[#DDD0C8] text-[#323232]'
                }`}
              >
                <Award className="w-8 h-8" />
              </div>
            </div>
          </div>

          {/* Question-Wise Evaluation Table */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#323232] dark:text-white">
                Question-Wise Detailed Evaluation Breakdown
              </h3>
              <span className="text-[11px] font-bold text-slate-400">
                {questions.length} Evaluated Questions
              </span>
            </div>

            <div className="overflow-x-auto border border-[#DDD0C8] dark:border-charcoal-700 rounded-2xl shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#faf8f6] dark:bg-charcoal-800 border-b border-[#DDD0C8] dark:border-charcoal-700 text-[#323232] dark:text-[#DDD0C8] font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3.5 w-14 text-center">Q#</th>
                    <th className="py-3 px-3.5">Question & Answer Description</th>
                    <th className="py-3 px-3 text-center w-16">Max</th>
                    <th className="py-3 px-3 text-center w-18">AI Marks</th>
                    <th className="py-3 px-3 text-center w-24">Final Marks</th>
                    <th className="py-3 px-3.5">Examiner Remarks & Rubric Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDD0C8]/40 dark:divide-charcoal-700">
                  {questions.map((q, idx) => (
                    <tr
                      key={idx}
                      className={
                        q.is_overridden
                          ? 'bg-amber-50/50 dark:bg-amber-950/20 font-medium'
                          : 'hover:bg-[#faf8f6]/60 dark:hover:bg-charcoal-800/40 transition-colors'
                      }
                    >
                      <td className="py-3 px-3.5 text-center font-black text-[#323232] dark:text-[#DDD0C8]">
                        <span className="inline-block px-2 py-0.5 rounded-lg bg-[#DDD0C8]/40 dark:bg-charcoal-700 border border-[#DDD0C8]/60 dark:border-charcoal-600">
                          Q{q.question_no}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-slate-700 dark:text-slate-300 max-w-xs font-medium">
                        {q.question_text}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-500 dark:text-slate-400">{q.max_marks}</td>
                      <td className="py-3 px-3 text-center font-bold text-slate-500 dark:text-slate-400">{q.ai_marks}</td>
                      <td className="py-3 px-3 text-center font-black text-[#323232] dark:text-white">
                        <span className="text-xs">{q.final_marks}</span>
                        {q.is_overridden && (
                          <span className="block text-[9px] text-amber-700 dark:text-amber-400 font-extrabold uppercase mt-0.5">
                            Teacher Adjusted
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3.5 text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                        {q.feedback}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Overall Remark */}
          <div className="mb-6 p-5 rounded-2xl bg-[#faf8f6] dark:bg-charcoal-800/60 border border-[#DDD0C8] dark:border-charcoal-700">
            <h4 className="text-xs font-black text-[#323232] dark:text-[#DDD0C8] uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Teacher & AI Evaluation Remark</span>
            </h4>
            <p className="text-xs text-[#323232] dark:text-slate-200 leading-relaxed font-medium">{overall_remark}</p>
          </div>

          {/* Strengths & Weak Areas Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Strengths */}
            {strengths && strengths.length > 0 && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-white dark:from-emerald-950/30 dark:to-charcoal-800 border border-emerald-200 dark:border-emerald-900/60 shadow-2xs">
                <div className="flex items-center text-xs font-black text-emerald-900 dark:text-emerald-300 mb-2.5">
                  <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600 dark:text-emerald-400" />
                  Key Strengths & Mastery
                </div>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-emerald-950 dark:text-emerald-200 font-medium">
                  {strengths.map((st, i) => (
                    <li key={i}>{st}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Weak Areas */}
            {weak_areas && weak_areas.length > 0 && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-50/80 to-white dark:from-rose-950/30 dark:to-charcoal-800 border border-rose-200 dark:border-rose-900/60 shadow-2xs">
                <div className="flex items-center text-xs font-black text-rose-900 dark:text-rose-300 mb-2.5">
                  <AlertTriangle className="w-4 h-4 mr-1.5 text-rose-600 dark:text-rose-400" />
                  Areas for Improvement
                </div>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-rose-950 dark:text-rose-200 font-medium">
                  {weak_areas.map((wa, i) => (
                    <li key={i}>{wa}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Actionable Recommendations */}
          {improvement_suggestions && improvement_suggestions.length > 0 && (
            <div className="p-5 rounded-2xl bg-[#DDD0C8]/25 dark:bg-charcoal-800/80 border border-[#DDD0C8] dark:border-charcoal-600 shadow-2xs">
              <div className="flex items-center text-xs font-black text-[#323232] dark:text-[#DDD0C8] mb-2.5">
                <Lightbulb className="w-4 h-4 mr-1.5 text-amber-500" />
                Actionable Study Recommendations for the Student
              </div>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-[#323232] dark:text-slate-200 font-medium">
                {improvement_suggestions.map((sugg, i) => (
                  <li key={i}>{sugg}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-[#DDD0C8] dark:border-charcoal-700 flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold text-slate-400 dark:text-slate-500">
            <span>Generated by AI Examiner Assessment Platform</span>
            <span>Verified and Approved by Teacher</span>
          </div>
        </div>
      </div>
    </Layout>
  );
}
