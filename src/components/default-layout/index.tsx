'use client'

import TopBar from 'components/top-bar'
import Sidebar from 'components/sidebar'
import BottomNav from 'components/bottom-nav'
import { cn } from 'lib/utils'
import React from 'react'
import { useUser } from '@clerk/clerk-react'

type DefaultLayoutProps = {
  children: React.ReactNode
  className?: string
  /** Whether user has a recent interview (for pulse indicator) */
  hasRecentInterview?: boolean
  /** Hide sidebar even when authenticated (e.g., during active interview) */
  hideSidebar?: boolean
}

// Extract background-related classes to apply to outer container
const extractBgClasses = (className: string = ''): { bgClasses: string; otherClasses: string } => {
  const classes = className.split(' ');
  const bgClasses: string[] = [];
  const otherClasses: string[] = [];
  
  classes.forEach(cls => {
    if (cls.startsWith('bg-') || cls.startsWith('from-') || cls.startsWith('via-') || cls.startsWith('to-')) {
      bgClasses.push(cls);
    } else {
      otherClasses.push(cls);
    }
  });
  
  return {
    bgClasses: bgClasses.join(' '),
    otherClasses: otherClasses.join(' ')
  };
};

export const DefaultLayout = ({
  children,
  className,
  hasRecentInterview = false,
  hideSidebar = false,
}: DefaultLayoutProps) => {
  const { bgClasses, otherClasses } = extractBgClasses(className);
  const { isSignedIn } = useUser();
  
  // Show sidebar layout for authenticated users (unless explicitly hidden)
  const showSidebar = isSignedIn && !hideSidebar;
  
  return (
    <div data-testid="root-container" className={cn("flex min-h-screen", bgClasses)}>
      {/* Sidebar - only for authenticated users on lg+ screens */}
      {showSidebar && <Sidebar hasRecentInterview={hasRecentInterview} />}
      
      <main 
        data-testid="main-content" 
        className={cn(
          "w-full min-h-screen",
          showSidebar && "lg:ml-[260px]"
        )}
      >
        <TopBar />
        <div 
          data-testid="content-wrapper" 
          className={cn(
            "pb-0 min-h-[calc(100vh-64px)]",
            // Add bottom padding on mobile when bottom nav is visible
            showSidebar && "pb-20 lg:pb-0"
          )}
        >
          <div data-testid="content-container" className={cn('mx-auto container pt-6 min-h-[calc(100vh-64px)]', otherClasses)}>
            {children}
          </div>
        </div>
      </main>
      
      {/* Bottom Navigation - only for authenticated users on mobile/tablet */}
      {showSidebar && <BottomNav hasRecentInterview={hasRecentInterview} />}
    </div>
  )
}