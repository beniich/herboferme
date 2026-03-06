import mongoose, { Document, Schema } from 'mongoose';

export interface IITTicket extends Document {
  organizationId: mongoose.Types.ObjectId;
  ticketNumber: string;
  title: string;
  description: string;
  category: 'hardware' | 'software' | 'network' | 'account' | 'printer' | 'security' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  status: 'new' | 'assigned' | 'in_progress' | 'pending' | 'resolved' | 'closed';
  requestedBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  relatedAsset?: mongoose.Types.ObjectId;
  sla?: {
    responseTime: number; // minutes
    resolutionTime: number; // minutes
    responseDeadline: Date;
    resolutionDeadline: Date;
    breached: boolean;
  };
  updates?: Array<{
    timestamp: Date;
    userId: mongoose.Types.ObjectId;
    message: string;
    internal: boolean; // Internal notes vs public updates
  }>;
  resolution?: {
    summary: string;
    rootCause?: string;
    solution?: string;
    resolvedBy: mongoose.Types.ObjectId;
  };
  attachments?: Array<{
    filename: string;
    url: string;
    uploadedBy: mongoose.Types.ObjectId;
    uploadedAt: Date;
  }>;
  satisfaction?: {
    rating: number; // 1-5
    feedback?: string;
    submittedAt: Date;
  };
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  closedAt?: Date;
}

const ITTicketSchema = new Schema<IITTicket>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },

    // Identification
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },

    // Classification
    category: {
      type: String,
      enum: ['hardware', 'software', 'network', 'account', 'printer', 'security', 'other'],
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent', 'critical'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['new', 'assigned', 'in_progress', 'pending', 'resolved', 'closed'],
      default: 'new',
    },

    // Assignment
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    relatedAsset: {
      type: Schema.Types.ObjectId,
      ref: 'ITAsset',
    },

    // SLA Tracking
    sla: {
      responseTime: Number,
      resolutionTime: Number,
      responseDeadline: Date,
      resolutionDeadline: Date,
      breached: { type: Boolean, default: false },
    },

    // Updates/Comments
    updates: [
      {
        timestamp: { type: Date, default: Date.now },
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        message: String,
        internal: { type: Boolean, default: false },
      },
    ],

    // Resolution
    resolution: {
      summary: String,
      rootCause: String,
      solution: String,
      resolvedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    },

    // Attachments
    attachments: [
      {
        filename: String,
        url: String,
        uploadedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // Satisfaction survey
    satisfaction: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      feedback: String,
      submittedAt: Date,
    },

    // Metadata
    tags: [String],

    // Timestamps
    resolvedAt: Date,
    closedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
ITTicketSchema.index({ organizationId: 1, status: 1 });
ITTicketSchema.index({ organizationId: 1, priority: 1 });
ITTicketSchema.index({ organizationId: 1, category: 1 });
ITTicketSchema.index({ assignedTo: 1 });
ITTicketSchema.index({ requestedBy: 1 });
ITTicketSchema.index({ ticketNumber: 1 });

// Pre-save hook to auto-generate ticket number
ITTicketSchema.pre('save', async function (next) {
  if (this.isNew && !this.ticketNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('ITTicket').countDocuments({
      organizationId: this.organizationId,
    });
    this.ticketNumber = `IT-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

export default mongoose.model<IITTicket>('ITTicket', ITTicketSchema);
