import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { handle, audit, HttpError, requireRole } from '@/server/modules/core';

/** Payment Orchestration: record dispute / refund / handling against a payment attempt. */
const Dispute = z.object({ attemptId: z.string().uuid(), reason: z.string().min(1), status: z.enum(['OPEN','WON','LOST','RESOLVED']) });

export async function POST(req: NextRequest) {
  return handle(req, async (ctx) => {
    requireRole(ctx, 'OWNER', 'ADMIN', 'MEMBER');
    const body = Dispute.parse(await req.json());
    const att = await prisma.paymentAttempt.findFirst({ where: { id: body.attemptId, organizationId: ctx.organizationId }, include: { intent: true } });
    if (!att) throw new HttpError(404, 'not found', 'NOT_FOUND');
    const action = `dispute.${body.status}`;
    await audit(ctx, action, 'payment_attempt', att.id, { reason: body.reason });
    if (body.status === 'WON' || body.status === 'RESOLVED') {
      await prisma.paymentAttempt.update({ where: { id: att.id }, data: { status: 'SUCCEEDED' } });
      await prisma.paymentIntent.update({ where: { id: att.paymentIntentId }, data: { status: 'SUCCEEDED' } });
    }
    return { id: att.id, status: body.status };
  });
}
