import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.upsert({
    where: { id: '00000000-0000-0000-0000-000000000006' }, update: {},
    create: { id: '00000000-0000-0000-0000-000000000006', name: 'Demo Payments Ltd', kraPin: 'P000555666E' },
  });
  const user = await prisma.user.upsert({
    where: { email: 'finance@demo.co.ke' }, update: {},
    create: { email: 'finance@demo.co.ke', name: 'Finance Lead' },
  });
  await prisma.membership.upsert({
    where: { userId_organizationId: { userId: user.id, organizationId: org.id } },
    update: { role: 'OWNER' },
    create: { userId: user.id, organizationId: org.id, role: 'OWNER' },
  });
  await prisma.paymentProvider.create({ data: { organizationId: org.id, code: 'mpesa-daraja', label: 'M-Pesa Daraja', configEncrypted: 'enc:...', priority: 10 } });
  await prisma.paymentProvider.create({ data: { organizationId: org.id, code: 'bank-partner', label: 'Bank Partner', configEncrypted: 'enc:...', priority: 20 } });
  await prisma.paymentIntent.create({
    data: { organizationId: org.id, amountCents: 500000, purpose: 'Invoice INV-2026-00001', reference: 'INV-2026-00001', idempotencyKey: 'seed-1', status: 'PENDING' },
  });
  console.log('seeded', { org: org.id, user: user.email });
}
main().finally(() => prisma.$disconnect());
