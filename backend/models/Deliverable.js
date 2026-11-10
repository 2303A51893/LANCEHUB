
const mongoose = require('mongoose');

const deliverableSchema = new mongoose.Schema({
  milestoneId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Milestone',
    required: true
  },
  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileUrl: {
    type: String,
    default: null
  },
  submissionNotes: {
    type: String,
    required: true
  },
  submissionDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Submitted', 'Accepted', 'Revision Requested'],
    default: 'Submitted'
  },
  clientFeedback: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  collection: 'deliverables'
});

module.exports = mongoose.model('Deliverable', deliverableSchema);
