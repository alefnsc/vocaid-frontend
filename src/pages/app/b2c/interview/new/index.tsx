/**
 * B2C Interview Setup Form
 * 
 * Allows candidates to configure their practice interview:
 * - Role/job title selection
 * - Optional company name
 * - Language selection
 * - Resume selection (optional)
 * 
 * Checks credit balance before allowing start.
 */

import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  PlayCircle,
  Briefcase,
  Building2,
  Globe,
  FileText,
  CreditCard,
  ChevronRight,
  AlertCircle,
  Loader2,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { FREE_TRIAL_CREDITS } from 'config/credits';

// Common job roles for quick selection
const COMMON_ROLES = [
  'Software Engineer',
  'Product Manager',
  'Data Analyst',
  'UX Designer',
  'Marketing Manager',
  'Sales Representative',
  'Project Manager',
  'Financial Analyst',
];

// Supported languages
const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

// Mock data - will be replaced with API calls
const MOCK_CREDITS = FREE_TRIAL_CREDITS;
const MOCK_RESUMES = [
  { id: '1', name: 'Software Engineer Resume.pdf', score: 85 },
  { id: '2', name: 'Product Manager Resume.pdf', score: 72 },
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

export default function B2CInterviewNew() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { t } = useTranslation();

  const [formData, setFormData] = React.useState({
    role: '',
    jobTitle: '',
    company: '',
    language: 'en',
    resumeId: '',
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const hasCredits = MOCK_CREDITS > 0;

  const handleRoleClick = (role: string) => {
    setFormData((prev) => ({ ...prev, role, jobTitle: role }));
    setErrors((prev) => ({ ...prev, role: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const newErrors: Record<string, string> = {};
    if (!formData.role && !formData.jobTitle) {
      newErrors.role = t('interviewSetup.roleSection.error');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!hasCredits) {
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/b2c/sessions', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });
      // const { session } = await response.json();

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Navigate to interview page
      navigate('/interview');
    } catch (error) {
      console.error('Failed to start interview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants}>
            <Link
              to="/app/b2c/dashboard"
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4"
            >
              {t('interviewSetup.backToDashboard')}
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{t('interviewSetup.title')}</h1>
            <p className="text-gray-600 mt-1">
              {t('interviewSetup.subtitle')}
            </p>
          </motion.div>

          {/* Credit Warning */}
          {!hasCredits && (
            <motion.div
              variants={itemVariants}
              className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
            >
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">{t('interviewSetup.noCredits.title')}</p>
                <p className="text-sm text-red-700 mt-1">
                  {t('interviewSetup.noCredits.description')}
                </p>
                <Link
                  to="/app/billing"
                  className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-red-700 hover:text-red-800"
                >
                  {t('interviewSetup.noCredits.buyCredits')} <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          )}

          {/* Credit Balance */}
          {hasCredits && (
            <motion.div
              variants={itemVariants}
              className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-purple-900">
                    {t('interviewSetup.creditsAvailable', { count: MOCK_CREDITS })}
                  </p>
                  <p className="text-sm text-purple-700">{t('interviewSetup.sessionCost')}</p>
                </div>
              </div>
              <CheckCircle2 className="h-5 w-5 text-purple-600" />
            </motion.div>
          )}

          {/* Form */}
          <motion.form
            variants={itemVariants}
            onSubmit={handleSubmit}
            className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100"
          >
            {/* Role Selection */}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="h-5 w-5 text-gray-500" />
                <label className="font-medium text-gray-900">
                  {t('interviewSetup.roleSection.label')}
                </label>
              </div>

              {/* Quick Select */}
              <div className="flex flex-wrap gap-2 mb-4">
                {COMMON_ROLES.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleRoleClick(role)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      formData.role === role
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>

              {/* Custom Input */}
              <input
                type="text"
                placeholder={t('interviewSetup.roleSection.placeholder')}
                value={formData.jobTitle || formData.role}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, role: '', jobTitle: e.target.value }));
                  setErrors((prev) => ({ ...prev, role: '' }));
                }}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.role ? 'border-red-300' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
              />
              {errors.role && (
                <p className="mt-2 text-sm text-red-600">{errors.role}</p>
              )}
            </div>

            {/* Company (Optional) */}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-5 w-5 text-gray-500" />
                <label className="font-medium text-gray-900">
                  {t('interviewSetup.companySection.label')}
                  <span className="text-gray-400 font-normal ml-2">{t('interviewSetup.companySection.optional')}</span>
                </label>
              </div>
              <input
                type="text"
                placeholder={t('interviewSetup.companySection.placeholder')}
                value={formData.company}
                onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="mt-2 text-sm text-gray-500 flex items-start gap-1">
                <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                {t('interviewSetup.companySection.hint')}
              </p>
            </div>

            {/* Language */}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="h-5 w-5 text-gray-500" />
                <label className="font-medium text-gray-900">{t('interviewSetup.languageSection.label')}</label>
              </div>
              <div className="flex gap-3">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, language: lang.code }))}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                      formData.language === lang.code
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <span className="font-medium text-gray-900">{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Resume Selection (Optional) */}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-gray-500" />
                <label className="font-medium text-gray-900">
                  {t('interviewSetup.resumeSection.label')}
                  <span className="text-gray-400 font-normal ml-2">{t('interviewSetup.resumeSection.optional')}</span>
                </label>
              </div>

              {MOCK_RESUMES.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">{t('interviewSetup.resumeSection.noResumes')}</p>
                  <Link
                    to="/app/b2c/resumes"
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    {t('interviewSetup.resumeSection.uploadResume')}
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, resumeId: '' }))}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-colors ${
                      !formData.resumeId
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-gray-700">{t('interviewSetup.resumeSection.noResumeOption')}</span>
                    {!formData.resumeId && <CheckCircle2 className="h-5 w-5 text-purple-600" />}
                  </button>

                  {MOCK_RESUMES.map((resume) => (
                    <button
                      key={resume.id}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, resumeId: resume.id }))}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-colors ${
                        formData.resumeId === resume.id
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-900">{resume.name}</span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          {t('interviewSetup.resumeSection.score', { score: resume.score })}
                        </span>
                      </div>
                      {formData.resumeId === resume.id && (
                        <CheckCircle2 className="h-5 w-5 text-purple-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="p-6">
              <button
                type="submit"
                disabled={isLoading || !hasCredits}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-purple-600 text-white rounded-xl font-semibold text-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {t('interviewSetup.submit.preparing')}
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-5 w-5" />
                    {t('interviewSetup.submit.start')}
                  </>
                )}
              </button>

              <p className="text-center text-sm text-gray-500 mt-4">
                {t('interviewSetup.submit.disclaimer')}
              </p>
            </div>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
}
