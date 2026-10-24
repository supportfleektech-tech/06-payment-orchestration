import { prisma } from '@/lib/db';
export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const org = await prisma.organization.findFirst();
  let stats = { intents: 0, providers: 0, succeededCents: 0 };
  let recent: { id: string; reference: string; status: string; amountCents: number; attempts: { status: string }[] }[] = [];
  if (org) {
    const [intents, providers, succ, rec] = await Promise.all([
      prisma.paymentIntent.count({ where: { organizationId: org.id } }),
      prisma.paymentProvider.count({ where: { organizationId: org.id, enabled: true } }),
      prisma.paymentIntent.aggregate({ where: { organizationId: org.id, status: 'SUCCEEDED' }, _sum: { amountCents: true } }),
      prisma.paymentIntent.findMany({
        where: { organizationId: org.id }, orderBy: { createdAt: 'desc' }, take: 10,
        include: { attempts: { orderBy: { createdAt: 'desc' as const }, take: 1 } },
      }),
    ]);
    stats = { intents, providers, succeededCents: succ._sum.amountCents || 0 };
    recent = rec;
  }
  const ksh = (c: number) => `KSh ${(c/100).toLocaleString('en-KE')}`;
  return (
    <>
      <h1>Dashboard</h1>
      {!org && <div className="card">No organization yet. Seed via seed script.</div>}
      {org && <>
        <div className="grid">
          <div className="card"><h3>Intents</h3><div className="big">{stats.intents}</div></div>
          <div className="card"><h3>Providers</h3><div className="big">{stats.providers}</div></div>
          <div className="card"><h3>Succeeded volume</h3><div className="big">{ksh(stats.succeededCents)}</div></div>
        </div>
        <div className="card" style={{ marginTop: 12 }}>
          <h3>Recent intents</h3>
          <table>
            <thead><tr><th>Ref</th><th>Status</th><th>Amount</th><th>Last attempt</th></tr></thead>
            <tbody>
              {recent.map(p => (
                <tr key={p.id}><td>{p.reference}</td><td><span className={`badge s-${p.status}`}>{p.status}</span></td><td>{ksh(p.amountCents)}</td><td>{p.attempts[0]?.status || '—'}</td></tr>
              ))}
              {recent.length === 0 && <tr><td colSpan={4}>No intents yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </>}
    </>
  );
}
