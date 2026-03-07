# 🌾 AgroMaître - Module Calendrier (Frontend Moderne)

## 🎨 PARTIE 1 : VISION AMÉLIORÉE DE L'INTERFACE

### Propositions d'Amélioration UX/UI

```
┌─────────────────────────────────────────────────────────┐
│         AMÉLIORATIONS PROPOSÉES                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ✨ VISION MODERNE                                      │
│     ├─ Vue mensuelle avec grille visuelle              │
│     ├─ Vue hebdomadaire détaillée                      │
│     ├─ Vue liste avec timeline                         │
│     ├─ Mini-calendrier latéral                         │
│     └─ Météo intégrée par jour                         │
│                                                         │
│  🎨 DESIGN AMÉLIORÉ                                     │
│     ├─ Couleurs par type d'événement                   │
│     ├─ Icônes pour chaque culture                      │
│     ├─ Badges de priorité                              │
│     ├─ Drag & drop pour déplacer                       │
│     └─ Modal détaillée au clic                         │
│                                                         │
│  🚀 FONCTIONNALITÉS                                     │
│     ├─ Filtres avancés (multi-select)                  │
│     ├─ Recherche instantanée                           │
│     ├─ Export PDF/Excel                                │
│     ├─ Notifications push                              │
│     ├─ Récurrence intelligente                         │
│     └─ Suggestions IA                                  │
│                                                         │
│  📊 ANALYTICS                                           │
│     ├─ Dashboard de productivité                       │
│     ├─ Temps passé par culture                         │
│     ├─ Coûts par période                               │
│     └─ Prévisions                                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 PARTIE 2 : COMPOSANT CALENDRIER PRINCIPAL

```typescript
// frontend/components/calendar/AgriCalendar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import frLocale from '@fullcalendar/core/locales/fr';
import {
  Calendar as CalendarIcon,
  Filter,
  Download,
  Plus,
  Search,
  Sun,
  CloudRain,
  Wind,
} from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end?: Date;
  allDay: boolean;
  backgroundColor: string;
  borderColor: string;
  extendedProps: {
    type: string;
    description?: string;
    culture?: any;
    task?: any;
    weather?: any;
  };
}

