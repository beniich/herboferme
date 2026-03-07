'use client';

import React from 'react';
import { BudgetDashboard } from '@/components/budget/BudgetDashboard';

export default function BudgetPage() {
    return (
        <div className="page active h-full">
            <BudgetDashboard />
        </div>
    );
}
