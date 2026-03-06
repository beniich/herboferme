// backend/models/AccountingEntry.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IAccountingEntry extends Document {
  date: Date;
  reference: string; // REF-2026-001
  type: 'income' | 'expense' | 'transfer';
  category: string;
  account: {
    number: string; // 601, 411, etc. (Plan comptable)
    name: string;
  };
  description: string;
  debit: number;
  credit: number;
  balance: number;
  taxRate?: number; // TVA 20%
  taxAmount?: number;
  paymentMethod?: 'cash' | 'bank_transfer' | 'check' | 'card';
  linkedDocument?: {
    type: 'invoice' | 'receipt' | 'order' | 'reclamation';
    id: mongoose.Types.ObjectId;
    number: string;
  };
  supplier?: mongoose.Types.ObjectId;
  customer?: mongoose.Types.ObjectId;
  tags: string[];
  fiscalYear: number; // 2026
  fiscalPeriod: number; // 1-12 (mois)
  status: 'draft' | 'validated' | 'reconciled';
  validatedBy?: mongoose.Types.ObjectId;
  validatedAt?: Date;
  attachments?: string[];
  notes?: string;
  domain: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
}

const accountingEntrySchema = new Schema<IAccountingEntry>(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    reference: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ['income', 'expense', 'transfer'],
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    account: {
      number: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
    },
    description: {
      type: String,
      required: true,
    },
    debit: {
      type: Number,
      default: 0,
    },
    credit: {
      type: Number,
      default: 0,
    },
    balance: {
      type: Number,
      default: 0,
    },
    taxRate: Number,
    taxAmount: Number,
    paymentMethod: {
      type: String,
      enum: ['cash', 'bank_transfer', 'check', 'card'],
    },
    linkedDocument: {
      type: {
        type: String,
        enum: ['invoice', 'receipt', 'order', 'reclamation'],
      },
      id: Schema.Types.ObjectId,
      number: String,
    },
    supplier: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
    },
    tags: [String],
    fiscalYear: {
      type: Number,
      required: true,
    },
    fiscalPeriod: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    status: {
      type: String,
      enum: ['draft', 'validated', 'reconciled'],
      default: 'draft',
    },
    validatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    validatedAt: Date,
    attachments: [String],
    notes: String,
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

// Indexes
accountingEntrySchema.index({ domain: 1, fiscalYear: 1, fiscalPeriod: 1 });
accountingEntrySchema.index({ date: 1 });

// Pre-save hook to calculate balance
accountingEntrySchema.pre('save', function (next) {
  this.balance = this.debit - this.credit;
  next();
});

const AccountingEntry = mongoose.model<IAccountingEntry>('AccountingEntry', accountingEntrySchema);
export default AccountingEntry;
