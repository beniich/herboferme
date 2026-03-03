   import { consumer } from '../config/kafka.js';
import { Complaint } from '../models/Complaint.js';
import { logger } from '../utils/logger.js';

export const startSagaConsumer = async () => {
    try {
        await consumer.connect();
        await consumer.subscribe({ topic: 'complaint-events', fromBeginning: false });

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                const value = message.value?.toString() || '{ /* Intentionally empty */ }';

                try {
                    const payload = JSON.parse(value);

                    if (payload.type === 'COMPLAINT_ASSIGNED') {
                        logger.info(`           [Saga] Backend received ASSIGNED for ${payload.complaintId}`);

                        // Update Complaint
                        await Complaint.findByIdAndUpdate(payload.complaintId, {
                            assignedTeamId: payload.teamId,
                            status: 'en cours',
                            updatedAt: new Date()
                        });
                        logger.info(`        [Saga] Complaint ${payload.complaintId} updated with Team ${payload.teamId}`);
                    }

                    if (payload.type === 'ASSIGNMENT_FAILED') {
                        logger.warn(`            [Saga] Backend received FAILED for ${payload.complaintId}`);

                        // Compensation: Escalate priority
                        await Complaint.findByIdAndUpdate(payload.complaintId, {
                            priority: 'urgent',
                            // status: 'rejet    e'? No, keep new but urgent.
                            updatedAt: new Date()
                        });
                        logger.info(`              [Saga] Complaint ${payload.complaintId} priority escalated (Compensation)`);
                    }

                } catch (err) {
                    logger.error('       [Saga] Error processing message:', err);
                }
            }
        });

        logger.info('        Saga Consumer started');
    } catch (error) {
        logger.error('       Failed to start Saga Consumer:', error);
    }
};
