const prisma = require('../src/config/database');
const bcrypt = require('bcrypt');

async function main() {
  console.log('Seeding development database...');

  const passwordHash = await bcrypt.hash('Password@123', 10);

  // ----------------------------------------------------
  // 1. Users
  // ----------------------------------------------------
  const usersData = [
    {
      name: 'Rahul Sharma',
      email: 'rahul.customer@example.com',
      phone: '9000000001',
      passwordHash,
      role: 'CUSTOMER',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
    },
    {
      name: 'Amit Patil',
      email: 'amit.worker@example.com',
      phone: '9000000002',
      passwordHash,
      role: 'WORKER',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
    },
    {
      name: 'Cooperative Admin',
      email: 'cooperative.admin@example.com',
      phone: '9000000003',
      passwordHash,
      role: 'COOPERATIVE_ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
    },
    {
      name: 'Federation Admin',
      email: 'federation.admin@example.com',
      phone: '9000000004',
      passwordHash,
      role: 'FEDERATION_ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
    },
    {
      name: 'Super Admin',
      email: 'super.admin@example.com',
      phone: '9000000005',
      passwordHash,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
    },
  ];

  // Ensure Postgres UserRole enum supports the required schema roles
  try {
    await prisma.$executeRawUnsafe(`ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'COOPERATIVE_ADMIN'`);
  } catch {}
  try {
    await prisma.$executeRawUnsafe(`ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'FEDERATION_ADMIN'`);
  } catch {}
  try {
    await prisma.$executeRawUnsafe(`ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN'`);
  } catch {}
  try {
    await prisma.$executeRawUnsafe(`ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'ADMIN'`);
  } catch {}

  // Introspect available roles in current database enum
  let availableRoles = [];
  try {
    const rawRoles = await prisma.$queryRaw`
      SELECT enumlabel FROM pg_enum WHERE enumtypid = '"UserRole"'::regtype;
    `;
    availableRoles = rawRoles.map((r) => r.enumlabel);
  } catch {
    availableRoles = [];
  }

  const createdUsers = {};
  for (const u of usersData) {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: u.email }, { phone: u.phone }],
      },
    });

    let targetRole = u.role;
    if (availableRoles.length > 0 && !availableRoles.includes(targetRole)) {
      if (availableRoles.includes('ADMIN')) {
        targetRole = 'ADMIN';
      } else if (availableRoles.includes('SUPER_ADMIN')) {
        targetRole = 'SUPER_ADMIN';
      }
    }

    let user;
    try {
      if (existing) {
        user = await prisma.user.update({
          where: { id: existing.id },
          data: {
            name: u.name,
            email: u.email,
            phone: u.phone,
            passwordHash: u.passwordHash,
            role: targetRole,
            status: u.status,
            emailVerified: u.emailVerified,
            phoneVerified: u.phoneVerified,
          },
        });
      } else {
        user = await prisma.user.create({
          data: {
            ...u,
            role: targetRole,
          },
        });
      }
    } catch (err) {
      // Fallback if targetRole is still rejected by DB enum
      const fallbackRole = availableRoles.includes('ADMIN')
        ? 'ADMIN'
        : availableRoles.includes('SUPER_ADMIN')
        ? 'SUPER_ADMIN'
        : u.role;

      if (existing) {
        user = await prisma.user.update({
          where: { id: existing.id },
          data: {
            name: u.name,
            email: u.email,
            phone: u.phone,
            passwordHash: u.passwordHash,
            role: fallbackRole,
            status: u.status,
            emailVerified: u.emailVerified,
            phoneVerified: u.phoneVerified,
          },
        });
      } else {
        user = await prisma.user.create({
          data: {
            ...u,
            role: fallbackRole,
          },
        });
      }
    }

    createdUsers[u.email] = user;
  }

  const rahul = createdUsers['rahul.customer@example.com'];
  const amit = createdUsers['amit.worker@example.com'];

  // ----------------------------------------------------
  // 2. Worker Profile for Amit Patil
  // ----------------------------------------------------
  const amitProfile = await prisma.workerProfile.upsert({
    where: { userId: amit.id },
    update: {
      bio: 'Experienced electrician providing residential and commercial electrical services.',
      experienceYears: 6,
      profilePhotoUrl: null,
      verificationStatus: 'APPROVED',
    },
    create: {
      userId: amit.id,
      bio: 'Experienced electrician providing residential and commercial electrical services.',
      experienceYears: 6,
      profilePhotoUrl: null,
      verificationStatus: 'APPROVED',
    },
  });

  // ----------------------------------------------------
  // 3. Skills
  // ----------------------------------------------------
  const skillNames = [
    { name: 'Electrical Work', description: 'Residential and commercial wiring, repairs, and fixtures' },
    { name: 'Plumbing', description: 'Pipes, fittings, drainage, and sanitary installations' },
    { name: 'Carpentry', description: 'Woodwork, furniture repair, and cabinetry' },
    { name: 'Painting', description: 'Interior and exterior wall painting and finishing' },
    { name: 'Cleaning', description: 'Deep home cleaning, sanitation, and maintenance' },
    { name: 'Appliance Repair', description: 'Repair and maintenance of home appliances' },
    { name: 'AC Repair', description: 'Air conditioning installation, service, and maintenance' },
    { name: 'Gardening', description: 'Lawn maintenance, planting, and landscape care' },
  ];

  const createdSkills = {};
  for (const s of skillNames) {
    const skill = await prisma.skill.upsert({
      where: { name: s.name },
      update: {
        description: s.description,
        isActive: true,
      },
      create: {
        name: s.name,
        description: s.description,
        isActive: true,
      },
    });
    createdSkills[s.name] = skill;
  }

  // ----------------------------------------------------
  // 4. Worker Skills for Amit
  // ----------------------------------------------------
  const amitSkills = [
    { skillName: 'Electrical Work', level: 'EXPERT' },
    { skillName: 'Appliance Repair', level: 'ADVANCED' },
    { skillName: 'AC Repair', level: 'INTERMEDIATE' },
  ];

  const createdWorkerSkills = [];
  for (const item of amitSkills) {
    const targetSkill = createdSkills[item.skillName];
    if (targetSkill) {
      const ws = await prisma.workerSkill.upsert({
        where: {
          workerProfileId_skillId: {
            workerProfileId: amitProfile.id,
            skillId: targetSkill.id,
          },
        },
        update: {
          level: item.level,
        },
        create: {
          workerProfileId: amitProfile.id,
          skillId: targetSkill.id,
          level: item.level,
        },
      });
      createdWorkerSkills.push(ws);
    }
  }

  // ----------------------------------------------------
  // 5. Worker Certifications for Amit
  // ----------------------------------------------------
  const certificationsData = [
    {
      name: 'Electrical Technician Certificate',
      issuingOrganization: 'Maharashtra Skill Development',
      certificateNumber: 'ELEC-2024-001',
      issueDate: new Date('2024-01-15T00:00:00Z'),
      expiryDate: new Date('2027-01-15T00:00:00Z'),
      verificationStatus: 'VERIFIED',
      documentUrl: null,
    },
    {
      name: 'Safety Training Certificate',
      issuingOrganization: 'Industrial Safety Institute',
      certificateNumber: 'SAFE-2025-015',
      issueDate: new Date('2025-03-10T00:00:00Z'),
      expiryDate: new Date('2028-03-10T00:00:00Z'),
      verificationStatus: 'VERIFIED',
      documentUrl: null,
    },
  ];

  const createdCertifications = [];
  for (const cert of certificationsData) {
    const existing = await prisma.workerCertification.findFirst({
      where: {
        workerProfileId: amitProfile.id,
        certificateNumber: cert.certificateNumber,
      },
    });

    if (existing) {
      const updated = await prisma.workerCertification.update({
        where: { id: existing.id },
        data: cert,
      });
      createdCertifications.push(updated);
    } else {
      const created = await prisma.workerCertification.create({
        data: {
          ...cert,
          workerProfileId: amitProfile.id,
        },
      });
      createdCertifications.push(created);
    }
  }

  // ----------------------------------------------------
  // 6. Worker Availability (Mon-Sat)
  // ----------------------------------------------------
  const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const createdAvailability = [];

  for (const day of daysOfWeek) {
    const isSaturday = day === 'SATURDAY';
    const startTime = '09:00';
    const endTime = isSaturday ? '14:00' : '18:00';

    const avail = await prisma.workerAvailability.upsert({
      where: {
        workerProfileId_dayOfWeek_startTime_endTime: {
          workerProfileId: amitProfile.id,
          dayOfWeek: day,
          startTime,
          endTime,
        },
      },
      update: {
        isAvailable: true,
      },
      create: {
        workerProfileId: amitProfile.id,
        dayOfWeek: day,
        startTime,
        endTime,
        isAvailable: true,
      },
    });
    createdAvailability.push(avail);
  }

  // ----------------------------------------------------
  // 7. Worker Service Areas
  // ----------------------------------------------------
  const serviceAreasData = [
    {
      city: 'Mumbai',
      area: 'Andheri',
      pincode: '400053',
      latitude: 19.1197,
      longitude: 72.8468,
      serviceRadiusKm: 15,
      isPrimary: true,
    },
    {
      city: 'Mumbai',
      area: 'Goregaon',
      pincode: '400062',
      latitude: 19.1663,
      longitude: 72.8526,
      serviceRadiusKm: 10,
      isPrimary: false,
    },
  ];

  const createdServiceAreas = [];
  for (const sa of serviceAreasData) {
    const area = await prisma.workerServiceArea.upsert({
      where: {
        workerProfileId_city_area_pincode: {
          workerProfileId: amitProfile.id,
          city: sa.city,
          area: sa.area,
          pincode: sa.pincode,
        },
      },
      update: {
        latitude: sa.latitude,
        longitude: sa.longitude,
        serviceRadiusKm: sa.serviceRadiusKm,
        isPrimary: sa.isPrimary,
      },
      create: {
        workerProfileId: amitProfile.id,
        ...sa,
      },
    });
    createdServiceAreas.push(area);
  }

  // ----------------------------------------------------
  // 8. Worker Services
  // ----------------------------------------------------
  const workerServicesData = [
    {
      name: 'Electrical Wiring & Repair',
      category: 'Electrical',
      description: 'Residential electrical wiring, switches, sockets and minor repairs.',
      price: 800,
      pricingUnit: 'FIXED',
      durationMinutes: 120,
      status: 'ACTIVE',
    },
    {
      name: 'Fan Installation',
      category: 'Electrical',
      description: 'Ceiling and wall fan installation service.',
      price: 500,
      pricingUnit: 'FIXED',
      durationMinutes: 60,
      status: 'ACTIVE',
    },
    {
      name: 'Electrical Repair',
      category: 'Electrical',
      description: 'Troubleshooting and repair of common electrical issues.',
      price: 400,
      pricingUnit: 'HOURLY',
      durationMinutes: 60,
      status: 'ACTIVE',
    },
  ];

  const createdWorkerServices = {};
  for (const ws of workerServicesData) {
    const existing = await prisma.workerService.findFirst({
      where: {
        workerProfileId: amitProfile.id,
        name: ws.name,
      },
    });

    if (existing) {
      const updated = await prisma.workerService.update({
        where: { id: existing.id },
        data: ws,
      });
      createdWorkerServices[ws.name] = updated;
    } else {
      const created = await prisma.workerService.create({
        data: {
          ...ws,
          workerProfileId: amitProfile.id,
        },
      });
      createdWorkerServices[ws.name] = created;
    }
  }

  const primaryService = createdWorkerServices['Electrical Wiring & Repair'];

  // ----------------------------------------------------
  // 9. Service Request for Rahul Sharma
  // ----------------------------------------------------
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 5);
  futureDate.setUTCHours(11, 0, 0, 0);

  let serviceRequest = await prisma.serviceRequest.findFirst({
    where: {
      customerId: rahul.id,
      serviceName: 'Electrical Wiring & Repair',
    },
  });

  if (serviceRequest) {
    serviceRequest = await prisma.serviceRequest.update({
      where: { id: serviceRequest.id },
      data: {
        category: 'Electrical',
        description: 'Need electrical repair and wiring work at home.',
        requestedDate: futureDate,
        requestedTime: '11:00',
        city: 'Mumbai',
        area: 'Andheri',
        pincode: '400053',
        latitude: 19.1197,
        longitude: 72.8468,
        status: 'MATCHED',
      },
    });
  } else {
    serviceRequest = await prisma.serviceRequest.create({
      data: {
        customerId: rahul.id,
        serviceName: 'Electrical Wiring & Repair',
        category: 'Electrical',
        description: 'Need electrical repair and wiring work at home.',
        requestedDate: futureDate,
        requestedTime: '11:00',
        city: 'Mumbai',
        area: 'Andheri',
        pincode: '400053',
        latitude: 19.1197,
        longitude: 72.8468,
        status: 'MATCHED',
      },
    });
  }

  // ----------------------------------------------------
  // 10. Match Result
  // ----------------------------------------------------
  const matchResult = await prisma.matchResult.upsert({
    where: {
      serviceRequestId_workerProfileId: {
        serviceRequestId: serviceRequest.id,
        workerProfileId: amitProfile.id,
      },
    },
    update: {
      workerServiceId: primaryService.id,
      matchScore: 95,
      skillMatch: true,
      serviceMatch: true,
      availabilityMatch: true,
      locationMatch: true,
      distanceKm: 1.5,
    },
    create: {
      serviceRequestId: serviceRequest.id,
      workerProfileId: amitProfile.id,
      workerServiceId: primaryService.id,
      matchScore: 95,
      skillMatch: true,
      serviceMatch: true,
      availabilityMatch: true,
      locationMatch: true,
      distanceKm: 1.5,
    },
  });

  // ----------------------------------------------------
  // 11. Booking
  // ----------------------------------------------------
  let booking = await prisma.booking.findFirst({
    where: {
      serviceRequestId: serviceRequest.id,
      workerProfileId: amitProfile.id,
    },
  });

  if (booking) {
    booking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        customerId: rahul.id,
        workerServiceId: primaryService.id,
        scheduledDate: futureDate,
        scheduledTime: '11:00',
        price: 800,
        customerNotes: 'Please arrive on time.',
        status: 'CONFIRMED',
      },
    });
  } else {
    booking = await prisma.booking.create({
      data: {
        customerId: rahul.id,
        workerProfileId: amitProfile.id,
        workerServiceId: primaryService.id,
        serviceRequestId: serviceRequest.id,
        scheduledDate: futureDate,
        scheduledTime: '11:00',
        price: 800,
        customerNotes: 'Please arrive on time.',
        status: 'CONFIRMED',
      },
    });
  }

  // ----------------------------------------------------
  // 12. Notifications
  // ----------------------------------------------------
  const notificationsData = [
    {
      userId: rahul.id,
      relatedBookingId: booking.id,
      type: 'BOOKING_CONFIRMED',
      title: 'Booking Confirmed',
      message: 'Your electrical service booking has been confirmed.',
      isRead: false,
    },
    {
      userId: amit.id,
      relatedBookingId: booking.id,
      type: 'NEW_BOOKING',
      title: 'New Booking',
      message: 'You have received a new electrical service booking.',
      isRead: false,
    },
  ];

  const createdNotifications = [];
  for (const n of notificationsData) {
    const existing = await prisma.notification.findFirst({
      where: {
        userId: n.userId,
        relatedBookingId: n.relatedBookingId,
        type: n.type,
      },
    });

    if (existing) {
      const updated = await prisma.notification.update({
        where: { id: existing.id },
        data: n,
      });
      createdNotifications.push(updated);
    } else {
      const created = await prisma.notification.create({
        data: n,
      });
      createdNotifications.push(created);
    }
  }

  // ----------------------------------------------------
  // 13. Worker Documents (KYC)
  // ----------------------------------------------------
  const pastVerificationDate = new Date('2025-01-10T10:00:00Z');

  const workerDocumentsData = [
    {
      documentType: 'IDENTITY_PROOF',
      fileName: 'amit-aadhaar.pdf',
      storageKey: 'workers/amit-patil/identity-proof/amit-aadhaar.pdf',
      mimeType: 'application/pdf',
      fileSize: 250000,
      verificationStatus: 'VERIFIED',
      verifiedAt: pastVerificationDate,
      rejectionReason: null,
    },
    {
      documentType: 'PAN_CARD',
      fileName: 'amit-pan.pdf',
      storageKey: 'workers/amit-patil/pan-card/amit-pan.pdf',
      mimeType: 'application/pdf',
      fileSize: 180000,
      verificationStatus: 'PENDING',
      verifiedAt: null,
      rejectionReason: null,
    },
    {
      documentType: 'ADDRESS_PROOF',
      fileName: 'amit-address-proof.pdf',
      storageKey: 'workers/amit-patil/address-proof/amit-address-proof.pdf',
      mimeType: 'application/pdf',
      fileSize: 210000,
      verificationStatus: 'VERIFIED',
      verifiedAt: pastVerificationDate,
      rejectionReason: null,
    },
  ];

  const createdDocuments = [];
  for (const doc of workerDocumentsData) {
    const wd = await prisma.workerDocument.upsert({
      where: {
        workerProfileId_documentType: {
          workerProfileId: amitProfile.id,
          documentType: doc.documentType,
        },
      },
      update: doc,
      create: {
        workerProfileId: amitProfile.id,
        ...doc,
      },
    });
    createdDocuments.push(wd);
  }

  // ----------------------------------------------------
  // Concise Console Summary
  // ----------------------------------------------------
  console.log('\n==============================================');
  console.log('🌱 Development Database Seed Complete:');
  console.log('==============================================');
  console.log(`- Users created:              ${Object.keys(createdUsers).length}`);
  console.log(`- Skills created:             ${Object.keys(createdSkills).length}`);
  console.log(`- Worker profile created:     1 (Amit Patil)`);
  console.log(`- Worker skills assigned:     ${createdWorkerSkills.length}`);
  console.log(`- Certifications created:     ${createdCertifications.length}`);
  console.log(`- Availability records:       ${createdAvailability.length} (Mon-Sat)`);
  console.log(`- Service areas created:      ${createdServiceAreas.length}`);
  console.log(`- Worker services created:    ${Object.keys(createdWorkerServices).length}`);
  console.log(`- Service requests created:   1 (Rahul Sharma)`);
  console.log(`- Match results created:      1 (Score: ${matchResult.matchScore})`);
  console.log(`- Bookings created:           1 (Status: ${booking.status})`);
  console.log(`- Notifications created:      ${createdNotifications.length}`);
  console.log(`- Worker documents created:   ${createdDocuments.length}`);
  console.log('==============================================');
  console.log('Sample Logins:');
  console.log('Customer:          rahul.customer@example.com / Password@123');
  console.log('Worker:            amit.worker@example.com / Password@123');
  console.log('Cooperative Admin: cooperative.admin@example.com / Password@123');
  console.log('Federation Admin:  federation.admin@example.com / Password@123');
  console.log('Super Admin:       super.admin@example.com / Password@123');
  console.log('==============================================\n');
}

main()
  .catch((e) => {
    console.error('Seed execution error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
