import { Crop, ICrop } from './crops.model.js';
import mongoose from 'mongoose';

export interface CropFilters {
  category?: string;
  status?: string;
  plotId?: string;
  search?: string;
}

export interface CreateCropDTO {
  name: string;
  category: 'VEGETABLE' | 'HERB' | 'NURSERY' | 'FOREST';
  plotId: string;
  plantedDate: Date;
  status?: 'PLANTED' | 'GROWING' | 'READY' | 'HARVESTED';
  expectedHarvestDate?: Date;
  estimatedYield?: number;
  surface?: number;
  notes?: string;
}

export interface HarvestDTO {
  actualYield: number;
  notes?: string;
}

export interface CropStats {
  byStatus:   Array<{ _id: string; count: number; yield: number }>;
  byCategory: Array<{ _id: string; count: number }>;
  totalYield: number;
}

export class CropService {
  async findAll(organizationId: string, filters: CropFilters = {}): Promise<ICrop[]> {
    const query: Record<string, unknown> = { organizationId: new mongoose.Types.ObjectId(organizationId) };

    if (filters.category) query.category = filters.category;
    if (filters.status)   query.status   = filters.status;
    if (filters.plotId)   query.plotId   = filters.plotId;

    if (filters.search) {
      return (Crop as any).find(
        { ...query, $text: { $search: filters.search } },
        { score: { $meta: 'textScore' } }
      ).sort({ score: { $meta: 'textScore' } });
    }

    return (Crop as any).find(query).sort({ plantedDate: -1 }).lean() as unknown as ICrop[];
  }

  async findById(id: string, organizationId: string): Promise<ICrop | null> {
    return (Crop as any).findOne({ _id: id, organizationId: new mongoose.Types.ObjectId(organizationId) }).lean() as unknown as ICrop | null;
  }

  async create(organizationId: string, dto: CreateCropDTO): Promise<ICrop> {
    return (Crop as any).create({ ...dto, organizationId: new mongoose.Types.ObjectId(organizationId) });
  }

  async update(id: string, organizationId: string, updates: Partial<CreateCropDTO>): Promise<ICrop | null> {
    const { ...safeUpdates } = updates;
    return (Crop as any).findOneAndUpdate(
      { _id: id, organizationId: new mongoose.Types.ObjectId(organizationId) },
      { $set: safeUpdates },
      { new: true, runValidators: true }
    ).lean() as unknown as ICrop | null;
  }

  async harvest(id: string, organizationId: string, dto: HarvestDTO): Promise<ICrop | null> {
    const crop = await Crop.findOne({ _id: id, organizationId: new mongoose.Types.ObjectId(organizationId) });
    if (!crop) return null;

    if (crop.status === 'HARVESTED') {
      throw new Error('Cette culture a déjà été récoltée');
    }

    return (Crop as any).findOneAndUpdate(
      { _id: id, organizationId: new mongoose.Types.ObjectId(organizationId) },
      {
        $set: {
          status:         'HARVESTED',
          estimatedYield: dto.actualYield,
          harvestedAt:    new Date(),
          ...(dto.notes ? { notes: dto.notes } : {}),
        },
      },
      { new: true }
    ).lean() as unknown as ICrop;
  }

  async delete(id: string, organizationId: string): Promise<boolean> {
    const result = await (Crop as any).findOneAndDelete({ _id: id, organizationId: new mongoose.Types.ObjectId(organizationId) });
    return result !== null;
  }

  async getStats(organizationId: string, filters: Pick<CropFilters, 'category'> = {}): Promise<CropStats> {
    const matchFilter: Record<string, unknown> = { organizationId: new mongoose.Types.ObjectId(organizationId) };
    if (filters.category) matchFilter.category = filters.category;

    const [byStatus, byCategory, totalYieldArr] = await Promise.all([
      (Crop as any).aggregate([
        { $match: matchFilter },
        { $group: { _id: '$status', count: { $sum: 1 }, yield: { $sum: '$estimatedYield' } } },
        { $sort: { count: -1 } },
      ]),
      (Crop as any).aggregate([
        { $match: matchFilter },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      (Crop as any).aggregate([
        { $match: { ...matchFilter, status: { $in: ['HARVESTED', 'READY'] } } },
        { $group: { _id: null, total: { $sum: '$estimatedYield' } } },
      ]),
    ]);

    return {
      byStatus,
      byCategory,
      totalYield: totalYieldArr[0]?.total || 0,
    };
  }
}

export const cropService = new CropService();
