import { validateLead, experiences } from '../src/lead';
interface Env {
 TELEGRAM_BOT_TOKEN: string; TELEGRAM_CHAT_ID: string; ALLOWED_ORIGIN: string; PRIVACY_READY: string;
 LEAD_LIMITER: { limit(options:{key:string}):Promise<{success:boolean}> };
}
export default {
 async fetch(request:Request,env:Env):Promise<Response>{
  const origin=request.headers.get('Origin');
  const headers:Record<string,string>={'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin'};
  if(origin===env.ALLOWED_ORIGIN)headers['Access-Control-Allow-Origin']=origin;
  const reply=(status:number,body:object)=>new Response(JSON.stringify(body),{status,headers});
  if(new URL(request.url).pathname!=='/api/leads')return reply(404,{ok:false});
  if(!env.ALLOWED_ORIGIN || origin!==env.ALLOWED_ORIGIN)return reply(403,{ok:false});
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...headers,'Access-Control-Allow-Methods':'POST','Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'86400'}});
  if(request.method!=='POST')return reply(405,{ok:false});
  if(env.PRIVACY_READY!=='true'||!env.TELEGRAM_BOT_TOKEN||!env.TELEGRAM_CHAT_ID)return reply(503,{ok:false});
  if(!request.headers.get('Content-Type')?.includes('application/json'))return reply(415,{ok:false});
  try{
   const rate=await env.LEAD_LIMITER.limit({key:request.headers.get('CF-Connecting-IP')||'unknown'});
   if(!rate.success)return reply(429,{ok:false});
   if(Number(request.headers.get('Content-Length'))>8192)return reply(413,{ok:false});
   const reader=request.body?.getReader();if(!reader)return reply(400,{ok:false});
   const chunks:Uint8Array[]=[];let size=0;
   while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>8192){await reader.cancel();return reply(413,{ok:false});}chunks.push(value);}
   const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}
   let input;try{input=JSON.parse(new TextDecoder().decode(bytes));}catch{return reply(400,{ok:false});}
   const result=validateLead(input);if('error' in result)return reply(400,{ok:false,error:result.error});
   const d=result.lead;
   const response=await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:env.TELEGRAM_CHAT_ID,text:`TRIADA — предзапись\n\nИмя: ${d.name}\nTelegram: ${d.telegram}\nОпыт: ${experiences[d.experience]}\nКомментарий: ${d.comment||'—'}\n\n18+: подтверждено\nСогласие: подтверждено\nДата: ${new Date().toISOString()}`,link_preview_options:{is_disabled:true}}),signal:AbortSignal.timeout(10000)});
   const resultTelegram=await response.json() as {ok?:boolean};
   if(!response.ok||resultTelegram.ok!==true)return reply(502,{ok:false});
   return reply(200,{ok:true});
  }catch{return reply(502,{ok:false});}
 }
};
