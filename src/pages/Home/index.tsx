'use client'

import { lazy, Suspense, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { DefaultLayout } from 'components/default-layout'
import { useAuthCheck } from 'hooks/use-auth-check'
import { useDashboardData } from 'hooks/use-dashboard-data'
import { useUser } from '@clerk/clerk-react'
import Loading from 'components/loading'
import PurpleButton from 'components/ui/purple-button'
import StatsCard from 'components/ui/stats-card'
import { Plus, Coins, ChevronRight, MessageSquare, TrendingUp, DollarSign } from 'lucide-react'
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

interface SimpleBarChartProps {
  data: { label: string; value: number }[]
  color?: string
  height?: number
  emptyTitle?: string
  emptyDesc?: string
}

const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ data, color = '#9333ea', height = 200, emptyTitle = 'No Spending Data', emptyDesc = 'Purchase credits to see your history' }) => {
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

  return (
    <div className="w-full flex flex-col" style={{ height }}>
      <div className="flex-1 flex items-end gap-2">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center">
            <div
              className="w-full rounded-t transition-all hover:opacity-80"
              style={{
                height: `${(d.value / maxValue) * 100}%`,
                backgroundColor: color,
                minHeight: d.value > 0 ? '4px' : '0'
              }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        {data.map((d, i) => (
          <span key={i} className="flex-1 text-center text-xs text-zinc-500 truncate">{d.label}</span>
        ))}
      </div>
    </div>
  )
}

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

  // Use shared dashboard data hook (with caching)
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError, refresh: refreshDashboard } = useDashboardData(5)
  const { stats, interviews, scoreData, spendingData } = dashboardData

  const { isLoading, userCredits } = useAuthCheck()
  
  // Check if user has any recent interviews (for pulse indicator)
  const hasRecentInterview = interviews.some(interview => isRecentInterview(interview.createdAt));

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
            {(userCredits !== null && userCredits > 0) ? (
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
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <StatsCard
                  title={t('dashboard.stats.totalInterviews')}
                  value={stats?.totalInterviews || 0}
                  subtitle={`${stats?.interviewsThisMonth || 0} ${t('dashboard.stats.thisMonth')}`}
                  icon={<MessageSquare />}
                />
                <StatsCard
                  title={t('dashboard.stats.averageScore')}
                  value={stats?.averageScore ? stats.averageScore : 0}
                  change={stats?.scoreChange}
                  icon={<TrendingUp />}
                />
                <StatsCard
                  title={t('dashboard.stats.totalSpent')}
                  value={formatCurrency(stats?.totalSpent || 0)}
                  icon={<DollarSign />}
                />
                <StatsCard
                  title={t('dashboard.stats.creditsRemaining')}
                  value={stats?.creditsRemaining ?? userCredits ?? 0}
                  icon={<Coins />}
                />
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {/* Score Evolution */}
                <div>
                  <div className="mb-3 sm:mb-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-zinc-900 tracking-tight">{t('dashboard.charts.scoreEvolution')}</h3>
                  </div>
                  <div className="p-6 bg-white border border-zinc-200 rounded-xl">
                    <div className="chart-container">
                      <SimpleLineChart
                        data={scoreData.map(d => ({
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
                {/* Monthly Spending */}
                <div>
                  <div className="mb-3 sm:mb-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-zinc-900 tracking-tight">{t('dashboard.charts.monthlySpending')}</h3>
                  </div>
                  <div className="p-6 bg-white border border-zinc-200 rounded-xl">
                    <div className="chart-container">
                      <SimpleBarChart
                        data={spendingData.map(d => ({ label: d.month, value: d.amount }))}
                        color="#9333ea"
                        height={200}
                        emptyTitle={t('dashboard.charts.noSpendingData')}
                        emptyDesc={t('dashboard.charts.noSpendingDataDesc')}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Start New Interview CTA Section OR Credit Packages */}
          {(userCredits !== null && userCredits > 0) ? (
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