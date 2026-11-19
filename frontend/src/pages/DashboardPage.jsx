import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { examService } from '../services/examService';
import { useAuth } from '../hooks/useAuth';
import {
  Plus,
  Search,
  BookOpen,
  Users,
  Award,
  ChevronRight,
  TrendingUp,
  FileCheck,
  Scale,
  Sparkles,
  ShieldAlert,
  BarChart3,
  PieChart,
  Clock,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Calendar,
  Layers,
  GraduationCap,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ── Circular Progress / Donut Gauge ──────────────────────────────────────────
function DonutGauge({ evaluated, total }) {
  const pct = total > 0 ? Math.round((evaluated / total) * 100) : 0;
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (circ * pct) / 100;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="96" height="96" viewBox="0 0 96 96" className="transform -rotate-90">
        <circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-[#DDD0C8]/40 dark:text-charcoal-700"
        />
        <circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          stroke="url(#donutGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: 'stroke-dasharray 1s ease-out' }}
        />
        <defs>
          <linearGradient id="donutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#323232" />
            <stop offset="100%" stopColor="#cbb89f" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-lg font-black text-[#323232] dark:text-[#ede4da]">{pct}%</span>
        <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Done</span>
      </div>
    </div>
  );
}

// ── Interactive SVG Class Performance Bar Chart ──────────────────────────────
function ClassPerformanceChart({ exams }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  // Take up to 7 most recent exams with data
  const chartData = useMemo(() => {
    return exams.slice(0, 8).map((ex) => {
      const avg = parseFloat(ex.class_average) || 0;
      const total = parseFloat(ex.total_marks) || 100;
      const pct = total > 0 ? Math.min(100, Math.round((avg / total) * 100)) : Math.round(avg);
      return {
        id: ex.id,
        title: ex.title,
        subject: ex.subject || 'General',
        class_name: ex.class_name || 'Class',
        avgScore: avg,
        totalMarks: total,
        percentage: pct,
        submissions: ex.total_submissions || 0,
      };
    });
  }, [exams]);

  if (chartData.length === 0) {
    return (
      <div className="h-56 flex flex-col items-center justify-center text-center p-6 text-slate-400">
        <BarChart3 className="w-10 h-10 mb-2 opacity-40 text-[#cbb89f]" />
        <p className="text-xs font-semibold">No exam evaluation metrics yet</p>
        <p className="text-[11px] mt-1 text-slate-400">Scores will graph automatically as students are graded</p>
      </div>
    );
  }

  const chartHeight = 160;
  const barWidth = Math.min(42, Math.max(22, 280 / chartData.length));

  return (
    <div className="relative pt-2">
      {/* Benchmark threshold indicator */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 mb-2 px-1">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#323232] dark:bg-[#DDD0C8]" />
          <span className="font-medium text-[#323232] dark:text-[#ede4da]">Class Average (%)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="inline-block w-4 h-0.5 border-t border-dashed border-amber-500" />
          <span className="text-amber-600 dark:text-amber-400 font-semibold text-[10px]">70% Target</span>
        </div>
      </div>

      <div className="h-44 flex items-end justify-between gap-2 border-b border-[#DDD0C8]/80 dark:border-charcoal-700 px-2 pb-1 relative">
        {/* 70% Guideline */}
        <div
          className="absolute inset-x-2 border-t border-dashed border-amber-400/60 dark:border-amber-500/40 pointer-events-none z-0"
          style={{ bottom: `${70}%` }}
        />

        {chartData.map((d, i) => {
          const isHovered = hoveredIdx === i;
          const barHeightPct = Math.max(8, d.percentage);
          const barColor =
            d.percentage >= 75
              ? 'from-[#323232] to-[#595959] dark:from-[#DDD0C8] dark:to-[#baa899]'
              : d.percentage >= 50
              ? 'from-[#b89e82] to-[#DDD0C8] dark:from-[#8f7a63] dark:to-[#cbb89f]'
              : 'from-rose-500 to-rose-400';

          return (
            <div
              key={d.id || i}
              className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Tooltip */}
              {isHovered && (
                <div className="absolute -top-16 z-30 bg-[#323232] text-white dark:bg-[#ede4da] dark:text-[#323232] text-[10px] rounded-lg p-2 shadow-xl border border-[#DDD0C8]/40 whitespace-nowrap animate-popIn pointer-events-none">
                  <p className="font-bold">{d.title}</p>
                  <p className="text-slate-300 dark:text-charcoal-700">
                    Avg: <span className="font-black text-amber-300 dark:text-amber-700">{d.avgScore}</span> / {d.totalMarks} ({d.percentage}%)
                  </p>
                  <p className="text-[9px] opacity-80">{d.submissions} Submissions · {d.class_name}</p>
                </div>
              )}

              {/* Bar Value Top Badge */}
              <span
                className={`text-[10px] font-bold mb-1 transition-all ${
                  isHovered
                    ? 'text-[#323232] dark:text-[#DDD0C8] scale-110'
                    : 'text-slate-400 dark:text-slate-500 opacity-80'
                }`}
              >
                {d.percentage}%
              </span>

              {/* Bar element */}
              <div
                className={`w-full max-w-[44px] rounded-t-xl bg-gradient-to-t ${barColor} transition-all duration-300 shadow-sm ${
                  isHovered ? 'brightness-110 ring-2 ring-[#DDD0C8] dark:ring-charcoal-500 scale-x-105' : ''
                }`}
                style={{
                  height: `${barHeightPct}%`,
                  transition: 'height 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            </div>
          );
        })}
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between items-center px-2 pt-2 gap-2">
        {chartData.map((d, i) => (
          <div key={d.id || i} className="flex-1 text-center truncate">
            <span
              className={`block text-[10px] font-bold truncate transition-colors ${
                hoveredIdx === i
                  ? 'text-[#323232] dark:text-[#DDD0C8]'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
              title={d.title}
            >
              {d.subject}
            </span>
            <span className="block text-[9px] text-slate-400 dark:text-slate-500 truncate">
              {d.class_name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Dashboard Component ──────────────────────────────────────────────────
export default function DashboardPage() {
  const { teacher } = useAuth();
  const [exams, setExams] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [selectedStrictness, setSelectedStrictness] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadExams() {
      try {
        const data = await examService.listExams();
        setExams(data || []);
      } catch (err) {
        toast.error('Failed to load exams');
      } finally {
        setIsLoading(false);
      }
    }
    loadExams();
  }, []);

  // Aggregated Metrics
  const totalExams = exams.length;
  const totalSubmissions = exams.reduce((acc, e) => acc + (e.total_submissions || 0), 0);
  const totalEvaluated = exams.reduce((acc, e) => acc + (e.evaluated_count || 0), 0);
  const pendingEvaluation = Math.max(0, totalSubmissions - totalEvaluated);

  const avgClassPercentage = useMemo(() => {
    const valid = exams.filter((e) => e.class_average && e.total_marks);
    if (valid.length === 0) return 0;
    const totalP = valid.reduce((acc, e) => {
      const avg = parseFloat(e.class_average) || 0;
      const tm = parseFloat(e.total_marks) || 100;
      return acc + (avg / tm) * 100;
    }, 0);
    return Math.round(totalP / valid.length);
  }, [exams]);

  // Unique Subjects for filter tabs
  const subjects = useMemo(() => {
    const set = new Set();
    exams.forEach((e) => {
      if (e.subject) set.add(e.subject.trim());
    });
    return Array.from(set);
  }, [exams]);

  // Strictness Counts
  const strictnessCounts = useMemo(() => {
    const counts = { lenient: 0, moderate: 0, strict: 0 };
    exams.forEach((e) => {
      const s = (e.grading_strictness || 'moderate').toLowerCase();
      if (counts[s] !== undefined) counts[s]++;
      else counts.moderate++;
    });
    return counts;
  }, [exams]);

  // Filtered & Sorted exams
  const filteredExams = useMemo(() => {
    return exams
      .filter((e) => {
        const q = search.toLowerCase();
        const matchesSearch =
          (e.title || '').toLowerCase().includes(q) ||
          (e.subject || '').toLowerCase().includes(q) ||
          (e.class_name || '').toLowerCase().includes(q);

        const matchesSubject =
          selectedSubject === 'ALL' ||
          (e.subject || '').toLowerCase() === selectedSubject.toLowerCase();

        const matchesStrictness =
          selectedStrictness === 'ALL' ||
          (e.grading_strictness || 'moderate').toLowerCase() === selectedStrictness.toLowerCase();

        return matchesSearch && matchesSubject && matchesStrictness;
      })
      .sort((a, b) => {
        if (sortBy === 'submissions') {
          return (b.total_submissions || 0) - (a.total_submissions || 0);
        }
        if (sortBy === 'score') {
          return (parseFloat(b.class_average) || 0) - (parseFloat(a.class_average) || 0);
        }
        // Default newest
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      });
  }, [exams, search, selectedSubject, selectedStrictness, sortBy]);

  const getStrictnessBadge = (strictness) => {
    switch ((strictness || 'moderate').toLowerCase()) {
      case 'lenient':
        return {
          label: 'Lenient',
          icon: Sparkles,
          color:
            'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        };
      case 'strict':
        return {
          label: 'Strict',
          icon: ShieldAlert,
          color:
            'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        };
      default:
        return {
          label: 'Moderate',
          icon: Scale,
          color:
            'bg-[#DDD0C8]/60 dark:bg-charcoal-700 text-[#323232] dark:text-[#DDD0C8] border-[#DDD0C8] dark:border-charcoal-600',
        };
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-fadeIn space-y-8">

        {/* ── HERO BANNER: Warm Beige & Dark Grey ── */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#323232] via-[#3d3d3d] to-[#474747] text-white p-6 sm:p-8 shadow-xl border border-[#DDD0C8]/30">
          {/* Subtle background decorative shapes */}
          <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-[#DDD0C8]/10 blur-2xl pointer-events-none" />
          <div className="absolute right-32 -bottom-16 w-48 h-48 rounded-full bg-[#cbb89f]/10 blur-xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#DDD0C8]/20 border border-[#DDD0C8]/30 backdrop-blur-md text-[11px] font-semibold text-[#DDD0C8]">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Instructor Workspace</span>
                <span>•</span>
                <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Welcome back, {teacher?.full_name || 'Professor'}!
              </h1>
              <p className="text-xs sm:text-sm text-[#DDD0C8] max-w-xl leading-relaxed">
                You have <span className="font-bold text-white underline decoration-[#cbb89f] underline-offset-4">{totalExams} active exams</span> with{' '}
                <span className="font-bold text-white">{totalSubmissions} submissions</span>. Automated grading is running with full teacher verification.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-3 shrink-0">
              <Link
                to="/exams/new"
                className="inline-flex items-center px-4 py-2.5 bg-[#DDD0C8] hover:bg-[#cbb89f] text-[#323232] text-xs font-bold rounded-xl shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Create New Exam
              </Link>
            </div>
          </div>
        </div>

        {/* ── 4 KPI METRIC CARDS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Active Exams */}
          <div className="bg-white dark:bg-[#252525] rounded-2xl p-5 border border-[#DDD0C8] dark:border-charcoal-700 shadow-xs hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 dark:text-[#cbb89f] uppercase tracking-wider">
                Active Exams
              </span>
              <div className="w-10 h-10 rounded-xl bg-[#DDD0C8]/50 dark:bg-charcoal-800 flex items-center justify-center text-[#323232] dark:text-[#DDD0C8] border border-[#DDD0C8]/60 dark:border-charcoal-600">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <h3 className="text-3xl font-extrabold text-[#323232] dark:text-white">{totalExams}</h3>
              <span className="text-[11px] font-semibold text-slate-400">total tests</span>
            </div>
            <div className="mt-3 pt-3 border-t border-[#DDD0C8]/40 dark:border-charcoal-700 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>{subjects.length} Subjects</span>
              <span className="text-[#323232] dark:text-[#DDD0C8] font-bold">Ready</span>
            </div>
          </div>

          {/* Total Submissions */}
          <div className="bg-white dark:bg-[#252525] rounded-2xl p-5 border border-[#DDD0C8] dark:border-charcoal-700 shadow-xs hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 dark:text-[#cbb89f] uppercase tracking-wider">
                Total Submissions
              </span>
              <div className="w-10 h-10 rounded-xl bg-[#DDD0C8]/50 dark:bg-charcoal-800 flex items-center justify-center text-[#323232] dark:text-[#DDD0C8] border border-[#DDD0C8]/60 dark:border-charcoal-600">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <h3 className="text-3xl font-extrabold text-[#323232] dark:text-white">{totalSubmissions}</h3>
              <span className="text-[11px] font-semibold text-slate-400">students</span>
            </div>
            <div className="mt-3 pt-3 border-t border-[#DDD0C8]/40 dark:border-charcoal-700 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Pending Review</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">{pendingEvaluation} left</span>
            </div>
          </div>

          {/* Evaluated Papers */}
          <div className="bg-white dark:bg-[#252525] rounded-2xl p-5 border border-[#DDD0C8] dark:border-charcoal-700 shadow-xs hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 dark:text-[#cbb89f] uppercase tracking-wider">
                Graded & Reviewed
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <FileCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <h3 className="text-3xl font-extrabold text-[#323232] dark:text-white">{totalEvaluated}</h3>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                ({totalSubmissions > 0 ? Math.round((totalEvaluated / totalSubmissions) * 100) : 0}%)
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-[#DDD0C8]/40 dark:border-charcoal-700 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>AI Accuracy</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">~94% Conf.</span>
            </div>
          </div>

          {/* Average Performance */}
          <div className="bg-white dark:bg-[#252525] rounded-2xl p-5 border border-[#DDD0C8] dark:border-charcoal-700 shadow-xs hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 dark:text-[#cbb89f] uppercase tracking-wider">
                Class Average
              </span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                <Award className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <h3 className="text-3xl font-extrabold text-[#323232] dark:text-white">{avgClassPercentage}%</h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#DDD0C8]/60 dark:bg-charcoal-700 text-[#323232] dark:text-[#DDD0C8]">
                {avgClassPercentage >= 80 ? 'Grade A' : avgClassPercentage >= 65 ? 'Grade B' : 'Grade C'}
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-[#DDD0C8]/40 dark:border-charcoal-700 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Evaluated Cohorts</span>
              <span className="text-[#323232] dark:text-[#DDD0C8] font-bold">Passing</span>
            </div>
          </div>
        </div>

        {/* ── 2 VISUAL GRAPHS & ANALYTICS SECTION ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Graph 1: Class Performance Bar Chart (2 cols) */}
          <div className="lg:col-span-2 bg-white dark:bg-[#252525] rounded-3xl p-6 border border-[#DDD0C8] dark:border-charcoal-700 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#DDD0C8]/50 dark:bg-charcoal-800 flex items-center justify-center text-[#323232] dark:text-[#DDD0C8]">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#323232] dark:text-white">Exam Performance Comparison</h3>
                  <p className="text-[11px] text-slate-400">Student average percentage per exam & class</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#f4efe9] dark:bg-charcoal-800 text-[#323232] dark:text-[#DDD0C8] border border-[#DDD0C8]/60 dark:border-charcoal-600">
                Interactive Graph
              </span>
            </div>

            <ClassPerformanceChart exams={exams} />
          </div>

          {/* Graph 2: Evaluation Progress & Strictness Policy (1 col) */}
          <div className="bg-white dark:bg-[#252525] rounded-3xl p-6 border border-[#DDD0C8] dark:border-charcoal-700 shadow-xs flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center space-x-2.5 mb-2">
                <div className="w-8 h-8 rounded-xl bg-[#DDD0C8]/50 dark:bg-charcoal-800 flex items-center justify-center text-[#323232] dark:text-[#DDD0C8]">
                  <PieChart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#323232] dark:text-white">Grading Completion</h3>
                  <p className="text-[11px] text-slate-400">Evaluated vs Pending papers</p>
                </div>
              </div>

              {/* Gauge and metrics */}
              <div className="flex items-center justify-center py-2">
                <DonutGauge evaluated={totalEvaluated} total={totalSubmissions} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs mt-2">
                <div className="p-2.5 rounded-xl bg-[#f7f4f0] dark:bg-charcoal-800 border border-[#DDD0C8]/60 dark:border-charcoal-600">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Evaluated</p>
                  <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">{totalEvaluated}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-[#f7f4f0] dark:bg-charcoal-800 border border-[#DDD0C8]/60 dark:border-charcoal-600">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Pending</p>
                  <p className="text-sm font-extrabold text-amber-600 dark:text-amber-400">{pendingEvaluation}</p>
                </div>
              </div>
            </div>

            {/* Strictness Breakdown */}
            <div className="pt-3 border-t border-[#DDD0C8]/60 dark:border-charcoal-700 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Grading Strictness Tiers
              </span>
              <div className="flex items-center space-x-2">
                <div className="flex-1 p-2 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/40 text-center">
                  <span className="block text-[10px] font-bold text-emerald-700 dark:text-emerald-300">Lenient</span>
                  <span className="text-xs font-black text-emerald-800 dark:text-emerald-200">{strictnessCounts.lenient}</span>
                </div>
                <div className="flex-1 p-2 rounded-xl bg-[#DDD0C8]/40 dark:bg-charcoal-800 border border-[#DDD0C8] dark:border-charcoal-600 text-center">
                  <span className="block text-[10px] font-bold text-[#323232] dark:text-[#DDD0C8]">Moderate</span>
                  <span className="text-xs font-black text-[#323232] dark:text-[#ede4da]">{strictnessCounts.moderate}</span>
                </div>
                <div className="flex-1 p-2 rounded-xl bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/40 text-center">
                  <span className="block text-[10px] font-bold text-rose-700 dark:text-rose-300">Strict</span>
                  <span className="text-xs font-black text-rose-800 dark:text-rose-200">{strictnessCounts.strict}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── EXAMS LIST HEADER & CONTROLS ── */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#323232] dark:text-white">Your Examination Catalog</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Click any exam to open submissions, review evaluations, or add papers</p>
            </div>

            {/* Search and Sort controls */}
            <div className="flex items-center space-x-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search exam, subject, class..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="text-xs pl-9 pr-3 py-2 border border-[#DDD0C8] dark:border-charcoal-600 rounded-xl w-52 sm:w-64 bg-white dark:bg-[#252525] text-[#323232] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#323232]/20 dark:focus:ring-[#DDD0C8]/20 transition-colors shadow-2xs"
                />
              </div>

              {/* Sort selector */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs py-2 px-3 border border-[#DDD0C8] dark:border-charcoal-600 rounded-xl bg-white dark:bg-[#252525] text-[#323232] dark:text-[#DDD0C8] font-semibold focus:outline-none focus:ring-2 focus:ring-[#323232]/20 shadow-2xs"
              >
                <option value="newest">Recent Exams</option>
                <option value="submissions">Most Students</option>
                <option value="score">Highest Average</option>
              </select>
            </div>
          </div>

          {/* Subject Filter Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 custom-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedSubject('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedSubject === 'ALL'
                  ? 'bg-[#323232] text-white dark:bg-[#DDD0C8] dark:text-[#323232] shadow-xs'
                  : 'bg-white dark:bg-[#252525] text-slate-600 dark:text-slate-300 border border-[#DDD0C8] dark:border-charcoal-600 hover:bg-[#DDD0C8]/30'
              }`}
            >
              All Subjects ({exams.length})
            </button>
            {subjects.map((sub) => {
              const count = exams.filter((e) => e.subject === sub).length;
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    selectedSubject === sub
                      ? 'bg-[#323232] text-white dark:bg-[#DDD0C8] dark:text-[#323232] shadow-xs'
                      : 'bg-white dark:bg-[#252525] text-slate-600 dark:text-slate-300 border border-[#DDD0C8] dark:border-charcoal-600 hover:bg-[#DDD0C8]/30'
                  }`}
                >
                  {sub} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* ── EXAMS GRID ── */}
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-9 w-9 border-4 border-[#323232] dark:border-[#DDD0C8] border-t-transparent mx-auto" />
            <p className="text-xs text-slate-400 mt-3 font-semibold">Loading your examination suite...</p>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="bg-white dark:bg-[#252525] rounded-3xl border border-[#DDD0C8] dark:border-charcoal-700 p-12 text-center shadow-xs">
            <BookOpen className="w-12 h-12 text-[#DDD0C8] dark:text-charcoal-500 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#323232] dark:text-white">No exams match your filters</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {search || selectedSubject !== 'ALL'
                ? 'Try resetting your search query or selecting All Subjects.'
                : 'Get started by creating your first exam to begin automated AI evaluation.'}
            </p>
            {(!search && selectedSubject === 'ALL') && (
              <Link
                to="/exams/new"
                className="inline-flex items-center mt-5 px-5 py-2.5 bg-[#323232] hover:bg-[#1f1f1f] dark:bg-[#DDD0C8] dark:hover:bg-[#cbb89f] text-white dark:text-[#323232] text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Create Exam
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExams.map((exam) => {
              const sBadge = getStrictnessBadge(exam.grading_strictness);
              const SIcon = sBadge.icon;
              const subCount = exam.total_submissions || 0;
              const evalCount = exam.evaluated_count || 0;
              const pctDone = subCount > 0 ? Math.round((evalCount / subCount) * 100) : 0;

              return (
                <Link
                  key={exam.id}
                  to={`/exams/${exam.id}`}
                  className="bg-white dark:bg-[#252525] rounded-2xl border border-[#DDD0C8] dark:border-charcoal-700 p-5 hover:border-[#323232] dark:hover:border-[#DDD0C8] hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
                >
                  <div>
                    {/* Top Tag Row */}
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[11px] font-bold text-[#323232] dark:text-[#DDD0C8] bg-[#DDD0C8]/50 dark:bg-charcoal-800 border border-[#DDD0C8] dark:border-charcoal-600 px-2.5 py-0.5 rounded-lg shadow-2xs">
                          {exam.subject || 'General'}
                        </span>
                        <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-lg border ${sBadge.color}`}>
                          <SIcon className="w-3 h-3 mr-1" />
                          {sBadge.label}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        Class: {exam.class_name || 'N/A'}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-extrabold text-sm text-[#323232] dark:text-white group-hover:text-[#b89e82] dark:group-hover:text-[#DDD0C8] transition-colors line-clamp-2 leading-snug">
                      {exam.title}
                    </h3>

                    {/* Evaluation Progress Bar */}
                    <div className="mt-3.5 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                        <span>Progress: {evalCount} of {subCount} evaluated</span>
                        <span className="font-bold text-[#323232] dark:text-[#DDD0C8]">{pctDone}%</span>
                      </div>
                      <div className="w-full bg-[#f4efe9] dark:bg-charcoal-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-[#323232] to-[#b89e82] dark:from-[#cbb89f] dark:to-[#DDD0C8] h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${pctDone}%` }}
                        />
                      </div>
                    </div>

                    {/* Quick 3 Metrics */}
                    <div className="mt-4 pt-3 border-t border-[#DDD0C8]/50 dark:border-charcoal-700 grid grid-cols-3 gap-2 text-center">
                      <div className="p-1 rounded-lg bg-[#faf8f6] dark:bg-charcoal-800/60">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Marks</p>
                        <p className="text-xs font-black text-[#323232] dark:text-slate-200 mt-0.5">
                          {exam.total_marks || '—'}
                        </p>
                      </div>
                      <div className="p-1 rounded-lg bg-[#faf8f6] dark:bg-charcoal-800/60">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Students</p>
                        <p className="text-xs font-black text-[#323232] dark:text-slate-200 mt-0.5">
                          {subCount}
                        </p>
                      </div>
                      <div className="p-1 rounded-lg bg-[#faf8f6] dark:bg-charcoal-800/60">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Average</p>
                        <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                          {exam.class_average ? `${exam.class_average}` : '—'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Link */}
                  <div className="mt-4 pt-3 border-t border-[#DDD0C8]/50 dark:border-charcoal-700 flex items-center justify-between text-xs font-bold text-[#323232] dark:text-[#DDD0C8] group-hover:underline">
                    <span>Open Exam Console</span>
                    <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
