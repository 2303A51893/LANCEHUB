
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'project',
      'bid',
      'contract',
      'milestone',
      'payment',
      'feedback',
      'system'
    ],
    default: 'system'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  link: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  collection: 'notifications'
});

module.exports = mongoose.model('Notification', notificationSchema);
