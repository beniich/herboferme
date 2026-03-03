import mongoose, { Document, Schema } from 'mongoose';

export interface ICrop extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  category: 'VEGETABLE' | 'HERB' | 'NURSERY' | 'FOREST';
  plotId: string;
  status: 'PLANTED' | 'GROWING' | 'READY' | 'HARVESTED';
  plantedDate: Date;
  expectedHarvestDate?: Date;
  harvestedAt?: Date;
  estimatedYield: number;
  surface: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CropSchema: Schema = new Schema({
  organizationId:      { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  name:                { type: String, required: true },
  category:            { type: String, required: true, enum: ['VEGETABLE', 'HERB', 'NURSERY', 'FOREST'] },
  plotId:              { type: String, required: true },
  status:              { type: String, required: true, enum: ['PLANTED', 'GROWING', 'READY', 'HARVESTED'], default: 'PLANTED' },
  plantedDate:         { type: Date, required: true, default: Date.now },
  expectedHarvestDate: { type: Date },
  harvestedAt:         { type: Date },
  estimatedYield:      { type: Number, default: 0 },
  surface:             { type: Number, default: 0 },
  notes:               { type: String },
}, { timestamps: true });

CropSchema.index({ organizationId: 1, status: 1 });
CropSchema.index({ organizationId: 1, category: 1 });
CropSchema.index({ organizationId: 1, createdAt: -1 });
CropSchema.index({ organizationId: 1, harvestedAt: -1 });
CropSchema.index({ plotId: 1, status: 1 });
CropSchema.index({ name: 'text', notes: 'text' });

(CropSchema as any).statics.getDashboardStats = async function(organizationId: string) {
  return this.aggregate([
    { $match: { organizationId: new mongoose.Types.ObjectId(organizationId) } },
    {
      $facet: {
        byStatus: [
          { $group: { _id: '$status', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ],
        byCategory: [
          { $group: { _id: '$category', count: { $sum: 1 }, totalSurface: { $sum: '$surface' } } },
          { $sort: { count: -1 } },
        ],
        yieldSummary: [
          {
            $group: {
              _id: null,
              totalYieldEstimate: { $sum: '$estimatedYield' },
              avgSurface:         { $avg: '$surface' },
              totalCrops:         { $sum: 1 },
            },
          },
        ],
      },
    },
  ]);
};

export const Crop = mongoose.model<ICrop>('Crop', CropSchema);
export default Crop;
