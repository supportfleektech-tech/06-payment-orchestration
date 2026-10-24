const base=process.env.APP_URL||'http://localhost:7315';const ORG='00000000-0000-0000-0000-000000000006';const EMAIL='finance@demo.co.ke';
async function req(p,o={}){const r=await fetch(base+p,{...o,headers:{'content-type':'application/json','x-dev-user-email':EMAIL,'x-org-id':ORG,...(o.headers||{})}});return{status:r.status,json:await r.json().catch(()=>({}))};}
(async()=>{
  const t=async(n,fn)=>{try{await fn();console.log(`✅ ${n}`)}catch(e){console.log(`❌ ${n} — `+String(e))}};
  await t('health', async()=>{if((await req('/api/v1/health')).status!==200) throw new Error('bad');});
  await t('intent→attempt→webhook→ledger shape', async()=>{
    const it=await req('/api/v1/payment-intents',{method:'POST',body:JSON.stringify({amountCents:7500,purpose:'Smoke',reference:`S3-${Date.now()}`})});
    if(it.status!==200) throw new Error('intent failed');
    const id=(it.json as any).data.id;
    await req(`/api/v1/payment-intents/${id}/attempt`,{method:'POST'});
    const wh=await fetch(`${base}/api/v1/webhooks/mpesa`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({intentReference:`S3-${Date.now()}`,providerRef:'PR-'+Date.now(),status:'SUCCEEDED'})});
    if(wh.status!==200) throw new Error('webhook failed');
  });
})();
