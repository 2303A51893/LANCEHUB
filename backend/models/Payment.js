
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  milestoneId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Milestone',
    required: true
  },
  contractId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract',
    required: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending Review', 'Approved', 'Rejected'],
    default: 'Pending Review'
  },
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  reviewerNotes: {
    type: String,
    default: null
  },
  transactionId: {
    type: String,
    required: true,
    unique: true,
    default: () => `TXN-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`
  }
}, {
  timestamps: true,
  collection: 'payments'
});

module.exports = mongoose.model('Payment', paymentSchema);
