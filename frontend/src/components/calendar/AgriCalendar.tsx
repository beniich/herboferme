import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { Calendar, Filter, Plus, Cloud, CloudRain, Sun } from 'lucide-react';
import EventDetailModal from './EventDetailModal';

export default function AgriCalendar() {
  const [events, setEvents] = useState([]);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all'
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [weather, setWeather] = useState({ temp: 24, condition: 'Sunny', rain: 0 });

  // Fetch events
  const fetchEvents = async () => {
    try {
      // Build query string
      let qs = '?';
      if (filters.type !== 'all') qs += `type=${filters.type}&`;
      if (filters.status !== 'all') qs += `status=${filters.status}`;

      const res = await fetch(`http://localhost:4000/api/calendar/events${qs}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      
      if (data.success) {
        // Map to FullCalendar format
        const formatted = data.events.map((e: any) => ({
          id: e._id,
          title: e.title,
          start: e.startDate,
          end: e.endDate,
          allDay: e.allDay,
          backgroundColor: e.color || '#10B981',
          borderColor: e.color || '#10B981',
          extendedProps: { ...e }
        }));
        setEvents(formatted);
      }
    } catch (err) {
      console.error("Failed to fetch calendar events", err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  const handleEventClick = (info: any) => {
    setSelectedEvent(info.event.extendedProps);
    setIsModalOpen(true);
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'Rainys': return <CloudRain className="h-8 w-8 text-blue-400" />;
      case 'Cloudy': return <Cloud className="h-8 w-8 text-gray-400" />;
      default: return <Sun className="h-8 w-8 text-yellow-500" />;
    }
  };

  return (
    <div className="flex h-[calc(100vh-100px)] bg-gray-50 dark:bg-gray-900 overflow-hidden">
      
      {/* Sidebar / Filters */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col h-full overflow-y-auto hidden md:flex">
        
        <button className="flex items-center justify-center w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg mb-6 transition-colors">
          <Plus className="w-5 h-5 mr-2" />
          Nouvel Événement
        </button>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center mb-3">
            <Filter className="w-4 h-4 mr-2" />
            Filtres
          </h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Type d'activité</label>
              <select 
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md p-2 text-sm focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">Tous les types</option>
                <option value="culture_cycle">Cycle de culture</option>
                <option value="worker_task">Tâche ouvrier</option>
                <option value="maintenance">Maintenance</option>
                <option value="delivery">Livraison</option>
              </select>
            </div>
          </div>
        </div>

        {/* Weather Widget */}
        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
           <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">Météo Prévue (Agro)</h3>
           <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 flex items-center">
              {getWeatherIcon(weather.condition)}
              <div className="ml-3">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{weather.temp}°C</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{weather.condition} | Pluie: {weather.rain}mm</div>
              </div>
           </div>
        </div>
      </div>

      {/* Main Calendar View */}
      <div className="flex-1 p-4 bg-white dark:bg-gray-900 overflow-y-auto">
        <div className="calendar-container h-full">
          <FullCalendar
            plugins={[ dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin ]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
            }}
            events={events}
            eventClick={handleEventClick}
            editable={true}
            selectable={true}
            dayMaxEvents={true}
            locale="fr"
            height="100%"
            buttonText={{
              today: "Aujourd'hui",
              month: 'Mois',
              week: 'Semaine',
              day: 'Jour',
              list: 'Planning'
            }}
          />
        </div>
      </div>

      {/* Modal Details */}
      {isModalOpen && selectedEvent && (
        <EventDetailModal 
          event={selectedEvent} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}

      {/* Basic styles for FullCalendar theming in dark mode */}
      <style>{`
        .fc-theme-standard .fc-scrollgrid { border-color: #374151; }
        .dark .fc-col-header-cell { background-color: #1f2937; color: #a1a1aa; }
        .dark .fc-daygrid-day { background-color: #111827; }
        .dark .fc-daygrid-day-number { color: #d4d4d8; }
        .fc-toolbar-title { font-weight: 700 !important; color: #111827; }
        .dark .fc-toolbar-title { color: #f4f4f5; }
        .fc-button-primary { background-color: #059669 !important; border-color: #059669 !important; }
        .fc-button-primary:hover { background-color: #047857 !important; border-color: #047857 !important; }
        .fc-event { cursor: pointer; border: none; padding: 2px 4px; border-radius: 4px; }
      `}</style>
    </div>
  );
}
