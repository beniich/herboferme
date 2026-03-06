import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
    action: string;
    userId: mongoose.Types.ObjectId;
    targetId?: string; // ID of the affected resource (optional)
    targetType?: string; // Type of resource (e.g., 'Complaint', 'User')
    details?: any; // Flexible metadata
    ipAddress?: string;
    timestamp: Date;
}

const AuditLogSchema: Schema = new Schema({
    action: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetId: { type: String },
    targetType: { type: String },
    details: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' }, // Optional for system events
    timestamp: { type: Date, default: Date.now }
});

// Index for faster querying by time and user
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ userId: 1 });
AuditLogSchema.index({ action: 1 });

export default mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
