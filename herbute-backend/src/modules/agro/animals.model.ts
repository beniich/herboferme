import mongoose, { Document, Schema } from 'mongoose';

export interface IAnimal extends Document {
  organizationId: mongoose.Types.ObjectId;
  type: string;
  breed: string;
  count: number;
  averageAge: number;
  category: 'LIVESTOCK' | 'POULTRY';
  status: 'PRODUCTION' | 'ACTIVE' | 'GROWING' | 'LAYING' | 'SICK' | 'SOLD';
  health?: 'healthy' | 'ill' | 'recovering' | 'deceased';
  estimatedValue: number;
  notes?: string;
  vaccinations?: Array<{ name: string; date: Date; nextDue?: Date }>;
  createdAt: Date;
  updatedAt: Date;
}

const AnimalSchema: Schema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  type:           { type: String, required: true },
  breed:          { type: String, required: true },
  category:       { type: String, required: true, enum: ['LIVESTOCK', 'POULTRY'], default: 'LIVESTOCK' },
  count:          { type: Number, required: true, min: 0 },
  averageAge:     { type: Number, required: true, min: 0 },
  status:         { type: String, required: true, enum: ['PRODUCTION', 'ACTIVE', 'GROWING', 'LAYING', 'SICK', 'SOLD'], default: 'ACTIVE' },
  health:         { type: String, enum: ['healthy', 'ill', 'recovering', 'deceased'], default: 'healthy' },
  estimatedValue: { type: Number, default: 0 },
  notes:          { type: String },
  vaccinations: [{
    name:    { type: String },
    date:    { type: Date },
    nextDue: { type: Date },
  }],
}, { timestamps: true });

AnimalSchema.index({ organizationId: 1 });
AnimalSchema.index({ organizationId: 1, category: 1 });
AnimalSchema.index({ organizationId: 1, status: 1 });
AnimalSchema.index({ organizationId: 1, health: 1 });
AnimalSchema.index({ organizationId: 1, category: 1, status: 1 });
AnimalSchema.index({ 'vaccinations.nextDue': 1 });
AnimalSchema.index({ organizationId: 1, createdAt: -1 });
AnimalSchema.index({ type: 'text', breed: 'text', notes: 'text' });

(AnimalSchema as any).statics.getDashboardStats = async function(organizationId: string) {
  return this.aggregate([
    { $match: { organizationId: new mongoose.Types.ObjectId(organizationId) } },
    {
      $facet: {
        totalAnimals: [
          { $group: { _id: null, total: { $sum: '$count' } } },
        ],
        byCategory: [
          { $group: { _id: '$category', count: { $sum: '$count' }, entries: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ],
        byStatus: [
          { $group: { _id: '$status', count: { $sum: '$count' } } },
          { $sort: { count: -1 } },
        ],
        sickAnimals: [
          { $match: { status: 'SICK' } },
          { $project: { type: 1, breed: 1, count: 1, category: 1 } },
          { $limit: 10 },
        ],
        upcomingVaccinations: [
          { $unwind: { path: '$vaccinations', preserveNullAndEmptyArrays: false } },
          {
            $match: {
              'vaccinations.nextDue': {
                $gte: new Date(),
                $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              },
            },
          },
          { $project: { type: 1, breed: 1, 'vaccinations.name': 1, 'vaccinations.nextDue': 1 } },
          { $limit: 5 },
        ],
      },
    },
  ]);
};

export const Animal = mongoose.model<IAnimal>('Animal', AnimalSchema);
export default Animal;
