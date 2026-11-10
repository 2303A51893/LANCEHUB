
const mongoose = require('mongoose');
const {
  Project,
  ClientProfile,
  Bid,
  FreelancerProfile,
  Contract,
  Notification
} = require('../models');

const parseSkills = (skills) => {
  if (Array.isArray(skills)) return skills;

  if (typeof skills === 'string' && skills.trim()) {
    try {
      const parsed = JSON.parse(skills);
      if (Array.isArray(parsed)) return parsed;
    } catch (error) {
      return skills.split(',').map(skill => skill.trim()).filter(Boolean);
    }
  }

  return [];
};

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Get all projects with filters and search
exports.getAllProjects = async (req, res, next) => {
  try {
    const {
      status,
      search,
      category,
      scope,
      minBudget,
      maxBudget,
      sortBy = 'createdAt',
      order = 'DESC',
      page = 1,
      limit = 20
    } = req.query;

    const filter = {};

    if (status && status !== 'all') filter.status = status;
    if (category && category !== 'all') filter.category = category;
    if (scope && scope !== 'all') filter.scope = scope;

    if (minBudget !== undefined || maxBudget !== undefined) {
      filter.budget = {};

      if (minBudget !== undefined) {
        const value = Number(minBudget);
        if (!Number.isFinite(value)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid minimum budget.'
          });
        }
        filter.budget.$gte = value;
      }

      if (maxBudget !== undefined) {
        const value = Number(maxBudget);
        if (!Number.isFinite(value)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid maximum budget.'
          });
        }
        filter.budget.$lte = value;
      }
    }

    if (search) {
      const searchRegex = new RegExp(escapeRegex(search), 'i');

      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { skillsRequired: searchRegex }
      ];
    }

    const currentPage = Math.max(1, parseInt(page, 10) || 1);
    const pageLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (currentPage - 1) * pageLimit;

    const allowedSortFields = [
      'createdAt',
      'updatedAt',
      'budget',
      'deadline',
      'title'
    ];

    const sortField = allowedSortFields.includes(sortBy)
      ? sortBy
      : 'createdAt';

    const sortOrder = order.toUpperCase() === 'ASC' ? 1 : -1;

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .populate('clientId', 'name email avatar')
        .sort({ [sortField]: sortOrder })
        .skip(offset)
        .limit(pageLimit),

      Project.countDocuments(filter)
    ]);

    const clientIds = projects
      .map(project => project.clientId?._id)
      .filter(Boolean);

    const profiles = await ClientProfile.find({
      userId: { $in: clientIds }
    });

    const profileMap = new Map(
      profiles.map(profile => [
        profile.userId.toString(),
        profile
      ])
    );

    const formattedProjects = projects.map(project => {
      const data = project.toObject();
      const client = data.clientId;

      data.client = client
        ? {
            ...client,
            clientProfile: profileMap.get(client._id.toString()) || null
          }
        : null;

      return data;
    });

    res.json({
      success: true,
      total,
      totalPages: Math.ceil(total / pageLimit),
      currentPage,
      projects: formattedProjects
    });
  } catch (error) {
    next(error);
  }
};

// Get single project by ID
exports.getProjectById = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID.'
      });
    }

    const project = await Project.findById(req.params.id)
      .populate('clientId', 'name email phone avatar');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.'
      });
    }

    const projectData = project.toObject();

    if (project.clientId) {
      projectData.client = {
        ...project.clientId.toObject(),
        clientProfile: await ClientProfile.findOne({
          userId: project.clientId._id
        })
      };
    } else {
      projectData.client = null;
    }

    const contract = await Contract.findOne({
      projectId: project._id
    }).populate('freelancerId', 'name email');

    projectData.contract = contract
      ? {
          ...contract.toObject(),
          freelancer: contract.freelancerId
        }
      : null;

    // Include bids only for the project owner or admin
    let bids = [];

    const isOwnerOrAdmin = req.user && (
      req.user.role === 'admin' ||
      (
        project.clientId &&
        req.user._id.toString() === project.clientId._id.toString()
      )
    );

    if (isOwnerOrAdmin) {
      const foundBids = await Bid.find({
        projectId: project._id
      })
        .populate('freelancerId', 'name email avatar')
        .sort({ createdAt: 1 });

      const freelancerIds = foundBids
        .map(bid => bid.freelancerId?._id)
        .filter(Boolean);

      const freelancerProfiles = await FreelancerProfile.find({
        userId: { $in: freelancerIds }
      });

      const profileMap = new Map(
        freelancerProfiles.map(profile => [
          profile.userId.toString(),
          profile
        ])
      );

      bids = foundBids.map(bid => {
        const data = bid.toObject();

        data.freelancer = data.freelancerId
          ? {
              ...data.freelancerId.toObject(),
              freelancerProfile:
                profileMap.get(data.freelancerId._id.toString()) || null
            }
          : null;

        return data;
      });
    }

    // Check whether the current freelancer has already submitted a bid
    let userBid = null;

    if (req.user && req.user.role === 'freelancer') {
      userBid = await Bid.findOne({
        projectId: project._id,
        freelancerId: req.user._id
      });
    }

    res.json({
      success: true,
      project: projectData,
      bids,
      hasBidded: !!userBid,
      userBid
    });
  } catch (error) {
    next(error);
  }
};

