# 🌾 AgroMaître - Transformation Complète des 3 Modules

## 📋 VUE D'ENSEMBLE

```
┌─────────────────────────────────────────────────────────┐
│         3 MODULES À TRANSFORMER                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1️⃣ ÉQUIPES                                            │
│     État: "Aucune équipe trouvée"                      │
│     → Gestion équipes + affectations                   │
│                                                         │
│  2️⃣ PLANNING RH                                        │
│     État: "Module en cours d'intégration"              │
│     → Calendrier présence + gestion temps              │
│                                                         │
│  3️⃣ TÂCHES                                             │
│     État: "Aucune tâche trouvée" (12 réalisées)        │
│     → Gestion missions + suivi qualité                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

# 1️⃣ MODULE ÉQUIPES - SOLUTION COMPLÈTE

## BACKEND - Modèle & Routes

```typescript
// backend/models/Team.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ITeam extends Document {
  name: string;
  description?: string;
  type: 'cultures' | 'irrigation' | 'maintenance' | 'harvest' | 'general';
  leader: mongoose.Types.ObjectId;
  members: Array<{
    worker: mongoose.Types.ObjectId;
    role: 'leader' | 'operator' | 'helper';
    joinedAt: Date;
  }>;
  currentSize: number;
  maxSize?: number;
  status: 'active' | 'inactive' | 'suspended';
  equipment: string[];
  specializations: string[];
  performance: {
    tasksCompleted: number;
    tasksOnTime: number;
    avgQualityScore: number;
    lastUpdated: Date;
  };
  schedule: {
    workDays: string[]; // ['monday', 'tuesday', ...]
    startTime: string; // "08:00"
    endTime: string; // "17:00"
    breakDuration: number; // minutes
  };
  assignedPlots: mongoose.Types.ObjectId[];
  domain: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const teamSchema = new Schema<ITeam>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    type: {
      type: String,
      enum: ['cultures', 'irrigation', 'maintenance', 'harvest', 'general'],
      required: true,
    },
    leader: {
      type: Schema.Types.ObjectId,
      ref: 'Worker',
      required: true,
    },
    members: [
      {
        worker: {
          type: Schema.Types.ObjectId,
          ref: 'Worker',
          required: true,
        },
        role: {
          type: String,
          enum: ['leader', 'operator', 'helper'],
          default: 'operator',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    currentSize: {
      type: Number,
      default: 0,
    },
    maxSize: Number,
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
    equipment: [String],
    specializations: [String],
    performance: {
      tasksCompleted: {
        type: Number,
        default: 0,
      },
      tasksOnTime: {
        type: Number,
        default: 0,
      },
      avgQualityScore: {
        type: Number,
        default: 0,
      },
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
    },
    schedule: {
      workDays: {
        type: [String],
        default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      },
      startTime: {
        type: String,
        default: '08:00',
      },
      endTime: {
        type: String,
        default: '17:00',
      },
      breakDuration: {
        type: Number,
        default: 60,
      },
    },
    assignedPlots: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Plot',
      },
    ],
    domain: {
      type: Schema.Types.ObjectId,
      ref: 'Domain',
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
teamSchema.index({ domain: 1, status: 1 });
teamSchema.index({ type: 1 });

export default mongoose.model<ITeam>('Team', teamSchema);
```

```typescript
// backend/routes/teams.routes.ts
import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  addMember,
  removeMember,
  updatePerformance,
  getTeamStats,
} from '../controllers/teams.controller';

const router = express.Router();

router.get('/', authenticate, getTeams);
router.get('/:id', authenticate, getTeamById);
router.post('/', authenticate, createTeam);
router.put('/:id', authenticate, updateTeam);
router.delete('/:id', authenticate, deleteTeam);
router.post('/:id/members', authenticate, addMember);
router.delete('/:id/members/:workerId', authenticate, removeMember);
router.put('/:id/performance', authenticate, updatePerformance);
router.get('/stats/overview', authenticate, getTeamStats);

export default router;
```

```typescript
// backend/controllers/teams.controller.ts
import { Request, Response } from 'express';
import Team from '../models/Team';

export const getTeams = async (req: any, res: Response) => {
  try {
    const { type, status } = req.query;

    const query: any = {
      domain: req.user.domain,
    };

    if (type) query.type = type;
    if (status) query.status = status;

    const teams = await Team.find(query)
      .populate('leader', 'firstName lastName email phone')
      .populate('members.worker', 'firstName lastName specialization')
      .populate('assignedPlots', 'name surface')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      teams,
      count: teams.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createTeam = async (req: any, res: Response) => {
  try {
    const teamData = {
      ...req.body,
      domain: req.user.domain,
      createdBy: req.user.id,
      currentSize: req.body.members?.length || 0,
    };

    const team = await Team.create(teamData);

    res.status(201).json({
      success: true,
      team,
      message: 'Team created successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const addMember = async (req: any, res: Response) => {
  try {
    const { workerId, role } = req.body;

    const team = await Team.findOneAndUpdate(
      {
        _id: req.params.id,
        domain: req.user.domain,
      },
      {
        $push: {
          members: {
            worker: workerId,
            role: role || 'operator',
            joinedAt: new Date(),
          },
        },
        $inc: { currentSize: 1 },
      },
      { new: true }
    ).populate('members.worker', 'firstName lastName');

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    res.json({
      success: true,
      team,
      message: 'Member added successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTeamStats = async (req: any, res: Response) => {
  try {
    const stats = await Team.aggregate([
      {
        $match: { domain: req.user.domain },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalMembers: { $sum: '$currentSize' },
          avgSize: { $avg: '$currentSize' },
        },
      },
    ]);

    const typeStats = await Team.aggregate([
      {
        $match: { domain: req.user.domain },
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalMembers: { $sum: '$currentSize' },
        },
      },
    ]);

    res.json({
      success: true,
      stats: {
        byStatus: stats,
        byType: typeStats,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
```

## FRONTEND - Composant Équipes

```typescript
// frontend/components/teams/TeamsManagement.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  UserPlus,
  Edit,
  Trash2,
  Award,
  Calendar,
  MapPin,
} from 'lucide-react';

interface Team {
  _id: string;
  name: string;
  type: string;
  leader: any;
  members: any[];
  currentSize: number;
  status: string;
  performance: any;
  schedule: any;
}

export const TeamsManagement: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    filterTeams();
  }, [searchTerm, selectedType, teams]);

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setTeams(data.teams);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const filterTeams = () => {
    let filtered = teams;

    if (searchTerm) {
      filtered = filtered.filter((team) =>
        team.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter((team) => team.type === selectedType);
    }

    setFilteredTeams(filtered);
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      cultures: 'bg-green-100 text-green-700',
      irrigation: 'bg-blue-100 text-blue-700',
      maintenance: 'bg-orange-100 text-orange-700',
      harvest: 'bg-yellow-100 text-yellow-700',
      general: 'bg-gray-100 text-gray-700',
    };
    return colors[type] || colors.general;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      cultures: 'Cultures',
      irrigation: 'Irrigation',
      maintenance: 'Maintenance',
      harvest: 'Récolte',
      general: 'Général',
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Équipes
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gestion des équipes opérationnelles et affectations
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Users}
          label="Total Équipes"
          value={teams.length}
          change="+2"
          color="blue"
        />
        <StatCard
          icon={Users}
          label="Équipes Actives"
          value={teams.filter((t) => t.status === 'active').length}
          change="+1"
          color="green"
        />
        <StatCard
          icon={Users}
          label="Total Membres"
          value={teams.reduce((sum, t) => sum + t.currentSize, 0)}
          change="+5"
          color="purple"
        />
        <StatCard
          icon={Award}
          label="Performance Moy."
          value="87%"
          change="+3%"
          color="orange"
        />
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Rechercher une équipe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Tous les types</option>
            <option value="cultures">Cultures</option>
            <option value="irrigation">Irrigation</option>
            <option value="maintenance">Maintenance</option>
            <option value="harvest">Récolte</option>
            <option value="general">Général</option>
          </select>

          {/* Create Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus size={20} />
            Nouvelle Équipe
          </button>
        </div>
      </div>

      {/* Teams Grid */}
      {filteredTeams.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Aucune équipe trouvée
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Créez votre première équipe pour commencer
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg inline-flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Créer une équipe
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <TeamCard key={team._id} team={team} onUpdate={fetchTeams} />
          ))}
        </div>
      )}
    </div>
  );
};

// Team Card Component
const TeamCard: React.FC<{ team: Team; onUpdate: () => void }> = ({
  team,
  onUpdate,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              {team.name}
            </h3>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                team.status === 'active'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {team.status}
            </span>
          </div>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Edit size={16} className="text-gray-600 dark:text-gray-400" />
            </button>
            <button className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
              <Trash2 size={16} className="text-red-600 dark:text-red-400" />
            </button>
          </div>
        </div>

        <span className={`px-2.5 py-1 rounded text-xs font-medium`}>
          {team.type}
        </span>
      </div>

      {/* Body */}
      <div className="p-6">
        {/* Leader */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <Users size={20} className="text-orange-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Chef d'équipe</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {team.leader?.firstName} {team.leader?.lastName}
            </p>
          </div>
        </div>

        {/* Members */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">Membres</span>
          <span className="font-bold text-gray-900 dark:text-white">
            {team.currentSize} {team.maxSize && `/ ${team.maxSize}`}
          </span>
        </div>

        {/* Performance */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Tâches complétées</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {team.performance.tasksCompleted}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{
                width: `${
                  (team.performance.tasksOnTime /
                    team.performance.tasksCompleted) *
                    100 || 0
                }%`,
              }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
            {Math.round(
              (team.performance.tasksOnTime / team.performance.tasksCompleted) *
                100 || 0
            )}
            % à temps
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <button className="w-full py-2 text-sm font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 flex items-center justify-center gap-2 transition-colors">
          <UserPlus size={16} />
          Ajouter un membre
        </button>
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  icon: any;
  label: string;
  value: number | string;
  change: string;
  color: string;
}> = ({ icon: Icon, label, value, change, color }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
    <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center mb-4`}>
      <Icon className={`text-${color}-600`} size={24} />
    </div>
    <p className="text-gray-500 text-sm mb-1">{label}</p>
    <div className="flex items-end justify-between">
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <span className="text-green-600 text-sm font-medium">{change}</span>
    </div>
  </div>
);
```

Suite avec Planning RH et Tâches dans le prochain fichier ! 🚀
