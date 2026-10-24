'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
export function DisputeButton(props:{attemptId:string}){
  const [open,setOpen]=useState(false); const [reason,setReason]=useState(''); const [status,setStatus]=useState('OPEN')
  const [loading,setLoading]=useState(false); const router=useRouter()
  return(
    <>
      <button className="ghost" onClick={()=>setOpen(o=>!o)}>{open?'Close':'Dispute'}</button>
      {open && (
        <form onSubmit={async e=>{e.preventDefault();setLoading(true);await fetch('/api/v1/disputes',{method:'POST',headers:{'content-type':'application/json','x-dev-user-email':'finance@demo.co.ke','x-org-id':'00000000-0000-0000-0000-000000000006'},body:JSON.stringify({attemptId:props.attemptId,reason,status})});setLoading(false);setOpen(false);router.refresh()}}>
          <textarea placeholder="Reason" value={reason} onChange={e=>setReason(e.target.value)} required/>
          <select value={status} onChange={e=>setStatus(e.target.value)}><option>OPEN</option><option>WON</option><option>LOST</option><option>RESOLVED</option></select>
          <button type="submit" disabled={loading}>{loading?'Saving…':'Submit'}</button>
        </form>
      )}
    </>
  )
}
