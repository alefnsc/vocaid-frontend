/**
 * TranscriptViewer Component
 * Timestamped transcript with media sync functionality
 * 
 * Design: Vocaid system (grayscale + purple-600, typography-driven, no icons)
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

type TFunction = ReturnType<typeof useTranslation>['t'];

// ========================================
// TYPES
// ========================================

export interface TranscriptSegment {
  id: string;
  speaker: 'agent' | 'user';
  content: string;
  startTime: number; // seconds
  endTime: number; // seconds
  sentimentScore?: number;
}

interface TranscriptViewerProps {
  segments: TranscriptSegment[];
  currentTime?: number; // Current playback time in seconds
  onSeek?: (timestamp: number) => void;
  isPlaying?: boolean;
}

// ========================================
// FORMAT HELPERS
// ========================================

const formatTimestamp = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// ========================================
// TRANSCRIPT SEGMENT COMPONENT
// ========================================

const TranscriptSegmentItem: React.FC<{
  segment: TranscriptSegment;
  isActive: boolean;
  onClick: () => void;
  t: TFunction;
}> = ({ segment, isActive, onClick, t }) => {
  const segmentRef = useRef<HTMLButtonElement>(null);
  
  // Auto-scroll to active segment
  useEffect(() => {
    if (isActive && segmentRef.current) {
      segmentRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [isActive]);

  return (
    <motion.button
      ref={segmentRef}
      onClick={onClick}
      className={`
        w-full text-left p-4 rounded-lg transition-all duration-200
        ${isActive 
          ? 'bg-purple-50 border-l-4 border-purple-600' 
          : 'bg-white hover:bg-zinc-50 border-l-4 border-transparent'
        }
      `}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.995 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className={`
          text-xs font-bold uppercase tracking-wider
          ${segment.speaker === 'agent' ? 'text-zinc-500' : 'text-purple-600'}
        `}>
          {segment.speaker === 'agent' ? t('analytics.transcript.interviewer') : t('analytics.transcript.you')}
        </span>
        <span className="font-mono text-xs text-zinc-400">
          {formatTimestamp(segment.startTime)} - {formatTimestamp(segment.endTime)}
        </span>
      </div>
      
      {/* Content */}
      <p className={`
        text-sm leading-relaxed
        ${isActive ? 'text-purple-900 font-medium' : 'text-zinc-700'}
      `}>
        {segment.content}
      </p>
      
      {/* Sentiment indicator (if available) */}
      {segment.sentimentScore !== undefined && (
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1 bg-zinc-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-600 rounded-full transition-all duration-300"
              style={{ width: `${segment.sentimentScore}%` }}
            />
          </div>
          <span className="text-xs font-mono text-zinc-400">
            {Math.round(segment.sentimentScore)}%
          </span>
        </div>
      )}
    </motion.button>
  );
};

// ========================================
// PLAYBACK CONTROLS COMPONENT
// ========================================

