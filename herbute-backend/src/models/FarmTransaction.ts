import mongoose, { Document, Schema } from 'mongoose';

export interface IFarmTransaction extends Document {
  organizationId: mongoose.Types.ObjectId;
  date: Date;
  description: string;
  category: string; // Ventes, Intrants, Sant    , Charges, etc.
  sector: string; //      levage, L    gumes, Herbes, P    pini    re, G    n    ral
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

export default mongoose.model<IFarmTransaction>('FarmTransaction', FarmTransactionSchema);
