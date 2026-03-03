import React from 'react';
import { Icon } from "@/components/devops-dashboards/ui/Icon";

export const ThreatMap = () => (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden relative shadow-sm h-[400px]">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 absolute top-0 w-full z-10">
            <div className="flex items-center gap-2">
                <Icon name="public" className="text-red-500" />
                <h3 className="font-bold text-sm">Live Global Threat Visualization</h3>
            </div>
            <div className="flex gap-2 text-xs">
                <span className="flex items-center gap-1 text-red-500 font-bold animate-pulse">
                    <span className="size-2 rounded-full bg-red-500"></span>
                    LIVE ATTACK DETECTED
                </span>
            </div>
        </div>

        {/* MAP     image placeholder + points */}
        <div className="h-full relative bg-[#0a0f18] flex items-center justify-center">
            {/* grille de fond */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fa6238_1px,transparent_1px)] [background-size:20px_20px]" />

            {/* points - Attacks */}
            <div className="absolute top-1/4 left-1/4 size-3 bg-red-500 rounded-full shadow-[0_0_15px_#fa6238] ring-4 ring-red-500/20 animate-ping" />
            <div className="absolute top-1/3 left-2/3 size-3 bg-red-500 rounded-full shadow-[0_0_15px_#fa6238] ring-4 ring-red-500/20 animate-ping delay-75" />
            <div className="absolute bottom-1/3 right-1/4 size-3 bg-red-500 rounded-full shadow-[0_0_15px_#fa6238] ring-4 ring-red-500/20 animate-ping delay-150" />

            {/* Attack Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <path
                    className="animate-[dash_1s_linear_infinite]"
                    d="M25% 25% Q 50% 10%, 66% 33%"
                    fill="none"
                    stroke="#fa6238"
                    strokeWidth="1"
                    strokeDasharray="5,5"
                />
                <path
                    className="animate-[dash_1.5s_linear_infinite]"
                    d="M75% 66% Q 50% 80%, 25% 25%"
                    fill="none"
                    stroke="#fa6238"
                    strokeWidth="1"
                    strokeDasharray="5,5"
                />
            </svg>

            {/* Carte du monde placeholder */}
            <div className="z-0 text-center pointer-events-none opacity-20">
                <Icon name="public" className="text-9xl text-slate-600" />
            </div>
        </div>
    </div>
);