export const AgriCalendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [view, setView] = useState<'month' | 'week' | 'day' | 'list'>('month');
  const [filters, setFilters] = useState({
    cultureCycles: true,
    workerTasks: true,
    adminMeetings: true,
    deliveries: false,
  });
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [weatherData, setWeatherData] = useState<any>(null);

  useEffect(() => {
    fetchEvents();
    fetchWeather();
  }, [filters]);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/calendar/events', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();

      // Transform to FullCalendar format
      const transformedEvents = data.events.map((event: any) => ({
        id: event._id,
        title: event.title,
        start: event.startDate,
        end: event.endDate || event.startDate,
        allDay: event.allDay,
        backgroundColor: getEventColor(event.type),
        borderColor: getEventColor(event.type),
        extendedProps: {
          type: event.type,
          description: event.description,
          culture: event.culture,
          task: event.task,
          weather: event.weatherConditions,
        },
      }));

      setEvents(transformedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchWeather = async () => {
    // Integrate weather API (OpenWeatherMap, etc.)
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=33.5731&lon=-7.5898&appid=YOUR_API_KEY&units=metric`
      );
      const data = await response.json();
      setWeatherData(data);
    } catch (error) {
      console.error('Error fetching weather:', error);
    }
  };

  const getEventColor = (type: string): string => {
    const colors: Record<string, string> = {
      culture_cycle: '#10b981', // green
      worker_task: '#f59e0b', // amber
      admin_meeting: '#3b82f6', // blue
      delivery: '#8b5cf6', // purple
      maintenance: '#ef4444', // red
    };
    return colors[type] || '#6b7280';
  };

  const handleEventClick = (info: any) => {
    setSelectedEvent(info.event);
    setShowModal(true);
  };

  const handleDateClick = (info: any) => {
    // Open create event modal with selected date
    console.log('Date clicked:', info.dateStr);
  };

  const handleEventDrop = async (info: any) => {
    // Update event date via API
    try {
      await fetch(`/api/calendar/events/${info.event.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          startDate: info.event.start,
          endDate: info.event.end,
        }),
      });
    } catch (error) {
      console.error('Error updating event:', error);
      info.revert(); // Revert drag if error
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - Filtres & Mini Calendar */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">
          Filtres Agenda
        </h3>

        {/* Filtres par type */}
        <div className="space-y-3 mb-8">
          <FilterCheckbox
            label="Cycles cultures"
            checked={filters.cultureCycles}
            onChange={(checked) =>
              setFilters({ ...filters, cultureCycles: checked })
            }
            color="green"
          />
          <FilterCheckbox
            label="Tâches d'ouvriers"
            checked={filters.workerTasks}
            onChange={(checked) =>
              setFilters({ ...filters, workerTasks: checked })
            }
            color="amber"
          />
          <FilterCheckbox
            label="Réunions Admin"
            checked={filters.adminMeetings}
            onChange={(checked) =>
              setFilters({ ...filters, adminMeetings: checked })
            }
            color="blue"
          />
          <FilterCheckbox
            label="Livraisons prévues"
            checked={filters.deliveries}
            onChange={(checked) =>
              setFilters({ ...filters, deliveries: checked })
            }
            color="purple"
          />
        </div>

        {/* Météo de la semaine */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 mb-6">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Sun size={16} className="text-yellow-500" />
            Météo 7 jours
          </h4>
          <div className="space-y-2">
            <WeatherDay day="Lun" temp={22} icon="sunny" />
            <WeatherDay day="Mar" temp={24} icon="sunny" />
            <WeatherDay day="Mer" temp={19} icon="rainy" />
            <WeatherDay day="Jeu" temp={21} icon="cloudy" />
            <WeatherDay day="Ven" temp={23} icon="sunny" />
            <WeatherDay day="Sam" temp={25} icon="sunny" />
            <WeatherDay day="Dim" temp={20} icon="rainy" />
          </div>
        </div>

        {/* Tâches urgentes */}
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
          <h4 className="text-sm font-semibold mb-3 text-red-700 dark:text-red-400">
            ⚠️ Tâches urgentes
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Irrigation Parcelle A</span>
              <span className="text-xs text-gray-500">Aujourd'hui</span>
            </div>
            <div className="flex justify-between">
              <span>Fertilisation Blé</span>
              <span className="text-xs text-gray-500">Demain</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Calendar Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                Calendrier & Planning
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Vue agenda des travaux et cycles agricoles
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Rechercher un événement..."
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* View Toggle */}
              <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                <button
                  onClick={() => setView('month')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    view === 'month'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Mois
                </button>
                <button
                  onClick={() => setView('week')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    view === 'week'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Semaine
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    view === 'list'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Liste
                </button>
              </div>

              {/* Export */}
              <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg flex items-center gap-2 text-gray-700 dark:text-gray-300 transition-colors">
                <Download size={18} />
                Exporter
              </button>

              {/* Add Event */}
              <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center gap-2 transition-colors shadow-sm">
                <Plus size={18} />
                Nouvelle tâche
              </button>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 h-full">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
              initialView={
                view === 'month'
                  ? 'dayGridMonth'
                  : view === 'week'
                  ? 'timeGridWeek'
                  : 'listWeek'
              }
              locale={frLocale}
              events={events}
              editable={true}
              droppable={true}
              eventClick={handleEventClick}
              dateClick={handleDateClick}
              eventDrop={handleEventDrop}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: '',
              }}
              height="100%"
              eventContent={renderEventContent}
              dayMaxEvents={3}
              moreLinkText="plus"
              slotMinTime="06:00:00"
              slotMaxTime="20:00:00"
              allDaySlot={true}
              weekends={true}
              nowIndicator={true}
            />
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      {showModal && selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

// Custom event rendering
function renderEventContent(eventInfo: any) {
  const { type, culture } = eventInfo.event.extendedProps;
  
  return (
    <div className="p-1">
      <div className="flex items-center gap-1.5">
        {getEventIcon(type)}
        <span className="text-xs font-medium truncate">
          {eventInfo.event.title}
        </span>
      </div>
      {culture && (
        <div className="text-xs opacity-75 truncate mt-0.5">
          {culture.name} - {culture.surface}ha
        </div>
      )}
    </div>
  );
}

function getEventIcon(type: string) {
  // Return appropriate icon based on type
  return '🌾';
}

// Filter Checkbox Component
const FilterCheckbox: React.FC<{
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  color: string;
}> = ({ label, checked, onChange, color }) => (
  <label className="flex items-center gap-3 cursor-pointer group">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className={`w-5 h-5 rounded border-2 border-${color}-500 text-${color}-600 focus:ring-${color}-500`}
    />
    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
      {label}
    </span>
  </label>
);

// Weather Day Component
const WeatherDay: React.FC<{
  day: string;
  temp: number;
  icon: string;
}> = ({ day, temp, icon }) => {
  const getWeatherIcon = () => {
    switch (icon) {
      case 'sunny':
        return <Sun size={16} className="text-yellow-500" />;
      case 'rainy':
        return <CloudRain size={16} className="text-blue-500" />;
      default:
        return <Wind size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-600 dark:text-gray-400">{day}</span>
      <div className="flex items-center gap-2">
        {getWeatherIcon()}
        <span className="font-medium text-gray-900 dark:text-white">
          {temp}°C
        </span>
      </div>
    </div>
  );
};
```

Suite avec Event Detail Modal et données de test ! 🚀
