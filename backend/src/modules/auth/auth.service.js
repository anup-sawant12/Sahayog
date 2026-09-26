const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authRepository = require('./auth.repository');
const { ApiError } = require('../../core/middleware/error.middleware');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../../config/env');

const BCRYPT_SALT_ROUNDS = 10;

const register = async (userData) => {
  const { name, email, phone, password, role } = userData;

  const normalizedEmail = email.toLowerCase().trim();
  const normalizedPhone = phone.trim();

  // 1. Check whether email already exists
  const existingUserByEmail = await authRepository.findUserByEmail(normalizedEmail);
  if (existingUserByEmail) {
    throw ApiError.conflict('An account with this email already exists');
  }

  // 2. Check whether phone already exists
  const existingUserByPhone = await authRepository.findUserByPhone(normalizedPhone);
  if (existingUserByPhone) {
    throw ApiError.conflict('An account with this phone number already exists');
  }

  // 3. Hash password using bcrypt
  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

  // 4. Create user in database
  const createdUser = await authRepository.createUser({
    name: name.trim(),
    email: normalizedEmail,
    phone: normalizedPhone,
    passwordHash,
    role: role || 'CUSTOMER',
  });

  // 5. Format safe response (exclude password and passwordHash)
  return {
    id: createdUser.id,
    name: createdUser.name,
    email: createdUser.email,
    phone: createdUser.phone,
    role: createdUser.role,
    status: createdUser.status,
    emailVerified: createdUser.emailVerified,
    phoneVerified: createdUser.phoneVerified,
    createdAt: createdUser.createdAt,
  };
};

const login = async (credentials) => {
  const { email, password } = credentials;

  const normalizedEmail = email.toLowerCase().trim();

  // 1. Find user by email
  const user = await authRepository.findUserByEmail(normalizedEmail);
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // 2. Check account status
  if (user.status === 'SUSPENDED') {
    throw ApiError.forbidden('Account is suspended');
  }
  if (user.status === 'INACTIVE') {
    throw ApiError.forbidden('Account is inactive');
  }

  // 3. Compare password with stored passwordHash
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // 4. Generate JWT with identity payload
  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
    }
  );

  // 5. Update lastLoginAt timestamp
  await authRepository.updateLastLogin(user.id);

  // 6. Return token and safe user profile
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
    },
  };
};

module.exports = {
  register,
  login,
};
