/**
 * Under Construction Page
 * 
 * Shown when users try to access disabled B2B features.
 * Provides a consistent experience with clear messaging.
 */

import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { BrandMark } from '../../components/shared/Brand';

export default function UnderConstruction() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const feature = searchParams.get('feature') || 'default';
  
  // Get feature info from translations, fallback to default
  const validFeatures = ['recruiter', 'hr', 'default'];
  const featureKey = validFeatures.includes(feature) ? feature : 'default';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <BrandMark size="xl" linkToHome />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-zinc-900 mb-2">
          {t('features.underConstruction.title')}
        </h1>

        {/* Feature Name */}
        <p className="text-lg text-purple-600 font-semibold mb-4">
          {t(`pages.underConstruction.featureInfo.${featureKey}.title`)}
        </p>

        {/* Description */}
        <p className="text-zinc-600 mb-8">
          {t(`pages.underConstruction.featureInfo.${featureKey}.description`)}
        </p>

        {/* Message */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6 mb-8">
          <p className="text-zinc-700">
            {t('features.underConstruction.message')}
          </p>
          <div className="mt-4 inline-block px-3 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">
            {t('features.nextRelease')}
          </div>
        </div>

        {/* CTAs */}
        <div className="space-y-3">
          <Link
            to="/app/b2c/dashboard"
            className="block w-full px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            {t('pages.underConstruction.goToDashboard')}
          </Link>
          <Link
            to="/"
            className="block w-full px-6 py-3 bg-zinc-100 text-zinc-900 font-medium rounded-lg hover:bg-zinc-200 transition-colors"
          >
            {t('pages.underConstruction.backToHome')}
          </Link>
        </div>

        {/* Help Text */}
        <p className="mt-8 text-sm text-zinc-500">
          {t('pages.underConstruction.haveQuestions')}{' '}
          <a href="mailto:support@vocaid.ai" className="text-purple-600 hover:underline">
            {t('pages.underConstruction.contactUs')}
          </a>
        </p>
      </motion.div>
    </div>
  );
}
