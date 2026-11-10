
const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
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
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  collection: 'feedback'
});

module.exports = mongoose.model('Feedback', feedbackSchema);
