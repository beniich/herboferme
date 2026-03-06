/**
 * REPOSITORY IMPLEMENTATION — MongoCropRepository
 * Cercle 3 : Infrastructure
 * Implémente le contrat ICropRepository défini par le domaine.
 */
import { Crop } from '../../modules/agro/crops.model.js';
import { ICropRepository, CropFilters, CropStats } from '../../domain/repositories/ICropRepository.js';
import { CropEntity } from '../../domain/entities/Crop.entity.js';
import { CropMapper } from '../mappers/CropMapper.js';
import mongoose from 'mongoose';

export class MongoCropRepository implements ICropRepository {
  
  async findAll(organizationId: string, filters: CropFilters = {}): Promise<CropEntity[]> {
    const query: any = { organizationId };

    if (filters.category) query.category = filters.category;
    if (filters.status)   query.status   = filters.status;
    if (filters.plotId)   query.plotId   = filters.plotId;

    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    const docs = await Crop.find(query).sort({ plantedDate: -1 }).lean();
    return docs.map(doc => CropMapper.toDomain(doc as any));
  }

  async findById(id: string, organizationId: string): Promise<CropEntity | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    
    const doc = await Crop.findOne({ _id: id, organizationId }).lean();
    return doc ? CropMapper.toDomain(doc as any) : null;
  }

  async save(entity: CropEntity): Promise<CropEntity> {
    const data = CropMapper.toPersistence(entity);
    
    let doc;
    if (entity.id) {
      // Update
      doc = await Crop.findOneAndUpdate(
        { _id: entity.id, organizationId: entity.organizationId },
        { $set: data },
        { new: true, runValidators: true }
      ).lean();
    } else {
      // Create
      doc = await Crop.create(data);
    }

    if (!doc) throw new Error('Échec de la sauvegarde de la culture');
    return CropMapper.toDomain(doc as any);
  }

  async delete(id: string, organizationId: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    
    const result = await Crop.findOneAndDelete({ _id: id, organizationId });
    return result !== null;
  }

  async getStats(organizationId: string, filters: Pick<CropFilters, 'category'> = {}): Promise<CropStats> {
    // On réutilise la méthode statique créée précédemment dans le modèle
    // car elle est déjà optimisée, tout en la mappant au contrat du domaine.
    const rawStats = await (Crop as any).getDashboardStats(organizationId);
    
    // Le mapping ici est simple car on veut des données structurées
    const stats = rawStats[0];
    return {
      byStatus:   stats.byStatus   || [],
      byCategory: stats.byCategory || [],
      totalYield: stats.yieldSummary[0]?.totalYieldEstimate || 0
    };
  }
}
