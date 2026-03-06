import mongoose, { Document, Schema } from 'mongoose';

export interface IADSyncLog extends Document {
  organizationId: mongoose.Types.ObjectId;
  syncType: 'manual' | 'scheduled' | 'automatic';
  action: 'imported' | 'updated' | 'disabled' | 'error';
  username?: string;
  userEmail?: string;
  totalProcessed: number;
  successful: number;
  failed: number;
  syncErrors?: Array<{
    username: string;
    error: string;
  }>;
  changes?: {
    imported: number;
    updated: number;
    disabled: number;
  };
  duration: number; // milliseconds
  triggeredBy?: mongoose.Types.ObjectId;
  details?: any;
  createdAt: Date;
}

const ADSyncLogSchema = new Schema<IADSyncLog>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },

    syncType: {
      type: String,
      enum: ['manual', 'scheduled', 'automatic'],
      default: 'manual',
    },

    action: {
      type: String,
      enum: ['imported', 'updated', 'disabled', 'error'],
      required: true,
    },

    // User-specific sync (optional, null for full sync)
    username: String,
    userEmail: String,

    // Statistics
    totalProcessed: {
      type: Number,
      default: 0,
    },
    successful: {
      type: Number,
      default: 0,
    },
    failed: {
      type: Number,
      default: 0,
    },

    // Errors encountered
    syncErrors: [
      {
        username: String,
        error: String,
      },
    ],

    // Change summary
    changes: {
      imported: { type: Number, default: 0 },
      updated: { type: Number, default: 0 },
      disabled: { type: Number, default: 0 },
    },

    // Performance
    duration: Number, // ms

    // Audit
    triggeredBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    // Additional details
    details: Schema.Types.Mixed,

    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false, // Only use createdAt
  }
);

// Indexes
ADSyncLogSchema.index({ organizationId: 1, createdAt: -1 });
ADSyncLogSchema.index({ organizationId: 1, action: 1 });
ADSyncLogSchema.index({ username: 1 });

export default mongoose.model<IADSyncLog>('ADSyncLog', ADSyncLogSchema);
