/**
 * B2C Dashboard - Interview Practice & Performance
 * 
 * Personal workspace for candidates to:
 * - View their credit balance (from real API)
 * - Start new practice interviews
 * - See recent interview history (from real API)
 * - Track performance trends
 * - View resume count (from real API)
 * - Skill breakdown analysis
 * - Weekly activity tracking
 */

import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  PlayCircle,
  FileText,
  TrendingUp,
  TrendingDown,
  CreditCard,
  History,
  ChevronRight,
  Zap,
  Award,
  Target,
  Loader2,
  Clock,
  BarChart3,
  Minus,
  Upload,
  Calendar,
  Filter,
  RefreshCw,
  X,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import { useWalletBalanceQuery } from '../../../../hooks/queries/useWalletQueries';
import { useResumesQuery } from '../../../../hooks/queries/useResumeQueries';
import { useDashboardQuery } from '../../../../hooks/queries/useDashboardQueries';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Seniority options constant (matches backend values)
const SENIORITY_OPTIONS = [
  { value: 'all', labelKey: 'dashboard.filters.allSeniorities' },
  { value: 'intern', labelKey: 'interviewSetup.form.seniorityLevels.intern' },
  { value: 'junior', labelKey: 'interviewSetup.form.seniorityLevels.junior' },
  { value: 'mid', labelKey: 'interviewSetup.form.seniorityLevels.mid' },
  { value: 'senior', labelKey: 'interviewSetup.form.seniorityLevels.senior' },
  { value: 'staff', labelKey: 'interviewSetup.form.seniorityLevels.staff' },
  { value: 'principal', labelKey: 'interviewSetup.form.seniorityLevels.principal' },
  { value: 'executive', labelKey: 'interviewSetup.form.seniorityLevels.executive' },
];

