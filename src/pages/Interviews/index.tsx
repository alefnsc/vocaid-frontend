'use client';

/**
 * Interviews Page
 * 
 * Displays the user's interview history with navigation to start new interviews.
 * Shows recent interviews with score badges, dates, and duration.
 * 
 * @module pages/Interviews
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUser } from '@clerk/clerk-react';
import { DefaultLayout } from 'components/default-layout';
import { useDashboardData } from 'hooks/use-dashboard-data';
import { useAuthCheck } from 'hooks/use-auth-check';
import Loading from 'components/loading';
import PurpleButton from 'components/ui/purple-button';
import InterviewReady from 'components/interview-ready';
import { Plus, ChevronRight, MessageSquare, Calendar, Clock, Briefcase, Coins } from 'lucide-react';

// ========================================
// HELPER COMPONENTS
// ========================================

const ScoreBadge: React.FC<{ score: number | null }> = ({ score }) => {
  if (score === null) {
    return (
      <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-zinc-100 text-zinc-600">
        N/A
      </span>
    );
  }
  
  let badgeClass = 'bg-red-100 text-red-700';
  if (score >= 80) badgeClass = 'bg-emerald-100 text-emerald-700';
  else if (score >= 60) badgeClass = 'bg-blue-100 text-blue-700';
  else if (score >= 40) badgeClass = 'bg-amber-100 text-amber-700';
  
  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${badgeClass}`}>
      {score}%
    </span>
  );
};

// Check if interview was completed recently (within last 24 hours)
const isRecentInterview = (createdAt: string): boolean => {
  const interviewDate = new Date(createdAt);
  const now = new Date();
  const hoursDiff = (now.getTime() - interviewDate.getTime()) / (1000 * 60 * 60);
  return hoursDiff <= 24;
};

// ========================================
// INTERVIEWS PAGE COMPONENT
// ========================================

export default function Interviews() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, isSignedIn, isLoaded } = useUser();
  
  // Use shared dashboard data hook (with caching)
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useDashboardData(20); // Get more interviews
  const { interviews } = dashboardData;
  
  // Get user credits
  const { userCredits } = useAuthCheck();
  
  // Check if user has any recent interviews (for pulse indicator)
  const hasRecentInterview = interviews.some(interview => isRecentInterview(interview.createdAt));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Redirect to home if not signed in
  if (isLoaded && !isSignedIn) {
    navigate('/');
    return null;
  }

  if (!isLoaded || dashboardLoading) {
    return (
      <DefaultLayout className="flex flex-col overflow-hidden bg-white">
        <div className="flex-1 flex items-center justify-center">
          <Loading />
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout className="flex flex-col overflow-hidden bg-white" hasRecentInterview={hasRecentInterview}>
      <div className="page-container py-6 sm:py-8">
        {/* Header with Start Interview Button */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 sm:mb-8">
          {/* Left Column - Page Title */}
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">
              {t('interviews.title')}
            </h1>
            <p className="text-zinc-600 mt-1">
              {t('interviews.subtitle')}
            </p>
          </div>

          {/* Right Column - CTA or No Credits Banner */}
          {(userCredits !== null && userCredits > 0) ? (
            <PurpleButton
              variant="primary"
              size="lg"
              onClick={() => navigate('/interview-setup')}
              className="w-full sm:w-auto"
            >
              <Plus className="w-5 h-5" />
              {t('interviews.startNew')}
              <ChevronRight className="w-4 h-4" />
            </PurpleButton>
          ) : (
            <div className="flex items-center gap-3 px-4 py-3 bg-purple-50 border border-purple-200 rounded-xl">
              <div className="p-2 bg-purple-100 rounded-full">
                <Coins className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-900">{t('credits.outOfCredits')}</p>
                <p className="text-xs text-zinc-600">{t('credits.purchaseToContinue')}</p>
              </div>
              <PurpleButton
                variant="primary"
                size="sm"
                onClick={() => navigate('/credits')}
              >
                {t('credits.buyCredits')}
              </PurpleButton>
            </div>
          )}
        </div>

        {/* Interview List */}
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
          {interviews.length === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-purple-50 flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 mb-2">{t('interviews.noInterviewsTitle')}</h3>
              <p className="text-zinc-500 mb-6 max-w-md mx-auto">
                {t('interviews.noInterviewsDescription')}
              </p>
              <PurpleButton
                variant="primary"
                onClick={() => navigate('/interview-setup')}
              >
                <Plus className="w-4 h-4" />
                {t('interviews.startFirst')}
              </PurpleButton>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {/* Table Header - Desktop */}
              <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-6 py-3 bg-zinc-50 text-xs font-medium uppercase tracking-wider text-zinc-500">
                <div className="col-span-4">{t('interviews.positionAndCompany')}</div>
                <div className="col-span-3">{t('interviews.date')}</div>
                <div className="col-span-2">{t('interviews.duration')}</div>
                <div className="col-span-2">{t('interviews.score')}</div>
                <div className="col-span-1"></div>
              </div>

              {/* Interview Items */}
              {interviews.map((interview) => (
                <div
                  key={interview.id}
                  className="group flex flex-col lg:grid lg:grid-cols-12 gap-2 lg:gap-4 p-4 lg:px-6 lg:py-4 cursor-pointer hover:bg-zinc-50 transition-colors"
                  onClick={() => navigate(`/interview/${interview.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/interview/${interview.id}`)}
                >
                  {/* Position & Company */}
                  <div className="lg:col-span-4 flex items-start gap-3">
                    <div className="hidden lg:flex w-10 h-10 rounded-lg bg-purple-50 items-center justify-center flex-shrink-0">
                      <Briefcase className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-zinc-900 truncate">
                        {interview.jobTitle || interview.position}
                      </p>
                      <p className="text-sm text-zinc-500 truncate">
                        {interview.companyName || interview.company}
                      </p>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="lg:col-span-3 flex items-center gap-2 text-sm text-zinc-600">
                    <Calendar className="w-4 h-4 text-zinc-400 lg:hidden" />
                    <span>{formatDate(interview.createdAt)}</span>
                    {isRecentInterview(interview.createdAt) && (
                      <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-purple-100 text-purple-700">
                        {t('interviews.new')}
                      </span>
                    )}
                  </div>

                  {/* Duration */}
                  <div className="lg:col-span-2 flex items-center gap-2 text-sm text-zinc-600">
                    <Clock className="w-4 h-4 text-zinc-400 lg:hidden" />
                    <span>
                      {interview.callDuration 
                        ? Math.floor(interview.callDuration / 1000 / 60) 
                        : interview.duration || 0} min
                    </span>
                  </div>

                  {/* Score */}
                  <div className="lg:col-span-2 flex items-center">
                    <ScoreBadge score={interview.score ?? interview.overallScore} />
                  </div>

                  {/* Arrow */}
                  <div className="lg:col-span-1 flex items-center justify-end">
                    <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-purple-600 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Interview Ready CTA Section */}
        {(userCredits !== null && userCredits > 0) && (
          <div className="mt-6 sm:mt-8">
            <InterviewReady />
          </div>
        )}
      </div>
    </DefaultLayout>
  );
}
