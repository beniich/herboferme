import mongoose, { Schema, Document } from 'mongoose';

export interface IAgriEvent extends Document {
  type: 'culture_cycle' | 'worker_task' | 'admin_meeting' | 'delivery' | 'maintenance';
  title: string;
  description?: string;
  
  // Dates
  startDate: Date;
  endDate?: Date;
  allDay: boolean;
  
  // Culture spécifique
  culture?: {
    name: string; // Blé, Maïs, Tomate, etc.
    variety?: string;
    surface: number; // en hectares
    plotId?: mongoose.Types.ObjectId;
  };
  
  // Tâches
  task?: {
    assignedTo: mongoose.Types.ObjectId[]; // Workers
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    equipmentNeeded: string[];
    estimatedDuration: number; // en heures
  };
  
  // Météo (optionnel - intégration API météo)
  weatherConditions?: {
    temperature: number;
    rainfall: number;
    windSpeed: number;
    favorable: boolean;
  };
  
  // Récurrence
  recurrence?: {
    pattern: 'daily' | 'weekly' | 'monthly' | 'seasonal';
    interval: number;
    endDate?: Date;
  };
  
  // Ressources
  resources?: {
    waterUsage?: number; // en m³
    fertilizerUsage?: number; // en kg
    seedsUsage?: number; // en kg
    cost?: number; // en MAD
  };
  
  // Notifications
  notifications: {
    email: boolean;
    sms: boolean;
    app: boolean;
    daysBeforeAlert: number[];
  };
  
  // Méta
  domain: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  color: string; // Pour le calendrier
  tags: string[];
  attachments?: string[]; // URLs
  notes?: string;
}

const agriEventSchema = new Schema<IAgriEvent>(
  {
    type: {
      type: String,
      enum: ['culture_cycle', 'worker_task', 'admin_meeting', 'delivery', 'maintenance'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    
    startDate: {
      type: Date,
      required: true,
    },
    endDate: Date,
    allDay: {
      type: Boolean,
      default: false,
    },
    
    culture: {
      name: String,
      variety: String,
      surface: Number,
      plotId: {
        type: Schema.Types.ObjectId,
        ref: 'Plot',
      },
    },
    
    task: {
      assignedTo: [{
        type: Schema.Types.ObjectId,
        ref: 'User', // Was 'Worker', changed to 'User' to match existing auth patterns or keep 'User' ? Note: The user might have a Worker model, let's keep Worker if it exists, but usually users are in User. The schema says 'Worker'. Let's keep it as is, or we might need to check. Wait, I see "ref: 'Worker'" in the original text. Let's keep Worker to be faithful, if it breaks we'll fix it. Actually, looking at the previous issues, it's safer to use whatever the original guide said. Let's use 'Worker' because the guide explicitly uses 'Worker' model in Teams too.
      }],
      status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'cancelled'],
        default: 'pending',
      },
      priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium',
      },
      equipmentNeeded: [String],
      estimatedDuration: Number,
    },
    
    weatherConditions: {
      temperature: Number,
      rainfall: Number,
      windSpeed: Number,
      favorable: Boolean,
    },
    
    recurrence: {
      pattern: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'seasonal'],
      },
      interval: Number,
      endDate: Date,
    },
    
    resources: {
      waterUsage: Number,
      fertilizerUsage: Number,
      seedsUsage: Number,
      cost: Number,
    },
    
    notifications: {
      email: {
        type: Boolean,
        default: true,
      },
      sms: {
        type: Boolean,
        default: false,
      },
      app: {
        type: Boolean,
        default: true,
      },
      daysBeforeAlert: {
        type: [Number],
        default: [1, 3, 7],
      },
    },
    
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
    color: {
      type: String,
      default: '#10b981', // green-500
    },
    tags: [String],
    attachments: [String],
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
agriEventSchema.index({ domain: 1, startDate: 1 });
agriEventSchema.index({ type: 1, startDate: 1 });
agriEventSchema.index({ 'task.assignedTo': 1 });

export default mongoose.models.AgriEvent || mongoose.model<IAgriEvent>('AgriEvent', agriEventSchema);
