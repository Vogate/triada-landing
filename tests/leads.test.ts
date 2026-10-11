import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeTelegram,validateLead} from '../src/lead';
import worker from '../worker/index';
const valid={name:'Артур',telegram:'https://t.me/test_user',experience:'beginner',comment:'Хочу играть',adult:true,consent:true,website:''};
test('Telegram normalizes handles and links, rejects unrelated URLs',()=>{
 for(const input of ['@test_user','t.me/test_user','https://t.me/test_user/','test_user'])assert.equal(normalizeTelegram(input),'@test_user');
 for(const input of ['https://evil.test/test_user','@ab','@12345','test user','t.me/test_user?x=1'])assert.equal(normalizeTelegram(input),null);
});
test('Consent, age, field boundaries, honeypot validated',()=>{
 assert.ok('lead' in validateLead(valid));
 for(const change of [{name:''},{adult:false},{consent:false},{experience:'other'},{website:'spam'},{comment:'x'.repeat(1001)},{telegram:'@abc'}])assert.ok('error' in validateLead({...valid,...change}));
});
const env={TELEGRAM_BOT_TOKEN:'test-token',TELEGRAM_CHAT_ID:'test-chat',ALLOWED_ORIGIN:'https://school.test',PRIVACY_READY:'true',LEAD_LIMITER:{limit:async()=>({success:true})}};
function req(body:unknown=valid,origin='https://school.test'){return new Request('https://worker.test/api/leads',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(body)});}
test('Worker denies other origins, disabled setup, invalid leads and oversized input',async()=>{
 assert.equal((await worker.fetch(req(valid,'https://other.test'),env)).status,403);
 assert.equal((await worker.fetch(req(),{...env,PRIVACY_READY:'false'})).status,503);
 assert.equal((await worker.fetch(req({...valid,adult:false}),env)).status,400);
 assert.equal((await worker.fetch(req({...valid,comment:'x'.repeat(9000)}),env)).status,413);
 assert.equal((await worker.fetch(req(),{...env,LEAD_LIMITER:{limit:async()=>({success:false})}})).status,429);
});
test('Worker confirms success only after Telegram confirms delivery',async()=>{
 const original=globalThis.fetch;
 try{
  globalThis.fetch=async(_url,options)=>{const body=JSON.parse(options!.body as string);assert.ok(body.text.includes('@test_user'));assert.equal(body.parse_mode,undefined);return Response.json({ok:true});};
  const success=await worker.fetch(req(),env);assert.equal(success.status,200);assert.deepEqual(await success.json(),{ok:true});
  globalThis.fetch=async()=>Response.json({ok:false});assert.equal((await worker.fetch(req(),env)).status,502);
  globalThis.fetch=async()=>{throw new Error('network');};assert.equal((await worker.fetch(req(),env)).status,502);
 }finally{globalThis.fetch=original;}
});
