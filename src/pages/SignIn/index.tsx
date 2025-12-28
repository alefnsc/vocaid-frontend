/**
 * Sign-In Page
 * 
 * Premium sign-in page using AuthShell layout and headless Clerk components.
 * 
 * @module pages/SignIn
 */

'use client';

import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import { AuthShell, CustomSignIn } from 'components/auth';
import { B2C_ROUTES } from 'routes/b2cRoutes';

const SignIn: React.FC = () => {
  const { isSignedIn, isLoaded } = useUser();

  // Redirect if already signed in
  if (isLoaded && isSignedIn) {
    return <Navigate to={B2C_ROUTES.DASHBOARD} replace />;
  }

  return (
    <AuthShell>
      <CustomSignIn />
    </AuthShell>
  );
};

export default SignIn;
