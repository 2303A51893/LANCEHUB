
const mongoose = require('mongoose');
const {
  Milestone,
  Contract,
  Deliverable,
  Payment,
  User,
  Notification
} = require('../models');

// Create Milestone for a Contract (Client only)
exports.createMilestone = async (req, res, next) => {
  try {
    const { contractId, title, description, amount, dueDate } = req.body;

    if (
      !contractId ||
      !title ||
      amount === undefined ||
      amount === null ||
      !dueDate
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide contractId, title, amount, and dueDate.'
      });
    }

    if (!mongoose.isValidObjectId(contractId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid contract ID.'
      });
    }

    const numericAmount = Number(amount);
    const parsedDate = new Date(dueDate);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a valid positive number.'
      });
    }

    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid due date.'
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
        message: 'Only the client can add milestones.'
      });
    }

    if (contract.status !== 'Active') {
      return res.status(400).json({
        success: false,
        message: 'Milestones can only be added to active contracts.'
      });
    }

    const milestone = await Milestone.create({
      contractId: contract._id,
      title,
      description,
      amount: numericAmount,
      dueDate: parsedDate,
      status: 'Pending'
    });

    await Notification.create({
      userId: contract.freelancerId,
      title: 'New Milestone Added',
      message: `A new milestone "${title}" ($${numericAmount}) has been created for your contract.`,
      type: 'milestone',
      link: `/contracts/${contract._id}`
    });

    res.status(201).json({
      success: true,
      message: 'Milestone created successfully!',
      milestone
    });
  } catch (error) {
    next(error);
  }
};

// Get milestones for a contract
exports.getContractMilestones = async (req, res, next) => {
  try {
    const { contractId } = req.params;

    if (!mongoose.isValidObjectId(contractId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid contract ID.'
      });
    }

    const contract = await Contract.findById(contractId);

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found.'
      });
    }

    const isPrivileged = [
      'admin',
      'payment_reviewer'
    ].includes(req.user.role);

    const isParticipant =
      contract.clientId.toString() === req.user._id.toString() ||
      contract.freelancerId.toString() === req.user._id.toString();

    if (!isPrivileged && !isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to these milestones.'
      });
    }

    const milestones = await Milestone.find({ contractId })
      .sort({ dueDate: 1 });

    const milestoneIds = milestones.map(item => item._id);

    const [deliverables, payments] = await Promise.all([
      Deliverable.find({
        milestoneId: { $in: milestoneIds }
      }),

      Payment.find({
        milestoneId: { $in: milestoneIds }
      })
    ]);

    const deliverableMap = new Map();
    deliverables.forEach(deliverable => {
      const key = deliverable.milestoneId.toString();

      if (!deliverableMap.has(key)) {
        deliverableMap.set(key, []);
      }

      deliverableMap.get(key).push(deliverable);
    });

    const paymentMap = new Map();
    payments.forEach(payment => {
      paymentMap.set(payment.milestoneId.toString(), payment);
    });

    const formattedMilestones = milestones.map(milestone => {
      const data = milestone.toObject();

      data.deliverables =
        deliverableMap.get(milestone._id.toString()) || [];

      data.payment =
        paymentMap.get(milestone._id.toString()) || null;

      return data;
    });

    res.json({
      success: true,
      milestones: formattedMilestones
    });
  } catch (error) {
    next(error);
  }
};

