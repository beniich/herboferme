'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, AlertTriangle, CloudRain, Wheat } from 'lucide-react';

interface Prediction {
  id: string;
  type: 'yield' | 'disease' | 'weather_impact' | 'market';
  target: string;
  predictionData: any;
  confidence: number;
}

export const PredictionCard: React.FC = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      const response = await fetch('/api/ai/predictions?domainId=1', { // using a mock domain id or taking first 10
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success && data.data && data.data.length > 0) {
        setPredictions(data.data);
      } else {
        // Fallback or Trigger a mock prediction if none exists
        triggerPrediction('yield', 'Parcelle Blé Nord');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const triggerPrediction = async (type: string, target: string) => {
    try {
      const res = await fetch('/api/ai/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ type, target, domainId: 'some-domain-id' })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setPredictions(prev => [data.data, ...prev]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'yield': return <Wheat className="w-6 h-6 text-green-500" />;
      case 'disease': return <AlertTriangle className="w-6 h-6 text-red-500" />;
      case 'weather_impact': return <CloudRain className="w-6 h-6 text-blue-500" />;
      default: return <TrendingUp className="w-6 h-6 text-orange-500" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'yield': return 'bg-green-50 dark:bg-green-900/20';
      case 'disease': return 'bg-red-50 dark:bg-red-900/20';
      case 'weather_impact': return 'bg-blue-50 dark:bg-blue-900/20';
      default: return 'bg-orange-50 dark:bg-orange-900/20';
    }
  };

  if (!isMounted || loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 animate-pulse">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
        <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
      </div>
    );
  }

  if (predictions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {predictions.slice(0, 3).map((p, idx) => (
        <div key={idx} className={`relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm`}>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg ${getBgColor(p.type)}`}>
              {getIcon(p.type)}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  Prédiction: {p.target}
                </h3>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                  <Sparkles className="w-3 h-3" />
                  {p.confidence.toFixed(1)}% Confiance
                </span>
              </div>
              
              <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                {p.type === 'yield' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">Est. Rendement</p>
                      <p className="font-bold text-slate-900 dark:text-white text-lg">{p.predictionData?.estimatedYield}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">Variance</p>
                      <p className="font-medium text-slate-700 dark:text-slate-300 text-sm">{p.predictionData?.variance}</p>
                    </div>
                  </div>
                )}
                {p.type === 'disease' && (
                    <div className="space-y-2">
                        <p className="text-red-600 dark:text-red-400 font-medium">Attention: Risque {p.predictionData?.riskLevel}</p>
                        <p>{p.predictionData?.recommendation}</p>
                    </div>
                )}
                {p.type === 'weather_impact' && (
                    <div className="space-y-2">
                        <p className="font-medium">{p.predictionData?.alert} sur {p.predictionData?.affectedArea}</p>
                        <p className="text-blue-600 dark:text-blue-400">Action: {p.predictionData?.mitigation}</p>
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
