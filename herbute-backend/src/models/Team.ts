import mongoose, { Schema, Document } from 'mongoose';

export type TeamStatus = 'disponible' | 'intervention' | 'repos';

export interface ITeam extends Document {
    name: string;
    color: string; // for calendar UI
    status: TeamStatus;
    location?: {
        lat: number;
        lng: number;
    };
    baseLocation?: {
        latitude: number;
        longitude: number;
    };
    specialization?: string; // Comma-separated list of specializations
    isActive: boolean;
    members: mongoose.Types.ObjectId[]; // Array of User IDs
    leaderId?: mongoose.Types.ObjectId;
    organizationId: mongoose.Types.ObjectId;
}

const TeamSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        color: { type: String, default: '#3b82f6' },
        status: {
            type: String,
            enum: ['disponible', 'intervention', 'repos'],
            default: 'disponible'
        },
        location: {
            lat: { type: Number },
            lng: { type: Number }
        },
        baseLocation: {
            latitude: { type: Number },
            longitude: { type: Number }
        },
        specialization: { type: String }, // Comma-separated: "plumbing, electrical, maintenance"
        isActive: { type: Boolean, default: true },
        members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        leaderId: { type: Schema.Types.ObjectId, ref: 'User' },
        organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true }
    },
    { timestamps: true }
);

TeamSchema.index({ organizationId: 1, name: 1 }, { unique: true });
TeamSchema.index({ organizationId: 1, status: 1 });

export const Team = mongoose.model<ITeam>('Team', TeamSchema);
