import mongoose, { Schema, Document } from 'mongoose';

// Types de shifts disponibles
export interface IShiftType extends Document {
    id: string; // ex: 'morning'
    name: string;
    description: string;
    startTime: string;
    endTime: string;
    color: string;
    requiredStaff: number;
}

const ShiftTypeSchema = new Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    color: { type: String, default: '#3b82f6' },
    requiredStaff: { type: Number, default: 1 }
});

// Assignations horaires
export interface IShiftAssignment extends Document {
    shiftId: string; // Lien vers ShiftType.id
    memberId: mongoose.Types.ObjectId;
    memberName: string; // Cache pour affichage rapide
    date: string; // YYYY-MM-DD
    status: 'scheduled' | 'confirmed' | 'completed' | 'absent';
    createdAt: Date;
}

const ShiftAssignmentSchema = new Schema({
    shiftId: { type: String, required: true },
    memberId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    memberName: { type: String },
    date: { type: String, required: true, index: true },
    status: {
        type: String,
        enum: ['scheduled', 'confirmed', 'completed', 'absent'],
        default: 'scheduled'
    }
}, { timestamps: true });

// Index composÃ© pour Ã©viter doublons (un membre ne peut avoir qu'un shift par jour/type)
ShiftAssignmentSchema.index({ memberId: 1, date: 1, shiftId: 1 }, { unique: true });

export const ShiftType = mongoose.model<IShiftType>('ShiftType', ShiftTypeSchema);
export const ShiftAssignment = mongoose.model<IShiftAssignment>('ShiftAssignment', ShiftAssignmentSchema);
