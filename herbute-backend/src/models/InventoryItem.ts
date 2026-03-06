// backend/models/InventoryItem.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IInventoryItem extends Document {
  name: string;
  category: 'equipment' | 'consumable' | 'seed' | 'fertilizer' | 'chemical' | 'tool';
  type: string;
  code: string; // INV-2026-001
  description?: string;
  quantity: number;
  unit: 'kg' | 'l' | 'unit' | 'm' | 'm2' | 'ton';
  minQuantity: number; // Alert threshold
  maxQuantity?: number;
  unitPrice: number;
  totalValue: number;
  supplier?: mongoose.Types.ObjectId;
  location: {
    storage: string; // Hangar A, Serre 2, etc.
    section?: string;
  };
  condition: 'new' | 'good' | 'fair' | 'poor';
  maintenanceSchedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    lastMaintenance?: Date;
    nextMaintenance?: Date;
  };
  movements: Array<{
    type: 'entry' | 'exit' | 'transfer' | 'adjustment';
    quantity: number;
    date: Date;
    reference?: string;
    reason?: string;
    user: mongoose.Types.ObjectId;
  }>;
  alerts: Array<{
    type: 'low_stock' | 'expiry' | 'maintenance';
    message: string;
    triggered: boolean;
    date: Date;
  }>;
  expiryDate?: Date;
  serialNumber?: string;
  photos?: string[];
  domain: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
}

const inventoryItemSchema = new Schema<IInventoryItem>(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['equipment', 'consumable', 'seed', 'fertilizer', 'chemical', 'tool'],
      required: true,
    },
    type: String,
    code: {
      type: String,
      required: true,
      unique: true,
    },
    description: String,
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    unit: {
      type: String,
      enum: ['kg', 'l', 'unit', 'm', 'm2', 'ton'],
      required: true,
    },
    minQuantity: {
      type: Number,
      required: true,
    },
    maxQuantity: Number,
    unitPrice: {
      type: Number,
      required: true,
    },
    totalValue: Number,
    supplier: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
    },
    location: {
      storage: {
        type: String,
        required: true,
      },
      section: String,
    },
    condition: {
      type: String,
      enum: ['new', 'good', 'fair', 'poor'],
      default: 'good',
    },
    maintenanceSchedule: {
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
      },
      lastMaintenance: Date,
      nextMaintenance: Date,
    },
    movements: [
      {
        type: {
          type: String,
          enum: ['entry', 'exit', 'transfer', 'adjustment'],
          required: true,
        },
        quantity: Number,
        date: {
          type: Date,
          default: Date.now,
        },
        reference: String,
        reason: String,
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    alerts: [
      {
        type: {
          type: String,
          enum: ['low_stock', 'expiry', 'maintenance'],
        },
        message: String,
        triggered: Boolean,
        date: Date,
      },
    ],
    expiryDate: Date,
    serialNumber: String,
    photos: [String],
    domain: {
      type: Schema.Types.ObjectId,
      ref: 'Domain',
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook
inventoryItemSchema.pre('save', function (next) {
  this.totalValue = this.quantity * this.unitPrice;
  
  // Check low stock alert
  if (this.quantity <= this.minQuantity) {
    const existingAlert = this.alerts.find(a => a.type === 'low_stock' && a.triggered);
    if (!existingAlert) {
      this.alerts.push({
        type: 'low_stock',
        message: `Stock bas: ${this.quantity} ${this.unit} (min: ${this.minQuantity})`,
        triggered: true,
        date: new Date(),
      });
    }
  }
  
  next();
});

const InventoryItem = mongoose.model<IInventoryItem>('InventoryItem', inventoryItemSchema);
export default InventoryItem;
