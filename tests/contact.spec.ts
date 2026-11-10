import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {createContactHandler} from '../api/contact';
const env={RESEND_API_KEY:'server-only-test-key',CONTACT_FROM_EMAIL:'Portfolio <contact@verified.example>',UPSTASH_REDIS_REST_URL:'https://redis.example',UPSTASH_REDIS_REST_TOKEN:'server-only-test-token'};
const payload={name:'Visitor <test>',email:'visitor@example.com',message:'Hello <script>alert("x")</script> & welcome',website:'',submissionId:'35272be0-9f61-4a2d-84b3-811ff187891a'};
function request(body:unknown=payload,headers:Record<string,string>={},method='POST'){return new Request('https://portfolio.example/api/contact',{method,headers:{'Content-Type':'application/json','x-vercel-forwarded-for':'203.0.113.4',...headers},...(method==='POST'?{body:typeof body==='string'?body:JSON.stringify(body)}:{})});}
function providerMock(rateResult=0,providerStatus=200){const calls:{url:string;options:RequestInit}[]=[];const fetcher=(async(url,options)=>{calls.push({url:String(url),options:options!});return String(url).includes('redis.example')?Response.json({result:rateResult}):Response.json(providerStatus===200?{id:'accepted-id'}:{message:'secret provider error'},{status:providerStatus});}) as typeof fetch;return {calls,fetcher};}
test('API accepts only validated fields, fixed recipient, authorized From and validated Reply-To; HTML escaped',async()=>{
 const {calls,fetcher}=providerMock();const response=await createContactHandler(env,fetcher)(request());expect(response.status).toBe(200);expect((await response.json()).message).toBe('Thanks! Your message has been sent.');
 expect(calls).toHaveLength(2);const message=JSON.parse(calls[1].options.body as string);expect(message.to).toEqual(['richdaniel011206@gmail.com']);expect(message.from).toBe(env.CONTACT_FROM_EMAIL);expect(message.reply_to).toBe(payload.email);expect(message.subject).toBe(`Portfolio enquiry from ${payload.name}`);expect(message.text).toContain(payload.message);expect(message.html).toContain('&lt;script&gt;');expect(message.html).not.toContain('<script>');expect(message.html).toContain('&amp;');expect(calls[1].options.headers).toMatchObject({'Idempotency-Key':`portfolio-${payload.submissionId}`});
 const command=JSON.parse(calls[0].options.body as string);expect(command[0]).toBe('EVAL');expect(command[1]).toContain("redis.call('INCR'");expect(command[1]).toContain("redis.call('EXPIRE'");expect(command.slice(2)).toEqual(['2',expect.stringMatching(/^contact:ip:[a-f0-9]{64}$/),'contact:global','5','600','100','3600']);expect(JSON.stringify(command)).not.toContain('203.0.113.4');
});
test('Resend onboarding sender is accepted for the account-owner test',async()=>{
 const {fetcher,calls}=providerMock();const response=await createContactHandler({...env,CONTACT_FROM_EMAIL:'RLwork <onboarding@resend.dev>'},fetcher)(request());
 expect(response.status).toBe(200);expect(JSON.parse(calls[1].options.body as string).from).toBe('RLwork <onboarding@resend.dev>');
});
test('invalid payloads, recipient injection, honeypot, limits and invalid email never reach external services',async()=>{
 const {fetcher,calls}=providerMock();const handle=createContactHandler(env,fetcher);
 for(const body of [{...payload,name:''},{...payload,email:'bad'},{...payload,email:'victim@example.com\r\nBcc: other@example.com'},{...payload,message:' '},{...payload,name:'a'.repeat(101)},{...payload,message:'a'.repeat(5001)},{...payload,website:'bot'},{...payload,to:'attacker@example.com'},{...payload,submissionId:'bad'},null,[],{...payload,email:4},'invalid JSON'])expect((await handle(request(body))).status).toBeGreaterThanOrEqual(400);
 expect(calls).toHaveLength(0);
});
test('method, media type, origin and body size are restricted',async()=>{
 const {fetcher,calls}=providerMock();const handle=createContactHandler(env,fetcher);
 expect((await handle(request(undefined,{},'GET'))).status).toBe(405);expect((await handle(request(payload,{'Content-Type':'text/plain'}))).status).toBe(415);expect((await handle(request(payload,{origin:'https://attacker.example'}))).status).toBe(403);expect((await handle(request('x'.repeat(24001)))).status).toBe(413);expect((await handle(request(payload,{'content-length':'24001'}))).status).toBe(413);expect(calls).toHaveLength(0);
});
test('shared rate limiting rejects across new handler instances and does not call Resend',async()=>{
 let count=0;const external:string[]=[];
 const fetcher=(async(url)=>{external.push(String(url));return String(url).includes('redis.example')?Response.json({result:++count>5?1:0}):Response.json({id:'accepted'});}) as typeof fetch;
 for(let i=0;i<5;i++)expect((await createContactHandler(env,fetcher)(request())).status).toBe(200);
 const limited=await createContactHandler(env,fetcher)(request());expect(limited.status).toBe(429);expect(limited.headers.get('Retry-After')).toBe('600');expect(external.filter(url=>url.includes('resend.com'))).toHaveLength(5);
});
test('configuration, Redis, provider errors and missing acceptance IDs fail closed without leaking secrets',async()=>{
 for(const key of Object.keys(env)){const {calls,fetcher}=providerMock();expect((await createContactHandler({...env,[key]:''},fetcher)(request())).status).toBe(503);expect(calls).toHaveLength(0);}
 const {fetcher}=providerMock(0,401);const response=await createContactHandler(env,fetcher)(request());expect(response.status).toBe(502);expect(await response.text()).not.toMatch(/server-only|secret provider/);
 for(const result of [Response.json({error:'secret redis error'}),Response.json({result:2}),new Response('',{status:500})]){
  let calls=0;expect((await createContactHandler(env,(async()=>{calls++;return result;}) as typeof fetch)(request())).status).toBe(503);expect(calls).toBe(1);
 }
 expect((await createContactHandler(env,(async(url)=>String(url).includes('redis')?Response.json({result:0}):Response.json({})) as typeof fetch)(request())).status).toBe(502);
 expect((await createContactHandler(env,(async()=>{throw new Error('secret');}) as typeof fetch)(request())).status).toBe(503);
});
for(const width of [1440,390,320])test(`${width}: contact layout, links, clipboard, focus and accessibility`,async({page,context})=>{
 await page.setViewportSize({width,height:900});await page.emulateMedia({reducedMotion:'reduce'});await context.grantPermissions(['clipboard-read','clipboard-write']);await page.goto('/');await page.locator('#contact').scrollIntoViewIfNeeded();
 const contact=page.locator('#contact');await expect(contact.getByRole('heading',{name:'GET IN TOUCH'})).toBeVisible();await expect(contact.locator('.eyebrow')).toHaveText('CONTACT / 05');await expect(contact.getByRole('link',{name:'+63 916 342 4218'})).toHaveAttribute('href','tel:+639163424218');await expect(contact.getByRole('link',{name:'richdaniel011206@gmail.com'})).toHaveAttribute('href','mailto:richdaniel011206@gmail.com');await expect(contact).toContainText('Valenzuela City, Philippines');
 await contact.getByRole('button',{name:'Copy Email'}).click();await expect(contact.getByRole('status').first()).toHaveText('Email copied.');expect(await page.evaluate(()=>navigator.clipboard.readText())).toBe('richdaniel011206@gmail.com');
 await contact.getByRole('textbox',{name:'Name',exact:true}).focus();await page.keyboard.press('Tab');await expect(contact.getByRole('textbox',{name:'Email',exact:true})).toBeFocused();
 const left=await contact.locator('.contact-details').boundingBox(),right=await contact.locator('.contact-form-column').boundingBox();if(width>850)expect(right!.x).toBeGreaterThan(left!.x+left!.width);else expect(right!.y).toBeGreaterThan(left!.y+left!.height);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();expect((await new AxeBuilder({page}).include('#contact').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
 await contact.screenshot({path:`/tmp/contact-${width}.png`});
});
test('form validates, prevents duplicate sends, confirms acceptance, clears on success and preserves errors',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');const contact=page.locator('#contact'),send=contact.getByRole('button',{name:'Send Message ↗'});
 await send.click();await expect(contact.getByRole('textbox',{name:'Name',exact:true})).toBeFocused();await expect(contact.locator('[aria-invalid=true]')).toHaveCount(3);
 await contact.getByRole('textbox',{name:'Name',exact:true}).fill('Test Visitor');await contact.getByRole('textbox',{name:'Email',exact:true}).fill('bad');await contact.getByRole('textbox',{name:'Message',exact:true}).fill('A verified enquiry');await send.click();await expect(contact.getByRole('textbox',{name:'Email',exact:true})).toBeFocused();await contact.getByRole('textbox',{name:'Email',exact:true}).fill('visitor@example.com');
 let calls=0;let release:()=>void=()=>{};const gate=new Promise<void>(resolve=>{release=resolve;});
 await page.route('**/api/contact',async route=>{calls++;await gate;await route.fulfill({status:200,json:{message:'Thanks! Your message has been sent.'}});});
 await send.click();await expect(contact.getByRole('button',{name:'Sending…'})).toBeDisabled();await contact.locator('form').evaluate(form=>{form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));});expect(calls).toBe(1);await expect(contact.getByRole('status').last()).toHaveText('Sending your message…');release();await expect(contact.getByRole('status').last()).toHaveText('Thanks! Your message has been sent.');await expect(contact.getByRole('textbox',{name:'Message',exact:true})).toHaveValue('');
 await page.unroute('**/api/contact');const ids:string[]=[];await page.route('**/api/contact',route=>{ids.push(route.request().postDataJSON().submissionId);return route.fulfill({status:503,json:{error:'not configured'}});});
 await contact.getByRole('textbox',{name:'Name',exact:true}).fill('Test');await contact.getByRole('textbox',{name:'Email',exact:true}).fill('visitor@example.com');await contact.getByRole('textbox',{name:'Message',exact:true}).fill('Keep this message');await send.click();await expect(contact.getByRole('status').last()).toHaveText('Your message couldn’t be sent. Please try again or email me directly.');await expect(contact.getByRole('textbox',{name:'Message',exact:true})).toHaveValue('Keep this message');await send.click();await expect(send).toBeEnabled();expect(ids[0]).toBe(ids[1]);
});

test('browser production bundle contains no server credentials or provider integration',async()=>{
 const {readdir,readFile}=await import('node:fs/promises');for(const file of await readdir('dist/assets'))if(file.endsWith('.js'))expect(await readFile(`dist/assets/${file}`,'utf8')).not.toMatch(/RESEND_API_KEY|CONTACT_FROM_EMAIL|UPSTASH_REDIS_REST_TOKEN|api\.resend\.com|server-only-test/);
});
