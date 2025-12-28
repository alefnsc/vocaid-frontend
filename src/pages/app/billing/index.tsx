/**
 * Billing Page
 * 
 * Credit management and purchasing via Mercado Pago or PayPal.
 * Features:
 * - Current credit balance from API
 * - Credit pack selection with localized pricing
 * - Payment provider auto-detection + manual override
 * - Purchase history from API
 * - Transaction ledger
 * 
 * Design System: Vocaid (white, black, zinc, purple-600 only)
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useUser } from '@clerk/clerk-react';
import { DefaultLayout } from 'components/default-layout';
import { useCreditsWallet, WalletTransaction } from 'hooks/use-credits-wallet';
import apiService from 'services/APIService';

// ==========================================
// TYPES
// ==========================================

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  priceUSD: number;
  currency: string;
  description: string;
}

type PaymentProvider = 'mercadopago' | 'paypal';

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function formatCurrency(amount: number, currency: string = 'USD'): string {
  const locale = currency === 'BRL' ? 'pt-BR' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getTransactionIndicator(type: WalletTransaction['type'] | string) {
  const baseClasses = "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold";
  switch (type) {
    case 'GRANT':
      return <span className={`${baseClasses} bg-purple-100 text-purple-600`}>+</span>;
    case 'PURCHASE':
      return <span className={`${baseClasses} bg-zinc-900 text-white`}>$</span>;
    case 'USAGE':
    case 'SPEND':
      return <span className={`${baseClasses} bg-zinc-100 text-zinc-600`}>−</span>;
    case 'REFUND':
    case 'RESTORE':
      return <span className={`${baseClasses} bg-purple-50 text-purple-600`}>↺</span>;
    case 'PROMO':
      return <span className={`${baseClasses} bg-zinc-100 text-zinc-900`}>★</span>;
    default:
      return <span className={`${baseClasses} bg-zinc-100 text-zinc-600`}>•</span>;
  }
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function BillingPage() {
  const { t } = useTranslation();
  const { user, isLoaded } = useUser();
  
  // Credit wallet state (from hook)
  const {
    balance,
    transactions,
    pagination,
    isLoading: isLoadingBalance,
    isLoadingHistory,
    error: walletError,
    refreshBalance,
    fetchHistory,
    loadMoreHistory,
  } = useCreditsWallet({ autoFetch: true, historyLimit: 10 });

  // Packages state
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [, setCurrency] = useState('USD');
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
  const [packagesError, setPackagesError] = useState<string | null>(null);

  // Provider state
  const [detectedProvider, setDetectedProvider] = useState<PaymentProvider>('paypal');
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider>('paypal');
  const [providerName, setProviderName] = useState('PayPal');
  const [, setIsLoadingProvider] = useState(true);
  const [showProviderSelector, setShowProviderSelector] = useState(false);

  // Purchase state
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  // Fetch packages from backend
  const fetchPackages = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoadingPackages(true);
    setPackagesError(null);
    
    try {
      const response = await apiService.getLocalizedPackages(user.id);
      if (response.status === 'success' && response.data) {
        setPackages(response.data.packages);
        setCurrency(response.data.currency);
      }
    } catch (err: any) {
      console.error('Failed to fetch packages:', err);
      setPackagesError(t('billing.failedToLoadPackages'));
    } finally {
      setIsLoadingPackages(false);
    }
  }, [user?.id]);

  // Fetch preferred provider from backend
  const fetchProvider = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoadingProvider(true);
    
    try {
      const response = await apiService.getPreferredPaymentProvider(user.id);
      if (response.status === 'success' && response.data) {
        setDetectedProvider(response.data.provider);
        setSelectedProvider(response.data.provider);
        setProviderName(response.data.name);
      }
    } catch (err: any) {
      console.error('Failed to fetch provider:', err);
      // Default to PayPal on error
      setDetectedProvider('paypal');
      setSelectedProvider('paypal');
    } finally {
      setIsLoadingProvider(false);
    }
  }, [user?.id]);

  // Initial data fetch
  useEffect(() => {
    if (isLoaded && user?.id) {
      fetchPackages();
      fetchProvider();
      fetchHistory();
    }
  }, [isLoaded, user?.id, fetchPackages, fetchProvider, fetchHistory]);

  // Handle provider selection
  const handleSelectProvider = (provider: PaymentProvider) => {
    setSelectedProvider(provider);
    setProviderName(provider === 'mercadopago' ? 'Mercado Pago' : 'PayPal');
    setShowProviderSelector(false);
  };

  // Handle purchase
  const handlePurchase = async (packageId: string) => {
    if (!user?.id) return;
    
    setSelectedPackage(packageId);
    setIsPurchasing(true);
    setPurchaseError(null);

    try {
      const response = await apiService.createGeoPayment(user.id, {
        packageId: packageId as 'starter' | 'intermediate' | 'professional',
        provider: selectedProvider,
      });

      if (response.status === 'success' && response.data?.redirectUrl) {
        // Redirect to payment provider
        window.location.href = response.data.redirectUrl;
      } else {
        throw new Error('Failed to create payment');
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      setPurchaseError(error.message || t('billing.paymentFailed'));
    } finally {
      setIsPurchasing(false);
      setSelectedPackage(null);
    }
  };

  // Determine which package is "popular" (middle one)
  const getPopularPackageId = () => {
    if (packages.length >= 3) return packages[2].id; // Professional (highest)
    if (packages.length === 2) return packages[1].id;
    return packages[0]?.id;
  };

  const isPopular = (pkgId: string) => pkgId === getPopularPackageId();

  return (
    <DefaultLayout className="bg-zinc-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="space-y-8">
          
          {/* Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">
              {t('creditsPage.billing.pageTitle', 'Credits & Billing')}
            </h1>
            <p className="text-zinc-500 mt-2">
              {t('creditsPage.billing.pageSubtitle', 'Manage your credits and purchase more interviews')}
            </p>
          </div>

          {/* Error Messages */}
          {(walletError || packagesError || purchaseError) && (
            <div className="bg-white border border-red-200 rounded-xl p-4 text-red-700">
              {walletError || packagesError || purchaseError}
              <button
                onClick={() => {
                  setPurchaseError(null);
                  refreshBalance();
                  fetchPackages();
                }}
                className="ml-2 underline hover:no-underline"
              >
                {t('billing.retry')}
              </button>
            </div>
          )}

          {/* Balance Card */}
          <div className="bg-zinc-900 rounded-2xl p-6 sm:p-8 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-zinc-400 text-sm font-medium">
                  {t('creditsPage.billing.currentBalance', 'Current Balance')}
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  {isLoadingBalance ? (
                    <span className="text-2xl text-zinc-400">{t('billing.loading')}</span>
                  ) : (
                    <>
                      <span className="text-4xl sm:text-5xl font-bold">{balance ?? 0}</span>
                      <span className="text-zinc-400 text-lg">
                        {t('creditsPage.billing.credits', 'credits')}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-zinc-500 text-sm mt-2">
                  {t('creditsPage.billing.creditsNeverExpire', 'Credits never expire')}
                </p>
              </div>
              <button
                onClick={() => refreshBalance()}
                disabled={isLoadingBalance}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isLoadingBalance ? t('billing.refreshing') : t('billing.refresh')}
              </button>
            </div>
          </div>

          {/* Payment Provider Selector */}
          <div className="bg-white border border-zinc-200 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="font-semibold text-zinc-900">{t('billing.paymentMethod')}</h3>
                <p className="text-sm text-zinc-500 mt-1">
                  {selectedProvider === detectedProvider 
                    ? t('billing.recommendedForRegion') 
                    : t('billing.manuallySelected')}
                </p>
              </div>
              
              {showProviderSelector ? (
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => handleSelectProvider('paypal')}
                    className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                      selectedProvider === 'paypal'
                        ? 'border-purple-600 bg-purple-50 text-purple-600'
                        : 'border-zinc-200 hover:border-zinc-300 text-zinc-700'
                    }`}
                  >
                    PayPal
                  </button>
                  <button
                    onClick={() => handleSelectProvider('mercadopago')}
                    className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                      selectedProvider === 'mercadopago'
                        ? 'border-purple-600 bg-purple-50 text-purple-600'
                        : 'border-zinc-200 hover:border-zinc-300 text-zinc-700'
                    }`}
                  >
                    Mercado Pago
                  </button>
                  <button
                    onClick={() => setShowProviderSelector(false)}
                    className="px-4 py-2 text-zinc-500 hover:text-zinc-700"
                  >
                    {t('billing.cancel')}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="px-4 py-2 bg-zinc-100 rounded-lg font-medium text-zinc-900">
                    {providerName}
                  </span>
                  <button
                    onClick={() => setShowProviderSelector(true)}
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    {t('billing.change')}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Credit Packages */}
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">
              {t('creditsPage.billing.buyCredits', 'Buy Credits')}
            </h2>
            
            {isLoadingPackages ? (
              <div className="grid md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl border border-zinc-200 p-6 animate-pulse">
                    <div className="h-6 bg-zinc-200 rounded w-1/2 mb-4" />
                    <div className="h-10 bg-zinc-200 rounded w-2/3 mb-4" />
                    <div className="h-4 bg-zinc-200 rounded w-full mb-2" />
                    <div className="h-4 bg-zinc-200 rounded w-3/4" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-4">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`relative bg-white rounded-xl border-2 transition-all ${
                      isPopular(pkg.id)
                        ? 'border-purple-600 shadow-lg'
                        : 'border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    {isPopular(pkg.id) && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                          {t('billing.bestValue')}
                        </span>
                      </div>
                    )}

                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-zinc-900">{pkg.name}</h3>
                      <p className="text-sm text-zinc-500 mt-1">{pkg.description}</p>

                      <div className="mt-4">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-zinc-900">
                            {formatCurrency(pkg.price, pkg.currency)}
                          </span>
                        </div>
                        {pkg.currency !== 'USD' && (
                          <p className="text-xs text-zinc-400 mt-1">
                            ≈ {formatCurrency(pkg.priceUSD, 'USD')}
                          </p>
                        )}
                        <p className="text-sm text-zinc-500 mt-2">
                          {t('billing.interviewCredits', { count: pkg.credits })}
                        </p>
                      </div>

                      <ul className="mt-4 space-y-2">
                        <li className="flex items-center gap-2 text-sm text-zinc-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0" />
                          {t('billing.practiceInterviews', { count: pkg.credits })}
                        </li>
                        <li className="flex items-center gap-2 text-sm text-zinc-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0" />
                          {t('billing.aiFeedback')}
                        </li>
                        <li className="flex items-center gap-2 text-sm text-zinc-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0" />
                          {t('billing.performanceAnalytics')}
                        </li>
                      </ul>

                      <button
                        onClick={() => handlePurchase(pkg.id)}
                        disabled={isPurchasing}
                        className={`w-full mt-6 py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          isPopular(pkg.id)
                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                            : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200'
                        }`}
                      >
                        {isPurchasing && selectedPackage === pkg.id
                          ? t('billing.processing')
                          : t('billing.buyNow')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="text-center text-sm text-zinc-500 mt-4">
              {t('billing.securePaymentVia')}{' '}
              <span className="font-medium text-zinc-700">{providerName}</span>
            </p>
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-xl border border-zinc-200">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900">
                  {t('creditsPage.billing.transactionHistory', 'Transaction History')}
                </h2>
                <p className="text-sm text-zinc-500 mt-1">
                  {t('creditsPage.billing.yourPurchasesAndUsage', 'Your purchases and usage')}
                </p>
              </div>
              {isLoadingHistory && (
                <span className="text-sm text-zinc-400">{t('billing.loading')}</span>
              )}
            </div>

            <div className="divide-y divide-zinc-100">
              {transactions.length === 0 && !isLoadingHistory ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl text-zinc-300">—</span>
                  </div>
                  <p className="text-zinc-500">
                    {t('creditsPage.billing.noTransactions', 'No transactions yet')}
                  </p>
                </div>
              ) : (
                transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 hover:bg-zinc-50"
                  >
                    <div className="flex items-center gap-4">
                      {getTransactionIndicator(transaction.type)}
                      <div>
                        <p className="font-medium text-zinc-900">{transaction.description}</p>
                        <p className="text-sm text-zinc-500">{formatDate(transaction.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          transaction.amount > 0 ? 'text-zinc-900' : 'text-zinc-500'
                        }`}
                      >
                        {transaction.amount > 0 ? '+' : ''}
                        {transaction.amount} {t('billing.credits')}
                      </p>
                      <p className="text-sm text-zinc-400">
                        {t('billing.balance')}: {transaction.balanceAfter}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Load More */}
            {pagination?.hasMore && (
              <div className="p-4 border-t border-zinc-100">
                <button
                  onClick={loadMoreHistory}
                  disabled={isLoadingHistory}
                  className="w-full py-2 px-4 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isLoadingHistory ? t('billing.loading') : t('billing.loadMore')}
                </button>
              </div>
            )}
          </div>

          {/* Help Section */}
          <div className="bg-zinc-100 rounded-xl p-6 text-center">
            <h3 className="font-semibold text-zinc-900">
              {t('billing.needHelp')}
            </h3>
            <p className="text-sm text-zinc-600 mt-1">
              {t('billing.contactUsAt')}{' '}
              <a href="mailto:support@vocaid.com" className="text-purple-600 hover:underline">
                support@vocaid.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
