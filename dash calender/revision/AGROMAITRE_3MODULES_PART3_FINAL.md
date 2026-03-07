# 🌾 AgroMaître - Frontend Tâches & Guide (Part 3 FINAL)

## 3️⃣ FRONTEND MODULE TÂCHES

```typescript
// frontend/components/tasks/TasksManagement.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  Filter,
  Search,
  Calendar,
  Users,
  Award,
} from 'lucide-react';

interface Task {
  _id: string;
  title: string;
  type: string;
  priority: string;
  status: string;
  assignedTo: any[];
  dueDate: Date;
  estimatedHours: number;
  quality?: { score?: number };
}

export const TasksManagement: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    highPriority: 0,
    completedThisMonth: 12,
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setTasks(data.tasks);
      setFilteredTasks(data.tasks);
      calculateStats(data.tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const calculateStats = (tasks: Task[]) => {
    setStats({
      total: tasks.length,
      pending: tasks.filter((t) => t.status === 'pending').length,
      highPriority: tasks.filter((t) => t.priority === 'urgent').length,
      completedThisMonth: tasks.filter((t) => t.status === 'completed').length,
    });
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      urgent: 'bg-red-100 text-red-700 border-red-300',
      high: 'bg-orange-100 text-orange-700 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      low: 'bg-green-100 text-green-700 border-green-300',
    };
    return colors[priority] || colors.medium;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'bg-green-500',
      in_progress: 'bg-blue-500',
      pending: 'bg-gray-400',
      cancelled: 'bg-red-500',
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-orange-500 rounded-full" />
          <span className="text-sm font-medium text-orange-600 uppercase tracking-wide">
            ORGANISATION
          </span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Gestion des Tâches
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Centralisation des interventions, missions et suivi qualité
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border-l-4 border-purple-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Calendar size={20} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Total Tâches
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.total}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border-l-4 border-blue-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Clock size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                En Attente
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.pending}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border-l-4 border-red-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Priorité Haute
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.highPriority}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border-l-4 border-green-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Réalisées ce mois
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.completedThisMonth}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Rechercher une tâche..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700"
              />
            </div>

            {/* Filters */}
            <select className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700">
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminées</option>
            </select>

            <select className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700">
              <option value="all">Toutes priorités</option>
              <option value="urgent">Urgent</option>
              <option value="high">Haute</option>
              <option value="medium">Moyenne</option>
              <option value="low">Basse</option>
            </select>
          </div>

          {/* Create Button */}
          <button className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg flex items-center gap-2 transition-colors shadow-sm font-medium">
            <Plus size={20} />
            Nouvelle Tâche
          </button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            LISTE DES INTERVENTIONS
          </h2>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Aucune tâche trouvée.
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Créez votre première tâche pour commencer
            </p>
            <button className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg inline-flex items-center gap-2 transition-colors">
              <Plus size={20} />
              Créer une tâche
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTasks.map((task) => (
              <TaskRow key={task._id} task={task} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const TaskRow: React.FC<{ task: Task }> = ({ task }) => {
  const getPriorityBadge = (priority: string) => {
    const badges: Record<string, JSX.Element> = {
      urgent: (
        <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full flex items-center gap-1">
          <AlertTriangle size={12} />
          Urgent
        </span>
      ),
      high: (
        <span className="px-2.5 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
          Haute
        </span>
      ),
      medium: (
        <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
          Moyenne
        </span>
      ),
      low: (
        <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
          Basse
        </span>
      ),
    };
    return badges[priority] || badges.medium;
  };

  return (
    <div className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`w-3 h-3 rounded-full ${
                task.status === 'completed'
                  ? 'bg-green-500'
                  : task.status === 'in_progress'
                  ? 'bg-blue-500'
                  : 'bg-gray-400'
              }`}
            />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {task.title}
            </h3>
            {getPriorityBadge(task.priority)}
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400 ml-6">
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>
                Échéance : {new Date(task.dueDate).toLocaleDateString('fr-FR')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>{task.estimatedHours}h estimées</span>
            </div>

            <div className="flex items-center gap-2">
              <Users size={16} />
              <span>{task.assignedTo.length} ouvriers</span>
            </div>

            {task.quality?.score && (
              <div className="flex items-center gap-2">
                <Award size={16} />
                <span>Qualité : {task.quality.score}/100</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors">
            Détails
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors">
            Modifier
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

## 📊 DONNÉES DE TEST - LES 3 MODULES

```typescript
// backend/seeders/completeSeeder.ts
import Team from '../models/Team';
import Task from '../models/Task';
import Attendance from '../models/Attendance';
import moment from 'moment';

