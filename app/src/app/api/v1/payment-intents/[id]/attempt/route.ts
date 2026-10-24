import { NextRequest } from 'next/server';
import { attemptPayment } from '@/server/modules/payments';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return attemptPayment(req, id);
}
