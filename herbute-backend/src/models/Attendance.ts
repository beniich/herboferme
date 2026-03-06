import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
  worker: mongoose.Types.ObjectId;
  date: Date;
  status: 'present' | 'absent' | 'leave' | 'sick' | 'late';
  checkIn?: Date;
  checkOut?: Date;
  workHours: number;
  breakMinutes: number;
  overtime: number;
  leaveType?: 'vacation' | 'sick' | 'personal' | 'other';
  leaveReason?: string;
  approvedBy?: mongoose.Types.ObjectId;
  notes?: string;
  location?: {
    checkIn: { lat: number; lng: number };
    checkOut: { lat: number; lng: number };
  };
  domain: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    worker: {
      type: Schema.Types.ObjectId,
      ref: 'Worker',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'leave', 'sick', 'late'],
      required: true,
    },
    checkIn: Date,
    checkOut: Date,
    workHours: {
      type: Number,
      default: 0,
    },
    breakMinutes: {
      type: Number,
      default: 60,
    },
    overtime: {
      type: Number,
      default: 0,
    },
    leaveType: {
      type: String,
      enum: ['vacation', 'sick', 'personal', 'other'],
    },
    leaveReason: String,
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: String,
    location: {
      checkIn: {
        lat: Number,
        lng: Number,
      },
      checkOut: {
        lat: Number,
        lng: Number,
      },
    },
    domain: {
      type: Schema.Types.ObjectId,
      ref: 'Domain',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
attendanceSchema.index({ worker: 1, date: 1 }, { unique: true });
attendanceSchema.index({ domain: 1, date: 1 });

export default mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', attendanceSchema);
