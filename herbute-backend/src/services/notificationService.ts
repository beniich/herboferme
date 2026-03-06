import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

export interface NotificationPayload {
    type: 'complaint_assigned' | 'status_update' | 'message' | 'alert';
    title: string;
    message: string;
    data?: any;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    timestamp: Date;
}

export class NotificationService {
    private io: SocketIOServer | null = null;

    /**
     * Initialize Socket.IO server
     */
    initialize(httpServer: HTTPServer) {
        this.io = new SocketIOServer(httpServer, {
            cors: {
                origin: process.env.FRONTEND_URL || 'http://localhost:3000',
                methods: ['GET', 'POST'],
                credentials: true
            }
        });

        this.io.on('connection', (socket) => {
            console.log(`âœ… Client connected: ${socket.id}`);

            // User joins their personal room (based on userId)
            socket.on('join', (userId: string) => {
                socket.join(`user:${userId}`);
                console.log(`User ${userId} joined their room`);
            });

            // Team members join team rooms
            socket.on('join_team', (teamId: string) => {
                socket.join(`team:${teamId}`);
                console.log(`User joined team room: ${teamId}`);
            });

            socket.on('disconnect', () => {
                console.log(`âŒ Client disconnected: ${socket.id}`);
            });
        });

        console.log('ðŸ”” Notification service initialized');
        return this.io;
    }

    /**
     * Send notification to a specific user
     */
    async notifyUser(userId: string, notification: NotificationPayload) {
        if (!this.io) {
            console.warn('Socket.IO not initialized');
            return;
        }

        this.io.to(`user:${userId}`).emit('notification', notification);
        console.log(`ðŸ“§ Notification sent to user ${userId}:`, notification.title);
    }

    /**
     * Send notification to all team members
     */
    async notifyTeam(teamId: string, notification: NotificationPayload) {
        if (!this.io) {
            console.warn('Socket.IO not initialized');
            return;
        }

        this.io.to(`team:${teamId}`).emit('notification', notification);
        console.log(`ðŸ“§ Notification sent to team ${teamId}:`, notification.title);
    }

    /**
     * Broadcast notification to all connected clients
     */
    async broadcast(notification: NotificationPayload) {
        if (!this.io) {
            console.warn('Socket.IO not initialized');
            return;
        }

        this.io.emit('notification', notification);
        console.log(`ðŸ“¢ Broadcast notification:`, notification.title);
    }

    /**
     * Notify team about new complaint assignment
     */
    async notifyComplaintAssigned(teamId: string, complaint: any) {
        const notification: NotificationPayload = {
            type: 'complaint_assigned',
            title: 'Nouvelle RÃ©clamation AssignÃ©e',
            message: `Une rÃ©clamation "${complaint.title}" a Ã©tÃ© assignÃ©e Ã  votre Ã©quipe`,
            data: {
                complaintId: complaint._id,
                category: complaint.category,
                priority: complaint.priority,
                address: complaint.address
            },
            priority: complaint.priority,
            timestamp: new Date()
        };

        await this.notifyTeam(teamId.toString(), notification);
    }

    /**
     * Notify about complaint status change
     */
    async notifyStatusChange(complaintId: string, oldStatus: string, newStatus: string, userIds: string[]) {
        const notification: NotificationPayload = {
            type: 'status_update',
            title: 'Statut de RÃ©clamation Mis Ã  Jour',
            message: `Le statut de la rÃ©clamation est passÃ© de "${oldStatus}" Ã  "${newStatus}"`,
            data: {
                complaintId,
                oldStatus,
                newStatus
            },
            timestamp: new Date()
        };

        for (const userId of userIds) {
            await this.notifyUser(userId, notification);
        }
    }

    /**
     * Send urgent alert
     */
    async sendUrgentAlert(message: string, recipientIds?: string[]) {
        const notification: NotificationPayload = {
            type: 'alert',
            title: 'âš ï¸ Alerte Urgente',
            message,
            priority: 'urgent',
            timestamp: new Date()
        };

        if (recipientIds && recipientIds.length > 0) {
            for (const userId of recipientIds) {
                await this.notifyUser(userId, notification);
            }
        } else {
            await this.broadcast(notification);
        }
    }
}

export const notificationService = new NotificationService();