// Freelancer submits deliverable for milestone
exports.submitDeliverable = async (req, res, next) => {
  try {
    const { milestoneId } = req.params;
    const { submissionNotes, fileUrl } = req.body;

    if (!mongoose.isValidObjectId(milestoneId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid milestone ID.'
      });
    }

    if (!submissionNotes || !submissionNotes.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide submission notes.'
      });
    }

    const milestone = await Milestone.findById(milestoneId);

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found.'
      });
    }

    const contract = await Contract.findById(milestone.contractId);

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Associated contract not found.'
      });
    }

    if (
      contract.freelancerId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Only the assigned freelancer can submit deliverables.'
      });
    }

    if (contract.status !== 'Active') {
      return res.status(400).json({
        success: false,
        message: 'Deliverables can only be submitted for active contracts.'
      });
    }

    if (!['Pending', 'In Progress', 'Revision Requested'].includes(milestone.status)) {
      return res.status(400).json({
        success: false,
        message: 'This milestone cannot accept another submission in its current status.'
      });
    }

    const deliverable = await Deliverable.create({
      milestoneId: milestone._id,
      freelancerId: req.user._id,
      submissionNotes: submissionNotes.trim(),
      fileUrl: fileUrl || null,
      status: 'Submitted'
    });

    milestone.status = 'Deliverable Submitted';
    await milestone.save();

    await Notification.create({
      userId: contract.clientId,
      title: 'Deliverable Submitted',
      message: `${req.user.name} submitted deliverables for milestone "${milestone.title}". Please review.`,
      type: 'milestone',
      link: `/contracts/${contract._id}`
    });

    res.status(201).json({
      success: true,
      message: 'Deliverable submitted for client review!',
      deliverable,
      milestone
    });
  } catch (error) {
    next(error);
  }
};

// Client approves or requests revision on deliverable
exports.reviewDeliverable = async (req, res, next) => {
  try {
    const { deliverableId } = req.params;
    const { action, feedback, revisionNotes } = req.body;

    if (!mongoose.isValidObjectId(deliverableId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid deliverable ID.'
      });
    }

    if (!['approve', 'revision'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action must be approve or revision.'
      });
    }

    const deliverable = await Deliverable.findById(deliverableId);

    if (!deliverable) {
      return res.status(404).json({
        success: false,
        message: 'Deliverable not found.'
      });
    }

    const milestone = await Milestone.findById(deliverable.milestoneId);

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Associated milestone not found.'
      });
    }

    const contract = await Contract.findById(milestone.contractId);

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Associated contract not found.'
      });
    }

    if (
      contract.clientId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Only the client can review deliverables.'
      });
    }

    if (deliverable.status !== 'Submitted') {
      return res.status(400).json({
        success: false,
        message: 'This deliverable has already been reviewed.'
      });
    }

    if (action === 'approve') {
      deliverable.status = 'Accepted';
      deliverable.clientFeedback =
        feedback || 'Deliverable meets all specifications. Approved!';

      await deliverable.save();

      milestone.status = 'Approved';
      await milestone.save();

      // Create simulated payment request if one does not exist
      let payment = await Payment.findOne({
        milestoneId: milestone._id
      });

      if (!payment) {
        payment = await Payment.create({
          milestoneId: milestone._id,
          contractId: contract._id,
          clientId: contract.clientId,
          freelancerId: contract.freelancerId,
          amount: milestone.amount,
          status: 'Pending Review'
        });
      }

      await Notification.create({
        userId: contract.freelancerId,
        title: 'Deliverable Approved!',
        message: `Your deliverable for "${milestone.title}" was approved! Payment of $${milestone.amount} has been queued for simulated payout review.`,
        type: 'payment',
        link: '/payments'
      });

      // Notify all active payment reviewers
      const reviewers = await User.find({
        role: 'payment_reviewer',
        isActive: true
      }).select('_id');

      if (reviewers.length > 0) {
        await Notification.insertMany(
          reviewers.map(reviewer => ({
            userId: reviewer._id,
            title: 'New Simulated Payment Request',
            message: `Payment request of $${payment.amount} for Milestone "${milestone.title}" is pending your review.`,
            type: 'payment',
            link: '/payments'
          }))
        );
      }

      return res.json({
        success: true,
        message: 'Deliverable approved! Simulated payment request created and routed to Payment Reviewer.',
        milestone,
        payment
      });
    }

    // Revision requested
    deliverable.status = 'Revision Requested';
    deliverable.clientFeedback =
      feedback || 'Please address required changes.';

    await deliverable.save();

    milestone.status = 'Revision Requested';
    milestone.revisionNotes =
      revisionNotes || feedback || 'Changes requested by client.';

    await milestone.save();

    await Notification.create({
      userId: contract.freelancerId,
      title: 'Revision Requested on Deliverable',
      message: `Client requested revisions for "${milestone.title}": ${milestone.revisionNotes}`,
      type: 'milestone',
      link: `/contracts/${contract._id}`
    });

    return res.json({
      success: true,
      message: 'Revision requested from freelancer.',
      milestone
    });
  } catch (error) {
    next(error);
  }
};
