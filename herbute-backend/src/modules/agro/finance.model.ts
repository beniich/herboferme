import mongoose, { Document, Schema } from 'mongoose';

export interface IFarmTransaction extends Document {
  organizationId: mongoose.Types.ObjectId;
  date: Date;
  description: string;
  category: string;
  sector: string;
  type: 'recette' | 'depense';
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

const FarmTransactionSchema: Schema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  date: { type: Date, required: true, default: Date.now },
  description: { type: String, required: true },
  category: { type: String, required: true },
  sector: { type: String, required: true },
  type: { type: String, required: true, enum: ['recette', 'depense'] },
  amount: { type: Number, required: true, min: 0 }
}, {
  timestamps: true
});

export const FarmTransaction = mongoose.model<IFarmTransaction>('FarmTransaction', FarmTransactionSchema);

export interface IFarmKPI extends Document {
  organizationId: mongoose.Types.ObjectId;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  cashFlow: number;
  month: number;
  year: number;
  createdAt: Date;
  updatedAt: Date;
}

const FarmKPISchema: Schema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  totalRevenue: { type: Number, default: 0 },
  totalExpenses: { type: Number, default: 0 },
  netProfit: { type: Number, default: 0 },
  cashFlow: { type: Number, default: 0 },
  month: { type: Number, required: true },
  year: { type: Number, required: true }
}, {
  timestamps: true
});

FarmKPISchema.index({ organizationId: 1, month: 1, year: 1 }, { unique: true });

export const FarmKPI = mongoose.model<IFarmKPI>('FarmKPI', FarmKPISchema);
