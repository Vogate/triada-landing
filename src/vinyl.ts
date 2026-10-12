// Render an independently rotating record in the photograph's perspective.
const surface = document.querySelector<HTMLCanvasElement>('.record-surface');
if (surface) {
 const card = surface.closest<HTMLElement>('.lesson')!;
 const source = card.querySelector<HTMLImageElement>('.lesson-visual > img')!;
 const ctx = surface.getContext('2d')!;
 const texture = document.createElement('canvas'); texture.width = texture.height = 1024;
 const t = texture.getContext('2d')!;
 const rotated = document.createElement('canvas'); rotated.width = rotated.height = 1024;
 const r = rotated.getContext('2d')!;
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 let angle = 0, spinning = false, visible = true, frame = 0, last = 0;
 const black = t.createRadialGradient(512,512,80,512,512,505);
 black.addColorStop(0,'#161820'); black.addColorStop(.4,'#06080c'); black.addColorStop(1,'#171b24');
 t.fillStyle=black; t.beginPath();t.arc(512,512,505,0,Math.PI*2);t.fill();
 for(let radius=150;radius<500;radius+=3){t.strokeStyle=radius%2?'#53607155':'#010205';t.lineWidth=.8;t.beginPath();t.arc(512,512,radius,0,Math.PI*2);t.stroke();}
 // Asymmetric surface details make real angular movement unambiguous.
 for(const a of [.35,2.8,4.4]){t.save();t.translate(512,512);t.rotate(a);const g=t.createLinearGradient(150,0,500,0);g.addColorStop(0,'#acc8e500');g.addColorStop(.7,'#c6ddf0cc');g.addColorStop(1,'#afc8e500');t.strokeStyle=g;t.lineWidth=22;t.beginPath();t.moveTo(150,0);t.lineTo(500,0);t.stroke();t.restore();}
 t.save();t.translate(512,512);t.rotate(.6);t.fillStyle='#a7c9eb';t.fillRect(428,-10,45,20);t.restore();
 t.fillStyle='#283448';t.beginPath();t.arc(512,512,140,0,Math.PI*2);t.fill();
 t.fillStyle='#9fbfe5';t.fillRect(494,382,36,73);
 t.fillStyle='#d7e4f3';t.font='600 26px sans-serif';t.textAlign='center';t.fillText('TRIADA',512,505);t.font='18px sans-serif';t.fillText('SIDE A',512,551);
 t.fillStyle='#05070a';t.beginPath();t.arc(512,512,12,0,Math.PI*2);t.fill();
 function draw(){
  r.clearRect(0,0,1024,1024);r.save();r.translate(512,512);r.rotate(angle);r.drawImage(texture,-512,-512);r.restore();
  ctx.clearRect(0,0,1200,800);
  // Perspective projection: the near edge spreads out while the far edge recedes.
  const rows=380;
  for(let i=0;i<rows;i++){
   const v=-1+(i/rows)*2, vNext=-1+((i+1)/rows)*2;
   const half=Math.sqrt(Math.max(0,1-v*v));const denominator=1-.5*v;
   const y=355+290*v/denominator, yNext=355+290*vNext/(1-.5*vNext);
   const x=100-880*half/denominator, width=1760*half/denominator;
   if(width>0 && y<800 && yNext>0)ctx.globalAlpha=.85;ctx.drawImage(rotated,512-half*505,512+v*505,half*1010,1010/rows,x,y,width,yNext-y+.8);
  }
  ctx.globalAlpha=1;
  // Restore the fixed tonearm, needle and spindle above the rotating record.
  if(source.complete && source.naturalWidth){
   ctx.save();ctx.beginPath();ctx.moveTo(760,300);ctx.lineTo(940,245);ctx.lineTo(1100,240);ctx.lineTo(1090,350);ctx.lineTo(950,410);ctx.lineTo(860,460);ctx.lineTo(780,450);ctx.closePath();ctx.clip();ctx.drawImage(source,0,0,1200,800);ctx.restore();
   ctx.save();ctx.beginPath();ctx.ellipse(97,333,27,48,0,0,Math.PI*2);ctx.clip();ctx.drawImage(source,0,0,1200,800);ctx.restore();
  }
 }
 function enabled(){return spinning&&visible&&!document.hidden&&!reduced.matches&&!document.body.classList.contains('motion-paused');}
 function tick(now:number){
  if(!enabled()){frame=0;last=0;return;}
  if(now-last>=40){if(last)angle+=(Math.min(now-last,100)/1000)*Math.PI*2/3;last=now;draw();}
  frame=requestAnimationFrame(tick);
 }
 function sync(){cancelAnimationFrame(frame);frame=0;last=0;if(enabled())frame=requestAnimationFrame(tick);}
 card.addEventListener('record-spin',event=>{spinning=(event as CustomEvent<boolean>).detail;sync();});
 new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});
 document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);
 if('IntersectionObserver' in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();}).observe(card);
 source.addEventListener('load',draw);draw();
}
export {};

