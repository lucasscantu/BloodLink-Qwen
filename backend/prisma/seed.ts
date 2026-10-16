import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Starting database seed...');

  // Institutions
  const hemocentroSP = await prisma.institution.upsert({
    where: { id: 'inst-1' },
    update: {},
    create: {
      id: 'inst-1',
      name: 'Hemocentro São Paulo',
      type: 'HEMOCENTRO',
      city: 'São Paulo',
      state: 'SP',
      latitude: -23.5505,
      longitude: -46.6333,
    },
  });

  const hospitalCentral = await prisma.institution.upsert({
    where: { id: 'inst-2' },
    update: {},
    create: {
      id: 'inst-2',
      name: 'Hospital Municipal Central',
      type: 'HOSPITAL',
      city: 'São Paulo',
      state: 'SP',
      latitude: -23.563,
      longitude: -46.6545,
    },
  });

  const hospitalSantaMaria = await prisma.institution.upsert({
    where: { id: 'inst-3' },
    update: {},
    create: {
      id: 'inst-3',
      name: 'Hospital Santa Maria',
      type: 'HOSPITAL',
      city: 'Campinas',
      state: 'SP',
      latitude: -22.9099,
      longitude: -47.0626,
    },
  });

  const hemocentroCampinas = await prisma.institution.upsert({
    where: { id: 'inst-4' },
    update: {},
    create: {
      id: 'inst-4',
      name: 'Hemocentro Regional Campinas',
      type: 'HEMOCENTRO',
      city: 'Campinas',
      state: 'SP',
      latitude: -22.9068,
      longitude: -47.0617,
    },
  });

  const hospitalUSP = await prisma.institution.upsert({
    where: { id: 'inst-5' },
    update: {},
    create: {
      id: 'inst-5',
      name: 'Hospital Universitário USP',
      type: 'HOSPITAL',
      city: 'Ribeirão Preto',
      state: 'SP',
      latitude: -21.1704,
      longitude: -47.8103,
    },
  });

  console.log('[Seed] Institutions created');

  // Users
  const passwordHash = await bcrypt.hash('senha123', 10);

  const users = [
    { id: 'user-1', name: 'Administrador Geral', email: 'admin@bloodlink.com', role: 'ADMIN' as const, institutionId: null },
    { id: 'user-2', name: 'Dr. Carlos Hemocentro', email: 'hemocentro@bloodlink.com', role: 'HEMOCENTRO' as const, institutionId: 'inst-1' },
    { id: 'user-3', name: 'Dra. Ana Hospital Central', email: 'hospitalA@bloodlink.com', role: 'HOSPITAL' as const, institutionId: 'inst-2' },
    { id: 'user-4', name: 'Dr. Pedro Santa Maria', email: 'hospitalB@bloodlink.com', role: 'HOSPITAL' as const, institutionId: 'inst-3' },
    { id: 'user-5', name: 'Auditor Silva', email: 'auditor@bloodlink.com', role: 'AUDITOR' as const, institutionId: null },
    { id: 'user-6', name: 'Enf. Maria Campinas', email: 'hemocentro2@bloodlink.com', role: 'HEMOCENTRO' as const, institutionId: 'inst-4' },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: {},
      create: { ...u, passwordHash },
    });
  }

  console.log('[Seed] Users created');

  // Blood Bags (120 bolsas)
  const bloodTypes = ['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'] as const;
  const statuses = ['COLETADA', 'EM_TESTE', 'APROVADA', 'ARMAZENADA', 'DISPONIVEL', 'UTILIZADA', 'RESERVADA', 'EM_TRANSPORTE', 'RECEBIDA', 'DESCARTADA', 'REPROVADA'] as const;
  const instIds = ['inst-1', 'inst-2', 'inst-4'];

  for (let i = 1; i <= 120; i++) {
    const code = `BL-${String(i).padStart(5, '0')}`;
    const bloodType = bloodTypes[i % bloodTypes.length];
    const status = statuses[i % statuses.length];
    const instId = instIds[i % instIds.length];
    const collectedAt = new Date(2024, Math.floor(i / 10), (i % 28) + 1);
    const expiresAt = new Date(2024, Math.floor(i / 10) + 1, (i % 28) + 1);

    await prisma.bloodBag.upsert({
      where: { code },
      update: {},
      create: {
        code,
        bloodType,
        volume: 350 + (i % 5) * 10,
        status,
        instituicaoAtualId: instId,
        collectedAt,
        expiresAt,
      },
    });
  }

  console.log('[Seed] 120 blood bags created');

  // Demands
  await prisma.bloodDemand.upsert({
    where: { id: 'dem-1' },
    update: {},
    create: {
      id: 'dem-1',
      institutionId: 'inst-2',
      bloodType: 'O_NEG',
      quantity: 5,
      urgency: 'CRITICA',
      status: 'ABERTA',
      description: 'Necessidade urgente de O- para cirurgias de emergência',
    },
  });

  await prisma.bloodDemand.upsert({
    where: { id: 'dem-2' },
    update: {},
    create: {
      id: 'dem-2',
      institutionId: 'inst-3',
      bloodType: 'A_POS',
      quantity: 3,
      urgency: 'ALTA',
      status: 'EM_ANALISE',
      description: 'Reposição de estoque para UTI',
    },
  });

  console.log('[Seed] Demands created');

  // Transfers
  await prisma.bloodTransfer.upsert({
    where: { id: 'tr-1' },
    update: {},
    create: {
      id: 'tr-1',
      bloodBagId: (await prisma.bloodBag.findFirst({ where: { code: 'BL-00005' } }))!.id,
      demandId: null,
      sourceInstitutionId: 'inst-1',
      destinationInstitutionId: 'inst-5',
      status: 'RECEBIDA',
    },
  });

  await prisma.bloodTransfer.upsert({
    where: { id: 'tr-2' },
    update: {},
    create: {
      id: 'tr-2',
      bloodBagId: (await prisma.bloodBag.findFirst({ where: { code: 'BL-00010' } }))!.id,
      demandId: null,
      sourceInstitutionId: 'inst-1',
      destinationInstitutionId: 'inst-2',
      status: 'OFERTADA',
    },
  });

  console.log('[Seed] Transfers created');

  // Temperature readings
  const dispBag = await prisma.bloodBag.findFirst({ where: { status: 'DISPONIVEL' } });
  if (dispBag) {
    const temps = [
      { temperature: 4.2, alert: false },
      { temperature: 4.5, alert: false },
      { temperature: 7.8, alert: true },
      { temperature: 5.1, alert: false },
      { temperature: 4.3, alert: false },
    ];
    for (const t of temps) {
      await prisma.temperatureReading.create({
        data: {
          bloodBagId: dispBag.id,
          temperature: t.temperature,
          institutionId: 'inst-1',
          alert: t.alert,
        },
      });
    }
    console.log('[Seed] Temperature readings created');
  }

  console.log('[Seed] ✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
