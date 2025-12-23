/**
 * Clerk Native Sign-In Page (Debug/Test)
 * 
 * Uses Clerk's built-in SignIn component to test OAuth flow.
 * If this works but CustomSignIn doesn't, the issue is in our custom implementation.
 * If this also fails, the issue is with Clerk's development environment.
 * 
 * Access at: /sign-in-clerk
 */

'use client';

import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { useUser } from '@clerk/clerk-react';
import { Navigate, Link } from 'react-router-dom';
import { BrandMark, CopyrightNotice } from 'components/shared/Brand';

const SignInClerk: React.FC = () => {
  const { isSignedIn, isLoaded } = useUser();

  // Redirect if already signed in
  if (isLoaded && isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Header */}
      <header className="py-6 px-4 lg:px-8">
        <Link to="/" aria-label="Vocaid Home">
          <BrandMark size="lg" linkToHome={false} />
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <p className="text-sm text-zinc-500 text-center mb-4">
            Testing Clerk's native SignIn component
          </p>
          <SignIn 
            routing="path" 
            path="/sign-in-clerk"
            signUpUrl="/sign-up"
            fallbackRedirectUrl="/dashboard"
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 text-center">
        <CopyrightNotice />
        <p className="text-xs text-zinc-400 mt-2">
          <Link to="/sign-in" className="hover:text-purple-600">
            ← Back to custom sign-in
          </Link>
        </p>
      </footer>
    </div>
  );
};

export default SignInClerk;
