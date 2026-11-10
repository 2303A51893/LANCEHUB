
const mongoose = require('mongoose');

const clientProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  companyName: {
    type: String,
    default: null
  },
  industry: {
    type: String,
    default: null
  },
  website: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    default: null
  },
  totalSpent: {
    type: Number,
    default: 0.0
  },
  totalProjectsPosted: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  collection: 'client_profiles'
});

module.exports = mongoose.model('ClientProfile', clientProfileSchema);
