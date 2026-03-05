'use client';

import React, { useEffect, useRef, useState } from 'react';
import AgroTopBar from './AgroTopBar';
import AgroSidebar from './AgroSidebar';
import '@/styles/agro-theme.css'; // Load the theme CSS

export default function AgroLayout({ children }: { children: React.ReactNode }) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    // Cursor logic for Premium feel
    const moveCursor = (e: MouseEvent) => {
      if (cursorRef.current && ringRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
        
        // Add a small lag to the ring for premium feel
        setTimeout(() => {
          if (ringRef.current) {
            ringRef.current.style.left = `${e.clientX}px`;
            ringRef.current.style.top = `${e.clientY}px`;
          }
        }, 50);
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickable = target.closest('a') || target.closest('button') || target.closest('.clickable');
      setIsHovering(!!isClickable);
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <div className="agro-theme use-custom-cursor">
      {/* Premium Overlays */}
      <div className="agro-theme-grain" />
      <div 
        ref={cursorRef} 
        className={`agro-custom-cursor ${isHovering ? 'scale-150 w-4 h-4' : 'scale-100 w-3 h-3'} pointer-events-none hidden lg:block`}
      />
      <div 
        ref={ringRef} 
        className={`agro-custom-cursor-ring ${isHovering ? 'w-16 h-16 border-[var(--gold)] border-2' : 'w-10 h-10'} pointer-events-none transition-all duration-300 hidden lg:block`}
      />

      <AgroTopBar />
      <div className="layout">
        <AgroSidebar />
        <div className="main" id="main">
          {children}
        </div>
      </div>
    </div>
  );
}
