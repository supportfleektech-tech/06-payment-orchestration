import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { handle, audit, HttpError, requireRole } from '@/server/modules/core';
import crypto from 'crypto';

const CreateIntent = z.object({
  amountCents: z.number().int().positive(),
  currency: z.string().default('KES'),
  purpose: z.string().min(1),
  reference: z.string().min(1),
});
const CreateProvider = z.object({
  code: z.string().min(1),
  label: z.string().min(1),
  configEncrypted: z.string().min(1),
  priority: z.number().int().default(100),
});

export async function listIntents(req: NextRequest) {
  return handle(req, async (ctx) => prisma.paymentIntent.findMany({
    where: { organizationId: ctx.organizationId }, orderBy: { createdAt: 'desc' }, take: 100,
    include: { attempts: { orderBy: { createdAt: 'desc' as const }, take: 3 } },
  }));
}

export async function createIntent(req: NextRequest) {
  return handle(req, async (ctx) => {
    requireRole(ctx, 'OWNER', 'ADMIN', 'MEMBER');
    const body = CreateIntent.parse(await req.json());
    const idem = req.headers.get('idempotency-key') || crypto.randomUUID();
    const existing = await prisma.paymentIntent.findFirst({ where: { organizationId: ctx.organizationId, idempotencyKey: idem } });
    if (existing) return existing;
    const it = await prisma.paymentIntent.create({
      data: { organizationId: ctx.organizationId, ...body, idempotencyKey: idem },
    });
    await audit(ctx, 'payment.intent.create', 'payment_intent', it.id, { reference: it.reference, amountCents: it.amountCents });
    return it;
  });
}

export async function listProviders(req: NextRequest) {
  return handle(req, async (ctx) => prisma.paymentProvider.findMany({
    where: { organizationId: ctx.organizationId }, orderBy: { priority: 'asc' },
  }));
}

export async function createProvider(req: NextRequest) {
  return handle(req, async (ctx) => {
    requireRole(ctx, 'OWNER', 'ADMIN');
    const body = CreateProvider.parse(await req.json());
    const p = await prisma.paymentProvider.create({ data: { organizationId: ctx.organizationId, ...body } });
    await audit(ctx, 'provider.create', 'payment_provider', p.id, { code: p.code });
    return p;
  });
}

/** Attempt a payment via highest-priority enabled provider (simulated — real adapters plug in). */
export async function attemptPayment(req: NextRequest, intentId: string) {
  return handle(req, async (ctx) => {
    requireRole(ctx, 'OWNER', 'ADMIN', 'MEMBER');
    const intent = await prisma.paymentIntent.findFirst({ where: { id: intentId, organizationId: ctx.organizationId } });
    if (!intent) throw new HttpError(404, 'intent not found', 'NOT_FOUND');
    if (intent.status === 'SUCCEEDED') return intent;

    const provider = await prisma.paymentProvider.findFirst({
      where: { organizationId: ctx.organizationId, enabled: true },
      orderBy: { priority: 'asc' },
    });
    if (!provider) throw new HttpError(503, 'no enabled provider', 'NO_PROVIDER');

    const attempt = await prisma.paymentAttempt.create({
      data: {
        organizationId: ctx.organizationId,
        paymentIntentId: intent.id,
        paymentProviderId: provider.id,
        status: 'STARTED',
      },
    });

    // Placeholder: real integration does provider.charge(...) here with adapter.
    // For now return attempt marked RETRYING until webhook confirms.
    await audit(ctx, 'payment.attempt', 'payment_attempt', attempt.id, { provider: provider.code, intentId: intent.id });
    return { intent, attempt };
  });
}
