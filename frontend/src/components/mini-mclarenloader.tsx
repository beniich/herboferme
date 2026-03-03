'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Ultra Compact McLaren Loader
 * Tiny animated car in corner - perfect for minimal design
 */
export function MiniMcLarenLoader() {
    const [isVisible, setIsVisible] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const handleStart = () => {
            setIsVisible(true);
            setProgress(15);
        };

        const handleEnd = () => {
            setProgress(100);
            setTimeout(() => setIsVisible(false), 500);
        };

        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const link = target.closest('a');

            if (link) {
                const href = link.getAttribute('href');
                if (href && !href.startsWith('#') && !href.startsWith('http')) {
                    handleStart();

                    const interval = setInterval(() => {
                        setProgress((prev) => (prev >= 90 ? 90 : prev + Math.random() * 30));
                    }, 200);

                    const timer = setTimeout(() => {
                        handleEnd();
                        clearInterval(interval);
                    }, 1000);

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
            {/* Top Thin Progress Bar */}
            <div className="fixed top-0 left-0 right-0 z-[9998] h-0.5 bg-transparent">
                <div
                    className="h-full bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 shadow-lg shadow-orange-500/60 transition-all duration-200"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Bottom Right Mini Car */}
            <div className={cn(
                'fixed bottom-4 right-4 z-[9997] transition-all duration-300',
                'hover:scale-110 active:scale-95'
            )}>
                <div className="relative group">
                    {/* Minimal Glow */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-500 rounded blur opacity-20 group-hover:opacity-40 transition-opacity" />

                    {/* Tiny Car */}
                    <svg
                        viewBox="0 0 100 50"
                        className="w-16 h-8 relative z-10 drop-shadow-md"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <defs>
                            <linearGradient id="tinyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" style={{ stopColor: '#FF8C00', stopOpacity: 1 }} />
                                <stop offset="100%" style={{ stopColor: '#FF4500', stopOpacity: 1 }} />
                            </linearGradient>
                        </defs>

                        {/* Car silhouette */}
                        <path
                            d="M 20 30 L 30 18 L 70 18 L 80 30 Z"
                            fill="url(#tinyGrad)"
                            stroke="#000"
                            strokeWidth="0.8"
                        />

                        {/* Windshield */}
                        <polygon points="32,24 42,16 58,16 68,24" fill="#87CEEB" opacity="0.6" />

                        {/* Wheels */}
                        <circle cx="35" cy="38" r="3.5" fill="#1a1a1a" stroke="#FFD700" strokeWidth="1" />
                        <circle cx="65" cy="38" r="3.5" fill="#1a1a1a" stroke="#FFD700" strokeWidth="1" />

                        {/* Racing stripe */}
                        <rect x="48" y="20" width="4" height="14" fill="#FFD700" opacity="0.7" />
                    </svg>

                    {/* Tooltip */}
                    <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block bg-slate-900 dark:bg-slate-800 text-white dark:text-slate-200 text-xs px-2 py-1 rounded whitespace-nowrap">
                        {progress}% chargement
                    </div>
                </div>
            </div>

            {/* Top Right Mini Speedometer */}
            <div className="fixed top-4 right-4 z-[9997] bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-orange-500/20">
                <div className="text-center">
                    <div className="text-xs font-bold text-orange-600 dark:text-orange-400">{Math.round(progress)}%</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Chargement</div>
                </div>
            </div>

            {/* Animated dots indicator */}
            <div className="fixed bottom-14 right-4 z-[9997] flex gap-1">
                <div
                    className="w-1 h-1 bg-orange-500 rounded-full"
                    style={{
                        animation: `pulse 1.5s ease-in-out infinite`,
                        animationDelay: '0s',
                    }}
                />
                <div
                    className="w-1 h-1 bg-red-500 rounded-full"
                    style={{
                        animation: `pulse 1.5s ease-in-out infinite`,
                        animationDelay: '0.2s',
                    }}
                />
                <div
                    className="w-1 h-1 bg-orange-500 rounded-full"
                    style={{
                        animation: `pulse 1.5s ease-in-out infinite`,
                        animationDelay: '0.4s',
                    }}
                />
            </div>

            <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
        </>
    );
}

/**
 * Flat Design Mini Car Loader
 * Modern minimal aesthetic
 */
export function FlatMcLarenLoader() {
    const [isVisible, setIsVisible] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const handleStart = () => {
            setIsVisible(true);
            setProgress(10);
        };

        const handleEnd = () => {
            setProgress(100);
            setTimeout(() => setIsVisible(false), 500);
        };

        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const link = target.closest('a');

            if (link) {
                const href = link.getAttribute('href');
                if (href && !href.startsWith('#') && !href.startsWith('http')) {
                    handleStart();

                    const interval = setInterval(() => {
                        setProgress((prev) => (prev >= 85 ? 85 : prev + Math.random() * 25));
                    }, 180);

                    const timer = setTimeout(() => {
                        handleEnd();
                        clearInterval(interval);
                    }, 1100);

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
            {/* Linear progress bar */}
            <div className="fixed top-0 left-0 right-0 z-[9998] h-1">
                <div
                    className="h-full bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Flat design bottom right */}
            <div className={cn(
                'fixed bottom-6 right-6 z-[9997]',
                'bg-white dark:bg-slate-800',
                'rounded-xl shadow-lg dark:shadow-lg dark:shadow-orange-500/20',
                'p-4 border border-orange-200 dark:border-orange-500/30'
            )}>
                <div className="w-20 h-10">
                    {/* Flat car design */}
                    <svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                        {/* Car body - flat */}
                        <rect x="20" y="22" width="60" height="14" rx="4" fill="#FF6B35" />
                        {/* Windshield - flat */}
                        <rect x="30" y="14" width="40" height="8" rx="2" fill="#E0E0E0" />
                        {/* Wheels - flat */}
                        <circle cx="32" cy="40" r="4" fill="#333" />
                        <circle cx="68" cy="40" r="4" fill="#333" />
                        {/* Door line */}
                        <line x1="50" y1="22" x2="50" y2="36" stroke="#000" strokeWidth="0.5" opacity="0.3" />
                    </svg>
                </div>
                <div className="text-center mt-2">
                    <div className="text-xs font-bold text-orange-600">
                        {progress < 40 ? '    ' : progress < 70 ? '       ' : '   '}
                    </div>
                    <div className="text-[10px] text-slate-600 dark:text-slate-400 mt-1">
                        {Math.round(progress)}%
                    </div>
                </div>
            </div>
        </>
    );
}
