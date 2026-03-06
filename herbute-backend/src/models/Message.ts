import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
    senderId: mongoose.Types.ObjectId; // ou "system"
    senderName: string;
    recipientId?: mongoose.Types.ObjectId;
    groupId?: string; // 'general', 'team-X', etc.
    content: string;
    read: boolean;
    type: 'text' | 'system' | 'alert';
    createdAt: Date;
}

const MessageSchema = new Schema({
    senderId: { type: Schema.Types.Mixed, required: true }, // ObjectId ou String ("system")
    senderName: { type: String, required: true },
    recipientId: { type: Schema.Types.ObjectId, ref: 'User' },
    groupId: { type: String },
    content: { type: String, required: true },
    read: { type: Boolean, default: false },
    type: {
        type: String,
        enum: ['text', 'system', 'alert'],
        default: 'text'
    }
}, { timestamps: true });

// Index pour rÃ©cupÃ©ration rapide
MessageSchema.index({ recipientId: 1, read: 1 });
MessageSchema.index({ groupId: 1, createdAt: -1 });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
