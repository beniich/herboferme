/**
 * models/ApiKey.ts
 * Stores API keys (hashed). Raw key is shown ONCE at generation, never stored.
 */
import mongoose, { Document, Schema, Types } from 'mongoose';

export type ApiKeyScope =
  | 'complaints:read'
  | 'complaints:write'
  | 'organizations:read'
  | 'reports:read'
  | '*'; // superscope

export interface IApiKey extends Document {
  orgId: Types.ObjectId;
  keyHash: string;          // SHA-256 of raw key          never store raw
  name: string;             // Human-readable label
  scopes: ApiKeyScope[];
  plan: string;
  rateLimit: number;        // requests per minute
  lastUsedAt?: Date;
  expiresAt?: Date;
  createdBy: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ApiKeySchema = new Schema<IApiKey>(
  {
    orgId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    keyHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    scopes: {
      type: [String],
      default: ['complaints:read'],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: 'At least one scope is required',
      },
    },
    plan: {
      type: String,
      default: 'starter',
    },
    rateLimit: {
      type: Number,
      default: 60, // 60 req/min
      min: 1,
      max: 10000,
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true, collection: 'api_keys' },
);

export const ApiKey = mongoose.model<IApiKey>('ApiKey', ApiKeySchema);
