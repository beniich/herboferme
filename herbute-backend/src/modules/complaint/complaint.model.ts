import mongoose, { Document, Schema } from 'mongoose';

export type ComplaintStatus = 'nouvelle' | 'en cours' | 'résolue' | 'fermée' | 'rejetée';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface IComplaint extends Document {
  number: string;
  category: string;
  subcategory: string;
  priority: Priority;
  title: string;
  description: string;
  address: string;
  city: string;
  district: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  location?: {
    latitude: number;
    longitude: number;
  };
  photos?: string[];
  documents?: { name: string; url: string }[];
  audioNote?: string;
  isAnonymous: boolean;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  status: ComplaintStatus;
  assignedTeamId?: mongoose.Types.ObjectId;
  technicianId?: mongoose.Types.ObjectId;
  assignedAt?: Date;
  rejectionReason?: string;
  organizationId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema: Schema = new Schema(
  {
    number: { type: String, unique: true },
    category: { type: String, required: true },
    subcategory: { type: String, required: true },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    postalCode: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    photos: [{ type: String }],
    documents: [
      {
        name: String,
        url: String,
      },
    ],
    audioNote: { type: String },
    isAnonymous: { type: Boolean, default: false },
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String },
    phone: { type: String },
    status: {
      type: String,
      enum: ['nouvelle', 'en cours', 'résolue', 'fermée', 'rejetée'],
      default: 'nouvelle',
    },
    rejectionReason: { type: String },
    assignedTeamId: { type: Schema.Types.ObjectId, ref: 'Team' },
    technicianId: { type: Schema.Types.ObjectId, ref: 'User' },
    assignedAt: { type: Date },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  },
  { timestamps: true }
);

ComplaintSchema.index({ organizationId: 1, status: 1 });
ComplaintSchema.index({ organizationId: 1, createdAt: -1 });

ComplaintSchema.pre<IComplaint>('save', function (next) {
  if (this.isNew && !this.number) {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    this.number = `REC-${datePart}-${randomPart}`;
  }
  next();
});

export const Complaint = mongoose.model<IComplaint>('Complaint', ComplaintSchema);
