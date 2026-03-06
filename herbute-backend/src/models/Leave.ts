import mongoose, { Schema, Document } from 'mongoose';

export interface ILeave extends Document {
    staffId: mongoose.Types.ObjectId;
    type: 'Sick' | 'Vacation' | 'Personal';
    start: Date;
    end: Date;
    status: 'Pending' | 'Approved' | 'Declined';
    reason?: string;
}

const LeaveSchema: Schema = new Schema(
    {
        staffId: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
        type: { type: String, enum: ['Sick', 'Vacation', 'Personal'], required: true },
        start: { type: Date, required: true },
        end: { type: Date, required: true },
        status: { type: String, enum: ['Pending', 'Approved', 'Declined'], default: 'Pending' },
        reason: String
    },
    { timestamps: true }
);

export const Leave = mongoose.model<ILeave>('Leave', LeaveSchema);
