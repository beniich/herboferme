import { producer } from '../config/kafka.js';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

export interface EventMessage {
    topic: string;
    eventType: string;
    payload: any;
}

// HTTP Subscribers Map (Simulating Kafka Consumer Groups)
const SUBSCRIBERS: Record<string, string[]> = {
    'auth-events': ['http://localhost:3004/events'], // Notification Service
    'complaint-events': ['http://localhost:3004/events', 'http://localhost:3003/events', 'http://localhost:5009/events'], // Notification, Teams, Backend (Saga)
    'team-events': ['http://localhost:3005/events'], // Analytics (example)
    'inventory-events': []
};

export const eventBus = {
    publish: async (topic: string, eventType: string, payload: any) => {
        const message = {
            eventId: uuidv4(),
            eventType,
            timestamp: new Date().toISOString(),
            version: '1.0',
            data: payload,
        };

        if (process.env.DISABLE_KAFKA === 'true') {
            // HTTP Fallback Mode
            console.log(`ðŸ“¡ [HTTP BUS] Publishing: [${topic}] ${eventType}`);
            const subscribers = SUBSCRIBERS[topic] || [];

            for (const url of subscribers) {
                try {
                    await axios.post(url, { topic, ...message });
                    console.log(`   âž¡ Sent to ${url}`);
                } catch (err) {
                    // console.error(`   âŒ Failed to send to ${url}`, err.message);
                    // Silently fail or log minimal to avoid spam in dev
                }
            }
        } else {
            // Kafka Mode
            try {
                await producer.send({
                    topic,
                    messages: [{ value: JSON.stringify(message) }],
                });
                console.log(`ðŸ“¡ [KAFKA] Event published: [${topic}] ${eventType}`);
            } catch (error) {
                console.error(`âŒ Failed to publish event [${topic}] ${eventType}:`, error);
            }
        }
    },
};
