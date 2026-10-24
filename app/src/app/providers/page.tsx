import { prisma } from '@/lib/db';
export const dynamic = 'force-dynamic';

export default async function Page() {
  const org = await prisma.organization.findFirst();
  const rows = org ? await prisma.paymentProvider.findMany({ where: { organizationId: org.id }, orderBy: { priority: 'asc' } }) : [];
  return (<><h1>Providers</h1><div className="card"><table>
    <thead><tr><th>Code</th><th>Label</th><th>Priority</th><th>Enabled</th></tr></thead>
    <tbody>
      {rows.map(p => <tr key={p.id}><td>{p.code}</td><td>{p.label}</td><td>{p.priority}</td><td>{p.enabled ? '✅' : '—'}</td></tr>)}
      {rows.length === 0 && <tr><td colSpan={4}>No providers configured.</td></tr>}
    </tbody>
  </table></div></>);
}
