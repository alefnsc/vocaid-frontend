/**
 * Sign-Up Page
 * 
 * Custom sign-up page using headless Clerk components.
 * 
 * @module pages/SignUp
 */

'use client';

import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { Navigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CustomSignUp } from 'components/auth';
import { BrandMark, CopyrightNotice } from 'components/shared/Brand';

const SignUp: React.FC = () => {
  const { isSignedIn, isLoaded } = useUser();
  const { t } = useTranslation();

  // Redirect if already signed in
  if (isLoaded && isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Header */}
      <header className="py-6 px-4 lg:px-8">
        <Link to="/" aria-label="Vocaid Home">
          <BrandMark size="md" />
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <CustomSignUp showTrustBar />
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 text-center">
        <CopyrightNotice />
      </footer>
    </div>
  );
};

export default SignUp;
