'use client';

import React from 'react';
import AgriCalendar from '@/components/calendar/AgriCalendar';

export default function CalendarPage() {
  return (
    <div className="w-full h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header Optionnel */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-inter text-gray-900 dark:text-white">AgroMaître - Calendrier</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gérez vos cycles de culture et opérations journalières</p>
        </div>
      </div>
      
      {/* Composant principal */}
      <div className="flex-1 w-full relative">
        <AgriCalendar />
      </div>
    </div>
  );
}
