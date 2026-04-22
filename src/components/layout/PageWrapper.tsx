import React from 'react';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
  safeBottom?: boolean;
}

export default function PageWrapper({ children, className = '', safeBottom = true }: PageWrapperProps) {
  return (
    <div className={`mobile-container bg-background min-h-[100dvh] ${safeBottom ? 'safe-bottom' : ''} ${className}`}>
      {children}
    </div>
  );
}
