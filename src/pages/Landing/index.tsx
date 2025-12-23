'use client'

import React, { useState } from 'react'
import { Helmet } from 'react-helmet'
import {
  LandingHeader,
  Hero,
  PlatformShowcase,
  LandingFeatureGrid,
  DashboardPreviewTabs,
  Integrations,
  PricingCards,
  FAQAccordion,
  DemoModal,
  FinalCTA,
} from 'components/landing'
import { FREE_TRIAL_CREDITS } from 'config/credits'

export const Landing: React.FC = () => {
  const [demoModalOpen, setDemoModalOpen] = useState(false)

  const handleDemoClick = () => {
    setDemoModalOpen(true)
  }

  const creditsText = FREE_TRIAL_CREDITS === 1 ? '1 Free Credit' : `${FREE_TRIAL_CREDITS} Free Credits`

  return (
    <>
      <Helmet>
        <title>Vocaid - AI Interview Practice, Recruiting & HR Hub | {creditsText}</title>
        <meta
          name="description"
          content={`Three platforms, one mission: turn interviews into measurable progress. Practice interviews with AI, evaluate candidates consistently, and empower employees. Start free with ${FREE_TRIAL_CREDITS} credit${FREE_TRIAL_CREDITS !== 1 ? 's' : ''}.`}
        />
        <meta
          name="keywords"
          content="AI interviews, interview practice, mock interviews, hiring platform, HR automation, employee service, recruiting, talent acquisition, career coaching"
        />
        <meta property="og:title" content="Vocaid - AI Interview Practice & Recruiting Platform" />
        <meta
          property="og:description"
          content={`Practice interviews with AI, evaluate candidates consistently, and empower employees. Start free with ${FREE_TRIAL_CREDITS} credit${FREE_TRIAL_CREDITS !== 1 ? 's' : ''}.`}
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Vocaid - AI Interview Practice & Recruiting Platform" />
        <meta
          name="twitter:description"
          content={`Practice interviews with AI, evaluate candidates consistently, and empower employees. Start free with ${FREE_TRIAL_CREDITS} credit${FREE_TRIAL_CREDITS !== 1 ? 's' : ''}.`}
        />
      </Helmet>

      <div className="min-h-screen bg-white">
        <LandingHeader onDemoClick={handleDemoClick} />
        
        <main>
          <Hero onDemoClick={handleDemoClick} />
          <PlatformShowcase />
          <LandingFeatureGrid />
          <DashboardPreviewTabs />
          <Integrations />
          <PricingCards onDemoClick={handleDemoClick} />
          <FAQAccordion />
          <FinalCTA onDemoClick={handleDemoClick} />
        </main>
        
        <DemoModal open={demoModalOpen} onOpenChange={setDemoModalOpen} />
      </div>
    </>
  )
}

export default Landing
