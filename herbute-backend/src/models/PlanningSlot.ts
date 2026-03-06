import mongoose, { Schema, Document } from 'mongoose';

export interface IPlanningSlot extends Document {
    teamId: mongoose.Types.ObjectId;
    start: Date;
    end: Date;
    complaintId?: mongoose.Types.ObjectId;
}

const PlanningSlotSchema: Schema = new Schema(
    {
        teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
        start: { type: Date, required: true },
        end: { type: Date, required: true },
        complaintId: { type: Schema.Types.ObjectId, ref: 'Complaint' }
    },
    { timestamps: true }
);

export const PlanningSlot = mongoose.model<IPlanningSlot>('PlanningSlot', PlanningSlotSchema);
