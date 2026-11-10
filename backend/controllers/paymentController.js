
const mongoose = require('mongoose');
const {
  Payment,
  Milestone,
  Contract,
  Project,
  User,
  FreelancerProfile,
  Notification
} = require('../models');

// Get all payments (Role-based access)
exports.getAllPayments = async (req, res, next) => {
  try {
    const { status, contractId } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (contractId) {
      if (!mongoose.isValidObjectId(contractId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid contract ID.'
        });
      }

      filter.contractId = contractId;
    }

    // Role-based filtering
    if (req.user.role === 'freelancer') {
      filter.freelancerId = req.user._id;
    } else if (req.user.role === 'client') {
      filter.clientId = req.user._id;
    }

    const payments = await Payment.find(filter)
      .populate('milestoneId', 'title dueDate amount status')
      .populate({
        path: 'contractId',
        populate: {
          path: 'projectId',
          select: 'title'
        }
      })
      .populate('clientId', 'name email')
      .populate('freelancerId', 'name email')
      .populate('reviewerId', 'name email')
      .sort({ createdAt: -1 });

    // Keep the response aliases used by the previous Sequelize API
    const formattedPayments = payments.map(payment => {
      const data = payment.toObject();

      data.milestone = data.milestoneId;
      data.contract = data.contractId;
      data.client = data.clientId;
      data.freelancer = data.freelancerId;
      data.reviewer = data.reviewerId;

      if (data.contract) {
        data.contract.project = data.contract.projectId;
      }

      return data;
    });

    res.json({
      success: true,
      total: formattedPayments.length,
      payments: formattedPayments
    });
  } catch (error) {
    next(error);
  }
};

// Review simulated payment (Payment Reviewer or Admin only)
exports.reviewPayment = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const { action, reviewerNotes } = req.body;

    if (!mongoose.isValidObjectId(paymentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment ID.'
      });
    }

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Action must be either 'approve' or 'reject'."
      });
    }

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found.'
      });
    }

    if (payment.status !== 'Pending Review') {
      return res.status(400).json({
        success: false,
        message: `Payment has already been processed with status: ${payment.status}`
      });
    }

    const milestone = await Milestone.findById(payment.milestoneId);

    payment.reviewerId = req.user._id;
    payment.reviewedAt = new Date();

    payment.reviewerNotes =
      reviewerNotes ||
      (action === 'approve'
        ? 'Simulated payment verified and approved.'
        : 'Payment rejected upon review.');

    if (action === 'approve') {
      payment.status = 'Approved';
      await payment.save();

      // Update milestone status
      if (milestone) {
        milestone.status = 'Paid';
        await milestone.save();
      }

      // Update freelancer earnings
      const freelancerProfile = await FreelancerProfile.findOne({
        userId: payment.freelancerId
      });

      if (freelancerProfile) {
        freelancerProfile.totalEarnings += payment.amount;
        await freelancerProfile.save();
      }

      // Notify freelancer
      await Notification.create({
        userId: payment.freelancerId,
        title: 'Payment Disbursed! (Simulated)',
        message: `Simulated payment of $${payment.amount} for "${milestone?.title || 'Milestone'}" has been approved and credited! Txn ID: ${payment.transactionId}`,
        type: 'payment',
        link: '/payments'
      });

      // Notify client
      await Notification.create({
        userId: payment.clientId,
        title: 'Payment Processed',
        message: `Simulated payment of $${payment.amount} for "${milestone?.title || 'Milestone'}" has been approved by ${req.user.name}.`,
        type: 'payment',
        link: '/payments'
      });
    } else {
      payment.status = 'Rejected';
      await payment.save();

      // Notify client
      await Notification.create({
        userId: payment.clientId,
        title: 'Payment Rejected by Reviewer',
        message: `Simulated payment for "${milestone?.title || 'Milestone'}" was rejected. Reason: ${payment.reviewerNotes}`,
        type: 'payment',
        link: '/payments'
      });

      // Notify freelancer
      await Notification.create({
        userId: payment.freelancerId,
        title: 'Payment Request Rejected',
        message: `Simulated payment for "${milestone?.title || 'Milestone'}" was rejected by payment reviewer.`,
        type: 'payment',
        link: '/payments'
      });
    }

    res.json({
      success: true,
      message: `Payment request has been ${payment.status.toLowerCase()}!`,
      payment
    });
  } catch (error) {
    next(error);
  }
};

// Payment statistics
exports.getPaymentStats = async (req, res, next) => {
  try {
    const all = await Payment.find();

    const totalAmount = all.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    const approvedPayments = all.filter(
      payment => payment.status === 'Approved'
    );

    const pendingPayments = all.filter(
      payment => payment.status === 'Pending Review'
    );

    const rejectedPayments = all.filter(
      payment => payment.status === 'Rejected'
    );

    const approvedAmount = approvedPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    const pendingAmount = pendingPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    const rejectedAmount = rejectedPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    res.json({
      success: true,
      stats: {
        totalTransactions: all.length,
        totalAmount,
        approvedCount: approvedPayments.length,
        approvedAmount,
        pendingCount: pendingPayments.length,
        pendingAmount,
        rejectedCount: rejectedPayments.length,
        rejectedAmount
      }
    });
  } catch (error) {
    next(error);
  }
};
