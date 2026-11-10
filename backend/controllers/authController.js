
const jwt = require('jsonwebtoken');
const { User, FreelancerProfile, ClientProfile } = require('../models');
const { JWT_SECRET } = require('../middleware/auth');

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Register
exports.register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      title,
      hourlyRate,
      skills,
      companyName,
      industry
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.'
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    const assignedRole = [
      'client',
      'freelancer',
      'payment_reviewer',
      'admin'
    ].includes(role) ? role : 'client';

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      phone: phone || null,
      isActive: true
    });

    let freelancerProfile = null;
    let clientProfile = null;

    if (assignedRole === 'freelancer') {
      freelancerProfile = await FreelancerProfile.create({
        userId: user._id,
        title: title || 'Freelance Specialist',
        hourlyRate: hourlyRate || 30,
        skills: Array.isArray(skills)
          ? skills
          : skills
            ? skills.split(',').map(skill => skill.trim())
            : ['General']
      });
    } else if (assignedRole === 'client') {
      clientProfile = await ClientProfile.create({
        userId: user._id,
        companyName: companyName || `${name}'s Organization`,
        industry: industry || 'Technology'
      });
    }

    const token = generateToken(user);

    const safeUser = user.toObject();
    delete safeUser.password;

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: {
        ...safeUser,
        freelancerProfile,
        clientProfile
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact an admin.'
      });
    }

    const [freelancerProfile, clientProfile] = await Promise.all([
      FreelancerProfile.findOne({ userId: user._id }),
      ClientProfile.findOne({ userId: user._id })
    ]);

    const token = generateToken(user);

    const safeUser = user.toObject();
    delete safeUser.password;

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        ...safeUser,
        freelancerProfile,
        clientProfile
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get current user profile
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    const [freelancerProfile, clientProfile] = await Promise.all([
      FreelancerProfile.findOne({ userId: user._id }),
      ClientProfile.findOne({ userId: user._id })
    ]);

    res.json({
      success: true,
      user: {
        ...user.toObject(),
        freelancerProfile,
        clientProfile
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update current user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      avatar,
      title,
      bio,
      hourlyRate,
      skills,
      portfolioUrl,
      githubUrl,
      companyName,
      industry,
      website
    } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    if (user.role === 'freelancer') {
      let profile = await FreelancerProfile.findOne({
        userId: user._id
      });

      if (!profile) {
        profile = new FreelancerProfile({
          userId: user._id
        });
      }

      if (title !== undefined) profile.title = title;
      if (bio !== undefined) profile.bio = bio;
      if (hourlyRate !== undefined) profile.hourlyRate = hourlyRate;

      if (skills !== undefined) {
        profile.skills = Array.isArray(skills)
          ? skills
          : skills.split(',').map(skill => skill.trim());
      }

      if (portfolioUrl !== undefined) profile.portfolioUrl = portfolioUrl;
      if (githubUrl !== undefined) profile.githubUrl = githubUrl;

      await profile.save();
    }

    if (user.role === 'client') {
      let profile = await ClientProfile.findOne({
        userId: user._id
      });

      if (!profile) {
        profile = new ClientProfile({
          userId: user._id
        });
      }

      if (companyName !== undefined) profile.companyName = companyName;
      if (industry !== undefined) profile.industry = industry;
      if (website !== undefined) profile.website = website;
      if (bio !== undefined) profile.bio = bio;

      await profile.save();
    }

    const [freelancerProfile, clientProfile] = await Promise.all([
      FreelancerProfile.findOne({ userId: user._id }),
      ClientProfile.findOne({ userId: user._id })
    ]);

    const safeUser = user.toObject();
    delete safeUser.password;

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        ...safeUser,
        freelancerProfile,
        clientProfile
      }
    });
  } catch (error) {
    next(error);
  }
};
