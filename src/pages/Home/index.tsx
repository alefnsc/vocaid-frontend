'use client'

import { lazy, Suspense, useEffect, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { DefaultLayout } from 'components/default-layout'
import { useAuthCheck } from 'hooks/use-auth-check'
import { useCandidateDashboard, DATE_RANGE_PRESETS } from 'hooks/use-candidate-dashboard'
import { useUser } from '@clerk/clerk-react'
import Loading from 'components/loading'
import PurpleButton from 'components/ui/purple-button'
import StatsCard from 'components/ui/stats-card'
import { Plus, Coins, ChevronRight, MessageSquare, TrendingUp, Clock, X, Download, FileText, Calendar, Star } from 'lucide-react'
import InterviewReady from 'components/interview-ready'
import Landing from 'pages/Landing'

// Lazy load components for better initial load performance
const CreditPackages = lazy(() => import('components/credit-packages'))

// ==========================================
// DASHBOARD COMPONENTS (for logged-in users)
// ==========================================

interface SimpleLineChartProps {
  data: { label: string; value: number }[]
  color?: string
  height?: number
  emptyTitle?: string
  emptyDesc?: string
}

const SimpleLineChart: React.FC<SimpleLineChartProps> = ({ data, color = '#9333ea', height = 200, emptyTitle = 'No Score Data', emptyDesc = 'Complete interviews to track your progress' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-8">
        <div className="w-10 h-0.5 bg-zinc-200 mb-4 rounded-full" />
        <p className="font-semibold text-zinc-900 mb-1">{emptyTitle}</p>
        <p className="text-sm text-zinc-500">{emptyDesc}</p>
      </div>
    )
  }

  const maxValue = Math.max(...data.map(d => d.value), 1)
  const minValue = Math.min(...data.map(d => d.value), 0)
  const range = maxValue - minValue || 1

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1 || 1)) * 100
    const y = 100 - ((d.value - minValue) / range) * 100
    return `${x},${y}`
  }).join(' ')

  return (
    <div className="w-full" style={{ height }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        {[0, 25, 50, 75, 100].map(y => (
          <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#e4e4e7" strokeWidth="0.5" />
        ))}
        <polyline fill="none" stroke={color} strokeWidth="2" points={points} vectorEffect="non-scaling-stroke" />
        <polygon fill={`${color}20`} points={`0,100 ${points} 100,100`} />
        {data.map((d, i) => {
          const x = (i / (data.length - 1 || 1)) * 100
          const y = 100 - ((d.value - minValue) / range) * 100
          return <circle key={i} cx={x} cy={y} r="2" fill={color} />
        })}
      </svg>
      <div className="flex justify-between mt-2 text-xs text-zinc-500">
        {data.slice(0, 6).map((d, i) => <span key={i}>{d.label}</span>)}
      </div>
    </div>
  )
}

// ==========================================
// FILTER BAR COMPONENT
// ==========================================

type DateRangePresetKey = 'last7days' | 'last30days' | 'last90days' | 'ytd' | 'custom' | 'all';

interface FilterBarProps {
  filterOptions: {
    roleTitles: string[];
    seniorities: string[];
    resumes: Array<{ id: string; title: string }>;
  } | null;
  activeFilters: {
    startDate?: string;
    endDate?: string;
    roleTitle?: string;
    seniority?: string;
    resumeId?: string;
  };
  onDateRangeChange: (preset: DateRangePresetKey | { startDate: string; endDate: string }) => void;
  onRoleChange: (role: string | null) => void;
  onSeniorityChange: (seniority: string | null) => void;
  onResumeChange: (resumeId: string | null) => void;
  onClearFilters: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  filterOptions,
  activeFilters,
  onDateRangeChange,
  onRoleChange,
  onSeniorityChange,
  onResumeChange,
  onClearFilters,
}) => {
  const { t } = useTranslation();
  const hasActiveFilters = !!(activeFilters.startDate || activeFilters.roleTitle || activeFilters.seniority || activeFilters.resumeId);

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-4 mb-6">
      <div className="flex flex-wrap items-center gap-3">
        {/* Date Range */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-zinc-400" />
          <select
            className="text-sm border border-zinc-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            value={activeFilters.startDate ? 'custom' : 'all'}
            onChange={(e) => onDateRangeChange(e.target.value as DateRangePresetKey)}
          >
            {DATE_RANGE_PRESETS.map((preset) => (
              <option key={preset.key} value={preset.key}>
                {preset.label}
              </option>
            ))}
          </select>
        </div>

        {/* Role Filter */}
        {filterOptions && filterOptions.roleTitles.length > 0 && (
          <select
            className="text-sm border border-zinc-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            value={activeFilters.roleTitle || ''}
            onChange={(e) => onRoleChange(e.target.value || null)}
          >
            <option value="">{t('dashboard.filters.allRoles', 'All Roles')}</option>
            {filterOptions.roleTitles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        )}

        {/* Seniority Filter */}
        {filterOptions && filterOptions.seniorities.length > 0 && (
          <select
            className="text-sm border border-zinc-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            value={activeFilters.seniority || ''}
            onChange={(e) => onSeniorityChange(e.target.value || null)}
          >
            <option value="">{t('dashboard.filters.allSeniorities', 'All Seniorities')}</option>
            {filterOptions.seniorities.map((seniority) => (
              <option key={seniority} value={seniority}>
                {seniority}
              </option>
            ))}
          </select>
        )}

        {/* Resume Filter */}
        {filterOptions && filterOptions.resumes.length > 0 && (
          <select
            className="text-sm border border-zinc-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            value={activeFilters.resumeId || ''}
            onChange={(e) => onResumeChange(e.target.value || null)}
          >
            <option value="">{t('dashboard.filters.allResumes', 'All Resumes')}</option>
            {filterOptions.resumes.map((resume) => (
              <option key={resume.id} value={resume.id}>
                {resume.title}
              </option>
            ))}
          </select>
        )}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 px-3 py-2"
          >
            <X className="w-4 h-4" />
            {t('dashboard.filters.clear', 'Clear')}
          </button>
        )}
      </div>
    </div>
  );
};

