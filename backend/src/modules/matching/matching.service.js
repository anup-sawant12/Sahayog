const matchingRepository = require('./matching.repository');
const matchingEngine = require('./matching.engine');
const { ApiError } = require('../../core/middleware/error.middleware');

const formatServiceRequest = (req) => {
  if (!req) return null;
  return {
    id: req.id,
    customerId: req.customerId,
    serviceName: req.serviceName,
    category: req.category,
    description: req.description,
    requestedDate: req.requestedDate,
    requestedTime: req.requestedTime,
    city: req.city,
    area: req.area,
    pincode: req.pincode,
    latitude: req.latitude !== null && req.latitude !== undefined ? Number(req.latitude) : null,
    longitude: req.longitude !== null && req.longitude !== undefined ? Number(req.longitude) : null,
    status: req.status,
    createdAt: req.createdAt,
    updatedAt: req.updatedAt,
  };
};

const formatMatchResult = (mr) => {
  const workerUser = mr.workerProfile?.user;
  const ws = mr.workerService;

  return {
    id: mr.id,
    workerProfileId: mr.workerProfileId,
    workerName: workerUser?.name || 'Worker',
    workerServiceId: mr.workerServiceId,
    serviceName: ws?.name || null,
    category: ws?.category || null,
    price: ws?.price !== null && ws?.price !== undefined ? Number(ws.price) : null,
    pricingUnit: ws?.pricingUnit || null,
    matchScore: mr.matchScore,
    skillMatch: mr.skillMatch,
    serviceMatch: mr.serviceMatch,
    availabilityMatch: mr.availabilityMatch,
    locationMatch: mr.locationMatch,
    distanceKm: mr.distanceKm !== null && mr.distanceKm !== undefined ? Number(mr.distanceKm) : null,
  };
};

const createServiceRequest = async (userId, data) => {
  // 1. Create ServiceRequest with status OPEN
  const requestPayload = {
    ...data,
    customerId: userId,
  };
  let request = await matchingRepository.createServiceRequest(requestPayload);

  // 2. Fetch eligible workers (APPROVED profile, ACTIVE services, ACTIVE availability)
  const eligibleWorkers = await matchingRepository.findEligibleWorkers(request);

  // 3. Run pure matching engine
  const evaluatedMatches = matchingEngine.evaluateWorkers(request, eligibleWorkers);

  // 4. Save matches and update status if any match met threshold (matchScore >= 40)
  if (evaluatedMatches.length > 0) {
    const matchRecords = evaluatedMatches.map((m) => ({
      serviceRequestId: request.id,
      workerProfileId: m.workerProfileId,
      workerServiceId: m.workerServiceId,
      matchScore: m.matchScore,
      skillMatch: m.skillMatch,
      serviceMatch: m.serviceMatch,
      availabilityMatch: m.availabilityMatch,
      locationMatch: m.locationMatch,
      distanceKm: m.distanceKm,
    }));

    await matchingRepository.createMatchResults(matchRecords);
    request = await matchingRepository.updateServiceRequestStatus(request.id, 'MATCHED');
  }

  // 5. Fetch saved match results with relation data
  const savedMatches = await matchingRepository.getMatchResultsByRequestId(request.id);

  return {
    request: formatServiceRequest(request),
    matches: savedMatches.map(formatMatchResult),
  };
};

const getServiceRequest = async (userId, requestId) => {
  // 1. Verify request exists and belongs to authenticated customer
  const request = await matchingRepository.getCustomerServiceRequestById(userId, requestId);
  if (!request) {
    throw ApiError.notFound('Service request not found');
  }

  // 2. Fetch match results
  const matches = await matchingRepository.getMatchResultsByRequestId(requestId);

  return {
    request: formatServiceRequest(request),
    matches: matches.map(formatMatchResult),
  };
};

const rematchServiceRequest = async (userId, requestId) => {
  // 1. Verify request belongs to customer
  let request = await matchingRepository.getCustomerServiceRequestById(userId, requestId);
  if (!request) {
    throw ApiError.notFound('Service request not found');
  }

  // 2. Only allow rematching when status is OPEN or MATCHED
  if (request.status !== 'OPEN' && request.status !== 'MATCHED') {
    throw ApiError.badRequest(
      `Cannot rematch request with status ${request.status}. Only OPEN or MATCHED requests can be rematched.`
    );
  }

  // 3. Delete previous match results
  await matchingRepository.clearMatchResults(requestId);

  // 4. Find eligible workers and evaluate
  const eligibleWorkers = await matchingRepository.findEligibleWorkers(request);
  const evaluatedMatches = matchingEngine.evaluateWorkers(request, eligibleWorkers);

  // 5. Update matches and status
  if (evaluatedMatches.length > 0) {
    const matchRecords = evaluatedMatches.map((m) => ({
      serviceRequestId: request.id,
      workerProfileId: m.workerProfileId,
      workerServiceId: m.workerServiceId,
      matchScore: m.matchScore,
      skillMatch: m.skillMatch,
      serviceMatch: m.serviceMatch,
      availabilityMatch: m.availabilityMatch,
      locationMatch: m.locationMatch,
      distanceKm: m.distanceKm,
    }));

    await matchingRepository.createMatchResults(matchRecords);
    request = await matchingRepository.updateServiceRequestStatus(request.id, 'MATCHED');
  } else {
    request = await matchingRepository.updateServiceRequestStatus(request.id, 'OPEN');
  }

  // 6. Fetch updated match results
  const newMatches = await matchingRepository.getMatchResultsByRequestId(requestId);

  return {
    request: formatServiceRequest(request),
    matches: newMatches.map(formatMatchResult),
  };
};

module.exports = {
  formatServiceRequest,
  formatMatchResult,
  createServiceRequest,
  getServiceRequest,
  rematchServiceRequest,
};
