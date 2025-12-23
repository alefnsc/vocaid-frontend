/**
 * Animated Background Component
 * 
 * Subtle animated gradient mesh background for visual polish.
 * Uses CSS animations for smooth, performant effects.
 * 
 * @module components/animated-background
 */

import { memo } from 'react';
import { motion } from 'framer-motion';

// ========================================
// GRADIENT ORB COMPONENT
// ========================================

interface GradientOrbProps {
  className?: string;
  color: string;
  size: string;
  position: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  animationDelay?: number;
}

const GradientOrb = memo(({ className, color, size, position, animationDelay = 0 }: GradientOrbProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        x: [0, 20, 0, -20, 0],
        y: [0, -15, 0, 15, 0],
      }}
      transition={{
        opacity: { duration: 1, delay: animationDelay },
        scale: { duration: 1, delay: animationDelay },
        x: { 
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: animationDelay,
        },
        y: { 
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: animationDelay + 0.5,
        },
      }}
      className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
      style={{
        background: color,
        width: size,
        height: size,
        ...position,
      }}
    />
  );
});

GradientOrb.displayName = 'GradientOrb';

// ========================================
// ANIMATED BACKGROUND VARIANTS
// ========================================

interface AnimatedBackgroundProps {
  variant?: 'hero' | 'section' | 'card' | 'minimal';
  className?: string;
  children?: React.ReactNode;
}

export function AnimatedBackground({ variant = 'hero', className = '', children }: AnimatedBackgroundProps) {
  
  // Hero variant - full page background with multiple orbs
  if (variant === 'hero') {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-purple-50/30 to-white" />
        
        {/* Animated orbs */}
        <GradientOrb
          color="linear-gradient(135deg, rgba(147, 51, 234, 0.15) 0%, rgba(147, 51, 234, 0.05) 100%)"
          size="600px"
          position={{ top: '-10%', right: '-10%' }}
          animationDelay={0}
        />
        <GradientOrb
          color="linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(168, 85, 247, 0.03) 100%)"
          size="500px"
          position={{ bottom: '-15%', left: '-5%' }}
          animationDelay={0.3}
        />
        <GradientOrb
          color="linear-gradient(135deg, rgba(126, 34, 206, 0.08) 0%, rgba(126, 34, 206, 0.02) 100%)"
          size="400px"
          position={{ top: '40%', left: '30%' }}
          animationDelay={0.6}
        />
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '64px 64px',
          }}
        />
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    );
  }

  // Section variant - subtle background for sections
  if (variant === 'section') {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-50 via-white to-purple-50/20" />
        
        <GradientOrb
          color="linear-gradient(135deg, rgba(147, 51, 234, 0.08) 0%, transparent 100%)"
          size="400px"
          position={{ top: '0%', right: '-10%' }}
          animationDelay={0}
        />
        <GradientOrb
          color="linear-gradient(135deg, rgba(168, 85, 247, 0.06) 0%, transparent 100%)"
          size="350px"
          position={{ bottom: '0%', left: '-8%' }}
          animationDelay={0.2}
        />
        
        <div className="relative z-10">
          {children}
        </div>
      </div>
    );
  }

  // Card variant - decorative background for cards
  if (variant === 'card') {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white to-purple-50/40" />
        
        <GradientOrb
          color="linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, transparent 100%)"
          size="200px"
          position={{ top: '-20%', right: '-20%' }}
          animationDelay={0}
        />
        
        <div className="relative z-10">
          {children}
        </div>
      </div>
    );
  }

  // Minimal variant - very subtle
  if (variant === 'minimal') {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <GradientOrb
          color="linear-gradient(135deg, rgba(147, 51, 234, 0.05) 0%, transparent 100%)"
          size="300px"
          position={{ top: '10%', right: '10%' }}
          animationDelay={0}
        />
        
        <div className="relative z-10">
          {children}
        </div>
      </div>
    );
  }

  return <div className={className}>{children}</div>;
}

// ========================================
// FLOATING PARTICLES (Optional enhancement)
// ========================================

export function FloatingParticles({ count = 20 }: { count?: number }) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-purple-400/20"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

export default AnimatedBackground;
