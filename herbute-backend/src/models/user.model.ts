/**
 * models/user.model.model.ts â€” SchÃ©ma Mongoose User
 * CentralisÃ© ici (source unique de vÃ©ritÃ©)
 * ImportÃ© par @reclamtrack/shared si nÃ©cessaire
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email:               string;
  passwordHash:        string;
  nom:                 string;
  prenom:              string;
  telephone?:          string;
  role:                'super_admin' | 'admin' | 'manager' | 'employe' | 'veterinaire' | 'comptable';
  farmId?:             mongoose.Types.ObjectId;
  organizationId?:     mongoose.Types.ObjectId;
  farmName?:           string;
  plan:                'essai' | 'essentiel' | 'professionnel' | 'entreprise';
  isActive:            boolean;
  emailVerified:       boolean;
  emailVerifyToken?:   string;
  emailVerifyExpires?: Date;
  passwordResetToken?:   string;
  passwordResetExpires?: Date;
  failedLoginAttempts: number;
  lockedUntil?:        Date;
  lastLogin?:          Date;
  avatarUrl?:          string;
  googleId?:           string;
  authProvider:        'local' | 'google';
  preferences:         Record<string, unknown>;
  stripeCustomerId?:   string;
  directLoginToken?:   string;
  createdAt:           Date;
  updatedAt:           Date;
}

const UserSchema = new Schema<IUser>({
  email:               { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash:        { type: String, required: true, select: false },
  nom:                 { type: String, required: true, trim: true, maxlength: 80 },
  prenom:              { type: String, required: true, trim: true, maxlength: 80 },
  telephone:           { type: String, maxlength: 20 },
  role: {
    type:    String,
    enum:    ['super_admin', 'admin', 'manager', 'employe', 'veterinaire', 'comptable'],
    default: 'employe',
  },
  farmId:              { type: Schema.Types.ObjectId, ref: 'Farm' },
  organizationId:      { type: Schema.Types.ObjectId, ref: 'Organization' },
  farmName:            { type: String },
  plan: {
    type:    String,
    enum:    ['essai', 'essentiel', 'professionnel', 'entreprise'],
    default: 'essai',
  },
  isActive:            { type: Boolean, default: true },
  emailVerified:       { type: Boolean, default: false },
  emailVerifyToken:    { type: String, select: false },
  emailVerifyExpires:  { type: Date },
  passwordResetToken:  { type: String, select: false },
  passwordResetExpires:{ type: Date },
  failedLoginAttempts: { type: Number, default: 0 },
  lockedUntil:         { type: Date },
  lastLogin:           { type: Date },
  avatarUrl:           { type: String },
  googleId:            { type: String, sparse: true },
  authProvider:        { type: String, enum: ['local', 'google'], default: 'local' },
  preferences:         { type: Schema.Types.Mixed, default: {} },
  stripeCustomerId:    { type: String },
  directLoginToken:    { type: String, select: false },
}, {
  timestamps: true,
});

// Index pour les lookups frÃ©quents
UserSchema.index({ email: 1 });
UserSchema.index({ farmId: 1 });
UserSchema.index({ role: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
