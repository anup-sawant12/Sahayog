/**
 * Matching Engine
 * Pure rule-based scoring engine for worker matching against customer service requests.
 * Isolated from data access and framework controllers.
 */

const DAYS_OF_WEEK = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
];

/**
 * Calculates distance in kilometers between two GPS coordinates using the Haversine formula.
 *
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} distance in km rounded to 1 decimal place
 */
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Converts a date string or object to an uppercase DayOfWeek enum string.
 *
 * @param {string|Date} dateInput
 * @returns {string} MONDAY | TUESDAY | ...
 */
function getDayOfWeek(dateInput) {
  const d =
    typeof dateInput === 'string' && !dateInput.includes('T')
      ? new Date(`${dateInput}T00:00:00Z`)
      : new Date(dateInput);

  return DAYS_OF_WEEK[d.getUTCDay()];
}

/**
 * Evaluates service name and category match against worker's active services.
 *
 * @param {Object} request
 * @param {Array} workerServices
 * @returns {{ score: number, serviceMatch: boolean, matchedService: Object|null }}
 */
function checkServiceMatch(request, workerServices = []) {
  if (!workerServices || workerServices.length === 0) {
    return { score: 0, serviceMatch: false, matchedService: null };
  }

  const reqName = (request.serviceName || '').trim().toLowerCase();
  const reqCategory = (request.category || '').trim().toLowerCase();

  // 1. Exact service name match (40 points)
  const exactNameMatch = workerServices.find(
    (ws) => (ws.name || '').trim().toLowerCase() === reqName
  );
  if (exactNameMatch) {
    return {
      score: 40,
      serviceMatch: true,
      matchedService: exactNameMatch,
    };
  }

  // 2. Category match (20 points)
  const categoryMatch = workerServices.find(
    (ws) => (ws.category || '').trim().toLowerCase() === reqCategory
  );
  if (categoryMatch) {
    return {
      score: 20,
      serviceMatch: true,
      matchedService: categoryMatch,
    };
  }

  return { score: 0, serviceMatch: false, matchedService: null };
}

/**
 * Evaluates whether worker skills match the requested service or category.
 *
 * @param {Object} request
 * @param {Array} workerSkills
 * @returns {{ score: number, skillMatch: boolean }}
 */
function checkSkillMatch(request, workerSkills = []) {
  if (!workerSkills || workerSkills.length === 0) {
    return { score: 0, skillMatch: false };
  }

  const reqName = (request.serviceName || '').trim().toLowerCase();
  const reqCategory = (request.category || '').trim().toLowerCase();

  const hasMatchingSkill = workerSkills.some((ws) => {
    const skillName = (ws.skill?.name || '').trim().toLowerCase();
    if (!skillName) return false;

    return (
      reqName.includes(skillName) ||
      skillName.includes(reqName) ||
      reqCategory.includes(skillName) ||
      skillName.includes(reqCategory)
    );
  });

  if (hasMatchingSkill) {
    return { score: 25, skillMatch: true };
  }

  return { score: 0, skillMatch: false };
}

/**
 * Evaluates availability for requested day and requested time.
 *
 * @param {Object} request
 * @param {Array} workerAvailability
 * @returns {{ score: number, availabilityMatch: boolean }}
 */
function checkAvailabilityMatch(request, workerAvailability = []) {
  if (!workerAvailability || workerAvailability.length === 0) {
    return { score: 0, availabilityMatch: false };
  }

  const requestedDay = getDayOfWeek(request.requestedDate);
  const requestedTime = (request.requestedTime || '').trim();

  const isCovered = workerAvailability.some((slot) => {
    if (slot.isAvailable === false) return false;
    if (slot.dayOfWeek !== requestedDay) return false;

    // Slot time format: HH:mm
    return slot.startTime <= requestedTime && requestedTime <= slot.endTime;
  });

  if (isCovered) {
    return { score: 20, availabilityMatch: true };
  }

  return { score: 0, availabilityMatch: false };
}

/**
 * Evaluates location and distance between request and worker service areas.
 *
 * @param {Object} request
 * @param {Array} serviceAreas
 * @returns {{ score: number, locationMatch: boolean, distanceKm: number|null }}
 */
