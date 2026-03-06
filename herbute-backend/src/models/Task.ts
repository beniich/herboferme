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

export default mongoose.models.Task || mongoose.model<ITask>('Task', taskSchema);
