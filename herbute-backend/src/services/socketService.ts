/* eslint-disable no-irregular-whitespace */
﻿import { Server } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { logger } from '../utils/logger.js';

export interface NotificationPayload {
  type: 'complaint_assigned' | 'status_update' | 'message' | 'alert';
  title: string;
  message: string;
  data?: any;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: Date;
}

interface NotificationData {
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  userId?: string; // Pour notifications ciblÃ©es
  timestamp: Date;
}

class NotificationService {
  private io: SocketIOServer | null = null;

  init(server: Server) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || '*', // Allow all for now or specify frontend URL
        methods: ['GET', 'POST'],
      },
    });

    // Namespace principal pour les notifications
    this.io.on('connection', (socket) => {
      logger.info(`ðŸ”” Client connectÃ©: ${socket.id}`);

      // Authentification (optionnel mais recommandÃ©)
      socket.on('authenticate', (token) => {
        // Ici tu peux vÃ©rifier le token JWT
        // et stocker userId dans socket.data.userId
        // socket.data.userId = 'user_' + ...;
      });

      socket.on('join-rooms', (rooms: string[]) => {
        rooms.forEach((room) => socket.join(room));
      });

      socket.on('disconnect', () => {
        logger.info(`ðŸ”Œ Client dÃ©connectÃ©: ${socket.id}`);
      });

      // --- WebRTC Signaling for SRTP Calls ---
      socket.on(
        'call-user',
        (data: { userToCall: string; signalData: any; from: string; fromName: string }) => {
          logger.info(`ðŸ“ž Call initiated from ${data.from} to ${data.userToCall}`);
          this.io?.to(`user:${data.userToCall}`).emit('call-made', {
            signal: data.signalData,
            from: data.from,
            fromName: data.fromName,
          });
        }
      );

      socket.on('answer-call', (data: { to: string; signal: any }) => {
        logger.info(`ðŸ“ž Call answered by ${socket.id} for ${data.to}`);
        this.io
          ?.to(`user:${data.to}`)
          .emit('call-answered', { signal: data.signal, from: socket.id });
      });

      socket.on('reject-call', (data: { to: string }) => {
        logger.info(`ðŸ“ž Call rejected by ${socket.id} for ${data.to}`);
        this.io?.to(`user:${data.to}`).emit('call-rejected', { from: socket.id });
      });

      socket.on('ice-candidate', (data: { to: string; candidate: any }) => {
        this.io
          ?.to(`user:${data.to}`)
          .emit('ice-candidate', { candidate: data.candidate, from: socket.id });
      });
      // ---------------------------------------
    });

    // Namespace /logs pour les logs en temps rÃ©el (Enterprise DB)
    this.initLogsNamespace();

    // Namespace /scheduler pour le planning (Enterprise DB)
    this.initSchedulerNamespace();

    // Namespace /security pour la sÃ©curitÃ© en temps rÃ©el
    this.initSecurityNamespace();

    return this.io;
  }

  /**
   * Namespace /logs pour les logs de base de donnÃ©es en temps rÃ©el
   */
  private initLogsNamespace() {
    if (!this.io) return;

    const logsNamespace = this.io.of('/logs');
    const logTypes = ['INFO', 'WARN', 'ERROR', 'BACKUP'];
    const containers = ['SQL', 'API_GATEWAY', 'WORKER', 'WAF', 'AUTH', 'REPLICA_1', 'REPLICA_2'];

    function randomLog() {
      const now = new Date().toISOString().replace('T', ' ').split('.')[0];
      const type = logTypes[Math.floor(Math.random() * logTypes.length)];
      const container = containers[Math.floor(Math.random() * containers.length)];

      let message = '';
      switch (type) {
        case 'INFO':
          message = 'Heartbeat OK â€“ all services healthy.';
          break;
        case 'WARN':
          message = 'Replication lag > 100 ms on replica-2.';
          break;
        case 'ERROR':
          message = 'Duplicate key violation on table `complaints`.';
          break;
        case 'BACKUP':
          message = 'Backup #20240211-01 completed (120 GB).';
          break;
      }

      return {
        timestamp: now,
        type,
        container,
        message,
      };
    }

    logsNamespace.on('connection', (socket) => {
      logger.info(`ðŸ”Œ Client log socket connected: ${socket.id}`);

      const interval = setInterval(() => {
        socket.emit('log', randomLog());
      }, 2000);

      socket.on('disconnect', () => {
        clearInterval(interval);
        logger.info(`ðŸ”Œ Client log socket disconnected: ${socket.id}`);
      });
    });
  }

  /**
   * Namespace /scheduler pour la synchronisation du planning en temps rÃ©el
   */
  private initSchedulerNamespace() {
    if (!this.io) return;

    const schedulerNamespace = this.io.of('/scheduler');
    const personnel = [
      'Alex Henderson',
      'Sarah Jenkins',
      'Marcus Vane',
      'Dave Miller',
      'Elena Rodriguez',
    ];
    const statuses = ['online', 'break', 'offline', 'busy'];

    function getRandomStatusUpdate() {
      const person = personnel[Math.floor(Math.random() * personnel.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      return {
        type: 'PERSONNEL_UPDATE',
        data: { name: person, status },
      };
    }

    function getRandomOrder() {
      const id = Math.floor(1000 + Math.random() * 9000);
      return {
        type: 'NEW_ORDER',
        data: {
          id: `#WO-${id}`,
          title: 'Emergency Repair',
          priority: 'Urgent',
          time: new Date().toISOString(),
        },
      };
    }

    schedulerNamespace.on('connection', (socket) => {
      logger.info(`ðŸ”Œ Client scheduler socket connected: ${socket.id}`);

      // Send initial sync
      socket.emit('scheduler:sync', {
        lastUpdate: new Date().toISOString(),
        activePersonnel: 12,
        pendingOrders: 5,
      });

      // Simulate live updates
      const statusInterval = setInterval(() => {
        const update = getRandomStatusUpdate();
        socket.emit('scheduler:update', update);
      }, 5000);

      const orderInterval = setInterval(() => {
        const order = getRandomOrder();
        socket.emit('scheduler:update', order);
      }, 15000);

      // Heartbeat / Sync check
      const syncInterval = setInterval(() => {
        socket.emit('scheduler:sync', {
          lastUpdate: new Date().toISOString(),
          activePersonnel: 10 + Math.floor(Math.random() * 5),
          pendingOrders: 3 + Math.floor(Math.random() * 5),
        });
      }, 30000);

      socket.on('disconnect', () => {
        clearInterval(statusInterval);
        clearInterval(orderInterval);
        clearInterval(syncInterval);
        logger.info(`ðŸ”Œ Client scheduler socket disconnected: ${socket.id}`);
      });
    });
  }

  /**
   * Namespace /security pour la sÃ©curitÃ© et le monitoring pfSense en temps rÃ©el
   */
  private initSecurityNamespace() {
    if (!this.io) return;

    const securityNamespace = this.io.of('/security');

    securityNamespace.on('connection', (socket) => {
      logger.info(`ðŸ”’ Client security socket connected: ${socket.id}`);

      // Allow joining specific rooms if needed
      socket.on('join-room', (room: string) => {
        socket.join(room);
        logger.info(`ðŸ”’ Client ${socket.id} joined room ${room}`);
      });

      // Simulation of pfSense logs if no real emitter is connected yet
      const logInterval = setInterval(() => {
        const now = new Date();
        const actions = ['pass', 'block', 'reject'];
        const protocols = ['TCP', 'UDP', 'ICMP'];

        socket.emit('firewall:log', {
          timestamp: now,
          interface: 'WAN',
          action: actions[Math.floor(Math.random() * actions.length)],
          protocol: protocols[Math.floor(Math.random() * protocols.length)],
          srcIP: `192.168.1.${Math.floor(Math.random() * 254)}`,
          dstIP: `10.0.0.${Math.floor(Math.random() * 254)}`,
          srcPort: Math.floor(Math.random() * 65535),
          dstPort: [80, 443, 22, 53][Math.floor(Math.random() * 4)],
        });
      }, 3000);

      socket.on('disconnect', () => {
        clearInterval(logInterval);
        logger.info(`ðŸ”’ Client security socket disconnected: ${socket.id}`);
      });
    });
  }

  // Envoyer une notification Ã  tous
  broadcast(data: NotificationData) {
    if (this.io) {
      this.io.emit('notification', data);
    }
  }

  // Envoyer une notification Ã  un utilisateur spÃ©cifique
  sendToUser(userId: string, data: NotificationData) {
    if (this.io) {
      this.io.to(userId).emit('notification', data);
    }
  }

  // Envoyer une notification Ã  une salle spÃ©cifique
  sendToRoom(room: string, data: NotificationData) {
    if (this.io) {
      this.io.to(room).emit('notification', data);
    }
  }

  getIO() {
    return this.io;
  }

  /**
   * Notify team about new complaint assignment
   */
  async notifyComplaintAssigned(teamId: string, complaint: any) {
    const notification = {
      type: 'complaint_assigned',
      title: 'Nouvelle RÃ©clamation AssignÃ©e',
      message: `Une rÃ©clamation "${complaint.title}" a Ã©tÃ© assignÃ©e Ã  votre Ã©quipe`,
      data: {
        complaintId: complaint._id,
        category: complaint.category,
        priority: complaint.priority,
        address: complaint.address,
      },
      priority: complaint.priority,
      timestamp: new Date(),
    };

    // Assuming team rooms are formatted as 'team:ID'
    if (this.io) {
      this.io.to(`team:${teamId}`).emit('notification', notification);
      logger.info(`ðŸ“§ Notification sent to team ${teamId}: ${notification.title}`);
    }
  }

  /**
   * Notify about complaint status change
   */
  async notifyStatusChange(
    complaintId: string,
    oldStatus: string,
    newStatus: string,
    userIds: string[]
  ) {
    const notification = {
      type: 'status_update',
      title: 'Statut de RÃ©clamation Mis Ã  Jour',
      message: `Le statut de la rÃ©clamation est passÃ© de "${oldStatus}" Ã  "${newStatus}"`,
      data: {
        complaintId,
        oldStatus,
        newStatus,
      },
      timestamp: new Date(),
    };

    if (this.io) {
      userIds.forEach((userId) => {
        // Assuming user rooms are formatted as 'user:ID' or just 'ID'
        // The existing code has socket.join(room), so we need to ensure users join 'user:ID'
        this.io?.to(`user:${userId}`).emit('notification', notification);
      });
      logger.info(`ðŸ“§ Status change notification sent to ${userIds.length} users`);
    }
  }

  /**
   * Send urgent alert
   */
  async sendUrgentAlert(message: string, recipientIds?: string[]) {
    const notification = {
      type: 'alert',
      title: 'âš ï¸ Alerte Urgente',
      message,
      priority: 'urgent',
      timestamp: new Date(),
    };

    if (this.io) {
      if (recipientIds && recipientIds.length > 0) {
        recipientIds.forEach((userId) => {
          this.io?.to(`user:${userId}`).emit('notification', notification);
        });
      } else {
        this.io.emit('notification', notification);
      }
      logger.info(`ðŸ“¢ Urgent alert sent: ${message}`);
    }
  }
}

const notificationService = new NotificationService();

// Export as default
export default notificationService;

// Also export initSocket for backward compatibility with index.ts
export const initSocket = (server: Server) => notificationService.init(server);
export const io = notificationService.getIO(); // This might be null initially
