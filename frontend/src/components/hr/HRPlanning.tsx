'use client';

import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Clock, UserCheck, AlertTriangle, CalendarDays, BarChart2 } from 'lucide-react';

export default function HRPlanning() {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchAttendance();
    fetchStats();
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/attendance`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setAttendance(data.attendance);
      }
    } catch (err) {
      console.error("Erreur de récupération des présences", err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/attendance/stats`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Erreur de récupération des stats RH", err);
    }
  };

  // Convert attendance to calendar events
  const calendarEvents = attendance.map(a => {
    let color = '';
    switch(a.status) {
      case 'present': color = '#10B981'; break;
      case 'late': color = '#F59E0B'; break;
      case 'absent': color = '#EF4444'; break;
      case 'leave': color = '#3B82F6'; break;
      case 'sick': color = '#8B5CF6'; break;
      default: color = '#6B7280';
    }

    const workerName = a.worker ? `${a.worker.firstName} ${a.worker.lastName}` : 'Ouvrier';

    return {
      id: a._id,
      title: `${workerName} - ${a.status}`,
      start: a.checkIn || a.date,
      end: a.checkOut || null,
      allDay: ['absent', 'leave', 'sick'].includes(a.status),
      backgroundColor: color,
      borderColor: color,
    };
  });

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-80px)]">
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-inter text-gray-900 dark:text-white">Planning RH & Présences</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Surveillez le pointage, les retards et les heures supplémentaires.</p>
      </div>

      {/* Overview Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
             <div className="flex items-center">
               <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg mr-4">
                 <UserCheck className="w-6 h-6 text-green-600 dark:text-green-500" />
               </div>
               <div>
                 <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Présences (Mois)</p>
                 <p className="text-xl font-bold text-gray-900 dark:text-white">
                   {stats.byStatus.find((s: any) => s._id === 'present')?.count || 0}
                 </p>
               </div>
             </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
             <div className="flex items-center">
               <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg mr-4">
                 <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-500" />
               </div>
               <div>
                 <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Retards</p>
                 <p className="text-xl font-bold text-gray-900 dark:text-white">
                   {stats.byStatus.find((s: any) => s._id === 'late')?.count || 0}
                 </p>
               </div>
             </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
             <div className="flex items-center">
               <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mr-4">
                 <Clock className="w-6 h-6 text-blue-600 dark:text-blue-500" />
               </div>
               <div>
                 <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Heures Travaillées</p>
                 <p className="text-xl font-bold text-gray-900 dark:text-white">
                   {Math.round(stats.byStatus.reduce((acc: number, curr: any) => acc + (curr.totalHours || 0), 0))}h
                 </p>
               </div>
             </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
             <div className="flex items-center">
               <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg mr-4">
                 <BarChart2 className="w-6 h-6 text-purple-600 dark:text-purple-500" />
               </div>
               <div>
                 <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Heures Sup.</p>
                 <p className="text-xl font-bold text-gray-900 dark:text-white">
                   {Math.round(stats.byStatus.reduce((acc: number, curr: any) => acc + (curr.totalOvertime || 0), 0))}h
                 </p>
               </div>
             </div>
          </div>
        </div>
      )}

      {/* Calendar Area */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 h-[600px] overflow-hidden">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <CalendarDays className="w-5 h-5 mr-2 text-green-600" />
          Calendrier des Pointages
        </h2>
        <div className="h-[calc(100%-40px)]">
          <FullCalendar
            plugins={[ dayGridPlugin, timeGridPlugin ]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={calendarEvents}
            locale="fr"
            height="100%"
            buttonText={{
              today: 'Aujourd\'hui',
              month: 'Mois',
              week: 'Semaine',
              day: 'Jour'
            }}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              meridiem: false,
              hour12: false
            }}
          />
        </div>
      </div>

      <style>{`
        .fc-theme-standard .fc-scrollgrid { border-color: #374151; }
        .dark .fc-col-header-cell { background-color: #1f2937; color: #a1a1aa; }
        .dark .fc-daygrid-day { background-color: #111827; }
        .dark .fc-daygrid-day-number { color: #d4d4d8; }
        .fc-toolbar-title { font-weight: 600 !important; color: #111827; font-size: 1.25rem !important; }
        .dark .fc-toolbar-title { color: #f4f4f5; }
        .fc-button-primary { background-color: #f3f4f6 !important; border-color: #e5e7eb !important; color: #374151 !important; text-transform: capitalize; }
        .dark .fc-button-primary { background-color: #374151 !important; border-color: #4b5563 !important; color: #f3f4f6 !important; }
        .fc-button-primary:hover { background-color: #e5e7eb !important; border-color: #d1d5db !important; }
        .dark .fc-button-primary:hover { background-color: #4b5563 !important; border-color: #6b7280 !important; }
        .fc-button-active { background-color: #059669 !important; border-color: #059669 !important; color: white !important; }
        .fc-event { border: none; padding: 2px 4px; border-radius: 4px; font-size: 0.75rem; }
      `}</style>

    </div>
  );
}
