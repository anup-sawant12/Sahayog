const prisma = require('../../config/database');

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  status: true,
  emailVerified: true,
  phoneVerified: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
};

const getUserById = async (userId) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: safeUserSelect,
  });
};

const findUserByEmail = async (email) => {
  return prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true },
  });
};

const findUserByPhone = async (phone) => {
  return prisma.user.findUnique({
    where: { phone },
    select: { id: true, phone: true },
  });
};

const updateUser = async (userId, data) => {
  // Explicitly whitelist and pick allowed fields only
  const allowedData = {};
  if (data.name !== undefined) allowedData.name = data.name.trim();
  if (data.email !== undefined) allowedData.email = data.email.toLowerCase().trim();
  if (data.phone !== undefined) allowedData.phone = data.phone.trim();

  return prisma.user.update({
    where: { id: userId },
    data: allowedData,
    select: safeUserSelect,
  });
};

module.exports = {
  getUserById,
  findUserByEmail,
  findUserByPhone,
  updateUser,
};