function checkLocationMatch(request, serviceAreas = []) {
  if (!serviceAreas || serviceAreas.length === 0) {
    return { score: 0, locationMatch: false, distanceKm: null };
  }

  const reqCity = (request.city || '').trim().toLowerCase();
  const reqArea = (request.area || '').trim().toLowerCase();
  const reqPincode = (request.pincode || '').trim();

  const hasCustCoords =
    request.latitude !== null &&
    request.latitude !== undefined &&
    request.longitude !== null &&
    request.longitude !== undefined;

  let bestScore = 0;
  let isLocationMatched = false;
  let minDistanceKm = null;

  for (const area of serviceAreas) {
    const areaCity = (area.city || '').trim().toLowerCase();
    const areaLocality = (area.area || '').trim().toLowerCase();
    const areaPincode = (area.pincode || '').trim();

    // 1. Text location score
    let areaScore = 0;
    if (areaPincode === reqPincode || (areaCity === reqCity && areaLocality === reqArea)) {
      areaScore = 15; // exact match
      isLocationMatched = true;
    } else if (areaCity === reqCity) {
      areaScore = 10; // city match
    }

    if (areaScore > bestScore) {
      bestScore = areaScore;
    }

    // 2. Distance calculation if coordinates exist
    const hasAreaCoords =
      area.latitude !== null &&
      area.latitude !== undefined &&
      area.longitude !== null &&
      area.longitude !== undefined;

    if (hasCustCoords && hasAreaCoords) {
      const dist = calculateDistanceKm(
        request.latitude,
        request.longitude,
        area.latitude,
        area.longitude
      );

      if (minDistanceKm === null || dist < minDistanceKm) {
        minDistanceKm = dist;
      }

      // Check service radius coverage
      const radius = area.serviceRadiusKm || 10;
      if (dist <= radius) {
        isLocationMatched = true;
      } else {
        // If outside radius and coordinates were available, location match fails
        isLocationMatched = false;
      }
    }
  }

  return {
    score: bestScore,
    locationMatch: isLocationMatched,
    distanceKm: minDistanceKm,
  };
}

/**
 * Calculates deterministic match score and details for a single worker.
 *
 * @param {Object} request
 * @param {Object} worker
 * @returns {Object}
 */
function calculateMatchScore(request, worker) {
  const serviceCheck = checkServiceMatch(request, worker.workerServices);
  const skillCheck = checkSkillMatch(request, worker.workerSkills);
  const availCheck = checkAvailabilityMatch(request, worker.workerAvailability);
  const locationCheck = checkLocationMatch(request, worker.serviceAreas);

  const totalScore =
    serviceCheck.score +
    skillCheck.score +
    availCheck.score +
    locationCheck.score;

  // Maximum 100 points
  const matchScore = Math.min(100, Math.max(0, totalScore));

  return {
    workerProfileId: worker.id,
    workerName: worker.user?.name || 'Worker',
    workerServiceId: serviceCheck.matchedService?.id || null,
    matchedService: serviceCheck.matchedService,
    matchScore,
    skillMatch: skillCheck.skillMatch,
    serviceMatch: serviceCheck.serviceMatch,
    availabilityMatch: availCheck.availabilityMatch,
    locationMatch: locationCheck.locationMatch,
    distanceKm: locationCheck.distanceKm,
  };
}

/**
 * Evaluates and ranks all candidate workers against a service request.
 * Filters out workers with matchScore < 40.
 *
 * @param {Object} request
 * @param {Array} workers
 * @returns {Array} ranked matches
 */
function evaluateWorkers(request, workers = []) {
  const evaluated = [];

  for (const worker of workers) {
    const result = calculateMatchScore(request, worker);

    // Threshold rule: only score >= 40
    if (result.matchScore >= 40) {
      evaluated.push(result);
    }
  }

  // Sort by matchScore DESC, then distanceKm ASC (with nulls last)
  evaluated.sort((a, b) => {
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }

    if (a.distanceKm !== null && b.distanceKm !== null) {
      return a.distanceKm - b.distanceKm;
    }

    if (a.distanceKm !== null && b.distanceKm === null) return -1;
    if (a.distanceKm === null && b.distanceKm !== null) return 1;

    return 0;
  });

  return evaluated;
}

module.exports = {
  calculateDistanceKm,
  getDayOfWeek,
  checkServiceMatch,
  checkSkillMatch,
  checkAvailabilityMatch,
  checkLocationMatch,
  calculateMatchScore,
  evaluateWorkers,
};
