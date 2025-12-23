 'use client'

import { lazy, Suspense, useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { useTranslation } from 'react-i18next'
import { DefaultLayout } from 'components/default-layout'
import Loading from 'components/loading'
import PurpleButton from 'components/ui/purple-button'
import StatsCard from 'components/ui/stats-card'
import { Coins, CreditCard, Calendar, Package, CheckCircle, Clock, XCircle, Sparkles, ChevronDown, Mic } from 'lucide-react'
import { useAuthCheck } from 'hooks/use-auth-check'
import apiService, { PaymentHistoryItem, InterviewSummary } from 'services/APIService'
import ContactButton from 'components/contact-button'
import { PaymentProviderSelector } from 'components/payment-provider-selector'

// Lazy load credit packages
const CreditPackages = lazy(() => import('components/credit-packages'))

interface ConsumptionDay {
  date: string
  displayDate: string
  interviews: InterviewSummary[]
  totalCredits: number
}

const getStatusIcon = (status: string) => {
  const upperStatus = status.toUpperCase()
  switch (upperStatus) {
    case 'APPROVED':
      return <CheckCircle className="w-4 h-4 text-purple-500" />
    case 'PENDING':
    case 'IN_PROCESS':
      return <Clock className="w-4 h-4 text-amber-500" />
    case 'REJECTED':
    case 'CANCELLED':
      return <XCircle className="w-4 h-4 text-red-500" />
    default:
      return <Clock className="w-4 h-4 text-gray-500" />
  }
}

const getStatusColor = (status: string) => {
  const upperStatus = status.toUpperCase()
  switch (upperStatus) {
    case 'APPROVED':
      return 'bg-purple-100 text-purple-700'
    case 'PENDING':
    case 'IN_PROCESS':
      return 'bg-amber-100 text-amber-700'
    case 'REJECTED':
    case 'CANCELLED':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDateShort = (dateString: string) => {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  }
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
  })
}

