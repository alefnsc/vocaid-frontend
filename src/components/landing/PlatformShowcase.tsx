/**
 * Platform Showcase Component
 * 
 * Displays the three Vocaid platforms with animated mock dashboard previews:
 * - B2C: Interview Practice & Performance
 * - B2B: Recruiter Interview Platform  
 * - HR: Employee Hub
 */

'use client'

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion } from 'framer-motion'
import {
  User,
  Building2,
  Users,
  PlayCircle,
  FileText,
  TrendingUp,
  Package,
  BarChart3,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from 'components/ui/button'
import { FEATURES } from 'config/features'
import { EarlyAccessModal, type ModuleInterest } from './EarlyAccessModal'
import {
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts'

// Mock data for charts
const MOCK_PERFORMANCE_DATA = [
  { week: 'W1', score: 65 },
  { week: 'W2', score: 72 },
  { week: 'W3', score: 68 },
  { week: 'W4', score: 78 },
  { week: 'W5', score: 82 },
]

const MOCK_SKILLS_DATA = [
  { skill: 'Communication', value: 85 },
  { skill: 'Technical', value: 72 },
  { skill: 'Problem Solving', value: 78 },
  { skill: 'Leadership', value: 65 },
  { skill: 'Culture Fit', value: 88 },
]

const MOCK_CANDIDATES = [
  { name: 'Sarah Chen', role: 'Software Engineer', score: 92, status: 'Recommended' },
  { name: 'Marcus Johnson', role: 'Product Manager', score: 78, status: 'Under Review' },
  { name: 'Ana Silva', role: 'Data Analyst', score: 85, status: 'Recommended' },
]

const MOCK_HR_QUERIES = [
  { question: 'How do I request PTO?', answered: true },
  { question: 'What are the health benefits?', answered: true },
  { question: 'Remote work policy', answered: true },
]

export const PlatformShowcase: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const prefersReducedMotion = useReducedMotion()
  
  // Early access modal state
  const [earlyAccessOpen, setEarlyAccessOpen] = useState(false)
  const [preselectedModule, setPreselectedModule] = useState<ModuleInterest | undefined>()

  const openEarlyAccess = (module: ModuleInterest) => {
    setPreselectedModule(module)
    setEarlyAccessOpen(true)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReducedMotion ? 0.2 : 0.6, ease: 'easeOut' },
    },
  }

  return (
    <section className="py-24 bg-zinc-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1 text-xs font-semibold text-purple-700 bg-purple-100 rounded-full mb-4">
            {t('landing.platformShowcase.badge')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
            {t('landing.platformShowcase.title')}
          </h2>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
            {t('landing.platformShowcase.subtitle')}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid lg:grid-cols-3 gap-8"
        >
          {/* B2C: Interview Practice - First on mobile, Center on desktop */}
          <motion.div
            variants={itemVariants}
            className="order-first lg:order-2 bg-white rounded-2xl shadow-lg border border-zinc-200 overflow-hidden group hover:shadow-xl transition-shadow lg:scale-105 ring-2 ring-purple-600"
          >
            <div className="bg-purple-600 text-white text-center py-1 text-xs font-semibold">
              {t('landing.platformShowcase.mostPopular')}
            </div>
            <div className="p-6 border-b border-zinc-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <User className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500">{t('landing.platformShowcase.b2c.forLabel')}</p>
                  <h3 className="font-bold text-zinc-900">{t('landing.platformShowcase.b2c.title')}</h3>
                </div>
              </div>
              <p className="text-zinc-600 text-sm">
                {t('landing.platformShowcase.b2c.description')}
              </p>
            </div>

            {/* Mock Dashboard Preview */}
            <div className="p-4 bg-zinc-50">
              <div className="bg-white rounded-xl border border-zinc-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-zinc-500">{t('landing.platformShowcase.b2c.performanceTrend')}</span>
                  <span className="text-xs text-purple-600 font-medium">{t('landing.platformShowcase.b2c.improvement')}</span>
                </div>
                <div className="h-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={MOCK_PERFORMANCE_DATA}>
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#7c3aed"
                        strokeWidth={2}
                        dot={{ fill: '#7c3aed', r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-zinc-100">
                  <div className="text-center">
                    <p className="text-lg font-bold text-zinc-900">12</p>
                    <p className="text-xs text-zinc-500">{t('landing.platformShowcase.b2c.stats.interviews')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-zinc-900">82%</p>
                    <p className="text-xs text-zinc-500">{t('landing.platformShowcase.b2c.stats.avgScore')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-zinc-900">3</p>
                    <p className="text-xs text-zinc-500">{t('landing.platformShowcase.b2c.stats.resumes')}</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-3 flex gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg text-xs">
                  <PlayCircle className="h-4 w-4 text-purple-600" />
                  <span className="text-purple-700 font-medium">{t('landing.platformShowcase.b2c.actions.startPractice')}</span>
                </div>
                <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-zinc-100 rounded-lg text-xs">
                  <FileText className="h-4 w-4 text-zinc-500" />
                  <span className="text-zinc-600">{t('landing.platformShowcase.b2c.actions.uploadResume')}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-zinc-100">
              <Button
                size="sm"
                onClick={() => navigate('/sign-up')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                {t('landing.platformShowcase.b2c.cta')} <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </motion.div>

          {/* B2B: Recruiter Platform - Second on mobile, First on desktop */}
          <motion.div
            variants={itemVariants}
            className="order-2 lg:order-1 bg-white rounded-2xl shadow-lg border border-zinc-200 overflow-hidden group hover:shadow-xl transition-shadow"
          >
            <div className="bg-zinc-500 text-white text-center py-1 text-xs font-semibold">
              {t('features.comingSoon')}
            </div>
            <div className="p-6 border-b border-zinc-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Building2 className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500">{t('landing.platformShowcase.b2b.forLabel')}</p>
                  <h3 className="font-bold text-zinc-900">{t('landing.platformShowcase.b2b.title')}</h3>
                </div>
              </div>
              <p className="text-zinc-600 text-sm">
                {t('landing.platformShowcase.b2b.description')}
              </p>
            </div>

            {/* Mock Dashboard Preview */}
            <div className="p-4 bg-zinc-50">
              <div className="bg-white rounded-xl border border-zinc-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-zinc-500">{t('landing.platformShowcase.b2b.candidatePipeline')}</span>
                  <span className="text-xs text-purple-600 font-medium">{t('landing.platformShowcase.b2b.thisWeek')}</span>
                </div>

                {/* Candidate List */}
                <div className="space-y-2">
                  {MOCK_CANDIDATES.map((candidate, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-50 last:border-0">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-medium">
                          {candidate.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-zinc-900">{candidate.name}</p>
                          <p className="text-[10px] text-zinc-500">{candidate.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-zinc-900">{candidate.score}%</p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          candidate.status === 'Recommended' 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-zinc-100 text-zinc-600'
                        }`}>
                          {candidate.status === 'Recommended' ? t('landing.platformShowcase.b2b.recommended') : t('landing.platformShowcase.b2b.underReview')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-3 flex gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg text-xs">
                  <Package className="h-4 w-4 text-purple-600" />
                  <span className="text-purple-700 font-medium">{t('landing.platformShowcase.b2b.actions.interviewKits')}</span>
                </div>
                <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-zinc-100 rounded-lg text-xs">
                  <BarChart3 className="h-4 w-4 text-zinc-500" />
                  <span className="text-zinc-600">{t('landing.platformShowcase.b2b.actions.analytics')}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-zinc-100">
              <Button
                size="sm"
                variant="outline"
                onClick={() => openEarlyAccess('recruiter_platform')}
                className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                {t('landing.platformShowcase.b2b.cta')} <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </motion.div>

          {/* HR: Employee Hub - Third on both mobile and desktop */}
          <motion.div
            variants={itemVariants}
            className="order-3 lg:order-3 bg-white rounded-2xl shadow-lg border border-zinc-200 overflow-hidden group hover:shadow-xl transition-shadow"
          >
            <div className="bg-zinc-500 text-white text-center py-1 text-xs font-semibold">
              {t('features.comingSoon')}
            </div>
            <div className="p-6 border-b border-zinc-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500">{t('landing.platformShowcase.hr.forLabel')}</p>
                  <h3 className="font-bold text-zinc-900">{t('landing.platformShowcase.hr.title')}</h3>
                </div>
              </div>
              <p className="text-zinc-600 text-sm">
                {t('landing.platformShowcase.hr.description')}
              </p>
            </div>

            {/* Mock Dashboard Preview */}
            <div className="p-4 bg-zinc-50">
              <div className="bg-white rounded-xl border border-zinc-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-zinc-500">{t('landing.platformShowcase.hr.recentQueries')}</span>
                  <span className="text-xs text-purple-600 font-medium">{t('landing.platformShowcase.hr.resolved')}</span>
                </div>

                {/* Query List */}
                <div className="space-y-2">
                  {(t('landing.platformShowcase.hr.mockQueries', { returnObjects: true }) as string[]).map((query, i) => (
                    <div key={i} className="flex items-center gap-2 py-2 border-b border-zinc-50 last:border-0">
                      <CheckCircle2 className="h-4 w-4 text-purple-500" />
                      <span className="text-xs text-zinc-700">{query}</span>
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-zinc-100">
                  <div className="text-center">
                    <p className="text-lg font-bold text-zinc-900">847</p>
                    <p className="text-xs text-zinc-500">{t('landing.platformShowcase.hr.stats.ticketsDeflected')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-zinc-900">4.8s</p>
                    <p className="text-xs text-zinc-500">{t('landing.platformShowcase.hr.stats.avgResponse')}</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-3 flex gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg text-xs">
                  <MessageSquare className="h-4 w-4 text-purple-600" />
                  <span className="text-purple-700 font-medium">{t('landing.platformShowcase.hr.actions.askHR')}</span>
                </div>
                <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-zinc-100 rounded-lg text-xs">
                  <FileText className="h-4 w-4 text-zinc-500" />
                  <span className="text-zinc-600">{t('landing.platformShowcase.hr.actions.policies')}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-zinc-100">
              <Button
                size="sm"
                variant="outline"
                onClick={() => openEarlyAccess('employee_hub')}
                className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                {t('landing.platformShowcase.hr.cta')} <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Early Access Modal */}
      <EarlyAccessModal
        open={earlyAccessOpen}
        onOpenChange={setEarlyAccessOpen}
        preselectedModule={preselectedModule}
      />
    </section>
  )
}

export default PlatformShowcase
