import mongoose, { Document, Schema } from 'mongoose';

export type ComplaintStatus = 'nouvelle' | 'en cours' | 'r    solue' | 'ferm    e' | 'rejet    e';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface IComplaint extends Document {
  number: string;
  // Step 1: Info
  category: string;
  subcategory: string;
  priority: Priority;
  title: string;
  description: string;

  // Step 2: Location
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

  // Step 3: Files
  photos?: string[];
  documents?: { name: string; url: string }[];
  audioNote?: string;

  // Step 4: Contact (if not anonymous)
  isAnonymous: boolean;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;

  // Workflow
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
    number: { type: String, unique: true }, // Auto-generated

    // Step 1
    category: { type: String, required: true },
    subcategory: { type: String, required: true },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    title: { type: String, required: true },
    description: { type: String, required: true },

    // Step 2
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

    // Step 3
    photos: [{ type: String }],
    documents: [
      {
        name: String,
        url: String,
      },
    ],
    audioNote: { type: String },

    // Step 4
    isAnonymous: { type: Boolean, default: false },
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String },
    phone: { type: String },

    // Workflow
    status: {
      type: String,
      enum: ['nouvelle', 'en cours', 'r    solue', 'ferm    e', 'rejet    e'],
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

// Index for organization filtering
ComplaintSchema.index({ organizationId: 1, status: 1 });
ComplaintSchema.index({ organizationId: 1, createdAt: -1 });

// Auto-generate unique complaint number
ComplaintSchema.pre<IComplaint>('save', function (next) {
  if (this.isNew && !this.number) {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    this.number = `REC-${datePart}-${randomPart}`;
  }
  next();
});

export const Complaint = mongoose.model<IComplaint>('Complaint', ComplaintSchema);
