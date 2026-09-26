const prisma = require('../../config/database');

const ensureDefaultSkills = async () => {
  const count = await prisma.skill.count();
  if (count === 0) {
    const defaultSkills = [
      { name: 'Electrical', description: 'Wiring, fixtures, appliances, switchboards, and electrical repairs' },
      { name: 'Plumbing', description: 'Pipe fitting, leak repairs, drainage, and sanitary installations' },
      { name: 'Carpentry', description: 'Furniture making, wood repairs, framing, and cabinetry' },
      { name: 'Painting', description: 'Interior and exterior wall painting, staining, and finishing' },
      { name: 'Appliance Repair', description: 'Refrigerators, washing machines, microwaves, and AC units' },
      { name: 'Cleaning', description: 'Deep home cleaning, sanitation, and commercial cleaning' },
      { name: 'Masonry', description: 'Brickwork, plastering, tile setting, and concrete work' },
      { name: 'Gardening', description: 'Lawn care, pruning, garden maintenance, and planting' },
      { name: 'Pest Control', description: 'Termite inspection, pest management, and fumigation' },
      { name: 'Welding', description: 'Metal fabrication, gate repairs, and welding services' },
    ];

    await prisma.skill.createMany({
      data: defaultSkills,
      skipDuplicates: true,
    });
  }
};

const getDashboardStats = async () => {
  const [
    totalUsers,
    totalWorkers,
    pendingWorkers,
    approvedWorkers,
    activeWorkers,
    totalBookings,
    pendingBookings,
    confirmedBookings,
    completedBookings,
    openServiceRequests,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.workerProfile.count(),
    prisma.workerProfile.count({ where: { verificationStatus: 'PENDING' } }),
    prisma.workerProfile.count({ where: { verificationStatus: 'APPROVED' } }),
    prisma.workerProfile.count({
      where: {
        verificationStatus: 'APPROVED',
        user: { status: 'ACTIVE' },
      },
    }),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: 'PENDING' } }),
    prisma.booking.count({ where: { status: 'CONFIRMED' } }),
    prisma.booking.count({ where: { status: 'COMPLETED' } }),
    prisma.serviceRequest.count({
      where: {
        status: { in: ['OPEN', 'MATCHED'] },
      },
    }),
  ]);

  // Fetch recent records for activity/overview
  const [recentWorkers, recentBookings, recentServiceRequests] = await Promise.all([
    prisma.workerProfile.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, status: true },
        },
        workerServices: {
          select: { id: true, name: true, category: true },
        },
      },
    }),
    prisma.booking.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { id: true, name: true } },
        workerProfile: {
          include: { user: { select: { id: true, name: true } } },
        },
        workerService: { select: { id: true, name: true, price: true, pricingUnit: true } },
        serviceRequest: { select: { id: true, serviceName: true } },
      },
    }),
    prisma.serviceRequest.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { id: true, name: true } },
      },
    }),
  ]);

  return {
    totalUsers,
    totalWorkers,
    pendingWorkers,
    approvedWorkers,
    activeWorkers,
    totalBookings,
    pendingBookings,
    confirmedBookings,
    completedBookings,
    openServiceRequests,
    recentWorkers,
    recentBookings,
    recentServiceRequests,
  };
};

const getWorkers = async ({ status, search, skip = 0, take = 50 } = {}) => {
  const where = {};

  if (status && status !== 'ALL') {
    where.verificationStatus = status;
  }

  if (search && search.trim()) {
    const term = search.trim();
    where.user = {
      OR: [
        { name: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
        { phone: { contains: term, mode: 'insensitive' } },
      ],
    };
  }

  const [workers, total] = await Promise.all([
    prisma.workerProfile.findMany({
      where,
      skip: Number(skip) || 0,
      take: Math.min(Number(take) || 50, 100),
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            status: true,
            createdAt: true,
          },
        },
        workerSkills: {
          include: { skill: true },
        },
        workerServices: {
          select: { id: true, name: true, category: true, price: true, status: true },
        },
      },
    }),
    prisma.workerProfile.count({ where }),
  ]);

  return { workers, total };
};

const getWorkerById = async (id) => {
  const worker = await prisma.workerProfile.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          status: true,
          createdAt: true,
          lastLoginAt: true,
        },
      },
      workerSkills: {
        include: { skill: true },
      },
      workerCertifications: true,
      workerAvailability: true,
      serviceAreas: true,
      workerServices: true,
    },
  });

  if (!worker) return null;

  // Booking metrics for worker
  const [totalBookings, completedBookings, pendingBookings, cancelledBookings] =
    await Promise.all([
      prisma.booking.count({ where: { workerProfileId: id } }),
      prisma.booking.count({ where: { workerProfileId: id, status: 'COMPLETED' } }),
      prisma.booking.count({ where: { workerProfileId: id, status: 'PENDING' } }),
      prisma.booking.count({ where: { workerProfileId: id, status: 'CANCELLED' } }),
    ]);

  return {
    ...worker,
    bookingsSummary: {
      totalBookings,
      completedBookings,
      pendingBookings,
      cancelledBookings,
    },
  };
};

