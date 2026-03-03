import { Types } from 'mongoose';
import { Complaint, IComplaint } from './complaint.model.js';
import { autoAssignComplaint } from '../../services/schedulingService.js';
import notificationService from '../../services/socketService.js';

export class ComplaintService {
    async getAllComplaints(filters: any = {}, organizationId: string) {
        const query: any = { organizationId };

        if (filters.status) query.status = filters.status;
        if (filters.priority) query.priority = filters.priority;
        if (filters.category) query.category = filters.category;
        if (filters.assignedTeamId) {
            query.assignedTeamId = new Types.ObjectId(filters.assignedTeamId);
        }

        return await Complaint.find(query)
            .populate('assignedTeamId', 'name specialization')
            .populate('technicianId', 'firstName lastName email')
            .sort({ createdAt: -1 });
    }

    async getComplaintById(id: string, organizationId: string) {
        if (!Types.ObjectId.isValid(id)) throw new Error('Invalid complaint ID');

        const complaint = await Complaint.findOne({ _id: id, organizationId })
            .populate('assignedTeamId', 'name specialization')
            .populate('technicianId', 'firstName lastName email');

        if (!complaint) throw new Error('Complaint not found');
        return complaint;
    }

    async createComplaint(data: Partial<IComplaint>) {
        const complaint = new Complaint(data);
        await complaint.save();

        if (!complaint.assignedTeamId) {
            try {
                const teamId = await autoAssignComplaint(complaint._id.toString());
                if (teamId) {
                    complaint.assignedTeamId = teamId;
                    complaint.assignedAt = new Date();
                    complaint.status = 'nouvelle';
                }
            } catch (error) {
                console.error('Error in auto-scheduling:', error);
            }
        }

        const updatedComplaint = await Complaint.findById(complaint._id)
            .populate('assignedTeamId', 'name specialization');

        if (updatedComplaint?.assignedTeamId) {
            try {
                const teamId = updatedComplaint.assignedTeamId._id
                    ? updatedComplaint.assignedTeamId._id.toString()
                    : updatedComplaint.assignedTeamId.toString();

                await notificationService.notifyComplaintAssigned(teamId, updatedComplaint);
            } catch (error) {
                console.error('Failed to send notification:', error);
            }
        }

        return updatedComplaint || complaint;
    }

    async updateComplaint(id: string, data: Partial<IComplaint>, organizationId: string) {
        if (!Types.ObjectId.isValid(id)) throw new Error('Invalid complaint ID');

        const complaint = await Complaint.findOneAndUpdate(
            { _id: id, organizationId },
            { $set: data },
            { new: true, runValidators: true }
        ).populate('assignedTeamId', 'name specialization')
            .populate('technicianId', 'firstName lastName email');

        if (!complaint) throw new Error('Complaint not found');
        return complaint;
    }

    async deleteComplaint(id: string, organizationId: string) {
        if (!Types.ObjectId.isValid(id)) throw new Error('Invalid complaint ID');
        const complaint = await Complaint.findOneAndDelete({ _id: id, organizationId });
        if (!complaint) throw new Error('Complaint not found');
        return complaint;
    }

    async getComplaintStats(organizationId: string) {
        const total = await Complaint.countDocuments({ organizationId });
        const byStatus = await Complaint.aggregate([
            { $match: { organizationId: new Types.ObjectId(organizationId) } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        const byPriority = await Complaint.aggregate([
            { $match: { organizationId: new Types.ObjectId(organizationId) } },
            { $group: { _id: '$priority', count: { $sum: 1 } } }
        ]);

        return {
            total,
            byStatus: byStatus.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {} as Record<string, number>),
            byPriority: byPriority.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {} as Record<string, number>)
        };
    }

    async approveComplaint(id: string, organizationId: string, approvedBy: string) {
        if (!Types.ObjectId.isValid(id)) throw new Error('Invalid complaint ID');

        const complaint = await Complaint.findOne({ _id: id, organizationId });
        if (!complaint) throw new Error('Complaint not found');
        if (complaint.status !== 'nouvelle') throw new Error('Only new complaints can be approved');

        complaint.status = 'en cours';
        await complaint.save();

        await complaint.populate('assignedTeamId', 'name specialization');
        await complaint.populate('technicianId', 'firstName lastName email');

        if (complaint.assignedTeamId) {
            try {
                const teamId = complaint.assignedTeamId._id
                    ? complaint.assignedTeamId._id.toString()
                    : complaint.assignedTeamId.toString();
                await notificationService.notifyComplaintAssigned(teamId, complaint);
            } catch (error) {
                console.error('Failed to send notification:', error);
            }
        }

        return complaint;
    }

    async rejectComplaint(id: string, organizationId: string, rejectionReason: string, rejectedBy: string) {
        if (!Types.ObjectId.isValid(id)) throw new Error('Invalid complaint ID');
        if (!rejectionReason || rejectionReason.trim().length === 0) throw new Error('Rejection reason is required');

        const complaint = await Complaint.findOne({ _id: id, organizationId });
        if (!complaint) throw new Error('Complaint not found');
        if (complaint.status !== 'nouvelle') throw new Error('Only new complaints can be rejected');

        complaint.status = 'rejetée';
        complaint.rejectionReason = rejectionReason;
        await complaint.save();

        await complaint.populate('assignedTeamId', 'name specialization');
        await complaint.populate('technicianId', 'firstName lastName email');

        return complaint;
    }
}

export const complaintService = new ComplaintService();
