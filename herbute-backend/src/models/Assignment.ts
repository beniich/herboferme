import mongoose, { Schema, Document } from 'mongoose';

export interface IAssignment extends Document {
    complaintId: mongoose.Types.ObjectId;
    teamId: mongoose.Types.ObjectId;
    assignedAt: Date;
    status: 'affect    ' | 'en cours' | 'termin    ';
}

const AssignmentSchema: Schema = new Schema(
    {
        complaintId: { type: Schema.Types.ObjectId, ref: 'Complaint', required: true },
        teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
        assignedAt: { type: Date, default: Date.now },
        status: {
            type: String,
            enum: ['affect    ', 'en cours', 'termin    '],
            default: 'affect    '
        }
    },
    { timestamps: true }
);

export const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema);
