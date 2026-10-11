export function assertLaunchReady(env: Record<string,string|undefined>, html: string) {
 if(env.VITE_PRIVACY_READY !== 'true') return;
 const endpoint=env.VITE_LEADS_ENDPOINT?.trim();
 let url: URL;
 try { url=new URL(endpoint || ''); } catch { throw new Error('Live leads require VITE_LEADS_ENDPOINT.'); }
 if(url.protocol!=='https:' || url.pathname!=='/api/leads' || url.username || url.password || url.search || url.hash || /YOUR|example|localhost/i.test(url.hostname)) {
  throw new Error('Live leads require a real HTTPS /api/leads endpoint without credentials or query parameters.');
 }
 if(!html.includes('data-privacy-status="ready"') || /data-privacy-status="draft"|Пока это проект|Срок хранения не определён/.test(html)) {
  throw new Error('Live leads are blocked: complete the privacy notice before setting VITE_PRIVACY_READY=true.');
 }
}
