'use client';

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loading from 'components/loading';

/**
 * Legacy Interview Setup Page - Redirects to new unified B2C Interview Setup
 * 
 * This page now redirects all traffic to /app/b2c/interview/new
 * which contains the unified interview setup experience with:
 * - Role/job title selection
 * - Seniority level
 * - Job description
 * - Language selection (7 languages)
 * - Country selection
 * - Resume selection from library
 * 
 * @deprecated Use /app/b2c/interview/new instead
 */
const InterviewSetup: React.FC = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to the new unified interview setup page
    navigate('/app/b2c/interview/new', { replace: true });
  }, [navigate]);
  
  // Show loading while redirecting
  return <Loading />;
};

export default InterviewSetup;
