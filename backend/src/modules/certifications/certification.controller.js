const certificationService = require('./certification.service');

const getMyCertifications = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const certifications = await certificationService.getMyCertifications(userId);

    return res.status(200).json({
      success: true,
      message: 'Certifications retrieved successfully',
      data: certifications,
    });
  } catch (error) {
    next(error);
  }
};

const createCertification = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const certification = await certificationService.createCertification(userId, req.body);

    return res.status(201).json({
      success: true,
      message: 'Certification created successfully',
      data: certification,
    });
  } catch (error) {
    next(error);
  }
};

const updateCertification = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const certificationId = req.params.id;
    const certification = await certificationService.updateCertification(
      userId,
      certificationId,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: 'Certification updated successfully',
      data: certification,
    });
  } catch (error) {
    next(error);
  }
};

const deleteCertification = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const certificationId = req.params.id;
    await certificationService.deleteCertification(userId, certificationId);

    return res.status(200).json({
      success: true,
      message: 'Certification deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
};
