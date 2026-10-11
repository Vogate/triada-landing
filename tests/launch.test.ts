import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {assertLaunchReady} from '../scripts/launch-readiness';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
test('demo can build, but current privacy draft cannot enable live leads',()=>{
 assert.doesNotThrow(()=>assertLaunchReady({},html));
 assert.throws(()=>assertLaunchReady({VITE_PRIVACY_READY:'true',VITE_LEADS_ENDPOINT:'https://leads.school.test/api/leads'},html),/privacy notice/);
});
test('live leads require a secure endpoint and completed notice',()=>{
 const ready='<dialog data-privacy-status="ready">Completed notice</dialog>';
 for(const endpoint of ['', 'http://school.test/api/leads','https://example.com/api/leads','https://school.test/wrong','https://user:pass@school.test/api/leads']){
  assert.throws(()=>assertLaunchReady({VITE_PRIVACY_READY:'true',VITE_LEADS_ENDPOINT:endpoint},ready));
 }
 assert.doesNotThrow(()=>assertLaunchReady({VITE_PRIVACY_READY:'true',VITE_LEADS_ENDPOINT:'https://school.test/api/leads'},ready));
});
test('HTML is fail-closed before JavaScript runs',()=>{
 assert.match(html,/<form[^>]+method="post"/);
 assert.match(html,/<fieldset[^>]+disabled/);
 assert.match(html,/<button[^>]+type="button"[^>]+class="button submit"[^>]+disabled/);
 assert.match(html,/<noscript>/);
});
