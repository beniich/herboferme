import mongoose, { Schema, Document } from 'mongoose';

export interface IIntervention extends Document {
    complaintId: mongoose.Types.ObjectId;
    teamId: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    start: Date;
    end: Date;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
    location: string;
    assignedTechnicians: mongoose.Types.ObjectId[]; // Array of User IDs
    createdAt: Date;
    updatedAt: Date;
}

const InterventionSchema: Schema = new Schema(
    {
        complaintId: { type: Schema.Types.ObjectId, ref: 'Complaint', required: true },
        teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
        title: { type: String, required: true },
        description: { type: String },
        start: { type: Date, required: true },
        end: { type: Date, required: true },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'urgent'],
            default: 'medium',
        },
        status: {
            type: String,
            enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
            default: 'scheduled',
        },
        location: { type: String },
        assignedTechnicians: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    },
    { timestamps: true }
);

export const Intervention = mongoose.model<IIntervention>('Intervention', InterventionSchema);
