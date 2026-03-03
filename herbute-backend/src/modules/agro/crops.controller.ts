import { Request, Response, NextFunction } from 'express';
import { cropService } from './crops.service.js';

export class CropController {
  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await cropService.getStats(
        (req as any).organizationId!,
        { category: req.query.category as string | undefined }
      );
      res.json({ success: true, data: stats });
    } catch (err) { next(err); }
  }

  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const crops = await cropService.findAll((req as any).organizationId!, {
        category: req.query.category as string | undefined,
        status:   req.query.status   as string | undefined,
        plotId:   req.query.plotId   as string | undefined,
        search:   req.query.search   as string | undefined,
      });
      res.json({ success: true, data: crops });
    } catch (err) { next(err); }
  }

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const crop = await cropService.findById(req.params.id, (req as any).organizationId!);
      if (!crop) {
        res.status(404).json({ success: false, message: 'Culture introuvable' });
        return;
      }
      res.json({ success: true, data: crop });
    } catch (err) { next(err); }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const crop = await cropService.create((req as any).organizationId!, req.body);
      res.status(201).json({ success: true, data: crop });
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const crop = await cropService.update(req.params.id, (req as any).organizationId!, req.body);
      if (!crop) {
        res.status(404).json({ success: false, message: 'Culture introuvable' });
        return;
      }
      res.json({ success: true, data: crop });
    } catch (err) { next(err); }
  }

  async harvest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const crop = await cropService.harvest(req.params.id, (req as any).organizationId!, {
        actualYield: req.body.actualYield,
        notes:       req.body.notes,
      });
      if (!crop) {
        res.status(404).json({ success: false, message: 'Culture introuvable' });
        return;
      }
      res.json({ success: true, data: crop, message: 'Récolte enregistrée avec succès' });
    } catch (err) {
      if (err instanceof Error && err.message.includes('déjà été récoltée')) {
        res.status(409).json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deleted = await cropService.delete(req.params.id, (req as any).organizationId!);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Culture introuvable' });
        return;
      }
      res.json({ success: true, message: 'Supprimé avec succès' });
    } catch (err) { next(err); }
  }
}

export const cropController = new CropController();
