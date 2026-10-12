import './vinyl';
export {};
/** Decorative club lighting. No audio, tracking or third-party animation runtime. */
const canvas = document.querySelector<HTMLCanvasElement>('#club-lights')!;
const ctx = canvas.getContext('2d');
const toggle = document.querySelector<HTMLButtonElement>('.motion-control')!;
const hero = document.querySelector<HTMLElement>('.hero-art')!;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let paused = false;
let frame = 0;
let width = 0;
let height = 0;
let last = 0;
let phase = 0;
function resize() {
 width = window.innerWidth; height = window.innerHeight;
 const ratio = Math.min(devicePixelRatio || 1, 1.5);
 canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
 ctx?.setTransform(ratio, 0, 0, ratio, 0, 0);
 if (paused || reduced.matches) draw(phase);
}
function draw(t: number) {
 if (!ctx) return;
 ctx.clearRect(0, 0, width, height);
 const narrow = width < 700;
 const reach = narrow ? 36 : Math.min(125, width * .075);
 const strands = narrow ? 5 : 10;
 for (let side = 0; side < 2; side++) {
  ctx.save();
  if (side) { ctx.translate(width, 0); ctx.scale(-1, 1); }
  for (let i = 0; i < strands; i++) {
   const gradient = ctx.createLinearGradient(0,0,reach,0);
   gradient.addColorStop(0, `rgba(108,164,255,${narrow ? .23 : .36})`);
   gradient.addColorStop(.5, `rgba(70,130,255,${.16+i*.008})`);
   gradient.addColorStop(1, 'rgba(72,128,255,0)');
   ctx.strokeStyle = gradient; ctx.lineWidth = i%3 === 0 ? 1.2 : .6;
   ctx.beginPath();
   for (let y = -30; y <= height+30; y += 8) {
    const x = 7 + reach * (.24 + .22*Math.sin(y*.003+t*.28+side*2+i*.21)) + Math.sin(y*.009-t*.4+i*.3)*reach*.18 + i*2;
    if (y === -30) ctx.moveTo(x,y); else ctx.lineTo(x,y);
   }
   ctx.stroke();
  }
  // Slow projector beams remain confined to the margins, away from copy.
  for(let i=0;i<3;i++){
   const fromY=height*(.18+i*.32);
   const toY=fromY+Math.sin(t*.16+i+side)*height*.35;
   const beam=ctx.createLinearGradient(0,fromY,reach,toY);
   beam.addColorStop(0,'rgba(163,202,255,.45)');beam.addColorStop(1,'rgba(80,140,255,0)');
   ctx.strokeStyle=beam;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,fromY);ctx.lineTo(reach,toY);ctx.stroke();
  }
  for(let i=0;i<(narrow?8:20);i++){
   const x=8+((i*37.7)%reach)*.75;
   const y=((i*83.13+t*(7+i%4))%(height+40))-20;
   const alpha=.18+.22*(.5+.5*Math.sin(t*.6+i));
   ctx.fillStyle=`rgba(163,207,255,${alpha})`;ctx.beginPath();ctx.arc(x,y,i%4===0?1.5:.7,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
 }
}
function animate(now:number){
 if(paused || reduced.matches || document.hidden){frame=0;last=0;return;}
 if(now-last>=33){if(last)phase+=Math.min((now-last)/1000,.1);last=now;draw(phase);}
 frame=requestAnimationFrame(animate);
}
function sync(){
 cancelAnimationFrame(frame);frame=0;last=0;
 const stopped=paused||reduced.matches||document.hidden;
 document.body.classList.toggle('motion-paused',stopped);
 toggle.setAttribute('aria-pressed',String(paused));
 toggle.setAttribute('aria-label',paused?'Включить анимацию':'Приостановить анимацию');
 toggle.querySelector('span')!.textContent=paused?'▷':'Ⅱ';
 hero.style.transform='';
 if(!stopped)frame=requestAnimationFrame(animate);else draw(phase);
}
toggle.addEventListener('click',()=>{paused=!paused;sync();});
document.addEventListener('visibilitychange',sync);
reduced.addEventListener('change',sync);
window.addEventListener('resize',resize,{passive:true});
hero.addEventListener('pointermove',e=>{
 if(paused||reduced.matches||e.pointerType!=='mouse')return;
 const box=hero.getBoundingClientRect();
 const x=(e.clientX-box.left)/box.width-.5;const y=(e.clientY-box.top)/box.height-.5;
 hero.style.transform=`rotateY(${x*9}deg) rotateX(${-y*7}deg)`;
});
hero.addEventListener('pointerleave',()=>{hero.style.transform='';});
const courseCards = document.querySelectorAll<HTMLElement>('.lesson');
const imageProperties = ['--image-rx', '--image-ry', '--image-x', '--image-y', '--light-x', '--light-y'];
function resetCourseImage(card: HTMLElement) {
 for (const property of imageProperties) card.style.removeProperty(property);
}
courseCards.forEach(card => {
 const trigger = document.createElement('button');
 trigger.type = 'button';
 trigger.className = 'lesson-trigger';
 trigger.setAttribute('aria-label', `Анимировать изображение: ${card.querySelector('h3')?.textContent || 'обучение'}`);
 card.append(trigger);
 const rotatingLayer = card.querySelector<SVGElement>('.jog-motion');
 const hasJog = !!rotatingLayer;
 const rotatingName = rotatingLayer?.dataset.rotatingName || 'джога';
 if (hasJog) { trigger.setAttribute('aria-label', `Запустить вращение ${rotatingName}`); trigger.setAttribute('aria-pressed', 'false'); }
 let tapTimer: ReturnType<typeof setTimeout> | undefined;
 trigger.addEventListener('click', () => {
  if (paused || document.hidden) return;
  if (hasJog) {
   const spinning = card.classList.toggle('jog-spinning');
   card.dispatchEvent(new CustomEvent('record-spin', {detail: spinning}));
   trigger.setAttribute('aria-pressed', String(spinning));
   trigger.setAttribute('aria-label', spinning ? `Остановить вращение ${rotatingName}` : `Запустить вращение ${rotatingName}`);
   return;
  }
  clearTimeout(tapTimer);
  card.classList.remove('is-tapped');
  // Restart the short effect even when the same image is tapped again.
  void card.offsetWidth;
  card.classList.add('is-tapped');
  tapTimer = setTimeout(() => card.classList.remove('is-tapped'), 1450);
 });
 card.addEventListener('pointermove', event => {
  if (paused || reduced.matches || event.pointerType !== 'mouse') return;
  const box = card.getBoundingClientRect();
  const x = Math.max(0, Math.min(1, (event.clientX - box.left) / box.width));
  const y = Math.max(0, Math.min(1, (event.clientY - box.top) / box.height));
  card.style.setProperty('--image-rx', `${(0.5 - y) * 5}deg`);
  card.style.setProperty('--image-ry', `${(x - 0.5) * 7}deg`);
  card.style.setProperty('--image-x', `${(x - 0.5) * 12}px`);
  card.style.setProperty('--image-y', `${(y - 0.5) * 10}px`);
  card.style.setProperty('--light-x', `${x * 100}%`);
  card.style.setProperty('--light-y', `${y * 100}%`);
 });
 card.addEventListener('pointerleave', () => resetCourseImage(card));
});
resize();sync();



// Pause the graduation scene while it is outside the viewport.
const stage = document.querySelector<HTMLElement>('.finale-art');
if(stage && 'IntersectionObserver' in window){
 const stageObserver = new IntersectionObserver(entries => {
  stage.classList.toggle('scene-idle', !entries[0].isIntersecting);
 }, {threshold:0});
 stageObserver.observe(stage);
}
