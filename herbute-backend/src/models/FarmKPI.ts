import mongoose, { Document, Schema } from 'mongoose';

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

export default mongoose.model<IFarmKPI>('FarmKPI', FarmKPISchema);