// ==========================================
// RECENT INTERVIEWS TABLE
// ==========================================

interface RecentInterviewsTableProps {
  interviews: Array<{
    id: string;
    date: string;
    roleTitle: string;
    companyName: string;
    seniority: string | null;
    resumeTitle: string | null;
    durationMinutes: number | null;
    score: number | null;
    status: string;
  }>;
  isLoading: boolean;
}

const RecentInterviewsTable: React.FC<RecentInterviewsTableProps> = ({ interviews, isLoading }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'bg-zinc-100 text-zinc-600';
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-zinc-200 rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-zinc-200 rounded w-1/4"></div>
          <div className="h-10 bg-zinc-100 rounded"></div>
          <div className="h-10 bg-zinc-100 rounded"></div>
          <div className="h-10 bg-zinc-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (interviews.length === 0) {
    return (
      <div className="bg-white border border-zinc-200 rounded-xl p-8 text-center">
        <MessageSquare className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
        <p className="font-semibold text-zinc-900 mb-1">{t('dashboard.noInterviews', 'No interviews yet')}</p>
        <p className="text-sm text-zinc-500">{t('dashboard.noInterviewsDesc', 'Start your first practice interview to see results here')}</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200">
              <th className="text-left py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">{t('dashboard.table.date', 'Date')}</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">{t('dashboard.table.role', 'Role')}</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden sm:table-cell">{t('dashboard.table.seniority', 'Seniority')}</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden md:table-cell">{t('dashboard.table.resume', 'Resume')}</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden lg:table-cell">{t('dashboard.table.duration', 'Duration')}</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">{t('dashboard.table.score', 'Score')}</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">{t('dashboard.table.action', 'Action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {interviews.map((interview) => (
              <tr
                key={interview.id}
                className="hover:bg-zinc-50 transition-colors cursor-pointer"
                onClick={() => navigate(`/interview/${interview.id}`)}
              >
                <td className="py-3 px-4 text-sm text-zinc-600">{formatDate(interview.date)}</td>
                <td className="py-3 px-4">
                  <div>
                    <p className="font-medium text-zinc-900">{interview.roleTitle}</p>
                    <p className="text-xs text-zinc-500">{interview.companyName}</p>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-zinc-600 hidden sm:table-cell">{interview.seniority || '-'}</td>
                <td className="py-3 px-4 text-sm text-zinc-600 hidden md:table-cell">{interview.resumeTitle || '-'}</td>
                <td className="py-3 px-4 text-sm text-zinc-600 hidden lg:table-cell">
                  {interview.durationMinutes ? `${interview.durationMinutes} min` : '-'}
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getScoreColor(interview.score)}`}>
                    {interview.score !== null ? `${interview.score}%` : '-'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/interview/${interview.id}`);
                    }}
                  >
                    {t('dashboard.viewDetails', 'View')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ==========================================
// RESUMES UTILIZED SECTION
// ==========================================

interface ResumesUtilizedProps {
  resumes: Array<{
    id: string;
    title: string;
    fileName: string;
    createdAt: string;
    lastUsedAt: string | null;
    interviewCount: number;
    filteredInterviewCount: number;
    isPrimary: boolean;
    qualityScore: number | null;
  }>;
  onDownload: (resumeId: string) => Promise<void>;
  isLoading: boolean;
}

const ResumesUtilized: React.FC<ResumesUtilizedProps> = ({ resumes, onDownload, isLoading }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleDownload = async (resumeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloadingId(resumeId);
    try {
      await onDownload(resumeId);
    } finally {
      setDownloadingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-zinc-200 rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-zinc-200 rounded w-1/4"></div>
          <div className="h-16 bg-zinc-100 rounded"></div>
          <div className="h-16 bg-zinc-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <div className="bg-white border border-zinc-200 rounded-xl p-8 text-center">
        <FileText className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
        <p className="font-semibold text-zinc-900 mb-1">{t('dashboard.noResumes', 'No resumes yet')}</p>
        <p className="text-sm text-zinc-500 mb-4">{t('dashboard.noResumesDesc', 'Upload a resume to get started')}</p>
        <PurpleButton variant="secondary" size="sm" onClick={() => navigate('/app/b2c/resumes')}>
          {t('dashboard.uploadResume', 'Upload Resume')}
        </PurpleButton>
      </div>
    );
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
      <div className="divide-y divide-zinc-100">
        {resumes.map((resume) => (
          <div key={resume.id} className="p-4 hover:bg-zinc-50 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-zinc-900 truncate">{resume.title}</h4>
                  {resume.isPrimary && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                      <Star className="w-3 h-3" />
                      {t('dashboard.primary', 'Primary')}
                    </span>
                  )}
                </div>
                <p className="text-sm text-zinc-500 truncate">{resume.fileName}</p>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-zinc-500">
                  <span>{t('dashboard.created', 'Created')}: {formatDate(resume.createdAt)}</span>
                  <span>{t('dashboard.lastUsed', 'Last used')}: {formatDate(resume.lastUsedAt)}</span>
                  <span>{resume.interviewCount} {t('dashboard.interviews', 'interviews')}</span>
                  {resume.qualityScore && (
                    <span className="text-purple-600">{t('dashboard.quality', 'Quality')}: {resume.qualityScore}%</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleDownload(resume.id, e)}
                  disabled={downloadingId === resume.id}
                  className="p-2 text-zinc-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
                  title={t('dashboard.download', 'Download')}
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 py-3 bg-zinc-50 border-t border-zinc-200">
        <Link
          to="/app/b2c/resumes"
          className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
        >
          {t('dashboard.manageResumes', 'Manage all resumes')}
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

// ==========================================
// HOME PAGE COMPONENT
// ==========================================

// Check if interview was completed recently (within last 24 hours)
const isRecentInterview = (createdAt: string): boolean => {
  const interviewDate = new Date(createdAt);
  const now = new Date();
  const hoursDiff = (now.getTime() - interviewDate.getTime()) / (1000 * 60 * 60);
  return hoursDiff <= 24;
};

export default function Home() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isSignedIn } = useUser()

  // Use unified candidate dashboard hook
  const {
    isLoading: dashboardLoading,
    error: dashboardError,
    kpis,
    scoreEvolution,
    recentInterviews,
    resumes,
    filterOptions,
    activeFilters,
    refresh: refreshDashboard,
    setDateRange,
    setRoleFilter,
    setSeniorityFilter,
    setResumeFilter,
    clearFilters,
    downloadResume,
  } = useCandidateDashboard(10, false); // Don't sync to URL for home page

  const { isLoading, userCredits } = useAuthCheck()
  
  // Check if user has any recent interviews (for pulse indicator)
  const hasRecentInterview = recentInterviews.some(interview => isRecentInterview(interview.date));

  // Check for navigation state (e.g., from incompatibility redirect)
  useEffect(() => {
    if (location.state?.message) {
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  if (isLoading) {
    return <Loading />
  }

  // ==========================================
  // LOGGED-IN USER: SHOW DASHBOARD
  // ==========================================
  if (isSignedIn) {
    const creditsRemaining = kpis?.creditsRemaining ?? userCredits ?? 0;

    return (
      <DefaultLayout className="flex flex-col overflow-hidden bg-white" hasRecentInterview={hasRecentInterview}>
        <div className="page-container py-6 sm:py-8">
          {/* Header with Start Interview Button */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 sm:mb-8">
            {/* Left Column - Welcome Message */}
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">
                {t('dashboard.welcome', { name: user?.firstName || t('common.there') })}
              </h1>
              <p className="text-zinc-600 mt-1">
                {t('dashboard.welcomeSubtitle')}
              </p>
            </div>

            {/* Right Column - CTA or No Credits Banner */}
            {creditsRemaining > 0 ? (
              <PurpleButton
                variant="primary"
                size="lg"
                onClick={() => navigate('/interview-setup')}
                className="w-full sm:w-auto"
              >
                <Plus className="w-5 h-5" />
                {t('dashboard.startNewInterview')}
                <ChevronRight className="w-4 h-4" />
              </PurpleButton>
            ) : (
              <div className="flex items-center gap-3 px-4 py-3 bg-purple-50 border border-purple-200 rounded-xl">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Coins className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-900">{t('credits.outOfCredits')}</p>
                  <p className="text-xs text-zinc-600">{t('credits.purchaseToContinue')}</p>
                </div>
                <PurpleButton
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    const creditsSection = document.getElementById('credit-packages');
                    if (creditsSection) creditsSection.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  {t('credits.buyCredits')}
                </PurpleButton>
              </div>
            )}
          </div>

          {dashboardError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {dashboardError}
              <button onClick={() => refreshDashboard(true)} className="ml-2 underline hover:no-underline">Retry</button>
            </div>
          )}

          {dashboardLoading ? (
            <div className="flex justify-center py-12"><Loading /></div>
          ) : (
            <>
              {/* Filter Bar */}
              <FilterBar
                filterOptions={filterOptions}
                activeFilters={activeFilters}
                onDateRangeChange={setDateRange}
                onRoleChange={setRoleFilter}
                onSeniorityChange={setSeniorityFilter}
                onResumeChange={setResumeFilter}
                onClearFilters={clearFilters}
              />

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <StatsCard
                  title={t('dashboard.stats.totalInterviews')}
                  value={kpis?.completedInterviews || 0}
                  subtitle={`${kpis?.interviewsThisMonth || 0} ${t('dashboard.stats.thisMonth')}`}
                  icon={<MessageSquare />}
                />
                <StatsCard
                  title={t('dashboard.stats.averageScore')}
                  value={kpis?.averageScore ? Math.round(kpis.averageScore) : 0}
                  change={kpis?.scoreChange || undefined}
                  icon={<TrendingUp />}
                />
                <StatsCard
                  title={t('dashboard.stats.avgDuration')}
                  value={kpis?.averageDurationMinutes ? `${kpis.averageDurationMinutes} min` : '-'}
                  subtitle={kpis?.passRate ? `${kpis.passRate}% pass rate` : undefined}
                  icon={<Clock />}
                />
                <StatsCard
                  title={t('dashboard.stats.creditsRemaining')}
                  value={creditsRemaining}
                  subtitle={kpis?.totalSpent ? formatCurrency(kpis.totalSpent) + ' spent' : undefined}
                  icon={<Coins />}
                />
              </div>

              {/* Charts & Resumes Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {/* Score Evolution Chart */}
                <div className="lg:col-span-2">
                  <div className="mb-3 sm:mb-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-zinc-900 tracking-tight">{t('dashboard.charts.scoreEvolution')}</h3>
                  </div>
                  <div className="p-6 bg-white border border-zinc-200 rounded-xl">
                    <div className="chart-container">
                      <SimpleLineChart
                        data={scoreEvolution.map(d => ({
                          label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                          value: d.score
                        }))}
                        color="#9333ea"
                        height={200}
                        emptyTitle={t('dashboard.charts.noScoreData')}
                        emptyDesc={t('dashboard.charts.noScoreDataDesc')}
                      />
                    </div>
                  </div>
                </div>

                {/* Resumes Utilized */}
                <div>
                  <div className="mb-3 sm:mb-4 flex items-center justify-between">
                    <h3 className="text-lg sm:text-xl font-semibold text-zinc-900 tracking-tight">{t('dashboard.resumesUtilized', 'Resumes')}</h3>
                  </div>
                  <ResumesUtilized
                    resumes={resumes}
                    onDownload={downloadResume}
                    isLoading={dashboardLoading}
                  />
                </div>
              </div>

              {/* Recent Interviews Table */}
              <div className="mb-6 sm:mb-8">
                <div className="mb-3 sm:mb-4 flex items-center justify-between">
                  <h3 className="text-lg sm:text-xl font-semibold text-zinc-900 tracking-tight">{t('dashboard.recentInterviews', 'Recent Interviews')}</h3>
                  <Link
                    to="/app/b2c/interviews"
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                  >
                    {t('dashboard.viewAll', 'View all')}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <RecentInterviewsTable
                  interviews={recentInterviews}
                  isLoading={dashboardLoading}
                />
              </div>
            </>
          )}

          {/* Start New Interview CTA Section OR Credit Packages */}
          {creditsRemaining > 0 ? (
            <InterviewReady />
          ) : (
            <div id="credit-packages" className="mt-6 sm:mt-8">
              <Suspense fallback={<div className="h-96 flex items-center justify-center"><Loading /></div>}>
                <CreditPackages onPurchaseComplete={() => refreshDashboard(true)} />
              </Suspense>
            </div>
          )}
        </div>
      </DefaultLayout>
    )
  }

  // ==========================================
  // NOT LOGGED IN: SHOW LANDING PAGE
  // ==========================================
  return <Landing />
}
