
const mongoose = require('mongoose');

const freelancerProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  title: {
    type: String,
    default: 'Full Stack Developer'
  },
  bio: {
    type: String,
    default: null
  },
  hourlyRate: {
    type: Number,
    default: 35.0
  },
  skills: {
    type: [String],
    default: ['React', 'Node.js', 'PostgreSQL', 'Docker']
  },
  portfolioUrl: {
    type: String,
    default: null
  },
  githubUrl: {
    type: String,
    default: null
  },
  rating: {
    type: Number,
    default: 5.0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  completedProjectsCount: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0.0
  },
  onTimeDeliveryRate: {
    type: Number,
    default: 98.5
  }
}, {
  timestamps: true,
  collection: 'freelancer_profiles'
});

module.exports = mongoose.model('FreelancerProfile', freelancerProfileSchema);