const PlaybackControls: React.FC<{
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onSeek: (time: number) => void;
  onPlayPause: () => void;
  t: TFunction;
}> = ({ currentTime, duration, isPlaying, onSeek, onPlayPause, t }) => {
  const progressRef = useRef<HTMLDivElement>(null);
  
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    onSeek(percentage * duration);
  };

  return (
    <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-zinc-200 p-4 z-10">
      {/* Progress Bar */}
      <div 
        ref={progressRef}
        className="h-2 bg-zinc-200 rounded-full cursor-pointer mb-3 overflow-hidden"
        onClick={handleProgressClick}
      >
        <motion.div 
          className="h-full bg-purple-600 rounded-full"
          style={{ width: `${(currentTime / duration) * 100}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>
      
      {/* Time Display */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm text-zinc-600">
          {formatTimestamp(currentTime)}
        </span>
        <button
          onClick={onPlayPause}
          className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
        >
          {isPlaying ? t('analytics.transcript.pause') : t('analytics.transcript.play')}
        </button>
        <span className="font-mono text-sm text-zinc-600">
          {formatTimestamp(duration)}
        </span>
      </div>
    </div>
  );
};

// ========================================
// MAIN TRANSCRIPT VIEWER COMPONENT
// ========================================

const TranscriptViewer: React.FC<TranscriptViewerProps> = ({
  segments,
  currentTime = 0,
  onSeek,
  isPlaying = false
}) => {
  const [internalTime, setInternalTime] = useState(currentTime);
  const [internalPlaying, setInternalPlaying] = useState(isPlaying);
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  
  // Calculate duration from segments
  const duration = segments.length > 0 
    ? Math.max(...segments.map(s => s.endTime))
    : 0;
  
  // Find active segment based on current time
  const activeSegmentId = segments.find(
    seg => internalTime >= seg.startTime && internalTime <= seg.endTime
  )?.id;
  
  // Handle segment click
  const handleSegmentClick = useCallback((segment: TranscriptSegment) => {
    setInternalTime(segment.startTime);
    onSeek?.(segment.startTime);
  }, [onSeek]);
  
  // Handle seek from progress bar
  const handleSeek = useCallback((time: number) => {
    setInternalTime(time);
    onSeek?.(time);
  }, [onSeek]);
  
  // Handle play/pause
  const handlePlayPause = useCallback(() => {
    setInternalPlaying(!internalPlaying);
  }, [internalPlaying]);
  
  // Sync with external currentTime prop
  useEffect(() => {
    setInternalTime(currentTime);
  }, [currentTime]);
  
  // Sync with external isPlaying prop
  useEffect(() => {
    setInternalPlaying(isPlaying);
  }, [isPlaying]);
  
  // Simulate playback (in real app, this would be synced with actual media player)
  useEffect(() => {
    if (!internalPlaying) return;
    
    const interval = setInterval(() => {
      setInternalTime(prev => {
        const next = prev + 0.1;
        if (next >= duration) {
          setInternalPlaying(false);
          return duration;
        }
        return next;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [internalPlaying, duration]);

  if (segments.length === 0) {
    return (
      <div className="p-6 bg-zinc-50 border border-zinc-200 rounded-xl">
        <h3 className="text-lg font-bold text-zinc-900 mb-4">{t('analytics.transcript.title')}</h3>
        <div className="text-center py-12">
          <p className="text-zinc-500 font-medium">{t('analytics.transcript.noData')}</p>
          <p className="text-sm text-zinc-400 mt-1">{t('analytics.transcript.noDataHint')}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-zinc-200">
        <h3 className="text-lg font-bold text-zinc-900">{t('analytics.transcript.title')}</h3>
        <p className="text-sm text-zinc-500 mt-1">
          {t('analytics.transcript.subtitle')}
        </p>
      </div>
      
      {/* Playback Controls */}
      {duration > 0 && (
        <PlaybackControls
          currentTime={internalTime}
          duration={duration}
          isPlaying={internalPlaying}
          onSeek={handleSeek}
          onPlayPause={handlePlayPause}
          t={t}
        />
      )}
      
      {/* Transcript Content */}
      <div 
        ref={containerRef}
        className="max-h-[500px] overflow-y-auto p-4 space-y-2"
      >
        <AnimatePresence>
          {segments.map((segment, index) => (
            <TranscriptSegmentItem
              key={segment.id}
              segment={segment}
              isActive={segment.id === activeSegmentId}
              onClick={() => handleSegmentClick(segment)}
              t={t}
            />
          ))}
        </AnimatePresence>
      </div>
      
      {/* Footer stats */}
      <div className="p-4 border-t border-zinc-200 bg-white">
        <div className="flex justify-between text-sm text-zinc-500">
          <span><span className="font-medium text-zinc-700">{segments.length}</span> {t('analytics.transcript.segments')}</span>
          <span>{t('analytics.transcript.duration')}: <span className="font-mono">{formatTimestamp(duration)}</span></span>
        </div>
      </div>
    </motion.div>
  );
};

export default TranscriptViewer;
