import { defineConfig, loadEnv } from 'vite';
import { assertLaunchReady } from './scripts/launch-readiness';
export default defineConfig(({mode})=>({
 base: './',
 plugins:[{
  name:'launch-readiness',
  transformIndexHtml(html){assertLaunchReady(loadEnv(mode, '.', 'VITE_'),html);return html;}
 }]
}));
