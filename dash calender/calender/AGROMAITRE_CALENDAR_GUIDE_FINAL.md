# 🌾 AgroMaître - Guide Installation & Améliorations (FINAL)

## 🚀 PARTIE 5 : GUIDE D'INSTALLATION COMPLET

### Étape 1 : Installation des dépendances

```bash
# Backend
cd backend
npm install moment mongoose @types/moment

# Frontend
cd frontend
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction @fullcalendar/list @fullcalendar/core
npm install lucide-react
npm install date-fns # Alternative à moment pour frontend
```

### Étape 2 : Configuration Backend

```typescript
// backend/index.ts - Ajouter les routes
import calendarRoutes from './routes/calendar.routes';

app.use('/api/calendar', calendarRoutes);
```

### Étape 3 : Seeder les données de test

```bash
# Créer script de seed
node scripts/seedCalendar.js
```

```typescript
// scripts/seedCalendar.ts
import mongoose from 'mongoose';
import { seedCalendarEvents } from '../seeders/calendarSeeder';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/agromaitre';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('📦 Connected to MongoDB');

    // Replace with your actual domain and user IDs
    const domainId = '507f1f77bcf86cd799439011';
    const userId = '507f191e810c19729de860ea';

    await seedCalendarEvents(domainId, userId);

    console.log('✅ Calendar seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seed();
```

### Étape 4 : Intégrer le composant Frontend

```typescript
// app/calendar/page.tsx
import { AgriCalendar } from '@/components/calendar/AgriCalendar';

export default function CalendarPage() {
  return <AgriCalendar />;
}
```

---

## 🎨 PARTIE 6 : PROPOSITIONS D'AMÉLIORATION UX/UI AVANCÉES

### 1. Vue Kanban pour Tâches

```typescript
// components/calendar/TaskKanban.tsx
'use client';

import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: string;
  assignedTo: string[];
}

export const TaskKanban: React.FC = () => {
  const [tasks, setTasks] = useState<Record<string, Task[]>>({
    pending: [],
    in_progress: [],
    completed: [],
  });

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;

    // Move task between columns
    const sourceTasks = Array.from(tasks[source.droppableId]);
    const [removed] = sourceTasks.splice(source.index, 1);
    const destTasks = Array.from(tasks[destination.droppableId]);
    destTasks.splice(destination.index, 0, removed);

    setTasks({
      ...tasks,
      [source.droppableId]: sourceTasks,
      [destination.droppableId]: destTasks,
    });

    // Update backend
    updateTaskStatus(removed.id, destination.droppableId);
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    // API call
  };

  return (
    <div className="grid grid-cols-3 gap-6 h-full">
      <DragDropContext onDragEnd={onDragEnd}>
        {['pending', 'in_progress', 'completed'].map((status) => (
          <div key={status} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-white capitalize">
              {status.replace('_', ' ')}
            </h3>
            <Droppable droppableId={status}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-3"
                >
                  {tasks[status]?.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm cursor-move"
                        >
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                            {task.title}
                          </h4>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">
                              {task.assignedTo.length} ouvriers
                            </span>
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                task.priority === 'urgent'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {task.priority}
                            </span>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </DragDropContext>
    </div>
  );
};
```

### 2. Timeline Vue (Gantt-like)

```typescript
// components/calendar/TimelineView.tsx
'use client';

import React from 'react';

export const TimelineView: React.FC<{ events: any[] }> = ({ events }) => {
  const cultures = ['Blé', 'Maïs', 'Tomate', 'Carotte'];
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 overflow-x-auto">
      <h3 className="text-lg font-bold mb-6">Timeline des Cultures 2026</h3>
      
      <div className="min-w-[1200px]">
        {/* Header - Months */}
        <div className="grid grid-cols-13 gap-2 mb-4">
          <div className="font-semibold text-sm">Culture</div>
          {months.map((month) => (
            <div key={month} className="text-center text-xs font-medium text-gray-500">
              {month}
            </div>
          ))}
        </div>

        {/* Rows - Cultures */}
        {cultures.map((culture) => (
          <div key={culture} className="grid grid-cols-13 gap-2 mb-3 items-center">
            <div className="font-medium text-sm">{culture}</div>
            {months.map((month, idx) => (
              <div key={idx} className="h-8 bg-gray-100 dark:bg-gray-700 rounded relative">
                {/* Render event bars here based on dates */}
                {idx >= 2 && idx <= 5 && (
                  <div
                    className="absolute inset-0 bg-green-500/60 rounded flex items-center justify-center text-xs text-white font-medium"
                    style={{
                      left: idx === 2 ? '0%' : '0',
                      right: idx === 5 ? '0%' : '0',
                    }}
                  >
                    {idx === 3 && 'Semis → Récolte'}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 3. Dashboard Agricole Intégré

```typescript
// components/calendar/AgriDashboard.tsx
'use client';