const updateWorkerVerification = async (id, verificationStatus) => {
  return prisma.workerProfile.update({
    where: { id },
    data: { verificationStatus },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });
};

const getUsers = async ({ role, status, search, skip = 0, take = 50 } = {}) => {
  const where = {};

  if (role && role !== 'ALL') {
    if (role === 'ADMIN') {
      where.role = {
        in: ['SUPER_ADMIN', 'COOPERATIVE_ADMIN', 'FEDERATION_ADMIN'],
      };
    } else {
      where.role = role;
    }
  }

  if (status && status !== 'ALL') {
    where.status = status;
  }

  if (search && search.trim()) {
    const term = search.trim();
    where.OR = [
      { name: { contains: term, mode: 'insensitive' } },
      { email: { contains: term, mode: 'insensitive' } },
      { phone: { contains: term, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: Number(skip) || 0,
      take: Math.min(Number(take) || 50, 100),
      orderBy: { createdAt: 'desc' },
      select: {
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
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total };
};

const getUserById = async (id) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });
};

const updateUserStatus = async (id, status) => {
  return prisma.user.update({
    where: { id },
    data: { status },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
    },
  });
};

const getBookings = async ({ status, search, skip = 0, take = 50 } = {}) => {
  const where = {};

  if (status && status !== 'ALL') {
    where.status = status;
  }

  if (search && search.trim()) {
    const term = search.trim();
    where.OR = [
      { customer: { name: { contains: term, mode: 'insensitive' } } },
      { workerProfile: { user: { name: { contains: term, mode: 'insensitive' } } } },
      { workerService: { name: { contains: term, mode: 'insensitive' } } },
      { serviceRequest: { serviceName: { contains: term, mode: 'insensitive' } } },
    ];
  }

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      skip: Number(skip) || 0,
      take: Math.min(Number(take) || 50, 100),
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        workerProfile: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
          },
        },
        workerService: { select: { id: true, name: true, category: true, price: true, pricingUnit: true } },
        serviceRequest: { select: { id: true, serviceName: true, category: true, city: true, area: true } },
      },
    }),
    prisma.booking.count({ where }),
  ]);

  return { bookings, total };
};

const getServiceRequests = async ({ status, search, skip = 0, take = 50 } = {}) => {
  const where = {};

  if (status && status !== 'ALL') {
    where.status = status;
  }

  if (search && search.trim()) {
    const term = search.trim();
    where.OR = [
      { serviceName: { contains: term, mode: 'insensitive' } },
      { category: { contains: term, mode: 'insensitive' } },
      { city: { contains: term, mode: 'insensitive' } },
      { area: { contains: term, mode: 'insensitive' } },
      { customer: { name: { contains: term, mode: 'insensitive' } } },
    ];
  }

  const [requests, total] = await Promise.all([
    prisma.serviceRequest.findMany({
      where,
      skip: Number(skip) || 0,
      take: Math.min(Number(take) || 50, 100),
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        bookings: { select: { id: true, status: true, price: true } },
      },
    }),
    prisma.serviceRequest.count({ where }),
  ]);

  return { requests, total };
};

const getSkills = async () => {
  try {
    await ensureDefaultSkills();
  } catch {
    // Non-blocking if already populated
  }

  return prisma.skill.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { workerSkills: true },
      },
    },
  });
};

const createSkill = async (data) => {
  return prisma.skill.create({
    data: {
      name: data.name.trim(),
      description: data.description ? data.description.trim() : null,
      isActive: data.isActive !== undefined ? data.isActive : true,
    },
  });
};

const updateSkill = async (id, data) => {
  const updateData = {};
  if (data.name !== undefined) updateData.name = data.name.trim();
  if (data.description !== undefined) updateData.description = data.description ? data.description.trim() : null;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  return prisma.skill.update({
    where: { id },
    data: updateData,
  });
};

module.exports = {
  getDashboardStats,
  getWorkers,
  getWorkerById,
  updateWorkerVerification,
  getUsers,
  getUserById,
  updateUserStatus,
  getBookings,
  getServiceRequests,
  getSkills,
  createSkill,
  updateSkill,
};
