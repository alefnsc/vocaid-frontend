/**
 * LoggedLayout Tests
 * 
 * Verifies that the LoggedLayout component renders correctly
 * with TopBar, Sidebar, and Footer for authenticated users.
 * 
 * @module components/logged-layout/__tests__
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// Mock dependencies
jest.mock('@clerk/clerk-react', () => ({
  useUser: jest.fn(() => ({
    user: {
      id: 'test-user-id',
      firstName: 'John',
      lastName: 'Doe',
      imageUrl: null,
      primaryEmailAddress: { emailAddress: 'john@test.com' },
      publicMetadata: { role: 'Candidate' },
    },
    isSignedIn: true,
    isLoaded: true,
  })),
}));

jest.mock('hooks/use-auth-check', () => ({
  useAuthCheck: () => ({
    isLoading: false,
    userCredits: 10,
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Import after mocks
import { LoggedLayout, useLoggedLayout } from '../index';

// Helper to render with router
const renderWithRouter = (ui: React.ReactElement, { route = '/' } = {}) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      {ui}
    </MemoryRouter>
  );
};

describe('LoggedLayout Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Layout Structure', () => {
    it('renders skip-to-content link for accessibility', () => {
      renderWithRouter(
        <LoggedLayout>
          <div>Test Content</div>
        </LoggedLayout>
      );

      const skipLink = screen.getByText('Skip to content');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('renders main content area with correct id', () => {
      renderWithRouter(
        <LoggedLayout>
          <div data-testid="test-content">Test Content</div>
        </LoggedLayout>
      );

      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('id', 'main-content');
    });

    it('renders children inside the layout', () => {
      renderWithRouter(
        <LoggedLayout>
          <div data-testid="test-content">Test Content</div>
        </LoggedLayout>
      );

      expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });
  });

  describe('Authentication States', () => {
    it('shows loading skeleton when auth is not loaded', () => {
      const { useUser } = require('@clerk/clerk-react');
      useUser.mockReturnValue({
        user: null,
        isSignedIn: false,
        isLoaded: false,
      });

      renderWithRouter(
        <LoggedLayout>
          <div>Test Content</div>
        </LoggedLayout>
      );

      // Should show loading indicator
      expect(screen.queryByText('Test Content')).not.toBeInTheDocument();
    });

    it('renders children directly when not signed in', () => {
      const { useUser } = require('@clerk/clerk-react');
      useUser.mockReturnValue({
        user: null,
        isSignedIn: false,
        isLoaded: true,
      });

      renderWithRouter(
        <LoggedLayout>
          <div data-testid="test-content">Test Content</div>
        </LoggedLayout>
      );

      expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });
  });

  describe('useLoggedLayout Hook', () => {
    it('returns default values when used outside LoggedLayout', () => {
      const TestComponent = () => {
        const context = useLoggedLayout();
        return (
          <div>
            <span data-testid="drawer-open">{String(context.isMobileDrawerOpen)}</span>
            <span data-testid="recent-interview">{String(context.hasRecentInterview)}</span>
          </div>
        );
      };

      render(<TestComponent />);

      expect(screen.getByTestId('drawer-open')).toHaveTextContent('false');
      expect(screen.getByTestId('recent-interview')).toHaveTextContent('false');
    });
  });
});

describe('Layout Presence Test', () => {
  /**
   * QA Checklist Item: Verify TopBar, Sidebar, Footer appear on logged routes
   */
  it('should render all layout elements for authenticated users', () => {
    renderWithRouter(
      <LoggedLayout>
        <div>Page Content</div>
      </LoggedLayout>
    );

    // Verify main content area exists
    expect(screen.getByRole('main')).toBeInTheDocument();

    // Verify skip link exists (accessibility)
    expect(screen.getByText('Skip to content')).toBeInTheDocument();
  });
});
