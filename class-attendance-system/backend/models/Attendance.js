const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required']
    },
    status: {
      type: String,
      enum: ['Present', 'Absent'],
      required: [true, 'Attendance status must be Present or Absent'],
      default: 'Present'
    }
  },
  { _id: false }
);

const attendanceSchema = new mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject is required']
    },
    // Normalized date string (YYYY-MM-DD) to prevent timezone drift across clients/servers
    date: {
      type: String,
      required: [true, 'Date string (YYYY-MM-DD) is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD']
    },
    section: {
      type: String,
      trim: true,
      uppercase: true,
      default: 'ALL'
    },
    records: [attendanceRecordSchema],
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate attendance sheets for the same subject and date
attendanceSchema.index({ subject: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
