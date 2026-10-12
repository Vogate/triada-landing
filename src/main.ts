import './style.css';
import './premium.css';
import {validateLead} from './lead';
const menu = document.querySelector<HTMLButtonElement>('.menu-toggle')!;
const nav = document.querySelector<HTMLElement>('#navigation')!;
function closeMenu(){menu.setAttribute('aria-expanded','false');nav.classList.remove('open');}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape' && nav.classList.contains('open')){closeMenu();menu.focus();}});
if(!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window){
 document.documentElement.classList.add('motion-ready');
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.08});
 document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
}
const dialog=document.querySelector<HTMLDialogElement>('#privacy-dialog')!;
document.querySelectorAll('[data-privacy-open]').forEach(button=>button.addEventListener('click',()=>dialog.showModal()));
document.querySelector('#privacy-close')!.addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
const form=document.querySelector<HTMLFormElement>('#lead-form')!;
const status=document.querySelector<HTMLElement>('#form-status')!;
const submit=form.querySelector<HTMLButtonElement>('[type=submit]')!;
const endpoint=import.meta.env.VITE_LEADS_ENDPOINT?.trim();
const ready=!!endpoint && import.meta.env.VITE_PRIVACY_READY==='true';
if(ready)document.querySelector<HTMLElement>('#demo-note')!.hidden=true;
let busy=false;
form.addEventListener('submit',async e=>{
 e.preventDefault();if(busy)return;
 form.querySelectorAll('[aria-invalid]').forEach(el=>el.removeAttribute('aria-invalid'));
 const d=new FormData(form);
 const result=validateLead({name:d.get('name'),telegram:d.get('telegram'),experience:d.get('experience'),comment:d.get('comment'),adult:d.get('adult')==='on',consent:d.get('consent')==='on',website:d.get('website')});
 status.dataset.state='error';
 if('error' in result){status.textContent=result.error;if(result.field){const field=form.elements.namedItem(result.field) as HTMLElement;field.setAttribute('aria-invalid','true');field.setAttribute('aria-describedby','form-status');field.focus();}return;}
 if(!ready){status.textContent='Это демонстрационная версия. Отправка ещё не подключена — данные никуда не переданы.';return;}
 busy=true;submit.disabled=true;submit.setAttribute('aria-busy','true');status.dataset.state='pending';status.textContent='Отправляем заявку…';
 try{
 const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(result.lead),signal:AbortSignal.timeout(15000)});
 const data=await response.json();
 if(!response.ok || data.ok!==true)throw new Error(response.status===429?'Слишком много попыток. Подожди минуту и попробуй снова.':'Не удалось подтвердить отправку. Попробуй ещё раз.');
 status.dataset.state='success';status.textContent='Заявка отправлена. Напишем тебе в Telegram, ответим на вопросы и сообщим о старте набора.';form.reset();
 }catch(error){status.dataset.state='error';status.textContent=error instanceof Error && error.name==='Error'?error.message:'Не удалось подтвердить отправку. Проверь соединение и попробуй снова.';}
 finally{busy=false;submit.disabled=false;submit.removeAttribute('aria-busy');}
});
// Enable native submission only after preventDefault is installed.
if(ready){
 form.querySelector<HTMLFieldSetElement>('fieldset')!.disabled=false;
 submit.type='submit';
 submit.disabled=false;
}
// Decorative failures must never prevent the form handler from being installed.
void import('./motion').catch(()=>document.body.classList.add('motion-paused'));
