import { prisma } from '@/lib/db'
import { CreateIntentForm } from './ui'
export const dynamic='force-dynamic'
export default async function IntentsPage(){
  const org=await prisma.organization.findFirst()
  const rows=org?await prisma.paymentIntent.findMany({where:{organizationId:org.id},orderBy:{createdAt:'desc'}}):[]
  const ksh=(c:number)=>`KSh ${(c/100).toLocaleString('en-KE')}`
  return(
    <>
      <h1>Payment Intents</h1>
      <div className="card" style={{marginBottom:16}}><h3>New intent</h3><CreateIntentForm/></div>
      <div className="card"><h3>All intents</h3>
        <table>
          <thead><tr><th>Ref</th><th>Purpose</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map(p=>(<tr key={p.id}><td>{p.reference}</td><td>{p.purpose}</td><td>{ksh(p.amountCents)}</td><td><span className={`badge s-${p.status}`}>{p.status}</span></td></tr>))}
            {rows.length===0&&<tr><td colSpan={4}>No intents yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  )
}
// existing page is server-rendered; append a client actions column below in a sibling update.
