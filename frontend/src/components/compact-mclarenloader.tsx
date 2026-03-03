'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Compact McLaren Car Loader
 * Small animated car that appears during page navigation
 */
export function CompactMcLarenLoader() {
    const [isVisible, setIsVisible] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Detect route changes
        const handleStart = () => {
            setIsVisible(true);
            setProgress(10);
        };

        const handleEnd = () => {
            setProgress(100);
            setTimeout(() => setIsVisible(false), 600);
        };

        // Listen for link clicks
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const link = target.closest('a');

            if (link) {
                const href = link.getAttribute('href');
                if (href && !href.startsWith('#') && !href.startsWith('http') && !link.hasAttribute('download')) {
                    handleStart();

                    // Animate progress
                    const interval = setInterval(() => {
                        setProgress((prev) => {
                            if (prev >= 90) return 90;
                            return prev + Math.random() * 25;
                        });
                    }, 250);

                    // Auto-complete
                    const timer = setTimeout(() => {
                        handleEnd();
                        clearInterval(interval);
                    }, 1200);

                    return () => {
                        clearInterval(interval);
                        clearTimeout(timer);
                    };
                }
            }
        };

        document.addEventListener('click', handleClick, true);
        return () => document.removeEventListener('click', handleClick, true);
    }, []);

    if (!isVisible) return null;

    return (
        <>
            {/* Top Progress Bar */}
            <div className="fixed top-0 left-0 right-0 z-[9998] h-1 bg-slate-800/30">
                <div
                    className="h-full bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 shadow-lg shadow-orange-500/50 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Floating McLaren Car */}
            <div className={cn(
                'fixed right-8 bottom-8 z-[9997] transition-all duration-500',
                'animate-bounce'
            )}>
                {/* Car Container */}
                <div className="relative">
                    {/* Glow */}
                    <div className="absolute -inset-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg blur-md opacity-30" />

                    {/* McLaren SVG - Compact */}
                    <svg
                        viewBox="0 0 200 100"
                        className="w-24 h-12 relative z-10 drop-shadow-lg"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <defs>
                            <linearGradient id="carGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" style={{ stopColor: '#FF8C00', stopOpacity: 1 }} />
                                <stop offset="100%" style={{ stopColor: '#FF4500', stopOpacity: 1 }} />
                            </linearGradient>
                        </defs>

                        {/* Road line */}
                        <line x1="0" y1="65" x2="200" y2="65" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />

                        {/* Speed lines */}
                        <g stroke="#FF6B35" strokeWidth="1" opacity="0.4">
                            <line x1="10" y1="50" x2="30" y2="50" strokeDasharray="2,2" />
                            <line x1="5" y1="60" x2="25" y2="60" strokeDasharray="2,2" />
                        </g>

                        {/* Car Body */}
                        <g>
                            {/* Main Body */}
                            <path
                                d="M 40 55 L 55 40 L 145 40 L 160 55 Z"
                                fill="url(#carGrad)"
                                stroke="#000"
                                strokeWidth="1"
                            />

                            {/* Windshield */}
                            <polygon
                                points="60,45 70,38 140,38 150,45"
                                fill="#87CEEB"
                                opacity="0.7"
                                stroke="#000"
                                strokeWidth="0.8"
                            />

                            {/* Front Wheel */}
                            <circle cx="65" cy="70" r="6" fill="#1a1a1a" stroke="#FFD700" strokeWidth="1.5" />
                            <circle cx="65" cy="70" r="3.5" fill="#0a0a0a" />

                            {/* Rear Wheel */}
                            <circle cx="135" cy="70" r="6" fill="#1a1a1a" stroke="#FFD700" strokeWidth="1.5" />
                            <circle cx="135" cy="70" r="3.5" fill="#0a0a0a" />

                            {/* Racing Stripe */}
                            <rect x="95" y="42" width="8" height="20" rx="1" fill="#FFD700" opacity="0.8" />

                            {/* Headlight */}
                            <circle cx="155" cy="50" r="2" fill="#FFFF00" opacity="0.9" />

                            {/* Taillight */}
                            <circle cx="42" cy="50" r="2" fill="#FF1744" opacity="0.9" />
                        </g>

                        {/* Text */}
                        <text x="100" y="85" textAnchor="middle" fontSize="6" fontWeight="bold" fill="currentColor" opacity="0.8">
                            McLaren
                        </text>
                    </svg>

                    {/* Loading Dots */}
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex gap-1">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                    </div>
                </div>
            </div>

            {/* Corner Mini Loader */}
            <div className="fixed top-6 right-6 z-[9997]">
                <div className="flex items-center gap-2 text-xs">
                    <div className="relative w-6 h-6">
                        <svg
                            viewBox="0 0 40 20"
                            className="w-full h-full animate-pulse"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <defs>
                                <linearGradient id="miniGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" style={{ stopColor: '#FF8C00', stopOpacity: 1 }} />
                                    <stop offset="100%" style={{ stopColor: '#FF4500', stopOpacity: 1 }} />
                                </linearGradient>
                            </defs>
                            {/* Minimal car silhouette */}
                            <path d="M 8 12 L 12 8 L 28 8 L 32 12 Z" fill="url(#miniGrad)" stroke="#000" strokeWidth="0.5" />
                            <circle cx="14" cy="14" r="2" fill="#1a1a1a" />
                            <circle cx="26" cy="14" r="2" fill="#1a1a1a" />
                        </svg>
                    </div>
                    <span className="text-slate-600 dark:text-slate-400 font-semibold">
                        {Math.round(progress)}%
                    </span>
                </div>
            </div>

            {/* Status Text */}
            <div className="fixed bottom-6 right-6 z-[9997] text-xs font-medium text-slate-600 dark:text-slate-400">
                {progress < 30 && 'D  marrage...'}
                {progress >= 30 && progress < 60 && '        Acc  l  ration...'}
                {progress >= 60 && progress < 90 && '    Vitesse max!'}
                {progress >= 90 && '    Arriv  e!'}
            </div>
        </>
    );
}

/**
 * Hook for manual control
 */
export function useMcLarenLoader() {
    return {
        showLoader: () => {
            if (typeof window !== 'undefined') {
                const event = new CustomEvent('mclarenStart');
                window.dispatchEvent(event);
            }
        },
        hideLoader: () => {
            if (typeof window !== 'undefined') {
                const event = new CustomEvent('mclarenEnd');
                window.dispatchEvent(event);
            }
        },
    };
}
