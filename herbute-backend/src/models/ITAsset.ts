import mongoose, { Document, Schema } from 'mongoose';

export interface IITAsset extends Omit<Document, 'model'> {
  organizationId: mongoose.Types.ObjectId;
  assetTag: string;
  name: string;
  type:
    | 'server'
    | 'workstation'
    | 'laptop'
    | 'network_device'
    | 'printer'
    | 'mobile_device'
    | 'storage'
    | 'ups'
    | 'other';
  status: 'active' | 'inactive' | 'maintenance' | 'retired' | 'broken';
  manufacturer?: string;
  deviceModel?: string;
  serialNumber?: string;
  hostname?: string;
  ipAddress?: string;
  macAddress?: string;
  subnet?: string;
  vlan?: number;
  operatingSystem?: string;
  cpu?: string;
  ram?: number; // GB
  storage?: number; // GB
  location?: {
    building?: string;
    floor?: string;
    room?: string;
    rack?: string;
    rackUnit?: number;
  };
  assignedTo?: mongoose.Types.ObjectId;
  purchaseDate?: Date;
  warrantyExpiration?: Date;
  purchasePrice?: number;
  vendor?: string;
  software?: Array<{
    name: string;
    version?: string;
    licenseKey?: string;
    expirationDate?: Date;
  }>;
  monitoringEnabled: boolean;
  lastSeenOnline?: Date;
  uptime?: number; // seconds
  maintenanceSchedule?: string;
  lastMaintenance?: Date;
  nextMaintenance?: Date;
  maintenanceHistory?: Array<{
    date: Date;
    type: string;
    performedBy: mongoose.Types.ObjectId;
    notes?: string;
    cost?: number;
  }>;
  notes?: string;
  tags?: string[];
  customFields?: any;
  createdAt: Date;
  updatedAt: Date;
}

const ITAssetSchema = new Schema<IITAsset>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },

    // Identification
    assetTag: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        'server',
        'workstation',
        'laptop',
        'network_device',
        'printer',
        'mobile_device',
        'storage',
        'ups',
        'other',
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'maintenance', 'retired', 'broken'],
      default: 'active',
    },

    // Hardware info
    manufacturer: String,
    deviceModel: String,
    serialNumber: String,

    // Network info
    hostname: String,
    ipAddress: String,
    macAddress: String,
    subnet: String,
    vlan: Number,

    // Server specs
    operatingSystem: String,
    cpu: String,
    ram: Number,
    storage: Number,

    // Location
    location: {
      building: String,
      floor: String,
      room: String,
      rack: String,
      rackUnit: Number,
    },

    // Management
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    purchaseDate: Date,
    warrantyExpiration: Date,
    purchasePrice: Number,
    vendor: String,

    // Software licenses
    software: [
      {
        name: String,
        version: String,
        licenseKey: String,
        expirationDate: Date,
      },
    ],

    // Monitoring
    monitoringEnabled: {
      type: Boolean,
      default: false,
    },
    lastSeenOnline: Date,
    uptime: Number,

    // Maintenance
    maintenanceSchedule: String,
    lastMaintenance: Date,
    nextMaintenance: Date,
    maintenanceHistory: [
      {
        date: Date,
        type: String,
        performedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        notes: String,
        cost: Number,
      },
    ],

    // Metadata
    notes: String,
    tags: [String],
    customFields: Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
ITAssetSchema.index({ organizationId: 1, type: 1 });
ITAssetSchema.index({ organizationId: 1, status: 1 });
ITAssetSchema.index({ hostname: 1 });
ITAssetSchema.index({ ipAddress: 1 });
ITAssetSchema.index({ assignedTo: 1 });

export default mongoose.model<IITAsset>('ITAsset', ITAssetSchema);
