import { NextFunction, Request, Response } from 'express';
import AuditLog from '../../models/AuditLog.js';
import { complaintService } from './complaint.service.js';
import { eventBus } from '../../services/eventBus.js';

const formatResponse = (data: any, message?: string) => ({
  success: true,
  data,
  message,
});

const formatError = (message: string, statusCode: number = 400) => ({
  success: false,
  error: message,
  statusCode,
});

export class ComplaintController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        status: req.query.status as string,
        priority: req.query.priority as string,
        category: req.query.category as string,
        assignedTeamId: req.query.teamId as string,
      };

      const complaints = await complaintService.getAllComplaints(
        filters,
        (req as any).organizationId
      );
      res.json(formatResponse(complaints));
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const complaint = await complaintService.getComplaintById(
        req.params.id as string,
        (req as any).organizationId
      );
      res.json(formatResponse(complaint));
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?._id;
      const organizationId = (req as any).organizationId;
      const complaintData = {
        ...req.body,
        userId,
        organizationId,
      };
      const complaint = await complaintService.createComplaint(complaintData);

      if (userId) {
        await AuditLog.create({
          action: 'CREATE_TICKET',
          userId: userId,
          targetId: (complaint as any)._id,
          targetType: 'Complaint',
          details: { title: req.body.title, category: req.body.category },
          ipAddress: req.ip,
        });
      }

      await eventBus.publish('complaint-events', 'COMPLAINT_CREATED', {
        complaintId: (complaint as any)._id,
        userId: userId,
        title: req.body.title,
        category: req.body.category,
        priority: req.body.priority,
        status: 'nouvelle',
        timestamp: new Date(),
      });

      res.status(201).json(formatResponse(complaint, 'Complaint created successfully'));
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const complaint = await complaintService.updateComplaint(
        req.params.id as string,
        req.body,
        (req as any).organizationId
      );

      if (req.body.status) {
        await eventBus.publish('complaint-events', 'COMPLAINT_STATUS_UPDATED', {
          complaintId: req.params.id,
          status: req.body.status,
          updatedBy: (req as any).user?._id,
          timestamp: new Date(),
        });
      }

      res.json(formatResponse(complaint, 'Complaint updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await complaintService.deleteComplaint(req.params.id as string, (req as any).organizationId);
      res.json(formatResponse(null, 'Complaint deleted successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await complaintService.getComplaintStats((req as any).organizationId);
      res.json(formatResponse(stats));
    } catch (error) {
      next(error);
    }
  }

  async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?._id;
      const organizationId = (req as any).organizationId;

      const complaint = await complaintService.approveComplaint(
        req.params.id as string,
        organizationId,
        userId
      );

      if (userId) {
        await AuditLog.create({
          action: 'APPROVE_COMPLAINT',
          userId: userId,
          targetId: complaint._id,
          targetType: 'Complaint',
          details: { number: complaint.number, title: complaint.title },
          ipAddress: req.ip,
        });
      }

      await eventBus.publish('complaint-events', 'COMPLAINT_APPROVED', {
        complaintId: complaint._id,
        approvedBy: userId,
        status: 'en cours',
        timestamp: new Date(),
      });

      res.json(formatResponse(complaint, 'Complaint approved successfully'));
    } catch (error) {
      next(error);
    }
  }

  async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?._id;
      const organizationId = (req as any).organizationId;
      const { rejectionReason } = req.body;

      if (!rejectionReason) {
        return res.status(400).json(formatError('Rejection reason is required'));
      }

      const complaint = await complaintService.rejectComplaint(
        req.params.id as string,
        organizationId,
        rejectionReason,
        userId
      );

      if (userId) {
        await AuditLog.create({
          action: 'REJECT_COMPLAINT',
          userId: userId,
          targetId: complaint._id,
          targetType: 'Complaint',
          details: {
            number: complaint.number,
            title: complaint.title,
            rejectionReason,
          },
          ipAddress: req.ip,
        });
      }

      await eventBus.publish('complaint-events', 'COMPLAINT_REJECTED', {
        complaintId: complaint._id,
        rejectedBy: userId,
        rejectionReason,
        status: 'rejetée',
        timestamp: new Date(),
      });

      res.json(formatResponse(complaint, 'Complaint rejected successfully'));
    } catch (error) {
      next(error);
    }
  }
}

export const complaintController = new ComplaintController();
