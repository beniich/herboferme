import mongoose, { Document, Schema } from 'mongoose';

export interface INetworkDevice extends Omit<Document, 'model'> {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  type: 'router' | 'switch' | 'firewall' | 'access_point' | 'gateway' | 'load_balancer';
  ipAddress: string;
  macAddress?: string;
  hostname?: string;
  managementIP?: string;
  snmpCommunity?: string; // Should be encrypted
  snmpVersion: 'v1' | 'v2c' | 'v3';
  manufacturer?: string;
  deviceModel?: string;
  firmwareVersion?: string;
  serialNumber?: string;
  interfaces?: Array<{
    name: string;
    status: 'up' | 'down' | 'testing' | 'dormant';
    speed: number; // Mbps
    vlan?: number;
    inOctets: number;
    outOctets: number;
    inErrors: number;
    outErrors: number;
    lastUpdate: Date;
  }>;
  currentMetrics?: {
    cpuUsage: number; // percentage
    memoryUsage: number; // percentage
    temperature?: number; // Celsius
    uptime: number; // seconds
    isOnline: boolean;
    lastChecked: Date;
  };
  location?: {
    building?: string;
    floor?: string;
    room?: string;
    rack?: string;
  };
  monitoringEnabled: boolean;
  alertThresholds?: {
    cpuWarning: number;
    cpuCritical: number;
    memoryWarning: number;
    memoryCritical: number;
    temperatureWarning?: number;
    temperatureCritical?: number;
  };
  notes?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const NetworkDeviceSchema = new Schema<INetworkDevice>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },

    // Identification
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['router', 'switch', 'firewall', 'access_point', 'gateway', 'load_balancer'],
      required: true,
    },

    // Network
    ipAddress: {
      type: String,
      required: true,
      index: true,
    },
    macAddress: String,
    hostname: String,
    managementIP: String,

    // SNMP Configuration
    snmpCommunity: String, // TODO: Encrypt this
    snmpVersion: {
      type: String,
      enum: ['v1', 'v2c', 'v3'],
      default: 'v2c',
    },

    // Device info
    manufacturer: String,
    deviceModel: String,
    firmwareVersion: String,
    serialNumber: String,

    // Interfaces/Ports
    interfaces: [
      {
        name: String,
        status: {
          type: String,
          enum: ['up', 'down', 'testing', 'dormant'],
          default: 'up',
        },
        speed: Number,
        vlan: Number,
        inOctets: { type: Number, default: 0 },
        outOctets: { type: Number, default: 0 },
        inErrors: { type: Number, default: 0 },
        outErrors: { type: Number, default: 0 },
        lastUpdate: Date,
      },
    ],

    // Current metrics
    currentMetrics: {
      cpuUsage: Number,
      memoryUsage: Number,
      temperature: Number,
      uptime: Number,
      isOnline: { type: Boolean, default: false },
      lastChecked: Date,
    },

    // Location
    location: {
      building: String,
      floor: String,
      room: String,
      rack: String,
    },

    // Monitoring
    monitoringEnabled: {
      type: Boolean,
      default: true,
    },
    alertThresholds: {
      cpuWarning: { type: Number, default: 70 },
      cpuCritical: { type: Number, default: 90 },
      memoryWarning: { type: Number, default: 75 },
      memoryCritical: { type: Number, default: 90 },
      temperatureWarning: Number,
      temperatureCritical: Number,
    },

    // Metadata
    notes: String,
    tags: [String],
  },
  {
    timestamps: true,
  }
);

// Indexes
NetworkDeviceSchema.index({ organizationId: 1, type: 1 });
NetworkDeviceSchema.index({ 'currentMetrics.isOnline': 1 });

export default mongoose.model<INetworkDevice>('NetworkDevice', NetworkDeviceSchema);
