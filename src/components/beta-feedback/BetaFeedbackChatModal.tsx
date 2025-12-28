/**
 * BetaFeedbackChatModal
 * 
 * Conversational chat-style modal for collecting beta feedback.
 * Supports bug reports and feature suggestions.
 * 
 * Vocaid Design System:
 * - White background, zinc borders, purple accents
 * - Chat-style message bubbles
 * - Mobile-first (bottom sheet on mobile)
 */

'use client';

import React, { useEffect, useCallback, useRef, useState, KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Send, ChevronLeft, SkipForward, Loader2, Check, Plus, Trash2 } from 'lucide-react';
import { cn } from 'lib/utils';
import { useBetaFeedbackFlow } from 'hooks/useBetaFeedbackFlow';
import { ChatMessage, ChatOption } from 'types/betaFeedback';

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface MessageBubbleProps {
  message: ChatMessage;
  onOptionSelect?: (value: string) => void;
  onTextSubmit?: (value: string) => void;
  onStepsSubmit?: (steps: string[]) => void;
  isLatest: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onOptionSelect,
  onTextSubmit,
  onStepsSubmit,
  isLatest,
}) => {
  const { t } = useTranslation();
  const isAssistant = message.role === 'assistant';
  const [inputValue, setInputValue] = useState('');
  const [steps, setSteps] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Focus input when this becomes the latest assistant message with input
  useEffect(() => {
    if (isLatest && isAssistant && message.inputType && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLatest, isAssistant, message.inputType]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (message.inputType === 'steps') {
        // Add step on Enter
        if (inputValue.trim()) {
          setSteps(prev => [...prev, inputValue.trim()]);
          setInputValue('');
        }
      } else if (message.inputType !== 'textarea') {
        e.preventDefault();
        if (inputValue.trim()) {
          onTextSubmit?.(inputValue);
          setInputValue('');
        }
      }
    }
  };

  const handleTextSubmit = () => {
    if (inputValue.trim()) {
      onTextSubmit?.(inputValue);
      setInputValue('');
    }
  };

  const handleStepsSubmit = () => {
    if (steps.length > 0) {
      onStepsSubmit?.(steps);
      setSteps([]);
    }
  };

  const removeStep = (index: number) => {
    setSteps(prev => prev.filter((_, i) => i !== index));
  };

  // Render markdown-like content (basic bold support)
  const renderContent = (content: string) => {
    const parts = content.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      // Handle newlines
      return part.split('\n').map((line, j) => (
        <React.Fragment key={`${i}-${j}`}>
          {j > 0 && <br />}
          {line}
        </React.Fragment>
      ));
    });
  };

  return (
    <div
      className={cn(
        'flex w-full mb-4',
        isAssistant ? 'justify-start' : 'justify-end'
      )}
    >
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-3',
          isAssistant
            ? 'bg-zinc-100 text-zinc-900 rounded-bl-md'
            : 'bg-purple-600 text-white rounded-br-md'
        )}
      >
        {/* Message content */}
        <div className="text-sm whitespace-pre-wrap">
          {renderContent(message.content)}
        </div>

        {/* Options (for assistant messages) */}
        {isLatest && isAssistant && message.options && (
          <div className="mt-3 flex flex-col gap-2">
            {message.options.map((option) => (
              <button
                key={option.id}
                onClick={() => onOptionSelect?.(option.value)}
                className="w-full px-4 py-2.5 text-left text-sm font-medium 
                  bg-white border border-zinc-200 rounded-xl
                  hover:border-purple-600 hover:text-purple-600
                  transition-colors duration-150
                  focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-1"
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        {/* Text/Email input */}
        {isLatest && isAssistant && message.inputType && message.inputType !== 'steps' && !message.options && (
          <div className="mt-3">
            {message.inputType === 'textarea' ? (
              <textarea
                ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={message.inputPlaceholder}
                rows={3}
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg
                  placeholder:text-zinc-400
                  focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent
                  resize-none"
              />
            ) : (
              <input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type={message.inputType === 'email' ? 'email' : 'text'}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={message.inputPlaceholder}
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg
                  placeholder:text-zinc-400
                  focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            )}
            <button
              onClick={handleTextSubmit}
              disabled={!inputValue.trim()}
              className="mt-2 w-full px-4 py-2 text-sm font-medium text-white
                bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-300
                rounded-lg transition-colors duration-150
                focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-1"
            >
              {t('betaFeedback.continue', 'Continue')}
            </button>
          </div>
        )}

        {/* Steps input */}
        {isLatest && isAssistant && message.inputType === 'steps' && (
          <div className="mt-3">
            {/* Current steps */}
            {steps.length > 0 && (
              <div className="mb-2 space-y-1">
                {steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm bg-white px-3 py-1.5 rounded-lg">
                    <span className="text-zinc-400">{i + 1}.</span>
                    <span className="flex-1">{step}</span>
                    <button
                      onClick={() => removeStep(i)}
                      className="text-zinc-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add step input */}
            <div className="flex gap-2">
              <input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={message.inputPlaceholder}
                className="flex-1 px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg
                  placeholder:text-zinc-400
                  focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
              <button
                onClick={() => {
                  if (inputValue.trim()) {
                    setSteps(prev => [...prev, inputValue.trim()]);
                    setInputValue('');
                  }
                }}
                disabled={!inputValue.trim()}
                className="px-3 py-2 bg-zinc-200 hover:bg-zinc-300 disabled:bg-zinc-100 
                  rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleStepsSubmit}
              disabled={steps.length === 0}
              className="mt-2 w-full px-4 py-2 text-sm font-medium text-white
                bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-300
                rounded-lg transition-colors duration-150
                focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-1"
            >
              {t('betaFeedback.done', 'Done')} ({steps.length} {t('betaFeedback.steps', 'steps')})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface BetaFeedbackChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BetaFeedbackChatModal: React.FC<BetaFeedbackChatModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    state,
    messages,
    progress,
    initializeChat,
    handleOptionSelect,
    handleTextInput,
    handleStepsInput,
    skipStep,
    previousStep,
    reset,
    canSkip,
    canGoBack,
    isComplete,
    isSubmitting,
  } = useBetaFeedbackFlow();

  // Initialize chat on open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeChat();
    }
  }, [isOpen, messages.length, initializeChat]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape as any);
    return () => document.removeEventListener('keydown', handleEscape as any);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Handle close with reset
  const handleClose = useCallback(() => {
    onClose();
    // Reset after animation
    setTimeout(reset, 300);
  }, [onClose, reset]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-[9998] transition-opacity duration-200"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed z-[9999] transition-all duration-300 ease-out
          /* Mobile: bottom sheet style */
          bottom-0 left-0 right-0 h-[90vh] rounded-t-2xl
          /* Desktop: floating window */
          sm:bottom-4 sm:right-4 sm:left-auto sm:top-auto
          sm:w-[440px] sm:h-[640px] sm:rounded-2xl
          /* Styling */
          bg-white border border-zinc-200 shadow-2xl
          flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="beta-feedback-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 bg-white">
          <div className="flex items-center gap-2">
            {canGoBack && (
              <button
                onClick={previousStep}
                className="p-1 hover:bg-zinc-100 rounded-lg transition-colors"
                aria-label={t('betaFeedback.back', 'Go back')}
              >
                <ChevronLeft className="w-5 h-5 text-zinc-600" />
              </button>
            )}
            <h2 id="beta-feedback-modal-title" className="text-lg font-semibold text-zinc-900">
              {state.feedbackType === 'bug' 
                ? t('betaFeedback.bugReportTitle', '🐛 Bug Report')
                : state.feedbackType === 'feature'
                ? t('betaFeedback.featureTitle', '💡 Feature Suggestion')
                : t('betaFeedback.title', 'Beta Feedback')}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
            aria-label={t('common.close', 'Close')}
          >
            <X className="w-5 h-5 text-zinc-600" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-zinc-100">
          <div 
            className="h-full bg-purple-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              onOptionSelect={handleOptionSelect}
              onTextSubmit={handleTextInput}
              onStepsSubmit={handleStepsInput}
              isLatest={index === messages.length - 1}
            />
          ))}

          {/* Submitting indicator */}
          {isSubmitting && (
            <div className="flex justify-start mb-4">
              <div className="bg-zinc-100 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                <span className="text-sm text-zinc-600">
                  {t('betaFeedback.submitting', 'Submitting your feedback...')}
                </span>
              </div>
            </div>
          )}

          {/* Success indicator */}
          {isComplete && (
            <div className="flex justify-center my-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full">
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {t('betaFeedback.submitted', 'Feedback submitted!')}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between">
          {/* Skip button (for optional fields) */}
          {canSkip && !isComplete && !isSubmitting && (
            <button
              onClick={skipStep}
              className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
            >
              <SkipForward className="w-4 h-4" />
              {t('betaFeedback.skip', 'Skip')}
            </button>
          )}

          {/* Close button when complete */}
          {isComplete && (
            <button
              onClick={handleClose}
              className="ml-auto px-4 py-2 text-sm font-medium text-white
                bg-purple-600 hover:bg-purple-700
                rounded-lg transition-colors"
            >
              {t('betaFeedback.close', 'Close')}
            </button>
          )}

          {/* Placeholder to maintain layout */}
          {!canSkip && !isComplete && <div />}

          {/* Step indicator */}
          <span className="text-xs text-zinc-400">
            {t('betaFeedback.powered', 'Powered by Vocaid')}
          </span>
        </div>
      </div>
    </>
  );
};

export default BetaFeedbackChatModal;
