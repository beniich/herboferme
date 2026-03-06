import mongoose, { Schema, Document } from 'mongoose';

export interface IFeedback extends Document {
    source: 'web' | 'mobile' | 'sms';
    userId?: mongoose.Types.ObjectId; // Optionnel (anonyme)
    category: string;
    rating: number; // 1-5
    comment: string;
    status: 'new' | 'reviewed' | 'addressed';
    createdAt: Date;
    organizationId: mongoose.Types.ObjectId;
}

const FeedbackSchema = new Schema({
    source: {
        type: String,
        enum: ['web', 'mobile', 'sms'],
        default: 'web'
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    category: { type: String, default: 'General' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    status: {
        type: String,
        enum: ['new', 'reviewed', 'addressed'],
        default: 'new'
    },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true }
}, { timestamps: true });

FeedbackSchema.index({ organizationId: 1, createdAt: -1 });

export const Feedback = mongoose.model<IFeedback>('Feedback', FeedbackSchema);
