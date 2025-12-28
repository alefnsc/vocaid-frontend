import React from 'react';
import { Outlet } from 'react-router-dom';
import 'styles/globals.css';
import Footer from 'components/footer';
import Metadata from 'components/metadata';
import ContactButton from 'components/contact-button';
import { BetaFeedbackFab } from 'components/beta-feedback';
import { isClosedBetaFeedbackEnabled } from 'config/featureFlags';

const Layout: React.FC = () => {
  const isBetaMode = isClosedBetaFeedbackEnabled();

  return (
    <div>
      <Metadata />
      <Outlet />
      <Footer />
      {/* Show either Beta Feedback FAB or original Contact button based on feature flag */}
      {isBetaMode ? <BetaFeedbackFab /> : <ContactButton />}
    </div>
  );
}

export default Layout;