export default function Credits() {
  const navigate = useNavigate()
  const { user, isSignedIn, isLoaded } = useUser()
  const { t } = useTranslation()
  const { userCredits, isLoading: authLoading } = useAuthCheck()
  const buyCreditsRef = useRef<HTMLDivElement>(null)
  
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([])
  const [consumptionHistory, setConsumptionHistory] = useState<ConsumptionDay[]>([])
  const [isLoadingPayments, setIsLoadingPayments] = useState(true)
  const [isLoadingConsumption, setIsLoadingConsumption] = useState(true)
  const [totalSpent, setTotalSpent] = useState(0)
  const [totalCreditsPurchased, setTotalCreditsPurchased] = useState(0)
  const [totalCreditsUsed, setTotalCreditsUsed] = useState(0)

  const scrollToBuyCredits = () => {
    buyCreditsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const fetchPaymentHistory = useCallback(async () => {
    if (!user?.id) return
    
    setIsLoadingPayments(true)
    try {
      const result = await apiService.getPaymentHistory(user.id)
      if (result && result.length > 0) {
        setPayments(result)
        // Calculate totals from approved payments
        const approved = result.filter((p) => p.status.toUpperCase() === 'APPROVED')
        setTotalSpent(approved.reduce((sum, p) => sum + p.amountUSD, 0))
        setTotalCreditsPurchased(approved.reduce((sum, p) => sum + p.creditsAmount, 0))
      }
    } catch (err) {
      console.error('Failed to fetch payment history:', err)
    } finally {
      setIsLoadingPayments(false)
    }
  }, [user?.id])

  const fetchConsumptionHistory = useCallback(async () => {
    if (!user?.id) return
    
    setIsLoadingConsumption(true)
    try {
      const result = await apiService.getUserInterviews(user.id, 1, 50)
      if (result.interviews && result.interviews.length > 0) {
        // Group interviews by date
        const grouped: { [key: string]: InterviewSummary[] } = {}
        result.interviews.forEach((interview) => {
          const date = new Date(interview.createdAt).toDateString()
          if (!grouped[date]) {
            grouped[date] = []
          }
          grouped[date].push(interview)
        })
        
        // Convert to array and sort by date descending
        const consumptionDays: ConsumptionDay[] = Object.entries(grouped)
          .map(([date, interviews]) => ({
            date,
            displayDate: formatDateShort(date),
            interviews,
            totalCredits: interviews.length // 1 credit per interview
          }))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        
        setConsumptionHistory(consumptionDays)
        setTotalCreditsUsed(result.interviews.length)
      }
    } catch (err) {
      console.error('Failed to fetch consumption history:', err)
    } finally {
      setIsLoadingConsumption(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (isSignedIn && user?.id) {
      fetchPaymentHistory()
      fetchConsumptionHistory()
    }
  }, [isSignedIn, user?.id, fetchPaymentHistory, fetchConsumptionHistory])

  if (!isLoaded) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loading />
        </div>
      </DefaultLayout>
    )
  }

  // ==========================================
  // NOT LOGGED IN: SHOW CREDITS INFO + PACKAGES
  // ==========================================
  if (!isSignedIn) {
    return (
      <DefaultLayout className="flex flex-col overflow-hidden bg-white">
        <div className="page-container py-6 sm:py-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 sm:mb-8">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">
                {t('creditsPage.title')} <span className="text-purple-600">{t('creditsPage.titleHighlight')}</span>
              </h1>
              <p className="text-zinc-600 mt-1">
                {t('creditsPage.subtitle')}
              </p>
            </div>
          </div>

          {/* Hero Section - How Credits Work */}
          <div className="p-6 bg-white border border-zinc-200 rounded-xl mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
              <div className="text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 mb-2 tracking-tight">
                  {t('creditsPage.pricing.title')}
                </h2>
                <p className="text-zinc-600 text-sm sm:text-base">
                  {t('creditsPage.pricing.description')}
                </p>
              </div>
            </div>
          </div>

          {/* Credit Packages */}
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-zinc-900 tracking-tight mb-3 sm:mb-4">{t('creditsPage.choosePackage')}</h2>
            <Suspense fallback={<Loading />}>
              <CreditPackages />
            </Suspense>
          </div>
        </div>
        
        {/* Contact Button */}
        <ContactButton />
      </DefaultLayout>
    )
  }

  // ==========================================
  // LOGGED IN: SHOW FULL CREDITS DASHBOARD
  // ==========================================
  if (authLoading) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loading />
        </div>
      </DefaultLayout>
    )
  }

  return (
    <DefaultLayout className="flex flex-col overflow-hidden bg-white">
      <div className="page-container py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">
              {t('creditsPage.billing.title')} <span className="text-purple-600">{t('creditsPage.billing.titleHighlight')}</span>
            </h1>
            <p className="text-zinc-600 mt-1">
              {t('creditsPage.billing.subtitle')}
            </p>
          </div>
          
          {/* Buy Credits CTA Button */}
          <PurpleButton
            variant="primary"
            size="lg"
            onClick={scrollToBuyCredits}
            className="w-full sm:w-auto"
          >
            <Sparkles className="w-5 h-5" />
            {t('creditsPage.buyMoreCredits')}
            <ChevronDown className="w-4 h-4" />
          </PurpleButton>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <StatsCard
            title={t('creditsPage.stats.balance')}
            value={userCredits}
            icon={<Coins />}
          />

          <StatsCard
            title={t('creditsPage.stats.purchased')}
            value={totalCreditsPurchased}
            icon={<Package />}
          />

          <StatsCard
            title={t('creditsPage.stats.used')}
            value={totalCreditsUsed}
            icon={<Mic />}
          />

          <StatsCard
            title={t('creditsPage.stats.spent')}
            value={`$${totalSpent.toFixed(0)}`}
            icon={<CreditCard />}
          />
        </div>

        {/* History Sections - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Payment History Section */}
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-zinc-900 tracking-tight mb-3 sm:mb-4">{t('creditsPage.paymentHistory')}</h2>
            
            <div className="p-6 bg-white border border-zinc-200 rounded-xl max-h-[300px] sm:max-h-[400px] overflow-y-auto">
              {isLoadingPayments ? (
                <div className="flex items-center justify-center py-12">
                  <Loading />
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-lg font-semibold text-zinc-900 mb-2">{t('creditsPage.noPaymentHistory')}</p>
                  <p className="text-sm text-zinc-500">
                    {t('creditsPage.purchaseToSeeHistory')}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-100">
                  {payments.map((payment) => (
                    <div key={payment.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-zinc-900">
                              {payment.packageName}
                            </span>
                            {/* <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                              {getStatusIcon(payment.status)}
                              {payment.status}
                            </span> */}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-zinc-500">
                            <span className="flex items-center gap-1">
                              <Coins className="w-3.5 h-3.5" />
                              {payment.creditsAmount} credits
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDate(payment.createdAt)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-zinc-900">
                            ${payment.amountUSD.toFixed(2)}
                          </p>
                          <p className="text-xs text-zinc-400">
                            R$ {payment.amountBRL.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Consumption History Section */}
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-zinc-900 tracking-tight mb-3 sm:mb-4">{t('creditsPage.creditUsage')}</h2>
            
            <div className="p-6 bg-white border border-zinc-200 rounded-xl max-h-[300px] sm:max-h-[400px] overflow-y-auto">
              {isLoadingConsumption ? (
                <div className="flex items-center justify-center py-12">
                  <Loading />
                </div>
              ) : consumptionHistory.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-lg font-semibold text-zinc-900 mb-2">{t('creditsPage.noInterviewsYet')}</p>
                  <p className="text-sm text-zinc-500">
                    {t('creditsPage.completeInterviewsToSee')}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {consumptionHistory.map((day) => (
                    <div key={day.date} className="border-b border-zinc-100 last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-purple-600" />
                          <span className="font-medium text-zinc-900">{day.displayDate}</span>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                          <Coins className="w-3 h-3" />
                          {day.totalCredits} credit{day.totalCredits !== 1 ? 's' : ''} used
                        </span>
                      </div>
                      <div className="pl-6 space-y-1">
                        {day.interviews.map((interview) => (
                          <div key={interview.id} className="flex items-center justify-between text-sm">
                            <span className="text-zinc-600 truncate max-w-[200px]">
                              {interview.position || 'Interview'}
                            </span>
                            <span className="text-zinc-400 text-xs">
                              {new Date(interview.createdAt).toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Buy Credits Section */}
        <div ref={buyCreditsRef} className="scroll-mt-8">
          <h2 className="text-lg sm:text-xl font-semibold text-zinc-900 tracking-tight mb-3 sm:mb-4">{t('creditsPage.buyCredits')}</h2>
          
          {/* Payment Provider Selector */}
          <div className="mb-6">
            <PaymentProviderSelector showRegionInfo={true} />
          </div>
          
          <Suspense fallback={<Loading />}>
            <CreditPackages onPurchaseComplete={fetchPaymentHistory} />
          </Suspense>
        </div>
      </div>
      
      {/* Contact Button */}
      <ContactButton />
    </DefaultLayout>
  )
}
