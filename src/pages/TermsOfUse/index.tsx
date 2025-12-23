'use client'

import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { DefaultLayout } from 'components/default-layout'
import { ArrowLeft } from 'lucide-react'

export default function TermsOfUse() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <DefaultLayout className="bg-white">
      <div className="page-container py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 sm:mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <ArrowLeft onClick={() => navigate('/about')} className="w-5 h-5 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer" aria-label={t('common.goBack')} />
                <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">
                  {t('legal.terms.title')} <span className="text-purple-600">{t('legal.terms.titleHighlight')}</span>
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 bg-white border border-zinc-200 rounded-xl prose prose-zinc max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-zinc-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-zinc-600 mb-4">
              By accessing and using Vocaid's services, you accept and agree to be bound by the terms and
              provisions of this agreement. If you do not agree to abide by these terms, please do not
              use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-zinc-900 mb-4">2. Description of Service</h2>
            <p className="text-zinc-600 mb-4">
              Vocaid provides an AI-powered interview practice platform that allows users to simulate job
              interviews and receive personalized feedback. Our service includes:
            </p>
            <ul className="list-disc list-inside text-zinc-600 space-y-2 ml-4">
              <li>AI-driven interview simulations</li>
              <li>Personalized feedback and scoring</li>
              <li>Interview history and analytics</li>
              <li>Credit-based payment system</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-zinc-900 mb-4">3. User Accounts</h2>
            <p className="text-zinc-600 mb-4">
              To use our services, you must create an account. You are responsible for:
            </p>
            <ul className="list-disc list-inside text-zinc-600 space-y-2 ml-4">
              <li>Maintaining the confidentiality of your account</li>
              <li>All activities that occur under your account</li>
              <li>Providing accurate and complete information</li>
              <li>Notifying us of any unauthorized use</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-zinc-900 mb-4">4. Credits and Payments</h2>
            <p className="text-zinc-600 mb-4">
              Our service operates on a credit-based system:
            </p>
            <ul className="list-disc list-inside text-zinc-600 space-y-2 ml-4">
              <li>Credits are purchased in advance and are non-refundable</li>
              <li>One credit is consumed per interview session</li>
              <li>Credits do not expire</li>
              <li>Prices are subject to change with notice</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-zinc-900 mb-4">5. Acceptable Use</h2>
            <p className="text-zinc-600 mb-4">You agree not to:</p>
            <ul className="list-disc list-inside text-zinc-600 space-y-2 ml-4">
              <li>Use the service for any unlawful purpose</li>
              <li>Share your account credentials with others</li>
              <li>Attempt to reverse engineer or exploit the service</li>
              <li>Upload malicious content or harmful data</li>
              <li>Interfere with the proper functioning of the service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-zinc-900 mb-4">6. Intellectual Property</h2>
            <p className="text-zinc-600 mb-4">
              All content, features, and functionality of our service are owned by Vocaid and are protected
              by international copyright, trademark, and other intellectual property laws. You retain
              ownership of any data you upload, but grant us a license to use it for providing our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-zinc-900 mb-4">7. Disclaimer of Warranties</h2>
            <p className="text-zinc-600 mb-4">
              Our service is provided "as is" without warranties of any kind. We do not guarantee that:
            </p>
            <ul className="list-disc list-inside text-zinc-600 space-y-2 ml-4">
              <li>The service will be uninterrupted or error-free</li>
              <li>Interview practice will result in job offers</li>
              <li>AI feedback will be 100% accurate</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-zinc-900 mb-4">8. Limitation of Liability</h2>
            <p className="text-zinc-600 mb-4">
              Vocaid shall not be liable for any indirect, incidental, special, consequential, or punitive
              damages resulting from your use of or inability to use the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-zinc-900 mb-4">9. Changes to Terms</h2>
            <p className="text-zinc-600 mb-4">
              We reserve the right to modify these terms at any time. We will notify users of any material
              changes via email or through the service. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-zinc-900 mb-4">10. Contact Information</h2>
            <p className="text-zinc-600">
              For questions about these terms, please contact us at{' '}
              <a href="mailto:legal@vocaid.ai" className="text-purple-600 hover:underline">
                legal@vocaid.ai
              </a>
            </p>
          </section>
        </div>
      </div>
    </DefaultLayout>
  )
}
