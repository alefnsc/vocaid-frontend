import React, { useEffect, useMemo } from 'react';

interface ScoreDisplayProps {
  score: number; // 0-100 percentage
  onScoreChange?: (score: number) => void;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Score Display Component
 * Displays interview score as a percentage (0-100%) with a dark purple progress bar
 */
const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ 
  score, 
  onScoreChange,
  showLabel = true,
  size = 'md'
}) => {
  // Clamp score to 0-100 range
  const normalizedScore = useMemo(() => {
    return Math.min(Math.max(Math.round(score), 0), 100);
  }, [score]);

  // Get performance label based on score
  const performanceLabel = useMemo(() => {
    if (normalizedScore >= 80) return { text: 'Excellent', color: 'text-green-600' };
    if (normalizedScore >= 60) return { text: 'Good', color: 'text-purple-600' };
    if (normalizedScore >= 40) return { text: 'Average', color: 'text-yellow-600' };
    return { text: 'Needs Improvement', color: 'text-red-600' };
  }, [normalizedScore]);

  // Notify parent of score changes
  useEffect(() => {
    onScoreChange?.(normalizedScore);
  }, [normalizedScore, onScoreChange]);

  // Size configurations
  const sizeConfig = {
    sm: {
      height: 'h-2',
      textSize: 'text-sm',
      labelSize: 'text-xs',
      gap: 'gap-1'
    },
    md: {
      height: 'h-3',
      textSize: 'text-lg',
      labelSize: 'text-sm',
      gap: 'gap-2'
    },
    lg: {
      height: 'h-4',
      textSize: 'text-2xl',
      labelSize: 'text-base',
      gap: 'gap-3'
    }
  };

  const config = sizeConfig[size];

  return (
    <div className={`w-full ${config.gap} flex flex-col`}>
      {/* Score header with percentage and label */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`font-bold ${config.textSize} text-gray-900`}>
            {normalizedScore}%
          </span>
          {showLabel && (
            <span className={`${config.labelSize} font-medium ${performanceLabel.color}`}>
              {performanceLabel.text}
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className={`w-full bg-gray-200 rounded-full ${config.height} overflow-hidden`}>
        <div
          className={`${config.height} rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-purple-700 to-purple-500`}
          style={{ width: `${normalizedScore}%` }}
        />
      </div>
    </div>
  );
};

export default ScoreDisplay;
