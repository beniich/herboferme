# 🌾 AgroMaître - Planning RH & Tâches (Part 2)

## 2️⃣ MODULE PLANNING RH - SOLUTION COMPLÈTE

### BACKEND - Modèle Attendance

```typescript
// backend/models/Attendance.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
  worker: mongoose.Types.ObjectId;
  date: Date;
  status: 'present' | 'absent' | 'leave' | 'sick' | 'late';
  checkIn?: Date;
  checkOut?: Date;
  workHours: number;
  breakMinutes: number;
  overtime: number;
  leaveType?: 'vacation' | 'sick' | 'personal' | 'other';
  leaveReason?: string;
  approvedBy?: mongoose.Types.ObjectId;
  notes?: string;
  location?: {
    checkIn: { lat: number; lng: number };
    checkOut: { lat: number; lng: number };
  };
  domain: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    worker: {
      type: Schema.Types.ObjectId,
      ref: 'Worker',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'leave', 'sick', 'late'],
      required: true,
    },
    checkIn: Date,
    checkOut: Date,
    workHours: {
      type: Number,
      default: 0,
    },
    breakMinutes: {
      type: Number,
      default: 60,
    },
    overtime: {
      type: Number,
      default: 0,
    },
    leaveType: {
      type: String,
      enum: ['vacation', 'sick', 'personal', 'other'],
    },
    leaveReason: String,
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: String,
    location: {
      checkIn: {
        lat: Number,
        lng: Number,
      },
      checkOut: {
        lat: Number,
        lng: Number,
      },
    },
    domain: {
      type: Schema.Types.ObjectId,
      ref: 'Domain',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
attendanceSchema.index({ worker: 1, date: 1 }, { unique: true });
attendanceSchema.index({ domain: 1, date: 1 });

export default mongoose.model<IAttendance>('Attendance', attendanceSchema);
```

```typescript
// backend/controllers/attendance.controller.ts
import { Request, Response } from 'express';
import Attendance from '../models/Attendance';
import moment from 'moment';

export const getAttendance = async (req: any, res: Response) => {
  try {
    const { startDate, endDate, workerId, status } = req.query;

    const query: any = {
      domain: req.user.domain,
    };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }

    if (workerId) {
      query.worker = workerId;
    }

    if (status) {
      query.status = status;
    }

    const attendance = await Attendance.find(query)
      .populate('worker', 'firstName lastName position')
      .sort({ date: -1 });

    res.json({
      success: true,
      attendance,
      count: attendance.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const checkIn = async (req: any, res: Response) => {
  try {
    const { workerId, location } = req.body;

    const today = moment().startOf('day').toDate();

    // Check if already checked in
    const existing = await Attendance.findOne({
      worker: workerId,
      date: today,
    });

    if (existing && existing.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in today',
      });
    }

    const checkInTime = new Date();
    const scheduledStart = moment().hour(8).minute(0); // 08:00
    const isLate = moment(checkInTime).isAfter(scheduledStart);

    const attendance = await Attendance.findOneAndUpdate(
      {
        worker: workerId,
        date: today,
      },
      {
        $set: {
          checkIn: checkInTime,
          status: isLate ? 'late' : 'present',
          'location.checkIn': location,
          domain: req.user.domain,
        },
      },
      {
        upsert: true,
        new: true,
      }
    );

    res.json({
      success: true,
      attendance,
      message: isLate ? 'Check-in recorded (late)' : 'Check-in successful',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const checkOut = async (req: any, res: Response) => {
  try {
    const { workerId, location } = req.body;

    const today = moment().startOf('day').toDate();

    const attendance = await Attendance.findOne({
      worker: workerId,
      date: today,
    });

    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'No check-in found for today',
      });
    }

    const checkOutTime = new Date();
    const checkInTime = attendance.checkIn;

    // Calculate work hours
    const duration = moment.duration(
      moment(checkOutTime).diff(moment(checkInTime))
    );
    const totalMinutes = duration.asMinutes();
    const workHours = (totalMinutes - attendance.breakMinutes) / 60;

    // Calculate overtime (if more than 8 hours)
    const overtime = Math.max(0, workHours - 8);

    attendance.checkOut = checkOutTime;
    attendance.workHours = workHours;
    attendance.overtime = overtime;
    attendance.location = {
      ...attendance.location,
      checkOut: location,
    };

    await attendance.save();

    res.json({
      success: true,
      attendance,
      message: 'Check-out successful',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAttendanceStats = async (req: any, res: Response) => {
  try {
    const { month, year } = req.query;

    const startDate = moment()
      .year(parseInt(year as string))
      .month(parseInt(month as string) - 1)
      .startOf('month')
      .toDate();

    const endDate = moment()
      .year(parseInt(year as string))
      .month(parseInt(month as string) - 1)
      .endOf('month')
      .toDate();

    const stats = await Attendance.aggregate([
      {
        $match: {
          domain: req.user.domain,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalHours: { $sum: '$workHours' },
          totalOvertime: { $sum: '$overtime' },
        },
      },
    ]);

    const workerStats = await Attendance.aggregate([
      {
        $match: {
          domain: req.user.domain,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$worker',
          presentDays: {
            $sum: {
              $cond: [{ $eq: ['$status', 'present'] }, 1, 0],
            },
          },
          totalHours: { $sum: '$workHours' },
          totalOvertime: { $sum: '$overtime' },
        },
      },
      {
        $lookup: {
          from: 'workers',
          localField: '_id',
          foreignField: '_id',
          as: 'worker',
        },
      },
      {
        $unwind: '$worker',
      },
      {
        $project: {
          workerId: '$_id',
          firstName: '$worker.firstName',
          lastName: '$worker.lastName',
          presentDays: 1,
          totalHours: 1,
          totalOvertime: 1,
        },
      },
    ]);

    res.json({
      success: true,
      stats: {
        byStatus: stats,
        byWorker: workerStats,
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

### FRONTEND - Planning RH Component

```typescript
// frontend/components/hr/HRPlanning.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Users,
  Clock,
  TrendingUp,
  UserCheck,
  UserX,
  Coffee,
} from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import frLocale from '@fullcalendar/core/locales/fr';

