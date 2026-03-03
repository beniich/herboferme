import mongoose, { Document, Schema } from 'mongoose';

export interface IIrrigationLog extends Document {
  organizationId: mongoose.Types.ObjectId;
  plotId: string;
  volume: number;
  duration: number;
  date: Date;
  status: 'COMPLETED' | 'SCHEDULED' | 'IN_PROGRESS';
  method: 'DRIP' | 'SPRINKLER' | 'SURFACE';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const IrrigationLogSchema: Schema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  plotId: { type: String, required: true },
  volume: { type: Number, required: true, min: 0 },
  duration: { type: Number, required: true, min: 0 },
  date: { type: Date, required: true, default: Date.now },
  status: { 
    type: String, 
    required: true, 
    enum: ['COMPLETED', 'SCHEDULED', 'IN_PROGRESS'],
    default: 'COMPLETED'
  },
  method: { 
    type: String, 
    required: true, 
    enum: ['DRIP', 'SPRINKLER', 'SURFACE'],
    default: 'DRIP'
  },
  notes: { type: String }
}, {
  timestamps: true
});

export const IrrigationLog = mongoose.model<IIrrigationLog>('IrrigationLog', IrrigationLogSchema);
