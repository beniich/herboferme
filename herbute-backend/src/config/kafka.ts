import kafkajs from 'kafkajs';
const { Kafka, logLevel } = kafkajs;

const kafka = new Kafka({
    clientId: 'reclamtrack-backend',
    brokers: [(process.env.KAFKA_BROKER || 'localhost:9092')],
    logLevel: logLevel.ERROR,
});

export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: 'reclamtrack-backend-group' });

export const connectKafka = async () => {
    try {
        await producer.connect();
        console.log('âœ… Kafka Producer connected');

        await consumer.connect();
        console.log('âœ… Kafka Consumer connected');
    } catch (error) {
        console.error('âŒ Kafka connection error:', error);
    }
};

export default kafka;
