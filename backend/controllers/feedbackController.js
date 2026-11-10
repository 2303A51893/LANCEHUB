
const mongoose = require('mongoose');
const {
  Feedback,
  Contract,
  User,
  FreelancerProfile,
  Notification
} = require('../models');

// Submit Feedback & Rating (Client only)
exports.submitFeedback = async (req, res, next) => {
  try {
    const { contractId, rating, comment } = req.body;

    if (
      !contractId ||
      rating === undefined ||
      rating === null ||
      !comment ||
      !comment.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide contractId, rating (1-5), and written comment.'
      });
    }

    if (!mongoose.isValidObjectId(contractId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid contract ID.'
      });
    }

    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be a whole number between 1 and 5.'
      });
    }

    const contract = await Contract.findById(contractId);

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found.'
      });
    }

    if (
      contract.clientId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Only the contracting client can provide feedback.'
      });
    }

    if (contract.status !== 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Feedback can only be submitted for completed contracts.'
      });
    }

    // Check if feedback already exists
    const existingFeedback = await Feedback.findOne({
      contractId: contract._id
    });

    if (existingFeedback) {
      return res.status(400).json({
        success: false,
        message: 'Feedback has already been submitted for this contract.'
      });
    }

    const feedback = await Feedback.create({
      contractId: contract._id,
      clientId: contract.clientId,
      freelancerId: contract.freelancerId,
      rating: numericRating,
      comment: comment.trim()
    });

    // Recalculate freelancer's average rating
    const ratingStats = await Feedback.aggregate([
      {
        $match: {
          freelancerId: contract.freelancerId
        }
      },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' }
        }
      }
    ]);

    const totalReviews = ratingStats[0]?.totalReviews || 0;
    const avgRating = ratingStats[0]?.averageRating || 0;

    const freelancerProfile = await FreelancerProfile.findOne({
      userId: contract.freelancerId
    });

    if (freelancerProfile) {
      freelancerProfile.rating = Number(avgRating.toFixed(1));
      freelancerProfile.totalReviews = totalReviews;
      await freelancerProfile.save();
    }

    // Notify freelancer
    await Notification.create({
      userId: contract.freelancerId,
      title: 'New Feedback & Rating Received!',
      message: `${req.user.name} rated your work ${numericRating} stars: "${comment.trim().substring(0, 60)}..."`,
      type: 'feedback',
      link: `/contracts/${contract._id}`
    });

    res.status(201).json({
      success: true,
      message: 'Feedback and rating submitted successfully!',
      feedback,
      newAverageRating: avgRating.toFixed(1)
    });
  } catch (error) {
    next(error);
  }
};

// Get feedback for a freelancer
exports.getFreelancerFeedback = async (req, res, next) => {
  try {
    const { freelancerId } = req.params;

    if (!mongoose.isValidObjectId(freelancerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid freelancer ID.'
      });
    }

    const feedbacks = await Feedback.find({
      freelancerId
    })
      .populate('clientId', 'name avatar')
      .populate('contractId', 'contractValue startDate endDate')
      .sort({ createdAt: -1 });

    // Keep aliases expected by the previous Sequelize API
    const formattedFeedbacks = feedbacks.map(feedback => {
      const data = feedback.toObject();

      data.client = data.clientId;
      data.contract = data.contractId;

      return data;
    });

    res.json({
      success: true,
      feedbacks: formattedFeedbacks
    });
  } catch (error) {
    next(error);
  }
};
