const prisma = require('../../config/database');

const findUserByEmail = async (email) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

const findUserByPhone = async (phone) => {
  return prisma.user.findUnique({
    where: { phone },
  });
};

const createUser = async (userData) => {
  return prisma.user.create({
    data: userData,
  });
};

const updateLastLogin = async (userId) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      lastLoginAt: new Date(),
    },
  });
};

module.exports = {
  findUserByEmail,
  findUserByPhone,
  createUser,
  updateLastLogin,
};
