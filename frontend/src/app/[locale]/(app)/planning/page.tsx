'use client';

import React from 'react';
import { PlanningRH } from '@/components/planning/PlanningRH';

export default function PlanningPage() {
    return (
        <div className="page active" id="page-planning">
            <div className="page-header">
                <div className="page-label" style={{ color: 'var(--blue)' }}>Organisation</div>
                <h1 className="page-title">Calendrier & Planning RH</h1>
                <div className="page-sub">Gérez vos équipes, interventions et le calendrier de la ferme</div>
            </div>

            <div className="content-grid cg-1" style={{ height: 'calc(100vh - 150px)' }}>
                <PlanningRH />
            </div>
        </div>
    );
}
