import {validateContact} from '../src/contactValidation';
type Env=Record<string,string|undefined>;
const failure='Your message couldn’t be sent. Please try again or email me directly.';
const recipient='richdaniel011206@gmail.com';
const escapeHtml=(s:string)=>s.replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]!));
const json=(status:number,body:object,headers:Record<string,string>={})=>Response.json(body,{status,headers:{'Cache-Control':'no-store',...headers}});
// Both buckets are incremented atomically in shared Redis; nothing relies on warm instances.
const rateScript=`local blocked=0; for i,key in ipairs(KEYS) do local n=redis.call('INCR',key); if n==1 then redis.call('EXPIRE',key,tonumber(ARGV[i*2])) end; if n>tonumber(ARGV[i*2-1]) then blocked=1 end end; return blocked`;
export function createContactHandler(env:Env,fetcher:typeof fetch=fetch){return async function handle(request:Request):Promise<Response>{
 try{
  if(request.method!=='POST')return json(405,{error:failure},{Allow:'POST'});
  const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return json(403,{error:failure});
  if(request.headers.get('content-type')?.split(';')[0].trim().toLowerCase()!=='application/json')return json(415,{error:failure});
  if(Number(request.headers.get('content-length'))>24000)return json(413,{error:failure});
  const reader=request.body?.getReader();if(!reader)return json(400,{error:failure});
  const chunks:Uint8Array[]=[];let size=0;
  for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>24000){await reader.cancel();return json(413,{error:failure});}chunks.push(value);}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  let body;try{body=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));}catch{return json(400,{error:failure});}
  if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).some(key=>!['name','email','message','website','submissionId'].includes(key)))return json(400,{error:failure});
  if(typeof body.website!=='string'||body.website!==''||!['name','email','message','submissionId'].every(key=>typeof body[key]==='string'))return json(400,{error:failure});
  const fields={name:body.name.trim(),email:body.email.trim(),message:body.message.trim()};
  const errors=validateContact(fields);if(Object.keys(errors).length)return json(422,{error:failure,errors});
  if(!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(body.submissionId))return json(400,{error:failure});
  const {RESEND_API_KEY,CONTACT_FROM_EMAIL,UPSTASH_REDIS_REST_URL,UPSTASH_REDIS_REST_TOKEN}=env;
  // Fail closed when either delivery or durable spam protection is unconfigured.
  if(!RESEND_API_KEY||!CONTACT_FROM_EMAIL||!UPSTASH_REDIS_REST_URL?.startsWith('https://')||!UPSTASH_REDIS_REST_TOKEN||/[\r\n]/.test(CONTACT_FROM_EMAIL))return json(503,{error:failure});
  const ip=request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim();
  if(!ip)return json(503,{error:failure});
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(UPSTASH_REDIS_REST_TOKEN+ip));
  const key=Array.from(new Uint8Array(digest),n=>n.toString(16).padStart(2,'0')).join('');
  const rate=await fetcher(UPSTASH_REDIS_REST_URL,{method:'POST',headers:{Authorization:`Bearer ${UPSTASH_REDIS_REST_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify(['EVAL',rateScript,'2',`contact:ip:${key}`,'contact:global','5','600','100','3600']),signal:AbortSignal.timeout(5000)});
  if(!rate.ok)return json(503,{error:failure});const result=await rate.json();if(result.error||![0,1].includes(result.result))return json(503,{error:failure});
  if(result.result===1)return json(429,{error:failure},{'Retry-After':'600'});
  const sent=await fetcher('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`portfolio-${body.submissionId}`},signal:AbortSignal.timeout(10000),body:JSON.stringify({from:CONTACT_FROM_EMAIL,to:[recipient],reply_to:fields.email,subject:`Portfolio enquiry from ${fields.name}`,text:`Name: ${fields.name}\nEmail: ${fields.email}\n\n${fields.message}`,html:`<p><strong>Name:</strong> ${escapeHtml(fields.name)}<br><strong>Email:</strong> ${escapeHtml(fields.email)}</p><p style="white-space:pre-wrap">${escapeHtml(fields.message)}</p>`})});
  if(!sent.ok)return json(502,{error:failure});const accepted=await sent.json();if(typeof accepted.id!=='string'||!accepted.id)return json(502,{error:failure});
  return json(200,{message:'Thanks! Your message has been sent.'});
 }catch{return json(503,{error:failure});}
};}
export default {fetch:(request:Request)=>createContactHandler(process.env)(request)};
