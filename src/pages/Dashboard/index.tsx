'use client'

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { useTranslation } from 'react-i18next'
import { DefaultLayout } from 'components/default-layout'
import Loading from 'components/loading'
import { useDashboardData } from 'hooks/use-dashboard-data'

// Simple Chart Components (Can be replaced with recharts later)
// Install: npm install recharts
// Then uncomment the imports and replace SimpleLineChart/SimpleBarChart

interface SimpleLineChartProps {
  data: { label: string; value: number }[]
  color?: string
  height?: number
}

const SimpleLineChart: React.FC<SimpleLineChartProps> = ({ data, color = '#9333ea', height = 200 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-400">
        No data available
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
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(y => (
          <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#e5e7eb" strokeWidth="0.5" />
        ))}
        {/* Line */}
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
          vectorEffect="non-scaling-stroke"
        />
        {/* Area under the line */}
        <polygon
          fill={`${color}20`}
          points={`0,100 ${points} 100,100`}
        />
        {/* Data points */}
        {data.map((d, i) => {
          const x = (i / (data.length - 1 || 1)) * 100
          const y = 100 - ((d.value - minValue) / range) * 100
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="2"
              fill={color}
              className="hover:r-3 transition-all"
            />
          )
        })}
      </svg>
      {/* X-axis labels */}
      <div className="flex justify-between mt-2 text-xs text-zinc-500">
        {data.slice(0, 6).map((d, i) => (
          <span key={i}>{d.label}</span>
        ))}
      </div>
    </div>
  )
}

interface SimpleBarChartProps {
  data: { label: string; value: number }[]
  color?: string
  height?: number
}

const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ data, color = '#9333ea', height = 200 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-400">
        No data available
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
      {/* X-axis labels */}
      <div className="flex gap-2 mt-2">
        {data.map((d, i) => (
          <span key={i} className="flex-1 text-center text-xs text-zinc-500 truncate">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  )
}

// Score badge component
const ScoreBadge: React.FC<{ score: number | null }> = ({ score }) => {
  if (score === null) {
    return <span className="score-badge bg-zinc-100 text-zinc-600">N/A</span>
  }

  let badgeClass = 'score-badge-needs-improvement'
  if (score >= 80) badgeClass = 'score-badge-excellent'
  else if (score >= 60) badgeClass = 'score-badge-good'
  else if (score >= 40) badgeClass = 'score-badge-average'

  return <span className={`score-badge ${badgeClass}`}>{score}%</span>
}

// Stats card component
const StatsCard: React.FC<{
  title: string
  value: string | number
  subtitle?: string
  change?: number
  icon: React.ReactNode
}> = ({ title, value, subtitle, change, icon }) => (
  <div className="stats-card">
    <div className="flex items-start justify-between">
      <div>
        <p className="metric-label">{title}</p>
        <p className="metric-value mt-1">{value}</p>
        {subtitle && <p className="text-sm text-zinc-500 mt-1">{subtitle}</p>}
        {change !== undefined && (
          <p className={change >= 0 ? 'metric-change-positive' : 'metric-change-negative'}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% from last month
          </p>
        )}
      </div>
      <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
        {icon}
      </div>
    </div>
  </div>
)

export default function Dashboard() {
  const { user, isLoaded, isSignedIn } = useUser()
  const navigate = useNavigate()
  const { t } = useTranslation()
  
  // Use shared dashboard data hook (with caching)
  const { data, isLoading, error, refresh } = useDashboardData(5)
  const { stats, interviews, scoreData, spendingData } = data

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/')
      return
    }
  }, [isLoaded, isSignedIn, navigate])

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (!isLoaded || isLoading) {
    return <Loading />
  }

  return (
    <DefaultLayout>
      <div className="page-container py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">
            {t('dashboard.welcome', { name: user?.firstName || t('common.there') })}
          </h1>
          <p className="text-zinc-600 mt-1">
            {t('dashboard.welcomeSubtitle')}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
            <button
              onClick={() => refresh(true)}
              className="ml-2 underline hover:no-underline"
            >
              {t('common.retry', 'Retry')}
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatsCard
            title={t('dashboard.stats.totalInterviews')}
            value={stats?.totalInterviews || 0}
            subtitle={`${stats?.interviewsThisMonth || 0} ${t('dashboard.stats.thisMonth')}`}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            }
          />
          <StatsCard
            title={t('dashboard.stats.averageScore')}
            value={stats?.averageScore ? `${stats.averageScore}%` : 'N/A'}
            change={stats?.scoreChange}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
          <StatsCard
            title={t('dashboard.stats.totalSpent')}
            value={formatCurrency(stats?.totalSpent || 0)}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatsCard
            title={t('dashboard.stats.creditsRemaining')}
            value={stats?.creditsRemaining || 0}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            }
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Score Evolution Chart */}
          <div className="p-6 bg-white border border-zinc-200 rounded-xl">
            <h3 className="text-lg font-semibold text-zinc-900 mb-4">{t('dashboard.charts.scoreEvolution')}</h3>
            <div className="chart-container">
              <SimpleLineChart
                data={scoreData.map(d => ({
                  label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                  value: d.score
                }))}
                color="#9333ea"
                height={200}
              />
            </div>
          </div>

          {/* Spending Chart */}
          <div className="p-6 bg-white border border-zinc-200 rounded-xl">
            <h3 className="text-lg font-semibold text-zinc-900 mb-4">{t('dashboard.charts.monthlySpending')}</h3>
            <div className="chart-container">
              <SimpleBarChart
                data={spendingData.map(d => ({
                  label: d.month,
                  value: d.amount
                }))}
                color="#9333ea"
                height={200}
              />
            </div>
          </div>
        </div>

        {/* Recent Interviews */}
        <div className="p-6 bg-white border border-zinc-200 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-zinc-900">{t('dashboard.recentInterviews')}</h3>
            <button
              onClick={() => navigate('/interviews')}
              className="text-sm text-purple-600 hover:underline"
            >
              {t('dashboard.viewAll')}
            </button>
          </div>

          {interviews.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-zinc-400 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-zinc-600 mb-4">{t('dashboard.noInterviews')}</p>
              <button
                onClick={() => navigate('/')}
                className="btn-voxly"
              >
                {t('interviews.startFirst')}
              </button>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {interviews.map((interview) => (
                <div
                  key={interview.id}
                  className="interview-list-item"
                  onClick={() => navigate(`/interview/${interview.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/interview/${interview.id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-zinc-900 truncate">{interview.position}</p>
                    <p className="text-sm text-zinc-500">{interview.company}</p>
                    <p className="text-xs text-zinc-400 mt-1">
                      {formatDate(interview.createdAt)} • {interview.duration} min
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-2 sm:mt-0">
                    <ScoreBadge score={interview.overallScore} />
                    <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DefaultLayout>
  )
}
