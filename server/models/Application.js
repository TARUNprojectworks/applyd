const mongoose = require('mongoose');

// The only allowed status values. Used by the schema enum and by the controller.
const STATUSES = ['Applied', 'Interview', 'Offer', 'Rejected'];

// One entry in the status history timeline.
// _id: false because these small sub-documents don't need their own ids.
const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, enum: STATUSES, required: true },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    // Owner of this application. Every query filters by this field.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // makes "find all applications of this user" fast
    },
    company: { type: String, required: [true, 'Company is required'], trim: true },
    role: { type: String, required: [true, 'Role is required'], trim: true },
    jobLink: { type: String, trim: true, default: '' },
    location: { type: String, trim: true, default: '' },
    salaryExpectation: { type: String, trim: true, default: '' },
    appliedDate: { type: Date, required: [true, 'Applied date is required'] },
    status: {
      type: String,
      enum: { values: STATUSES, message: 'Status must be Applied, Interview, Offer or Rejected' },
      default: 'Applied',
    },
    interviewDate: { type: Date, default: null }, // optional
    notes: { type: String, trim: true, default: '' },
    // Array of { status, changedAt }. A new entry is pushed whenever status changes.
    statusHistory: [statusHistorySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Application', applicationSchema);
module.exports.STATUSES = STATUSES;
