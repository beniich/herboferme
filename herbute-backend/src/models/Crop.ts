import mongoose, { Document, Schema } from 'mongoose';

export interface ICrop extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string; // e.g., 'Tomates', 'Menthe', 'Plantes'
  category: 'L    gumes' | 'Herbes' | 'P    pini    re';
  plotId: string; // Identifier for the field/plot
  status: 'Plant    ' | 'En croissance' | 'Pr    t     r    colter' | 'R    colt    ';
  plantedDate: Date;
  expectedHarvestDate?: Date;
  estimatedYield: number; // in kg or units
  createdAt: Date;
  updatedAt: Date;
}

const CropSchema: Schema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  name: { type: String, required: true },
  category: {
    type: String,
    required: true,
    enum: ['VEGETABLE', 'HERB', 'NURSERY']
  },
  plotId: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ['PLANTED', 'GROWING', 'READY', 'HARVESTED'],
    default: 'PLANTED'
  },
  plantedDate: { type: Date, required: true, default: Date.now },
  expectedHarvestDate: { type: Date },
  estimatedYield: { type: Number, default: 0 }
}, {
  timestamps: true
});

export default mongoose.model<ICrop>('Crop', CropSchema);