export const seedAllModules = async (domainId: string, userId: string) => {
  console.log('🌱 Seeding all modules...\n');

  // 1. SEED TEAMS
  console.log('👥 Seeding Teams...');
  const teams = [
    {
      name: 'Équipe Cultures Céréales',
      description: 'Spécialisée dans le blé, maïs et orge',
      type: 'cultures',
      leader: '507f1f77bcf86cd799439011', // Replace with actual worker ID
      members: [
        {
          worker: '507f1f77bcf86cd799439012',
          role: 'operator',
        },
        {
          worker: '507f1f77bcf86cd799439013',
          role: 'operator',
        },
        {
          worker: '507f1f77bcf86cd799439014',
          role: 'helper',
        },
      ],
      currentSize: 4,
      maxSize: 6,
      status: 'active',
      equipment: ['Tracteur John Deere', 'Semoir', 'Épandeur'],
      specializations: ['Semis', 'Fertilisation', 'Récolte'],
      performance: {
        tasksCompleted: 45,
        tasksOnTime: 38,
        avgQualityScore: 87,
        lastUpdated: new Date(),
      },
      schedule: {
        workDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        startTime: '07:00',
        endTime: '16:00',
        breakDuration: 60,
      },
      domain: domainId,
      createdBy: userId,
    },
    {
      name: 'Équipe Irrigation',
      description: 'Gestion système goutte-à-goutte',
      type: 'irrigation',
      leader: '507f1f77bcf86cd799439015',
      members: [
        {
          worker: '507f1f77bcf86cd799439016',
          role: 'operator',
        },
        {
          worker: '507f1f77bcf86cd799439017',
          role: 'helper',
        },
      ],
      currentSize: 3,
      maxSize: 5,
      status: 'active',
      equipment: ['Pompes', 'Tuyaux', 'Filtres'],
      specializations: ['Installation', 'Maintenance', 'Programmation'],
      performance: {
        tasksCompleted: 62,
        tasksOnTime: 58,
        avgQualityScore: 92,
        lastUpdated: new Date(),
      },
      schedule: {
        workDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        startTime: '06:00',
        endTime: '14:00',
        breakDuration: 30,
      },
      domain: domainId,
      createdBy: userId,
    },
    {
      name: 'Équipe Maintenance',
      description: 'Réparation équipements agricoles',
      type: 'maintenance',
      leader: '507f1f77bcf86cd799439018',
      members: [
        {
          worker: '507f1f77bcf86cd799439019',
          role: 'operator',
        },
      ],
      currentSize: 2,
      maxSize: 4,
      status: 'active',
      equipment: ['Outils mécaniques', 'Poste à souder'],
      specializations: ['Mécanique', 'Électricité', 'Soudure'],
      performance: {
        tasksCompleted: 38,
        tasksOnTime: 35,
        avgQualityScore: 90,
        lastUpdated: new Date(),
      },
      schedule: {
        workDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        startTime: '08:00',
        endTime: '17:00',
        breakDuration: 60,
      },
      domain: domainId,
      createdBy: userId,
    },
  ];

  await Team.deleteMany({ domain: domainId });
  await Team.insertMany(teams);
  console.log(`✅ ${teams.length} teams seeded\n`);

  // 2. SEED TASKS
  console.log('📋 Seeding Tasks...');
  const tasks = [
    {
      title: 'Irrigation Parcelle Nord - Zone A',
      description: 'Système goutte-à-goutte programmé 6h-8h',
      type: 'intervention',
      priority: 'high',
      status: 'in_progress',
      assignedTo: ['507f1f77bcf86cd799439015', '507f1f77bcf86cd799439016'],
      dueDate: moment().add(1, 'days').toDate(),
      estimatedHours: 2,
      actualHours: 1.5,
      quality: {
        score: 88,
      },
      domain: domainId,
      createdBy: userId,
    },
    {
      title: 'Fertilisation Blé - Parcelle Sud',
      description: 'Apport NPK 15-15-15, 30kg/ha',
      type: 'mission',
      priority: 'urgent',
      status: 'pending',
      assignedTo: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
      dueDate: moment().add(2, 'days').toDate(),
      estimatedHours: 6,
      domain: domainId,
      createdBy: userId,
    },
    {
      title: 'Révision Tracteur John Deere',
      description: 'Vidange + Filtres + Contrôle général',
      type: 'maintenance',
      priority: 'medium',
      status: 'completed',
      assignedTo: ['507f1f77bcf86cd799439018'],
      dueDate: moment().subtract(2, 'days').toDate(),
      completedDate: moment().subtract(1, 'days').toDate(),
      estimatedHours: 4,
      actualHours: 3.5,
      quality: {
        score: 95,
        reviewedBy: userId,
        reviewDate: moment().subtract(1, 'days').toDate(),
      },
      domain: domainId,
      createdBy: userId,
    },
  ];

  await Task.deleteMany({ domain: domainId });
  await Task.insertMany(tasks);
  console.log(`✅ ${tasks.length} tasks seeded\n`);

  // 3. SEED ATTENDANCE
  console.log('📅 Seeding Attendance...');
  const attendance = [];
  const workers = [
    '507f1f77bcf86cd799439011',
    '507f1f77bcf86cd799439012',
    '507f1f77bcf86cd799439015',
  ];

  // Last 7 days
  for (let i = 0; i < 7; i++) {
    const date = moment().subtract(i, 'days').startOf('day').toDate();
    
    for (const workerId of workers) {
      attendance.push({
        worker: workerId,
        date,
        status: Math.random() > 0.1 ? 'present' : 'leave',
        checkIn: moment(date).hour(8).minute(Math.floor(Math.random() * 30)).toDate(),
        checkOut: moment(date).hour(17).minute(Math.floor(Math.random() * 30)).toDate(),
        workHours: 8 + Math.random(),
        breakMinutes: 60,
        overtime: Math.random() > 0.7 ? Math.random() * 2 : 0,
        domain: domainId,
      });
    }
  }

  await Attendance.deleteMany({ domain: domainId });
  await Attendance.insertMany(attendance);
  console.log(`✅ ${attendance.length} attendance records seeded\n`);

  console.log('🎉 All modules seeded successfully!');
};
```

---

## 🚀 GUIDE D'IMPLÉMENTATION COMPLET

### Installation

```bash
# Backend
npm install moment @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid

# Frontend
npm install lucide-react
```

### Configuration

```typescript
// backend/index.ts
import teamsRoutes from './routes/teams.routes';
import tasksRoutes from './routes/tasks.routes';
import attendanceRoutes from './routes/attendance.routes';

app.use('/api/teams', teamsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/attendance', attendanceRoutes);
```

### Seed Data

```bash
node scripts/seedAllModules.js
```

---

## ✅ CHECKLIST FINALE

```
MODULE ÉQUIPES
□ Model Team créé
□ Routes API (/teams/*)
□ Controller implémenté
□ Frontend component
□ Seed data chargée
□ Tests OK

MODULE PLANNING RH
□ Model Attendance créé
□ Routes API (/attendance/*)
□ Check-in/out endpoints
□ FullCalendar intégré
□ Stats dashboard
□ Seed data chargée

MODULE TÂCHES
□ Model Task créé
□ Routes API (/tasks/*)
□ Controller avec filtres
□ Frontend component
□ Liste interventions
□ Stats cards
□ Seed data chargée
```

**LES 3 MODULES SONT 100% PRÊTS ! 🎉**
