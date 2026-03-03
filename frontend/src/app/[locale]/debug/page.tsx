import React from 'react';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { fetchWithErrorId } from '@/utils/network';

export default function DebugPage() {
    // Fonction simple pour tester le d  clenchement d'erreur (client-side)
    // Note: Dans un vrai cas, on utiliserait un Server Action ou une API Route qui fail.
    const triggerError = async () => {
        try {
            await fetchWithErrorId("/error");
        } catch (e) {
            console.error("Test error triggered", e);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold">        Debug Assistant Dashboard</h1>
                    <p className="text-slate-500 mt-2">Vue d'ensemble des erreurs et diagnostics IA</p>
                </div>
                <button
                    onClick={triggerError}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md font-medium transition-colors"
                >
                         D  clencher Erreur Test
                </button>
            </header>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-8 border border-blue-100 dark:border-blue-800">
                <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Instructions</h3>
                <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-400 space-y-1">
                    <li>Utilisez <code>Ctrl + Alt + D</code> n'importe o   pour ouvrir le widget flottant.</li>
                    <li>Cliquez sur le bouton rouge ci-dessus pour simuler une erreur 500 API.</li>
                    <li>Les donn  es ci-dessous proviennent de l'API <code>/analytics</code> du backend.</li>
                </ul>
            </div>

            <AnalyticsDashboard />
        </div>
    );
}
