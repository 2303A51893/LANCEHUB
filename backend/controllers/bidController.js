
const mongoose = require('mongoose');
const {
  Bid,
  Project,
  User,
  FreelancerProfile,
  Contract,
  Milestone,
  Notification
} = require('../models');

// Submit proposal/bid (Freelancer only)
exports.submitBid = async (req, res, next) => {
  try {
    const { projectId, bidAmount, deliveryDays, coverLetter } = req.body;

    if (
      !projectId ||
      bidAmount === undefined ||
      bidAmount === null ||
      bidAmount === '' ||
      deliveryDays === undefined ||
      deliveryDays === null ||
      deliveryDays === '' ||
      !coverLetter
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide projectId, bidAmount, deliveryDays, and coverLetter.'
      });
    }

    if (!mongoose.isValidObjectId(projectId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID.'
      });
    }

    const amount = Number(bidAmount);
    const days = Number(deliveryDays);

    if (!Number.isFinite(amount) || amount <= 0 || !Number.isInteger(days) || days <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Bid amount and delivery days must be valid positive numbers.'
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.'
      });
    }

    if (project.status !== 'Open') {
      return res.status(400).json({
        success: false,
        message: `Cannot submit proposal. Project is currently '${project.status}'.`
      });
    }

    const existingBid = await Bid.findOne({
      projectId: project._id,
      freelancerId: req.user._id
    });

    if (existingBid) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a proposal for this project. Duplicate bids are not allowed.'
      });
    }

    const bid = await Bid.create({
      projectId: project._id,
      freelancerId: req.user._id,
      bidAmount: amount,
      deliveryDays: days,
      coverLetter,
      status: 'Pending'
    });

    project.bidsCount += 1;
    await project.save();

    await Notification.create({
      userId: project.clientId,
      title: 'New Bid Received',
      message: `${req.user.name} submitted a bid of $${bid.bidAmount} on "${project.title}".`,
      type: 'bid',
      link: `/projects/${project._id}/compare`
    });

    res.status(201).json({
      success: true,
      message: 'Proposal submitted successfully!',
      bid
    });
  } catch (error) {
    next(error);
  }
};

// Get all bids for a project (Client owner or Admin)
exports.getBidsForProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    if (!mongoose.isValidObjectId(projectId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID.'
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.'
      });
    }

    if (
      req.user.role !== 'admin' &&
      project.clientId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view proposals for this project.'
      });
    }

    const bids = await Bid.find({
      projectId: project._id
    })
      .populate('freelancerId', 'name email avatar')
      .sort({ createdAt: -1 });

    const freelancerIds = bids
      .map(bid => bid.freelancerId?._id)
      .filter(Boolean);

    const profiles = await FreelancerProfile.find({
      userId: { $in: freelancerIds }
    });

    const profileMap = new Map(
      profiles.map(profile => [
        profile.userId.toString(),
        profile
      ])
    );

    const formattedBids = bids.map(bid => {
      const data = bid.toObject();

      data.freelancer = data.freelancerId
        ? {
            ...data.freelancerId,
            freelancerProfile:
              profileMap.get(data.freelancerId._id.toString()) || null
          }
        : null;

      return data;
    });

    res.json({
      success: true,
      project,
      totalBids: formattedBids.length,
      bids: formattedBids
    });
  } catch (error) {
    next(error);
  }
};

// Get my bids (Freelancer)
exports.getMyBids = async (req, res, next) => {
  try {
    const bids = await Bid.find({
      freelancerId: req.user._id
    })
      .populate({
        path: 'projectId',
        populate: {
          path: 'clientId',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 });

    const formattedBids = bids.map(bid => {
      const data = bid.toObject();

      data.project = data.projectId
        ? {
            ...data.projectId,
            client: data.projectId.clientId
          }
        : null;

      return data;
    });

    res.json({
      success: true,
      bids: formattedBids
    });
  } catch (error) {
    next(error);
  }
};

// Accept a bid and automatically generate contract (Client only)
exports.acceptBid = async (req, res, next) => {
  try {
    const { bidId } = req.params;

    if (!mongoose.isValidObjectId(bidId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid bid ID.'
      });
    }

    const bid = await Bid.findById(bidId);

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found.'
      });
    }

    const project = await Project.findById(bid.projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Associated project not found.'
      });
    }

    if (
      project.clientId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Only the project owner can accept proposals.'
      });
    }

    if (bid.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'This bid has already been processed.'
      });
    }

    if (project.status !== 'Open') {
      return res.status(400).json({
        success: false,
        message: 'This project already has an active or completed contract.'
      });
    }

    // Accept this bid
    bid.status = 'Accepted';
    await bid.save();

    // Reject other pending bids on this project
    await Bid.updateMany(
      {
        projectId: project._id,
        status: 'Pending',
        _id: { $ne: bid._id }
      },
      {
        $set: { status: 'Rejected' }
      }
    );

    // Update project status
    project.status = 'In Progress';
    await project.save();

    // Calculate contract end date
    const targetEndDate = new Date();
    targetEndDate.setDate(
      targetEndDate.getDate() + (bid.deliveryDays || 14)
    );

    // Create contract
    const contract = await Contract.create({
      projectId: project._id,
      clientId: project.clientId,
      freelancerId: bid.freelancerId,
      bidId: bid._id,
      contractValue: bid.bidAmount,
      status: 'Active',
      startDate: new Date(),
      endDate: targetEndDate,
      terms: `Agreed delivery in ${bid.deliveryDays} days for fixed price of $${bid.bidAmount}. Scope per project description.`
    });

    // Create initial milestone
    await Milestone.create({
      contractId: contract._id,
      title: 'Milestone 1: Project Architecture & Initial Deliverables',
      description: 'Initial design, wireframes, repository setup and base architecture.',
      amount: Number((bid.bidAmount * 0.5).toFixed(2)),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'In Progress'
    });

    // Create final milestone
    await Milestone.create({
      contractId: contract._id,
      title: 'Milestone 2: Final Implementation & Delivery',
      description: 'Full feature implementation, testing, deployment instructions, and handover.',
      amount: Number((bid.bidAmount - Number((bid.bidAmount * 0.5).toFixed(2))).toFixed(2)),
      dueDate: targetEndDate,
      status: 'Pending'
    });

    // Notify freelancer
    await Notification.create({
      userId: bid.freelancerId,
      title: 'Proposal Accepted! Contract Created',
      message: `Congratulations! Your proposal for "${project.title}" has been accepted. A contract valued at $${contract.contractValue} has been generated.`,
      type: 'contract',
      link: `/contracts/${contract._id}`
    });

    res.json({
      success: true,
      message: 'Bid accepted and contract generated successfully!',
      contract
    });
  } catch (error) {
    next(error);
  }
};

// Reject a bid (Client only)
exports.rejectBid = async (req, res, next) => {
  try {
    const { bidId } = req.params;

    if (!mongoose.isValidObjectId(bidId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid bid ID.'
      });
    }

    const bid = await Bid.findById(bidId);

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found.'
      });
    }

    const project = await Project.findById(bid.projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Associated project not found.'
      });
    }

    if (
      project.clientId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to reject this bid.'
      });
    }

    if (bid.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'This bid has already been processed.'
      });
    }

    bid.status = 'Rejected';
    await bid.save();

    await Notification.create({
      userId: bid.freelancerId,
      title: 'Proposal Update',
      message: `Your proposal for "${project.title}" was not selected.`,
      type: 'bid',
      link: '/bids'
    });

    res.json({
      success: true,
      message: 'Bid marked as rejected.'
    });
  } catch (error) {
    next(error);
  }
};
