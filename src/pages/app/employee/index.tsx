/**
 * Employee Portal (B2B)
 * 
 * Placeholder page for B2B Employee users.
 * This portal will be used for internal employee development.
 * 
 * Coming soon - restricted to EMPLOYEE role only.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, Clock, ArrowRight } from 'lucide-react';

const EmployeePortal: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-8">
          <Building2 className="w-10 h-10 text-emerald-600" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {t('employeePortal.title', 'Employee Hub')}
        </h1>

        {/* Description */}
        <p className="text-lg text-gray-600 mb-8">
          {t('employeePortal.description', 'This hub is for internal employees. Develop your interview skills and prepare for career growth within your organization.')}
        </p>

        {/* Coming Soon Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full font-medium">
          <Clock className="w-4 h-4" />
          {t('common.comingSoon', 'Coming Soon')}
        </div>

        {/* Features Preview */}
        <div className="mt-12 grid gap-4 text-left">
          <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200">
            <ArrowRight className="w-5 h-5 text-emerald-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900">{t('employeePortal.feature1Title', 'Career Development')}</h3>
              <p className="text-sm text-gray-600">{t('employeePortal.feature1Desc', 'Practice interviews for internal promotions')}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200">
            <ArrowRight className="w-5 h-5 text-emerald-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900">{t('employeePortal.feature2Title', 'Team Assessments')}</h3>
              <p className="text-sm text-gray-600">{t('employeePortal.feature2Desc', 'Collaborate with managers on skill assessments')}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200">
            <ArrowRight className="w-5 h-5 text-emerald-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900">{t('employeePortal.feature3Title', 'Learning Resources')}</h3>
              <p className="text-sm text-gray-600">{t('employeePortal.feature3Desc', 'Access curated training for interview excellence')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeePortal;
