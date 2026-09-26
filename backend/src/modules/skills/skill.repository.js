const prisma = require('../../config/database');

const safeSkillSelect = {
  id: true,
  name: true,
  description: true,
  isActive: true,
};

const safeWorkerSkillSelect = {
  id: true,
  level: true,
  createdAt: true,
  updatedAt: true,
  skill: {
    select: {
      id: true,
      name: true,
      description: true,
    },
  },
};

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

const getActiveSkills = async () => {
  try {
    await ensureDefaultSkills();
  } catch {
    // Proceed if already populated or concurrent query
  }

  return prisma.skill.findMany({
    where: { isActive: true },
    select: safeSkillSelect,
    orderBy: { name: 'asc' },
  });
};

const findSkillById = async (skillId) => {
  return prisma.skill.findUnique({
    where: { id: skillId },
  });
};

const findWorkerProfileByUserId = async (userId) => {
  return prisma.workerProfile.findUnique({
    where: { userId },
    select: { id: true, userId: true },
  });
};

const findWorkerSkillById = async (workerSkillId) => {
  return prisma.workerSkill.findUnique({
    where: { id: workerSkillId },
    select: {
      id: true,
      workerProfileId: true,
      skillId: true,
      level: true,
      skill: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
    },
  });
};

const findWorkerSkill = async (workerProfileId, skillId) => {
  return prisma.workerSkill.findUnique({
    where: {
      workerProfileId_skillId: {
        workerProfileId,
        skillId,
      },
    },
  });
};

const getWorkerSkills = async (workerProfileId) => {
  return prisma.workerSkill.findMany({
    where: { workerProfileId },
    select: {
      id: true,
      level: true,
      skill: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

const createWorkerSkill = async (workerProfileId, skillId, level) => {
  return prisma.workerSkill.create({
    data: {
      workerProfileId,
      skillId,
      level,
    },
    select: {
      id: true,
      level: true,
      skill: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
    },
  });
};

const updateWorkerSkill = async (workerSkillId, level) => {
  return prisma.workerSkill.update({
    where: { id: workerSkillId },
    data: { level },
    select: {
      id: true,
      level: true,
      skill: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
    },
  });
};

const deleteWorkerSkill = async (workerSkillId) => {
  return prisma.workerSkill.delete({
    where: { id: workerSkillId },
  });
};

module.exports = {
  getActiveSkills,
  findSkillById,
  findWorkerProfileByUserId,
  findWorkerSkillById,
  findWorkerSkill,
  getWorkerSkills,
  createWorkerSkill,
  updateWorkerSkill,
  deleteWorkerSkill,
};
