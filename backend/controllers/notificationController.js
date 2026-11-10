
const mongoose = require('mongoose');
const { Notification } = require('../models');

// Get current user notifications
exports.getMyNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(30),

      Notification.countDocuments({
        userId,
        isRead: false
      })
    ]);

    res.json({
      success: true,
      unreadCount,
      notifications
    });
  } catch (error) {
    next(error);
  }
};

// Mark single notification as read
exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID.'
      });
    }

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found.'
      });
    }

    if (notification.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized.'
      });
    }

    notification.isRead = true;
    await notification.save();

    res.json({
      success: true,
      message: 'Marked as read.',
      notification
    });
  } catch (error) {
    next(error);
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      {
        userId: req.user._id,
        isRead: false
      },
      {
        $set: { isRead: true }
      }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read.'
    });
  } catch (error) {
    next(error);
  }
};
