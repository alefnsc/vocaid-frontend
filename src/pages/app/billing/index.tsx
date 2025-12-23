/**
 * Billing Page
 * 
 * Credit management and purchasing via Mercado Pago
 * Features:
 * - Current credit balance
 * - Credit pack selection
 * - Purchase history
 * - Transaction ledger
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import {
  CreditCard,
  Zap,
  Star,
  Check,
  Clock,
  ArrowRight,
  Receipt,
  Loader2,
} from 'lucide-react';

// Credit Pack Configuration
const CREDIT_PACKS = [
  {
    id: 'starter',
    name: 'Starter',
    credits: 5,
    price: 29.90,
    currency: 'BRL',
    popular: false,
    description: 'Perfect for trying out',
  },
  {
    id: 'pro',
    name: 'Pro',
    credits: 15,
    price: 69.90,
    currency: 'BRL',
    popular: true,
    description: 'Best value for regular practice',
    savings: '22%',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    credits: 50,
    price: 199.90,
    currency: 'BRL',
    popular: false,
    description: 'For serious preparation',
    savings: '33%',
  },
];

// Mock data - will be replaced with API calls
const MOCK_BALANCE = 3;
const MOCK_TRANSACTIONS = [
  {
    id: '1',
    type: 'GRANT_TRIAL',
    amount: 3,
    description: 'Welcome credits',
    date: '2024-01-01T10:00:00Z',
    balance: 3,
  },
  {
    id: '2',
    type: 'DEBIT_INTERVIEW',
    amount: -1,
    description: 'Practice interview - Software Engineer',
    date: '2024-01-05T14:30:00Z',
    balance: 2,
  },
  {
    id: '3',
    type: 'PURCHASE',
    amount: 5,
    description: 'Starter pack purchase',
    date: '2024-01-10T09:15:00Z',
    balance: 7,
  },
  {
    id: '4',
    type: 'DEBIT_INTERVIEW',
    amount: -1,
    description: 'Practice interview - Product Manager',
    date: '2024-01-12T16:00:00Z',
    balance: 6,
  },
];

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

function formatCurrency(amount: number, currency: string = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
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

function getTransactionIcon(type: string) {
  switch (type) {
    case 'GRANT_TRIAL':
      return <Star className="h-4 w-4 text-purple-600" />;
    case 'PURCHASE':
      return <CreditCard className="h-4 w-4 text-green-600" />;
    case 'DEBIT_INTERVIEW':
      return <Zap className="h-4 w-4 text-orange-600" />;
    default:
      return <Receipt className="h-4 w-4 text-gray-600" />;
  }
}

export default function BillingPage() {
  const { user } = useUser();
  const { t } = useTranslation();
  const [selectedPack, setSelectedPack] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handlePurchase = async (packId: string) => {
    setSelectedPack(packId);
    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/billing/mp/create-preference', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ packId }),
      // });
      // const { initPoint } = await response.json();
      // window.location.href = initPoint;

      // For now, just simulate loading
      await new Promise((resolve) => setTimeout(resolve, 2000));
      alert(`Mercado Pago integration coming soon!\n\nSelected pack: ${packId}`);
    } catch (error) {
      console.error('Purchase error:', error);
    } finally {
      setIsLoading(false);
      setSelectedPack(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants}>
            <h1 className="text-2xl font-bold text-gray-900">{t('creditsPage.billing.pageTitle')}</h1>
            <p className="text-gray-600 mt-1">
              {t('creditsPage.billing.pageSubtitle')}
            </p>
          </motion.div>

          {/* Balance Card */}
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-6 text-white"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-purple-200 text-sm font-medium">{t('creditsPage.billing.currentBalance')}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-bold">{MOCK_BALANCE}</span>
                  <span className="text-purple-200">{t('creditsPage.billing.credits')}</span>
                </div>
                <p className="text-purple-200 text-sm mt-2">
                  {t('creditsPage.billing.creditsPerInterview')}
                </p>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                <Clock className="h-5 w-5 text-purple-200" />
                <span className="text-sm">{t('creditsPage.billing.creditsNeverExpire')}</span>
              </div>
            </div>
          </motion.div>

          {/* Credit Packs */}
          <motion.div variants={itemVariants}>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('creditsPage.billing.buyCredits')}</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {CREDIT_PACKS.map((pack) => (
                <div
                  key={pack.id}
                  className={`relative bg-white rounded-xl border-2 transition-all ${
                    pack.popular
                      ? 'border-purple-600 shadow-lg'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  {pack.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        {t('creditsPage.billing.mostPopular')}
                      </span>
                    </div>
                  )}

                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900">{pack.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{pack.description}</p>

                    <div className="mt-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-gray-900">
                          {formatCurrency(pack.price)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {t('creditsPage.billing.creditsCount', { count: pack.credits })}
                        {pack.savings && (
                          <span className="ml-2 text-green-600 font-medium">
                            {t('creditsPage.billing.save', { amount: pack.savings })}
                          </span>
                        )}
                      </p>
                    </div>

                    <ul className="mt-4 space-y-2">
                      <li className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="h-4 w-4 text-green-600" />
                        {t('creditsPage.billing.practiceInterviews', { count: pack.credits })}
                      </li>
                      <li className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="h-4 w-4 text-green-600" />
                        {t('creditsPage.billing.fullScorecard')}
                      </li>
                      <li className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="h-4 w-4 text-green-600" />
                        {t('creditsPage.billing.performanceAnalytics')}
                      </li>
                    </ul>

                    <button
                      onClick={() => handlePurchase(pack.id)}
                      disabled={isLoading && selectedPack === pack.id}
                      className={`w-full mt-6 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors ${
                        pack.popular
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isLoading && selectedPack === pack.id ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          {t('creditsPage.billing.processing')}
                        </>
                      ) : (
                        <>
                          {t('creditsPage.billing.buyNow')}
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center text-sm text-gray-500 mt-4">
              {t('creditsPage.billing.securePaymentVia')}{' '}
              <span className="font-medium text-[#009ee3]">Mercado Pago</span>
            </p>
          </motion.div>

          {/* Transaction History */}
          <motion.div variants={itemVariants} className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{t('creditsPage.billing.transactionHistory')}</h2>
              <p className="text-sm text-gray-500 mt-1">
                {t('creditsPage.billing.yourPurchasesAndUsage')}
              </p>
            </div>

            <div className="divide-y divide-gray-100">
              {MOCK_TRANSACTIONS.length === 0 ? (
                <div className="p-8 text-center">
                  <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">{t('creditsPage.billing.noTransactions')}</p>
                </div>
              ) : (
                MOCK_TRANSACTIONS.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          transaction.amount > 0 ? 'text-green-600' : 'text-gray-900'
                        }`}
                      >
                        {transaction.amount > 0 ? '+' : ''}
                        {t('creditsPage.billing.creditsCount', { count: transaction.amount })}
                      </p>
                      <p className="text-sm text-gray-500">{t('creditsPage.billing.balance')}: {transaction.balance}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Help Section */}
          <motion.div
            variants={itemVariants}
            className="bg-gray-100 rounded-xl p-6 text-center"
          >
            <h3 className="font-semibold text-gray-900">{t('creditsPage.billing.needHelp')}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {t('creditsPage.billing.contactSupport')}{' '}
              <a href="mailto:support@vocaid.com" className="text-purple-600 hover:underline">
                support@vocaid.com
              </a>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