import React from 'react';
import { TrendingUp, Users, Droplet, DollarSign, Calendar as CalendarIcon } from 'lucide-react';

export const AgriDashboard: React.FC = () => {
  const stats = [
    {
      label: 'Tâches en cours',
      value: '12',
      change: '+3',
      icon: CalendarIcon,
      color: 'orange',
    },
    {
      label: 'Ouvriers actifs',
      value: '8',
      change: '+2',
      icon: Users,
      color: 'blue',
    },
    {
      label: 'Consommation eau',
      value: '245 m³',
      change: '-12%',
      icon: Droplet,
      color: 'cyan',
    },
    {
      label: 'Coûts mois',
      value: '45,200 MAD',
      change: '+5%',
      icon: DollarSign,
      color: 'green',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className={`p-3 bg-${stat.color}-100 dark:bg-${stat.color}-900/20 rounded-lg`}
            >
              <stat.icon className={`text-${stat.color}-600 dark:text-${stat.color}-400`} size={24} />
            </div>
            <span
              className={`text-sm font-medium ${
                stat.change.startsWith('+')
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {stat.change}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {stat.value}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
        </div>
      ))}
    </div>
  );
};
```

### 4. Intégration Météo Avancée

```typescript
// components/calendar/WeatherWidget.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, Wind } from 'lucide-react';

interface WeatherData {
  date: string;
  temp: number;
  condition: string;
  rainfall: number;
  windSpeed: number;
  favorable: boolean;
}

export const WeatherWidget: React.FC = () => {
  const [forecast, setForecast] = useState<WeatherData[]>([]);

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    // Call OpenWeatherMap API
    const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
    const LAT = 33.5731; // Casablanca
    const LON = -7.5898;

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric&lang=fr`
      );
      const data = await response.json();

      // Process forecast data
      const processedForecast = data.list.slice(0, 7).map((item: any) => ({
        date: new Date(item.dt * 1000).toLocaleDateString('fr-FR', {
          weekday: 'short',
        }),
        temp: Math.round(item.main.temp),
        condition: item.weather[0].main,
        rainfall: item.rain?.['3h'] || 0,
        windSpeed: Math.round(item.wind.speed * 3.6),
        favorable: item.main.temp > 15 && item.main.temp < 30 && !item.rain,
      }));

      setForecast(processedForecast);
    } catch (error) {
      console.error('Weather fetch error:', error);
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear':
        return <Sun className="text-yellow-500" size={24} />;
      case 'rain':
        return <CloudRain className="text-blue-500" size={24} />;
      case 'clouds':
        return <Cloud className="text-gray-500" size={24} />;
      default:
        return <Wind className="text-gray-400" size={24} />;
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Sun size={20} />
        Prévisions Météo - Casablanca
      </h3>

      <div className="grid grid-cols-7 gap-3">
        {forecast.map((day, index) => (
          <div
            key={index}
            className={`bg-white/10 backdrop-blur-sm rounded-lg p-3 ${
              day.favorable ? 'ring-2 ring-green-300' : ''
            }`}
          >
            <p className="text-xs font-medium mb-2 text-center">{day.date}</p>
            <div className="flex justify-center mb-2">{getWeatherIcon(day.condition)}</div>
            <p className="text-xl font-bold text-center mb-1">{day.temp}°C</p>
            {day.rainfall > 0 && (
              <p className="text-xs text-center opacity-75">
                💧 {day.rainfall}mm
              </p>
            )}
            {day.favorable && (
              <p className="text-xs text-center text-green-300 mt-1">✓ Favorable</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-white/10 rounded-lg">
        <p className="text-sm font-medium">💡 Recommandation IA</p>
        <p className="text-xs opacity-90 mt-1">
          Conditions idéales pour l'irrigation lundi et mardi. Éviter les traitements
          mercredi (pluie prévue).
        </p>
      </div>
    </div>
  );
};
```

### 5. Notifications Push Intelligentes

```typescript
// lib/notifications/agriNotifications.ts
import { sendPushNotification } from './pushService';

interface NotificationRule {
  type: string;
  daysBeforeAlert: number[];
  message: (event: any) => string;
}

const NOTIFICATION_RULES: NotificationRule[] = [
  {
    type: 'culture_cycle',
    daysBeforeAlert: [1, 3, 7],
    message: (event) =>
      `⏰ Rappel: ${event.title} prévu dans {days} jour(s) - ${event.culture.surface}ha`,
  },
  {
    type: 'worker_task',
    daysBeforeAlert: [1],
    message: (event) =>
      `🔔 Tâche urgente: ${event.title} - Priorité ${event.task.priority}`,
  },
];

export async function scheduleEventNotifications(event: any) {
  const rule = NOTIFICATION_RULES.find((r) => r.type === event.type);
  if (!rule) return;

  const eventDate = new Date(event.startDate);

  for (const days of rule.daysBeforeAlert) {
    const notificationDate = new Date(eventDate);
    notificationDate.setDate(notificationDate.getDate() - days);

    if (notificationDate > new Date()) {
      // Schedule notification
      const message = rule.message(event).replace('{days}', days.toString());

      // Use job scheduler (Bull, Agenda, etc.)
      await scheduleJob(notificationDate, async () => {
        await sendPushNotification({
          userId: event.createdBy,
          title: 'AgroMaître - Rappel',
          body: message,
          data: {
            eventId: event._id,
            type: event.type,
          },
        });
      });
    }
  }
}
```

---

## 📊 PARTIE 7 : CHECKLIST D'IMPLÉMENTATION

```
✅ BACKEND
  □ Models créés (AgriEvent)
  □ Routes API (/calendar/*)
  □ Controllers implémentés
  □ Seed data chargé
  □ Tests API passants

✅ FRONTEND
  □ FullCalendar installé
  □ AgriCalendar component créé
  □ EventDetailModal créé
  □ Filtres fonctionnels
  □ Drag & drop actif
  □ Responsive design

✅ FONCTIONNALITÉS AVANCÉES
  □ Vue Kanban tâches
  □ Timeline cultures
  □ Dashboard stats
  □ Météo intégrée
  □ Notifications push
  □ Export PDF/Excel
  □ Recherche avancée

✅ UX/UI
  □ Design moderne
  □ Dark mode
  □ Animations fluides
  □ Loading states
  □ Error handling
  □ Accessibilité
```

---

## 🎨 AMÉLIORATION VISUELLE - COMPARAISON AVANT/APRÈS

### AVANT (État actuel)
```
❌ Page vide avec message "À venir"
❌ Filtres statiques
❌ Pas de données réelles
❌ UI basique
```

### APRÈS (Proposition)
```
✅ Calendrier interactif complet
✅ 3 vues (Mois, Semaine, Liste)
✅ Drag & drop événements
✅ Modal détaillée avec météo
✅ Filtres multi-critères
✅ Dashboard intégré
✅ Notifications intelligentes
✅ Timeline cultures
✅ Vue Kanban tâches
✅ Export données
✅ Recherche instantanée
✅ Météo 7 jours
✅ Recommandations IA
✅ Design moderne et responsive
```

---

## 🚀 PROCHAINES ÉTAPES

### Semaine 1
1. Implémenter backend complet
2. Seeder données de test
3. Tester API endpoints

### Semaine 2
1. Intégrer FullCalendar
2. Créer modal détails
3. Ajouter filtres

### Semaine 3
1. Implémenter météo
2. Ajouter notifications
3. Créer vue Kanban

### Semaine 4
1. Dashboard analytics
2. Export fonctions
3. Tests & optimisation

**CALENDRIER AGRICOLE COMPLET PRÊT ! 🌾🚀**