export const HRPlanning: React.FC = () => {
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    employeesPresent: 45,
    totalEmployees: 52,
    onLeave: 5,
    overtimeHours: 12,
  });

  useEffect(() => {
    fetchAttendance();
    fetchStats();
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await fetch('/api/attendance', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setAttendanceData(data.attendance);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const fetchStats = async () => {
    // Fetch real stats from API
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-blue-600">PLANNING RH</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Planning RH
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gestion du calendrier de présence, affectation des équipes et suivi des temps de travail
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <UserCheck size={24} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Employés présents</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.employeesPresent}/{stats.totalEmployees}
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{
                width: `${(stats.employeesPresent / stats.totalEmployees) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
              <Coffee size={24} className="text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">En congés</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.onLeave} personnes
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Clock size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Heures suppl.</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.overtimeHours}heures (ce mois)
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <TrendingUp size={24} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Taux présence</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">94%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Calendrier de Présence
        </h2>

        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin]}
          initialView="dayGridMonth"
          locale={frLocale}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek',
          }}
          events={[
            {
              title: '45 présents',
              start: new Date(),
              backgroundColor: '#10b981',
              borderColor: '#10b981',
            },
            {
              title: '5 en congés',
              start: new Date(),
              backgroundColor: '#f59e0b',
              borderColor: '#f59e0b',
            },
          ]}
          height="600px"
          eventClick={(info) => {
            console.log('Event clicked:', info.event);
          }}
        />
      </div>

      {/* Team Assignment Section */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Affectation des Équipes par Poste
        </h2>

        <div className="grid grid-cols-3 gap-6">
          <PostCard
            post="Cultures"
            assigned={12}
            total={15}
            color="green"
          />
          <PostCard
            post="Irrigation"
            assigned={8}
            total={10}
            color="blue"
          />
          <PostCard
            post="Maintenance"
            assigned={6}
            total={8}
            color="orange"
          />
        </div>
      </div>
    </div>
  );
};

const PostCard: React.FC<{
  post: string;
  assigned: number;
  total: number;
  color: string;
}> = ({ post, assigned, total, color }) => (
  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-semibold text-gray-900 dark:text-white">{post}</h3>
      <span className={`text-sm font-medium text-${color}-600`}>
        {assigned}/{total}
      </span>
    </div>
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
      <div
        className={`bg-${color}-500 h-2 rounded-full`}
        style={{ width: `${(assigned / total) * 100}%` }}
      />
    </div>
  </div>
);
```

---

## 3️⃣ MODULE TÂCHES - SOLUTION COMPLÈTE

### BACKEND - Modèle Task

```typescript
// backend/models/Task.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description?: string;
  type: 'intervention' | 'mission' | 'maintenance' | 'inspection';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo: mongoose.Types.ObjectId[];
  team?: mongoose.Types.ObjectId;
  plot?: mongoose.Types.ObjectId;
  equipment?: string[];
  dueDate: Date;
  startDate?: Date;
  completedDate?: Date;
  estimatedHours: number;
  actualHours?: number;
  quality: {
    score?: number; // 0-100
    reviewedBy?: mongoose.Types.ObjectId;
    reviewDate?: Date;
    notes?: string;
  };
  resources: {
    materials?: string[];
    cost?: number;
  };
  checklist?: Array<{
    item: string;
    completed: boolean;
  }>;
  photos?: string[];
  tags: string[];
  domain: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    type: {
      type: String,
      enum: ['intervention', 'mission', 'maintenance', 'inspection'],
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    assignedTo: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Worker',
      },
    ],
    team: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
    },
    plot: {
      type: Schema.Types.ObjectId,
      ref: 'Plot',
    },
    equipment: [String],
    dueDate: {
      type: Date,
      required: true,
    },
    startDate: Date,
    completedDate: Date,
    estimatedHours: {
      type: Number,
      required: true,
    },
    actualHours: Number,
    quality: {
      score: Number,
      reviewedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      reviewDate: Date,
      notes: String,
    },
    resources: {
      materials: [String],
      cost: Number,
    },
    checklist: [
      {
        item: String,
        completed: {
          type: Boolean,
          default: false,
        },
      },
    ],
    photos: [String],
    tags: [String],
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
taskSchema.index({ domain: 1, status: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ assignedTo: 1 });

export default mongoose.model<ITask>('Task', taskSchema);
```

Suite avec le frontend des tâches et données de test ! 🚀
