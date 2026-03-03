import mongoose from 'mongoose';

const secretSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    value: { type: String, required: true }, // Encrypted value
    category: {
      type: String,
      enum: ['API_KEY', 'DB_PASSWORD', 'SSL_CERT', 'OAUTH_CLIENT', 'SSH_KEY', 'OTHER'],
      default: 'OTHER',
    },
    environment: {
      type: String,
      enum: ['production', 'staging', 'development'],
      default: 'production',
    },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lastAccessed: { type: Date },
    lastRotation: { type: Date, default: Date.now },
    expiresAt: { type: Date },
    description: { type: String },
    isAutoRotate: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Secret = mongoose.model('Secret', secretSchema);
