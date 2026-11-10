
const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  contractId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: null
  },
  amount: {
    type: Number,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: [
      'Pending',
      'In Progress',
      'Deliverable Submitted',
      'Approved',
      'Paid',
      'Revision Requested'
    ],
    default: 'Pending'
  },
  revisionNotes: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  collection: 'milestones'
});

module.exports = mongoose.model('Milestone', milestoneSchema);
