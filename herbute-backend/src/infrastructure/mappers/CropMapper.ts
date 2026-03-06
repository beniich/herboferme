/**
 * MAPPER — CropMapper
 * Cercle 3 : Infrastructure
 * Traduit entre la persistance (MongoDB Document) et le Domaine (Entity).
 */
import { CropEntity, CropProps } from '../../domain/entities/Crop.entity.js';
import { ICrop } from '../../modules/agro/crops.model.js';

export class CropMapper {
  /**
   * Convertit un document MongoDB en entité Domaine
   */
  static toDomain(doc: ICrop): CropEntity {
    const props: CropProps = {
      id:                  doc._id.toString(),
      organizationId:      doc.organizationId.toString(),
      name:                doc.name,
      category:            doc.category as any,
      plotId:              doc.plotId,
      status:              doc.status as any,
      plantedDate:         doc.plantedDate,
      expectedHarvestDate: doc.expectedHarvestDate,
      harvestedAt:         doc.harvestedAt,
      estimatedYield:      doc.estimatedYield,
      surface:             doc.surface,
      notes:               doc.notes,
      createdAt:           doc.createdAt,
      updatedAt:           doc.updatedAt,
    };

    return CropEntity.reconstitute(props);
  }

  /**
   * Convertit une entité Domaine en objet pour la persistance
   */
  static toPersistence(entity: CropEntity): any {
    const props = entity.toPlainObject();
    
    return {
      name:                props.name,
      category:            props.category,
      plotId:              props.plotId,
      status:              props.status,
      plantedDate:         props.plantedDate,
      expectedHarvestDate: props.expectedHarvestDate,
      harvestedAt:         props.harvestedAt,
      estimatedYield:      props.estimatedYield,
      surface:             props.surface,
      notes:               props.notes,
      organizationId:      props.organizationId,
    };
  }
}
