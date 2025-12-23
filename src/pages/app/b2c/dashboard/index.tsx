/**
 * B2C Dashboard - Interview Practice & Performance
 * 
 * Personal workspace for candidates to:
 * - View their credit balance
 * - Start new practice interviews
 * - See recent interview history
 * - Track performance trends
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  PlayCircle,
  FileText,
  TrendingUp,
  CreditCard,
  History,
  ChevronRight,
  Zap,
  Award,
  Target,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import { FREE_TRIAL_CREDITS } from 'config/credits'

// Mock data - will be replaced with real API calls
const MOCK_CREDITS = FREE_TRIAL_CREDITS;
const MOCK_INTERVIEWS = [
  { id: '1', role: 'Software Engineer', company: 'Practice', date: '2024-01-15', score: 78 },
  { id: '2', role: 'Product Manager', company: 'Practice', date: '2024-01-10', score: 82 },
  { id: '3', role: 'Data Analyst', company: 'Practice', date: '2024-01-05', score: 71 },
];
const MOCK_PERFORMANCE = [
  { date: 'Jan 1', score: 65 },
  { date: 'Jan 8', score: 71 },
  { date: 'Jan 15', score: 78 },
  { date: 'Jan 22', score: 75 },
  { date: 'Jan 29', score: 82 },
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

export default function B2CDashboard() {
  const { user } = useUser();
  const { t } = useTranslation();
  const firstName = user?.firstName || t('common.there');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t('dashboard.welcome', { name: firstName })}
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
                  <p className="text-2xl font-bold text-gray-900">{MOCK_CREDITS}</p>
                </div>
              </div>
              <Link
                to="/app/billing"
                className="mt-3 text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
              >
                {t('dashboard.lowCredits.buyMore')} <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Total Interviews */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <History className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('dashboard.stats.interviews')}</p>
                  <p className="text-2xl font-bold text-gray-900">{MOCK_INTERVIEWS.length}</p>
                </div>
              </div>
              <Link
                to="/app/b2c/interviews"
                className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                {t('dashboard.viewAll')} <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Average Score */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Target className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('dashboard.stats.avgScore')}</p>
                  <p className="text-2xl font-bold text-gray-900">77%</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-green-600 font-medium flex items-center gap-1">
                <TrendingUp className="h-4 w-4" /> +5% {t('dashboard.stats.thisMonth')}
              </p>
            </div>

            {/* Resumes */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FileText className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('dashboard.stats.resumes')}</p>
                  <p className="text-2xl font-bold text-gray-900">2</p>
                </div>
              </div>
              <Link
                to="/app/b2c/resumes"
                className="mt-3 text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
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
                  to="/app/b2c/insights"
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                >
                  View insights <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={MOCK_PERFORMANCE}>
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
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="p-2 bg-gray-200 rounded-lg">
                    <FileText className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{t('dashboard.quickActions.uploadResume')}</p>
                    <p className="text-sm text-gray-600">{t('dashboard.quickActions.uploadDesc')}</p>
                  </div>
                </Link>

                <Link
                  to="/app/b2c/insights"
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="p-2 bg-gray-200 rounded-lg">
                    <Award className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{t('dashboard.quickActions.viewInsights')}</p>
                    <p className="text-sm text-gray-600">{t('dashboard.quickActions.insightsDesc')}</p>
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

            {MOCK_INTERVIEWS.length === 0 ? (
              <div className="text-center py-12">
                <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">{t('dashboard.noInterviews')}</p>
                <p className="text-sm text-gray-400 mt-1">{t('dashboard.noInterviewsHint')}</p>
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
                    {MOCK_INTERVIEWS.map((interview) => (
                      <tr key={interview.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{interview.role}</td>
                        <td className="py-3 px-4 text-gray-600">{interview.company}</td>
                        <td className="py-3 px-4 text-gray-600">
                          {new Date(interview.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                              interview.score >= 80
                                ? 'bg-green-100 text-green-800'
                                : interview.score >= 60
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {interview.score}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                            {t('dashboard.viewAll')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

          {/* Credits CTA */}
          {MOCK_CREDITS <= 3 && (
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
                  to="/app/billing"
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
