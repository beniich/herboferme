// backend/models/Budget.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IBudget extends Document {
  name: string;
  description?: string;
  fiscalYear: number;
  type: 'operational' | 'investment' | 'treasury';
  categories: Array<{
    name: string;
    budgeted: number;
    spent: number;
    remaining: number;
    percentage: number;
  }>;
  totalBudgeted: number;
  totalSpent: number;
  totalRemaining: number;
  status: 'draft' | 'approved' | 'active' | 'closed';
  startDate: Date;
  endDate: Date;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  alerts: Array<{
    category: string;
    threshold: number; // 80% = alert
    triggered: boolean;
    date?: Date;
  }>;
  domain: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
}

const budgetSchema = new Schema<IBudget>(
  {
    name: {
      type: String,
      required: true,
    },
    description: String,
    fiscalYear: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['operational', 'investment', 'treasury'],
      required: true,
    },
    categories: [
      {
        name: String,
        budgeted: Number,
        spent: {
          type: Number,
          default: 0,
        },
        remaining: Number,
        percentage: Number,
      },
    ],
    totalBudgeted: {
      type: Number,
      required: true,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    totalRemaining: Number,
    status: {
      type: String,
      enum: ['draft', 'approved', 'active', 'closed'],
      default: 'draft',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: Date,
    alerts: [
      {
        category: String,
        threshold: Number,
        triggered: Boolean,
        date: Date,
      },
    ],
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

// Pre-save hook to calculate totals
budgetSchema.pre('save', function (next) {
  this.totalRemaining = this.totalBudgeted - this.totalSpent;
  
  this.categories.forEach((category) => {
    category.remaining = category.budgeted - category.spent;
    category.percentage = (category.spent / category.budgeted) * 100;
  });
  
  next();
});

const Budget = mongoose.model<IBudget>('Budget', budgetSchema);
export default Budget;
