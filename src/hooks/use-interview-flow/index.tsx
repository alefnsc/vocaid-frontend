import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Interview flow stages
export type InterviewStage = 'details' | 'interview' | 'feedback';

export interface InterviewFlowState {
  currentStage: InterviewStage;
  callId: string | null;
  metadata: {
    firstName?: string;
    lastName?: string;
    companyName?: string;
    jobTitle?: string;
    jobDescription?: string;
    resume?: string;
  } | null;
  startedAt: number | null;
}

interface InterviewFlowContextType {
  state: InterviewFlowState;
  setStage: (stage: InterviewStage) => void;
  setCallId: (callId: string) => void;
  setMetadata: (metadata: InterviewFlowState['metadata']) => void;
  startInterview: () => void;
  resetFlow: () => void;
  isInFlow: boolean;
}

const SESSION_KEY = 'voxly_interview_flow';

const defaultState: InterviewFlowState = {
  currentStage: 'details',
  callId: null,
  metadata: null,
  startedAt: null,
};

const InterviewFlowContext = createContext<InterviewFlowContextType | undefined>(undefined);

export const InterviewFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<InterviewFlowState>(() => {
    // Load from session storage on mount
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Check if session is still valid (within 2 hours)
        if (parsed.startedAt && Date.now() - parsed.startedAt < 2 * 60 * 60 * 1000) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load interview flow state:', e);
    }
    return defaultState;
  });

  // Persist to session storage on changes
  useEffect(() => {
    if (state.startedAt) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
    }
  }, [state]);

  const setStage = useCallback((stage: InterviewStage) => {
    setState(prev => ({ ...prev, currentStage: stage }));
  }, []);

  const setCallId = useCallback((callId: string) => {
    setState(prev => ({ ...prev, callId }));
  }, []);

  const setMetadata = useCallback((metadata: InterviewFlowState['metadata']) => {
    setState(prev => ({ ...prev, metadata }));
  }, []);

  const startInterview = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStage: 'details',
      startedAt: Date.now(),
    }));
  }, []);

  const resetFlow = useCallback(() => {
    setState(defaultState);
    sessionStorage.removeItem(SESSION_KEY);
  }, []);

  const isInFlow = state.startedAt !== null;

  return (
    <InterviewFlowContext.Provider
      value={{
        state,
        setStage,
        setCallId,
        setMetadata,
        startInterview,
        resetFlow,
        isInFlow,
      }}
    >
      {children}
    </InterviewFlowContext.Provider>
  );
};

export const useInterviewFlow = (): InterviewFlowContextType => {
  const context = useContext(InterviewFlowContext);
  if (!context) {
    throw new Error('useInterviewFlow must be used within an InterviewFlowProvider');
  }
  return context;
};

export default InterviewFlowContext;
