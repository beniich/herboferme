import mongoose, { Document, Schema } from 'mongoose';

export interface IAnimal extends Document {
  organizationId: mongoose.Types.ObjectId;
  type: string; // e.g., 'Vaches', 'Moutons', 'Poulets'
  breed: string; // e.g., 'Holstein', 'Sardi'
  count: number;
  averageAge: number; // in months
  status: 'En production' | 'Actif' | 'Croissance' | 'En ponte' | 'Malade' | 'Vendu';
  estimatedValue: number;
  createdAt: Date;
  updatedAt: Date;
}

const AnimalSchema: Schema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  type: { type: String, required: true },
  breed: { type: String, required: true },
  count: { type: Number, required: true, min: 0 },
  averageAge: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    required: true,
    enum: ['PRODUCTION', 'ACTIVE', 'GROWING', 'LAYING', 'SICK', 'SOLD'],
    default: 'ACTIVE'
  },
  estimatedValue: { type: Number, default: 0 }
}, {
  timestamps: true
});

export default mongoose.model<IAnimal>('Animal', AnimalSchema);
