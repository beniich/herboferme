import mongoose, { Schema, Document } from 'mongoose';

export interface IAgriTeam extends Document {
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

const agriTeamSchema = new Schema<IAgriTeam>(
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
agriTeamSchema.index({ domain: 1, status: 1 });
agriTeamSchema.index({ type: 1 });

export default mongoose.models.AgriTeam || mongoose.model<IAgriTeam>('AgriTeam', agriTeamSchema);
