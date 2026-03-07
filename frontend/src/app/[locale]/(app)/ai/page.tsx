'use client';

import React from 'react';
import { AIChat } from '@/components/ai/AIChat';
import { PredictionCard } from '@/components/ai/PredictionCard';

export default function AIPage() {
    return (
        <div className="page active h-full" id="page-ai">
            <div className="page-header">
                <div className="page-label" style={{ color: 'var(--amber)' }}>Intelligence</div>
                <h1 className="page-title">AgroMaître Vision IA</h1>
                <div className="page-sub">Votre assistant intelligent et vos prédictions analytiques</div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ height: 'calc(100vh - 150px)' }}>
                {/* AI Chat section */}
                <div className="lg:col-span-2 h-full">
                    <AIChat />
                </div>
                
                {/* Predictions section */}
                <div className="h-full overflow-y-auto space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                            Alertes & Prédictions
                        </h3>
                        <PredictionCard />
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                        <h4 className="font-medium text-slate-900 dark:text-white mb-2">Comment ça marche ?</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                            L'IA analyse les données climatiques en temps réel, l'historique de vos rendements (module récolte), et la documentation agronomique (module base de connaissance) pour vous fournir ces recommandations.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