export default function B2CDashboard() {
  const { user } = useUser();
  const { t } = useTranslation();
  const firstName = user?.firstName || t('common.there');

  // Filter state
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [seniorityFilter, setSeniorityFilter] = useState<string>('all');

  // Build filters object for API
  const apiFilters = React.useMemo(() => {
    const filters: { roleTitle?: string; seniority?: string } = {};
    if (roleFilter !== 'all') filters.roleTitle = roleFilter;
    if (seniorityFilter !== 'all') filters.seniority = seniorityFilter;
    return filters;
  }, [roleFilter, seniorityFilter]);

  // Check if any filters are active
  const hasActiveFilters = roleFilter !== 'all' || seniorityFilter !== 'all';

  // Clear all filters
  const clearFilters = useCallback(() => {
    setRoleFilter('all');
    setSeniorityFilter('all');
  }, []);

  // Fetch real data from APIs
  const { data: walletData, isLoading: isLoadingWallet } = useWalletBalanceQuery();
  const { data: resumes, isLoading: isLoadingResumes } = useResumesQuery();
  const { data: dashboardData, isLoading: isLoadingDashboard, refetch } = useDashboardQuery({
    filters: apiFilters,
  });

  const credits = walletData?.data?.balance ?? 0;
  const resumeCount = resumes?.length ?? 0;
  const recentInterviews = dashboardData?.recentInterviews ?? [];
  // Use kpis.totalInterviews for accurate count (source of truth from backend)
  const totalInterviewCount = dashboardData?.kpis?.totalInterviews ?? 0;
  const averageScore = dashboardData?.kpis?.averageScore ?? 0;
  const scoreChange = dashboardData?.kpis?.scoreChange ?? 0;
  const totalDuration = dashboardData?.kpis?.averageDurationMinutes ?? 0;

  // Extract filter options from API response
  const filterOptions = dashboardData?.filterOptions;
  const availableRoles = filterOptions?.roleTitles ?? [];
  const availableSeniorities = filterOptions?.seniorities ?? [];

  // Build performance trend from score evolution data
  const performanceData = React.useMemo(() => {
    const scoreEvolution = dashboardData?.scoreEvolution ?? [];
    if (!scoreEvolution || scoreEvolution.length === 0) {
      return [];
    }
    // Take last 5 data points for the trend chart
    return scoreEvolution
      .slice(-5)
      .map((point) => ({
        date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: point.score,
      }));
  }, [dashboardData?.scoreEvolution]);

  // Calculate skill breakdown from interview data (simulated for now)
  const skillBreakdown = React.useMemo((): Array<{ skill: string; score: number; trend: 'up' | 'down' | 'stable' }> => {
    if (recentInterviews.length === 0) return [];
    const avgScore = averageScore ?? 0;
    // In production, this would come from the API
    return [
      { skill: t('dashboard.skills.technical', 'Technical'), score: Math.min(100, avgScore + 5), trend: 'up' },
      { skill: t('dashboard.skills.communication', 'Communication'), score: Math.max(0, avgScore - 5), trend: 'stable' },
      { skill: t('dashboard.skills.problemSolving', 'Problem Solving'), score: avgScore, trend: 'up' },
    ];
  }, [recentInterviews.length, averageScore, t]);

  // Weekly activity data (derived from recent interviews)
  const weeklyActivity = React.useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const activity = days.map(day => ({ day, interviews: 0 }));
    
    recentInterviews.forEach(interview => {
      const dayIndex = new Date(interview.date).getDay();
      activity[dayIndex].interviews++;
    });
    
    // Rotate to start from Monday
    return [...activity.slice(1), activity[0]];
  }, [recentInterviews]);

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">


            <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">
                {t('dashboard.welcome', 'Welcome back,')} <span className="text-purple-600">{firstName}!</span>
              </h1>
              <p className="text-gray-600 mt-1">
                {t('dashboard.readyToPractice')}
              </p>
            </div>
            <Link
              to="/app/b2c/interview/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors shadow-sm"
            >
              <PlayCircle className="h-5 w-5" />
              {t('dashboard.startInterview')}
            </Link>
          </motion.div>

          {/* Filters Row */}
          {(availableRoles.length > 0 || availableSeniorities.length > 0 || totalInterviewCount > 0) && (
            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">{t('common.filters', 'Filters')}:</span>
              </div>
              
              {/* Role Filter */}
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px] bg-white text-sm border-gray-200">
                  <SelectValue placeholder={t('dashboard.filters.allRoles', 'All Roles')} />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">{t('dashboard.filters.allRoles', 'All Roles')}</SelectItem>
                  {availableRoles.map((role) => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Seniority Filter */}
              <Select value={seniorityFilter} onValueChange={setSeniorityFilter}>
                <SelectTrigger className="w-[180px] bg-white text-sm border-gray-200">
                  <SelectValue placeholder={t('dashboard.filters.allSeniorities', 'All Levels')} />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {SENIORITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.value === 'all' 
                        ? t('dashboard.filters.allSeniorities', 'All Levels') 
                        : t(opt.labelKey, opt.value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Refresh Button */}
              <button
                onClick={() => refetch()}
                disabled={isLoadingDashboard}
                className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
                title={t('common.refreshData', 'Refresh data')}
              >
                <RefreshCw className={`w-4 h-4 text-gray-500 ${isLoadingDashboard ? 'animate-spin' : ''}`} />
              </button>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  <X className="w-3 h-3" />
                  {t('common.clearFilters', 'Clear')}
                </button>
              )}
            </motion.div>
          )}

          {/* Stats Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Credits Balance */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('dashboard.stats.credits')}</p>
                  {isLoadingWallet ? (
                    <Loader2 className="h-6 w-6 text-purple-600 animate-spin" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">{credits}</p>
                  )}
                </div>
              </div>
              <Link
                to="/app/b2c/billing"
                className="mt-3 text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
              >
                {t('dashboard.lowCredits.buyMore')} <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Total Interviews */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <History className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('dashboard.stats.interviews')}</p>
                  {isLoadingDashboard ? (
                    <Loader2 className="h-6 w-6 text-purple-600 animate-spin" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">{totalInterviewCount}</p>
                  )}
                </div>
              </div>
              <Link
                to="/app/b2c/interviews"
                className="mt-3 text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
              >
                {t('dashboard.viewAll')} <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Average Score */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('dashboard.stats.avgScore')}</p>
                  {isLoadingDashboard ? (
                    <Loader2 className="h-6 w-6 text-purple-600 animate-spin" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">{averageScore}%</p>
                  )}
                </div>
              </div>
              {scoreChange !== 0 && (
                <p className={`mt-3 text-sm font-medium flex items-center gap-1 ${scoreChange > 0 ? 'text-purple-600' : 'text-gray-500'}`}>
                  {scoreChange > 0 && <TrendingUp className="h-4 w-4" />}
                  {scoreChange > 0 ? '+' : ''}{scoreChange}% {t('dashboard.stats.thisMonth')}
                </p>
              )}
            </div>

            {/* Resumes */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('dashboard.stats.resumes')}</p>
                  {isLoadingResumes ? (
                    <Loader2 className="h-6 w-6 text-purple-600 animate-spin" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">{resumeCount}</p>
                  )}
                </div>
              </div>
              <Link
                to="/app/b2c/resumes"
                className="mt-3 text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
              >
                {t('common.edit')} <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Performance Trend */}
            <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">{t('dashboard.charts.performanceTrend')}</h2>
                <Link
                  to="/app/b2c/interviews"
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                >
                  {t('dashboard.viewAll')} <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="h-64">
                {isLoadingDashboard ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
                  </div>
                ) : performanceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6b7280" />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#7c3aed"
                        strokeWidth={3}
                        dot={{ fill: '#7c3aed', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: '#7c3aed' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <Target className="h-10 w-10 mb-2" />
                    <p>{t('dashboard.charts.noData', 'Complete interviews to see your performance trend')}</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.quickActions.title')}</h2>
              <div className="space-y-3">
                <Link
                  to="/app/b2c/interview/new"
                  className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors"
                >
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Zap className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-purple-900">{t('dashboard.quickActions.practiceInterview')}</p>
                    <p className="text-sm text-purple-700">{t('dashboard.quickActions.practiceDesc')}</p>
                  </div>
                </Link>

                <Link
                  to="/app/b2c/resumes"
                  className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors"
                >
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-purple-900">{t('dashboard.quickActions.uploadResume')}</p>
                    <p className="text-sm text-purple-700">{t('dashboard.quickActions.uploadDesc')}</p>
                  </div>
                </Link>

                <Link
                  to="/app/b2c/interviews"
                  className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors"
                >
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Award className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-purple-900">{t('dashboard.quickActions.viewHistory', 'View History')}</p>
                    <p className="text-sm text-purple-700">{t('dashboard.quickActions.historyDesc', 'Review your past interviews')}</p>
                  </div>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Recent Interviews */}
          <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">{t('dashboard.recentInterviews')}</h2>
              <Link
                to="/app/b2c/interviews"
                className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
              >
                {t('dashboard.viewAll')} <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {isLoadingDashboard ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 text-purple-600 mx-auto mb-4 animate-spin" />
                <p className="text-gray-500">{t('common.loading', 'Loading...')}</p>
              </div>
            ) : recentInterviews.length === 0 ? (
              <div className="text-center py-12">
                <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">{t('dashboard.noInterviews')}</p>
                <p className="text-sm text-gray-400 mt-1">{t('dashboard.noInterviewsHint')}</p>
                <Link
                  to="/app/b2c/interview/new"
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors text-sm"
                >
                  <PlayCircle className="h-4 w-4" />
                  {t('dashboard.startInterview')}
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">{t('dashboard.table.role')}</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">{t('dashboard.table.company')}</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">{t('dashboard.table.date')}</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">{t('dashboard.table.score')}</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">{t('dashboard.table.action')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentInterviews.slice(0, 5).map((interview) => (
                      <tr key={interview.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{interview.roleTitle || 'Practice'}</td>
                        <td className="py-3 px-4 text-gray-600">{interview.companyName || 'Practice'}</td>
                        <td className="py-3 px-4 text-gray-600">
                          {new Date(interview.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                              (interview.score ?? 0) >= 80
                                ? 'bg-purple-100 text-purple-800'
                                : (interview.score ?? 0) >= 60
                                  ? 'bg-purple-50 text-purple-700'
                                  : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {interview.score ?? 0}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link 
                            to={`/interview/${interview.id}`}
                            className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                          >
                            {t('dashboard.table.view', 'View')}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

          {/* New Widgets Row: Skill Breakdown, Weekly Activity, Uploaded Resumes */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Skill Breakdown */}
            <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{t('dashboard.widgets.skillBreakdown', 'Skill Breakdown')}</h2>
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              {isLoadingDashboard ? (
                <div className="h-40 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 text-purple-600 animate-spin" />
                </div>
              ) : skillBreakdown.length > 0 ? (
                <div className="space-y-4">
                  {skillBreakdown.map((skill) => (
                    <div key={skill.skill}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{skill.skill}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-bold text-gray-900">{skill.score}%</span>
                          {skill.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                          {skill.trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
                          {skill.trend === 'stable' && <Minus className="h-3 w-3 text-gray-400" />}
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${skill.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-40 flex flex-col items-center justify-center text-gray-400">
                  <BarChart3 className="h-8 w-8 mb-2" />
                  <p className="text-sm">{t('dashboard.widgets.noSkillData', 'Complete interviews to see skill analysis')}</p>
                </div>
              )}
            </motion.div>

            {/* Weekly Activity */}
            <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{t('dashboard.widgets.weeklyActivity', 'Weekly Activity')}</h2>
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              {isLoadingDashboard ? (
                <div className="h-40 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 text-purple-600 animate-spin" />
                </div>
              ) : (
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyActivity}>
                      <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#6b7280" />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                        formatter={(value: number) => [`${value} interview${value !== 1 ? 's' : ''}`, '']}
                      />
                      <Bar 
                        dataKey="interviews" 
                        fill="#7c3aed" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-gray-500">{t('dashboard.widgets.totalTime', 'Total time')}</span>
                <span className="font-medium text-gray-900 flex items-center gap-1">
                  <Clock className="h-4 w-4 text-purple-600" />
                  {totalDuration > 0 ? `${totalDuration} min` : '0 min'}
                </span>
              </div>
            </motion.div>

            {/* Uploaded Resumes Mini */}
            <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{t('dashboard.widgets.uploadedResumes', 'Your Resumes')}</h2>
                <Link
                  to="/app/b2c/resumes"
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                >
                  {t('dashboard.viewAll')} <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              {isLoadingResumes ? (
                <div className="h-40 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 text-purple-600 animate-spin" />
                </div>
              ) : resumes && resumes.length > 0 ? (
                <div className="space-y-3">
                  {resumes.slice(0, 3).map((resume: { id: string; fileName: string; createdAt?: string; title?: string }) => (
                    <div 
                      key={resume.id} 
                      className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <FileText className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {resume.title || resume.fileName || 'Resume'}
                        </p>
                        {resume.createdAt && (
                          <p className="text-xs text-gray-500">
                            {new Date(resume.createdAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  {resumes.length > 3 && (
                    <p className="text-sm text-gray-500 text-center">
                      +{resumes.length - 3} more
                    </p>
                  )}
                </div>
              ) : (
                <div className="h-40 flex flex-col items-center justify-center">
                  <div className="p-3 bg-purple-50 rounded-full mb-3">
                    <Upload className="h-6 w-6 text-purple-600" />
                  </div>
                  <p className="text-sm text-gray-500 text-center mb-3">
                    {t('dashboard.widgets.noResumes', 'No resumes uploaded yet')}
                  </p>
                  <Link
                    to="/app/b2c/resumes"
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    {t('dashboard.widgets.uploadFirst', 'Upload your first resume')}
                  </Link>
                </div>
              )}
            </motion.div>
          </div>

          {/* Credits CTA */}
          {credits <= 3 && (
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 text-white"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">{t('dashboard.lowCredits.title')}</h3>
                  <p className="text-purple-200 mt-1">
                    {t('dashboard.readyToPractice')}
                  </p>
                </div>
                <Link
                  to="/app/b2c/billing"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-purple-600 rounded-lg font-medium hover:bg-gray-100 transition-colors shadow-sm"
                >
                  <CreditCard className="h-5 w-5" />
                  {t('dashboard.lowCredits.buyMore')}
                </Link>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}