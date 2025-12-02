'use client'

import { lazy, Suspense, useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { DefaultLayout } from 'components/default-layout'
import Loading from 'components/loading'
import { Coins, Receipt, CreditCard, ArrowLeft, Calendar, Package, CheckCircle, Clock, XCircle } from 'lucide-react'
import { useAuthCheck } from 'hooks/use-auth-check'
import apiService, { PaymentHistoryItem } from 'services/APIService'
import ContactButton from 'components/contact-button'

// Lazy load credit packages
const CreditPackages = lazy(() => import('components/credit-packages'))

const getStatusIcon = (status: string) => {
  const upperStatus = status.toUpperCase()
  switch (upperStatus) {
    case 'APPROVED':
      return <CheckCircle className="w-4 h-4 text-green-500" />
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
      return 'bg-green-100 text-green-700'
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

export default function Credits() {
  const navigate = useNavigate()
  const { user, isSignedIn, isLoaded } = useUser()
  const { userCredits, isLoading: authLoading } = useAuthCheck()
  
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([])
  const [isLoadingPayments, setIsLoadingPayments] = useState(true)
  const [totalSpent, setTotalSpent] = useState(0)
  const [totalCreditsPurchased, setTotalCreditsPurchased] = useState(0)

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

  useEffect(() => {
    if (isSignedIn && user?.id) {
      fetchPaymentHistory()
    }
  }, [isSignedIn, user?.id, fetchPaymentHistory])

  // Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/')
    }
  }, [isLoaded, isSignedIn, navigate])

  if (!isLoaded || authLoading) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loading />
        </div>
      </DefaultLayout>
    )
  }

  if (!isSignedIn) {
    return null
  }

  return (
    <DefaultLayout>
      <div className="page-container py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Credits & <span className="text-voxly-purple">Billing</span>
          </h1>
          <p className="text-gray-600">
            Manage your credits and view your payment history
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="voxly-card flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Coins className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Current Balance</p>
              <p className="text-2xl font-bold text-gray-900">{userCredits}</p>
              <p className="text-xs text-gray-400">credits</p>
            </div>
          </div>

          <div className="voxly-card flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Purchased</p>
              <p className="text-2xl font-bold text-gray-900">{totalCreditsPurchased}</p>
              <p className="text-xs text-gray-400">credits</p>
            </div>
          </div>

          <div className="voxly-card flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">${totalSpent.toFixed(2)}</p>
              <p className="text-xs text-gray-400">USD</p>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Purchase Credits Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-voxly-purple" />
              <h2 className="text-xl font-semibold text-gray-900">Buy Credits</h2>
            </div>
            <Suspense fallback={<Loading />}>
              <CreditPackages onPurchaseComplete={fetchPaymentHistory} />
            </Suspense>
          </div>

          {/* Payment History Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Receipt className="w-5 h-5 text-voxly-purple" />
              <h2 className="text-xl font-semibold text-gray-900">Payment History</h2>
            </div>
            
            <div className="voxly-card">
              {isLoadingPayments ? (
                <div className="flex items-center justify-center py-12">
                  <Loading />
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-12">
                  <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No payment history yet</p>
                  <p className="text-sm text-gray-400">
                    Purchase credits to see your transaction history
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {payments.map((payment) => (
                    <div key={payment.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">
                              {payment.packageName}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                              {getStatusIcon(payment.status)}
                              {payment.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
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
                          <p className="font-semibold text-gray-900">
                            ${payment.amountUSD.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-400">
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
        </div>
      </div>
      
      {/* Contact Button */}
      <ContactButton />
    </DefaultLayout>
  )
}
