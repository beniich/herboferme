import mongoose, { Schema, Document } from 'mongoose';

export interface IMembership extends Document {
    userId: mongoose.Types.ObjectId;
    organizationId: mongoose.Types.ObjectId;
    roles: string[];
    status: 'ACTIVE' | 'INVITED' | 'SUSPENDED';
    joinedAt: Date;
    invitedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    hasRole(role: string): boolean;
    isAdmin(): boolean;
}

const MembershipSchema = new Schema<IMembership>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        organizationId: {
            type: Schema.Types.ObjectId,
            ref: 'Organization',
            required: true
        },
        roles: {
            type: [String],
            default: ['MEMBER'],
            enum: {
                values: ['OWNER', 'ADMIN', 'TECH_LEAD', 'TECHNICIAN', 'MEMBER', 'VIEWER'],
                message: '{VALUE} is not a valid role'
            }
        },
        status: {
            type: String,
            enum: ['ACTIVE', 'INVITED', 'SUSPENDED'],
            default: 'ACTIVE'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        },
        invitedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null
        }
    },
    {
        timestamps: true
    }
);

// Compound index: ensure one user can only have one membership per org
MembershipSchema.index({ userId: 1, organizationId: 1 }, { unique: true });

// Index for fast org member lookups
MembershipSchema.index({ organizationId: 1, status: 1 });

// Helper method to check if user has a specific role
MembershipSchema.methods.hasRole = function (role: string): boolean {
    return this.roles.includes(role);
};

// Helper method to check if user is admin or owner
MembershipSchema.methods.isAdmin = function (): boolean {
    return this.roles.includes('OWNER') || this.roles.includes('ADMIN');
};

export const Membership = mongoose.model<IMembership>('Membership', MembershipSchema);
