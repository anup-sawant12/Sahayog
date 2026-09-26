const userService = require('./user.service');

const getMyProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await userService.getMyProfile(userId);

    return res.status(200).json({
      success: true,
      message: 'Profile fetched successfully',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateMyProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const updatedUser = await userService.updateMyProfile(userId, req.body);

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
};