// Create a new project
exports.createProject = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      scope,
      budget,
      deadline,
      skillsRequired
    } = req.body;

    if (
      !title ||
      !description ||
      budget === undefined ||
      budget === null ||
      budget === '' ||
      !deadline
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, budget, and deadline.'
      });
    }

    const numericBudget = Number(budget);
    const deadlineDate = new Date(deadline);

    if (!Number.isFinite(numericBudget) || numericBudget <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Budget must be a positive number.'
      });
    }

    if (Number.isNaN(deadlineDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid deadline.'
      });
    }

    const project = await Project.create({
      clientId: req.user._id,
      title,
      description,
      category: category || 'Web Development',
      scope: scope || 'Intermediate',
      budget: numericBudget,
      deadline: deadlineDate,
      skillsRequired: parseSkills(skillsRequired),
      status: 'Open'
    });

    const clientProfile = await ClientProfile.findOne({
      userId: req.user._id
    });

    if (clientProfile) {
      clientProfile.totalProjectsPosted += 1;
      await clientProfile.save();
    }

    await Notification.create({
      userId: req.user._id,
      title: 'Project Published',
      message: `Your project "${project.title}" has been successfully published.`,
      type: 'project',
      link: `/projects/${project._id}`
    });

    res.status(201).json({
      success: true,
      message: 'Project created and published successfully!',
      project
    });
  } catch (error) {
    next(error);
  }
};

// Update project
exports.updateProject = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID.'
      });
    }

    const project = await Project.findById(req.params.id);

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
        message: 'You are not authorized to edit this project.'
      });
    }

    const {
      title,
      description,
      category,
      scope,
      budget,
      deadline,
      skillsRequired,
      status
    } = req.body;

    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;
    if (category !== undefined) project.category = category;
    if (scope !== undefined) project.scope = scope;

    if (budget !== undefined) {
      const numericBudget = Number(budget);

      if (!Number.isFinite(numericBudget) || numericBudget <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Budget must be a positive number.'
        });
      }

      project.budget = numericBudget;
    }

    if (deadline !== undefined) {
      const deadlineDate = new Date(deadline);

      if (Number.isNaN(deadlineDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid deadline.'
        });
      }

      project.deadline = deadlineDate;
    }

    if (skillsRequired !== undefined) {
      project.skillsRequired = parseSkills(skillsRequired);
    }

    if (status !== undefined) {
      const allowedStatuses = [
        'Open',
        'In Progress',
        'Completed',
        'Cancelled'
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid project status.'
        });
      }

      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Only an admin can directly change project status.'
        });
      }

      project.status = status;
    }

    await project.save();

    res.json({
      success: true,
      message: 'Project updated successfully!',
      project
    });
  } catch (error) {
    next(error);
  }
};

// Delete project
exports.deleteProject = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID.'
      });
    }

    const project = await Project.findById(req.params.id);

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
        message: 'You are not authorized to delete this project.'
      });
    }

    const existingContract = await Contract.findOne({
      projectId: project._id
    });

    if (existingContract) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a project with contract history.'
      });
    }

    await Bid.deleteMany({
      projectId: project._id
    });

    await Project.deleteOne({
      _id: project._id
    });

    res.json({
      success: true,
      message: 'Project deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// Get current user's projects
exports.getMyProjects = async (req, res, next) => {
  try {
    let projects = [];

    if (req.user.role === 'client') {
      const clientProjects = await Project.find({
        clientId: req.user._id
      }).sort({ createdAt: -1 });

      const projectIds = clientProjects.map(project => project._id);

      const bids = await Bid.find({
        projectId: { $in: projectIds }
      }).select('projectId status bidAmount');

      projects = clientProjects.map(project => {
        const data = project.toObject();

        data.bids = bids
          .filter(
            bid => bid.projectId.toString() === project._id.toString()
          )
          .map(bid => ({
            _id: bid._id,
            id: bid._id.toString(),
            status: bid.status,
            bidAmount: bid.bidAmount
          }));

        return data;
      });

    } else if (req.user.role === 'freelancer') {
      const bids = await Bid.find({
        freelancerId: req.user._id
      }).populate({
        path: 'projectId',
        populate: {
          path: 'clientId',
          select: 'name email'
        }
      });

      projects = bids
        .filter(bid => bid.projectId)
        .map(bid => {
          const projectData = bid.projectId.toObject();

          projectData.client = projectData.clientId;
          projectData.myBid = bid;

          return projectData;
        });

    } else {
      projects = await Project.find()
        .sort({ createdAt: -1 });
    }

    res.json({
      success: true,
      projects
    });
  } catch (error) {
    next(error);
  }
};
