import React from 'react';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export const FadeIn: React.FC<FadeInProps> = ({ 
  children, 
  delay = 0, 
  duration = 500, 
  className = '' 
}) => {
  return (
    <div 
      className={`animate-fade-in ${className}`}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`
      }}
    >
      {children}
    </div>
  );
};

interface SlideInProps {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
  duration?: number;
  className?: string;
}

export const SlideIn: React.FC<SlideInProps> = ({ 
  children, 
  direction = 'up', 
  delay = 0, 
  duration = 500, 
  className = '' 
}) => {
  const translateClass = {
    left: 'translate-x-full',
    right: '-translate-x-full',
    up: 'translate-y-full',
    down: '-translate-y-full'
  }[direction];

  const enterClass = {
    left: '-translate-x-full',
    right: 'translate-x-full',
    up: 'translate-y-full',
    down: '-translate-y-full'
  }[direction];

  return (
    <div 
      className={`animate-slide-in ${enterClass} ${className}`}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`
      }}
    >
      {children}
    </div>
  );
};

interface ScaleInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  scaleStart?: number;
  className?: string;
}

export const ScaleIn: React.FC<ScaleInProps> = ({ 
  children, 
  delay = 0, 
  duration = 500, 
  scaleStart = 0.8,
  className = '' 
}) => {
  return (
    <div 
      className={`animate-scale-in ${className}`}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`,
        transformOrigin: 'center'
      }}
    >
      {children}
    </div>
  );
};

interface BounceProps {
  children: React.ReactNode;
  className?: string;
}

export const Bounce: React.FC<BounceProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`animate-bounce ${className}`}>
      {children}
    </div>
  );
};

interface PulseProps {
  children: React.ReactNode;
  className?: string;
}

export const Pulse: React.FC<PulseProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {children}
    </div>
  );
};