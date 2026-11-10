
const mongoose = require('mongoose');
const {
  Contract,
  Project,
  User,
  FreelancerProfile,
  ClientProfile,
  Milestone,
  Deliverable,
  Payment,
  Feedback,
  Notification
} = require('../models');

// Get all contracts (filtered by user role)
exports.getAllContracts = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (req.user.role === 'client') {
      filter.clientId = req.user._id;
    } else if (req.user.role === 'freelancer') {
      filter.freelancerId = req.user._id;
    }

    // Search projects by title
    if (search) {
      const searchRegex = new RegExp(
        search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        'i'
      );

      const matchingProjects = await Project.find({
        title: searchRegex
      }).select('_id');

      filter.projectId = {
        $in: matchingProjects.map(project => project._id)
      };
    }

    const contracts = await Contract.find(filter)
      .sort({ createdAt: -1 });

    const userIds = [
      ...new Set(
        contracts.flatMap(contract => [
          contract.clientId.toString(),
          contract.freelancerId.toString()
        ])
      )
    ];

    const projectIds = contracts.map(contract => contract.projectId);

    const [users, projects, milestones, clientProfiles, freelancerProfiles] =
      await Promise.all([
        User.find({ _id: { $in: userIds } })
          .select('name email avatar'),

        Project.find({ _id: { $in: projectIds } }),

        Milestone.find({
          contractId: { $in: contracts.map(contract => contract._id) }
        }),

        ClientProfile.find({
          userId: {
            $in: contracts.map(contract => contract.clientId)
          }
        }).select('userId companyName'),

        FreelancerProfile.find({
          userId: {
            $in: contracts.map(contract => contract.freelancerId)
          }
        }).select('userId rating title')
      ]);

    const userMap = new Map(
      users.map(user => [user._id.toString(), user.toObject()])
    );

    const projectMap = new Map(
      projects.map(project => [project._id.toString(), project.toObject()])
    );

    const clientProfileMap = new Map(
      clientProfiles.map(profile => [
        profile.userId.toString(),
        profile.toObject()
      ])
    );

    const freelancerProfileMap = new Map(
      freelancerProfiles.map(profile => [
        profile.userId.toString(),
        profile.toObject()
      ])
    );

    const milestoneMap = new Map();

    milestones.forEach(milestone => {
      const key = milestone.contractId.toString();

      if (!milestoneMap.has(key)) {
        milestoneMap.set(key, []);
      }

      milestoneMap.get(key).push(milestone);
    });

    const formattedContracts = contracts.map(contract => {
      const data = contract.toObject();

      const client = userMap.get(contract.clientId.toString());
      const freelancer = userMap.get(contract.freelancerId.toString());

      data.project = projectMap.get(contract.projectId.toString()) || null;

      data.client = client
        ? {
            ...client,
            clientProfile:
              clientProfileMap.get(contract.clientId.toString()) || null
          }
        : null;

      data.freelancer = freelancer
        ? {
            ...freelancer,
            freelancerProfile:
              freelancerProfileMap.get(contract.freelancerId.toString()) || null
          }
        : null;

      data.milestones =
        milestoneMap.get(contract._id.toString()) || [];

      return data;
    });

    res.json({
      success: true,
      total: formattedContracts.length,
      contracts: formattedContracts
    });
  } catch (error) {
    next(error);
  }
};

// Get single contract details
exports.getContractById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid contract ID.'
      });
    }

    const contract = await Contract.findById(id);

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found.'
      });
    }

    // Only admin and payment reviewer can see all contracts
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
        message: 'Access denied to this contract.'
      });
    }

    const [
      project,
      client,
      freelancer,
      clientProfile,
      freelancerProfile,
      milestones,
      feedback
    ] = await Promise.all([
      Project.findById(contract.projectId),

      User.findById(contract.clientId)
        .select('name email phone avatar'),

      User.findById(contract.freelancerId)
        .select('name email phone avatar'),

      ClientProfile.findOne({
        userId: contract.clientId
      }),

      FreelancerProfile.findOne({
        userId: contract.freelancerId
      }),

      Milestone.find({
        contractId: contract._id
      }).sort({ createdAt: 1 }),

      Feedback.find({
        contractId: contract._id
      })
    ]);

    const milestoneIds = milestones.map(milestone => milestone._id);

    const [deliverables, payments] = await Promise.all([
      Deliverable.find({
        milestoneId: { $in: milestoneIds }
      }),

      Payment.find({
        milestoneId: { $in: milestoneIds }
      }).populate('reviewerId', 'name email')
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

    const contractData = contract.toObject();

    contractData.project = project;

    contractData.client = client
      ? {
          ...client.toObject(),
          clientProfile
        }
      : null;

    contractData.freelancer = freelancer
      ? {
          ...freelancer.toObject(),
          freelancerProfile
        }
      : null;

    contractData.milestones = formattedMilestones;
    contractData.feedback = feedback;

    res.json({
      success: true,
      contract: contractData
    });
  } catch (error) {
    next(error);
  }
};

// Update contract status
exports.updateContractStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid contract ID.'
      });
    }

    if (!['Active', 'Completed', 'Terminated'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid contract status.'
      });
    }

    const contract = await Contract.findById(id);

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found.'
      });
    }

    if (
      req.user.role !== 'admin' &&
      contract.clientId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Only client or admin can update contract status.'
      });
    }

    if (contract.status === 'Completed' || contract.status === 'Terminated') {
      return res.status(400).json({
        success: false,
        message: 'This contract has already been finalized.'
      });
    }

    const project = await Project.findById(contract.projectId);

    if (status === 'Completed') {
      contract.endDate = new Date();

      if (project) {
        project.status = 'Completed';
        await project.save();
      }

      // Update freelancer profile
      const freelancerProfile = await FreelancerProfile.findOne({
        userId: contract.freelancerId
      });

      if (freelancerProfile) {
        freelancerProfile.completedProjectsCount += 1;
        freelancerProfile.totalEarnings += contract.contractValue;
        await freelancerProfile.save();
      }

      // Update client profile
      const clientProfile = await ClientProfile.findOne({
        userId: contract.clientId
      });

      if (clientProfile) {
        clientProfile.totalSpent += contract.contractValue;
        await clientProfile.save();
      }

      // Notify freelancer
      await Notification.create({
        userId: contract.freelancerId,
        title: 'Contract Completed!',
        message: `Contract for "${project?.title || 'Project'}" has been marked as Completed.`,
        type: 'contract',
        link: `/contracts/${contract._id}`
      });
    }

    contract.status = status;
    await contract.save();

    res.json({
      success: true,
      message: `Contract status updated to ${status}.`,
      contract
    });
  } catch (error) {
    next(error);
  }
};
