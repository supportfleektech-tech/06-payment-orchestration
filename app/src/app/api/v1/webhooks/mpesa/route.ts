import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { handle, audit } from '@/server/modules/core';

/** Idempotent provider webhook; resolves payment intent by external reference. */
export async function POST(req: NextRequest) {
  return handle(req, async () => {
    const body = await req.json().catch(() => ({}));
    const intentRef: string | undefined = body?.intentReference || body?.reference;
    const providerRef: string | undefined = body?.providerRef || body?.TransID;
    const status: string | undefined = (body?.status || '').toUpperCase();
    if (!intentRef || !providerRef) return { received: false, reason: 'unrecognized' };
    const intent = await prisma.paymentIntent.findFirst({ where: { reference: intentRef } });
    if (!intent) return { received: false, reason: 'intent not found' };

    const already = await prisma.paymentAttempt.findFirst({ where: { paymentIntentId: intent.id, providerRef } });
    if (already) return { received: true, idempotent: true, attemptId: already.id };

    const newIntentStatus = status === 'SUCCEEDED' || status === 'SUCCESS' ? 'SUCCEEDED' : status === 'FAILED' ? 'FAILED' : 'REQUIRES_ACTION';
    const contribution = newIntentStatus === 'SUCCEEDED' ? { status: 'SUCCEEDED' as const, processedAt: new Date() } : { status: 'FAILED' as const };
    const attempt = await prisma.paymentAttempt.updateMany({
      where: { paymentIntentId: intent.id, status: 'STARTED' },
      data: { providerRef, status: newIntentStatus === 'SUCCEEDED' ? 'SUCCEEDED' : newIntentStatus === 'FAILED' ? 'FAILED' : 'RETRYING' },
    });
    await prisma.paymentIntent.update({ where: { id: intent.id }, data: { status: newIntentStatus as never } });
    await audit({ organizationId: intent.organizationId, userId: 'webhook', email: 'webhook@psp', role: 'ADMIN' },
      'payment.webhook', 'payment_intent', intent.id, { status: newIntentStatus, providerRef });
    return { received: true, updated: attempt.count, contribution };
  }, { auth: false });
}
