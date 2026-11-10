
const mongoose = require('mongoose');
const {
  User,
  FreelancerProfile,
  ClientProfile,
  Project,
  Contract
} = require('../models');

// Get all users (Admin only)
exports.getAllUsers = async (req, res, next) => {
  try {
    const {
      role,
      status,
      search,
      page = 1,
      limit = 50
    } = req.query;

    const filter = {};

    if (role && role !== 'all') {
      filter.role = role;
    }

    if (status !== undefined && status !== 'all') {
      filter.isActive = status === 'active';
    }

    if (search) {
      const searchRegex = new RegExp(
        search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        'i'
      );

      filter.$or = [
        { name: searchRegex },
        { email: searchRegex }
      ];
    }

    const currentPage = Math.max(1, parseInt(page, 10) || 1);
    const pageLimit = Math.min(
      100,
      Math.max(1, parseInt(limit, 10) || 50)
    );

    const skip = (currentPage - 1) * pageLimit;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageLimit)
        .lean(),

      User.countDocuments(filter)
    ]);

    const userIds = users.map(user => user._id);

    const [freelancerProfiles, clientProfiles] = await Promise.all([
      FreelancerProfile.find({
        userId: { $in: userIds }
      }).lean(),

      ClientProfile.find({
        userId: { $in: userIds }
      }).lean()
    ]);

    const freelancerMap = new Map(
      freelancerProfiles.map(profile => [
        profile.userId.toString(),
        profile
      ])
    );

    const clientMap = new Map(
      clientProfiles.map(profile => [
        profile.userId.toString(),
        profile
      ])
    );

    const formattedUsers = users.map(user => ({
      ...user,
      freelancerProfile:
        freelancerMap.get(user._id.toString()) || null,
      clientProfile:
        clientMap.get(user._id.toString()) || null
    }));

    res.json({
      success: true,
      total,
      totalPages: Math.ceil(total / pageLimit),
      currentPage,
      users: formattedUsers
    });
  } catch (error) {
    next(error);
  }
};

// Get single user by ID
exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID.'
      });
    }

    const user = await User.findById(id)
      .select('-password')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    const [freelancerProfile, clientProfile] = await Promise.all([
      FreelancerProfile.findOne({
        userId: user._id
      }).lean(),

      ClientProfile.findOne({
        userId: user._id
      }).lean()
    ]);

    res.json({
      success: true,
      user: {
        ...user,
        freelancerProfile,
        clientProfile
      }
    });
  } catch (error) {
    next(error);
  }
};

// Toggle user active status (Admin only)
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID.'
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own admin account.'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User account has been ${
        user.isActive ? 'activated' : 'deactivated'
      } successfully.`,
      isActive: user.isActive
    });
  } catch (error) {
    next(error);
  }
};

// Delete user (Admin only)
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID.'
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own admin account.'
      });
    }

    await Promise.all([
      FreelancerProfile.deleteMany({ userId: user._id }),
      ClientProfile.deleteMany({ userId: user._id })
    ]);

    await user.deleteOne();

    res.json({
      success: true,
      message: 'User deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// Get list of freelancers for client browsing
exports.getFreelancers = async (req, res, next) => {
  try {
    const { search, skill, minRating } = req.query;

    const filter = {
      role: 'freelancer',
      isActive: true
    };

    if (search) {
      const searchRegex = new RegExp(
        search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        'i'
      );

      filter.$or = [
        { name: searchRegex },
        { email: searchRegex }
      ];
    }

    const profileFilter = {};

    if (minRating !== undefined && minRating !== '') {
      const rating = Number(minRating);

      if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Minimum rating must be between 0 and 5.'
        });
      }

      profileFilter.rating = {
        $gte: rating
      };
    }

    if (skill) {
      profileFilter.skills = {
        $regex: skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        $options: 'i'
      };
    }

    const profiles = await FreelancerProfile.find(profileFilter)
      .sort({ rating: -1 });

    const freelancerIds = profiles.map(profile => profile.userId);

    const users = await User.find({
      ...filter,
      _id: { $in: freelancerIds }
    })
      .select('-password')
      .lean();

    const profileMap = new Map(
      profiles.map(profile => [
        profile.userId.toString(),
        profile.toObject()
      ])
    );

    const results = users.map(user => ({
      ...user,
      freelancerProfile:
        profileMap.get(user._id.toString()) || null
    }));

    res.json({
      success: true,
      freelancers: results
    });
  } catch (error) {
    next(error);
  }
};
