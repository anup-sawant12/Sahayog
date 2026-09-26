const userRepository = require('./user.repository');
const { ApiError } = require('../../core/middleware/error.middleware');

const getMyProfile = async (userId) => {
  const user = await userRepository.getUserById(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  return user;
};

const updateMyProfile = async (userId, data) => {
  const user = await userRepository.getUserById(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // 1. Check duplicate email if email is being changed
  if (data.email) {
    const normalizedEmail = data.email.toLowerCase().trim();
    if (normalizedEmail !== user.email) {
      const existingUser = await userRepository.findUserByEmail(normalizedEmail);
      if (existingUser && existingUser.id !== userId) {
        throw ApiError.conflict('An account with this email already exists');
      }
    }
  }

  // 2. Check duplicate phone if phone is being changed
  if (data.phone) {
    const normalizedPhone = data.phone.trim();
    if (normalizedPhone !== user.phone) {
      const existingUser = await userRepository.findUserByPhone(normalizedPhone);
      if (existingUser && existingUser.id !== userId) {
        throw ApiError.conflict('An account with this phone number already exists');
      }
    }
  }

  // 3. Update user profile
  const updatedUser = await userRepository.updateUser(userId, data);

  return updatedUser;
};

module.exports = {
  getMyProfile,
  updateMyProfile,
};
