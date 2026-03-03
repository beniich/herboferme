import mongoose, { Schema, Document } from 'mongoose';

export interface IStaff extends Document {
    name: string;
    role: string;
    email: string;
    avatar?: string;
}

const StaffSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        role: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        avatar: { type: String }
    },
    { timestamps: true }
);

export const Staff = mongoose.model<IStaff>('Staff', StaffSchema);
