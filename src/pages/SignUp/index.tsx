/**
 * Sign-Up Page
 * 
 * Premium sign-up page using AuthShell layout and headless Clerk components.
 * 
 * @module pages/SignUp
 */

'use client';

import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import { AuthShell, CustomSignUp } from 'components/auth';
import { B2C_ROUTES } from 'routes/b2cRoutes';

const SignUp: React.FC = () => {
  const { isSignedIn, isLoaded } = useUser();

  // Redirect if already signed in
  if (isLoaded && isSignedIn) {
    return <Navigate to={B2C_ROUTES.DASHBOARD} replace />;
  }

  return (
    <AuthShell>
      <CustomSignUp showFeaturePills />
    </AuthShell>
  );
};

export default SignUp;
