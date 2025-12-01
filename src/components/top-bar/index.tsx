'use client'

import React from 'react';
import MainLogo from '../main-logo'
import { useUser, SignInButton, UserButton } from '@clerk/clerk-react';

const TopBar: React.FC = () => {
  const { user } = useUser()
  
  return (
    <nav className="flex h-[70px] items-center justify-center border-b border-gray-200 bg-white" role="navigation" aria-label="Main navigation">
      <div className="flex flex-row items-center justify-between w-full max-w-7xl px-6 sm:px-8 md:px-10 lg:px-8">
        <div className="flex justify-center items-center">
          <MainLogo />
        </div>
        <div className="flex items-center">
          {user ? (
            <div className="flex items-center gap-2">
              {/* Desktop only: Show first name */}
              <span className="hidden md:block text-base font-medium text-gray-700">
                {user.firstName}
              </span>
              <UserButton 
                afterSignOutUrl='/' 
                appearance={{
                  elements: {
                    avatarBox: "w-14 h-14 sm:w-12 sm:h-12 md:w-10 md:h-10 lg:w-9 lg:h-9",
                    userButtonPopoverCard: "shadow-lg"
                  }
                }}
              />
            </div>
          ) : (
            <SignInButton 
              mode='modal'
              forceRedirectUrl='/'
            >
              <button 
                className="px-4 py-2 text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-md transition-colors shadow-sm"
                aria-label="Sign in to Voxly"
              >
                Sign In
              </button>
            </SignInButton>
          )}
        </div>
      </div>
    </nav>
  )
}

export default TopBar