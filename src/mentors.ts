const cards=[...document.querySelectorAll<HTMLElement>('.mystery-mentor')];
const progress=document.querySelector<HTMLElement>('.mentor-progress')!;
let unlocked=0;
cards.forEach((card,index)=>{
 const cover=card.querySelector<HTMLButtonElement>('.mentor-cover')!;
 const content=card.querySelector<HTMLElement>('.mentor-content')!;
 const read=card.querySelector<HTMLButtonElement>('.mentor-read')!;
 cover.addEventListener('click',()=>{
  if(index>unlocked)return;
  content.hidden=false;cover.hidden=true;cover.setAttribute('aria-expanded','true');
  card.classList.add('mentor-open');
  const title=content.querySelector<HTMLElement>('h3')!;
  title.tabIndex=-1;title.focus({preventScroll:true});
  progress.textContent=`${index+1} из ${cards.length}: ${title.textContent}. Прочитай описание и подтверди знакомство.`;
 });
 read.addEventListener('click',()=>{
  if(content.hidden||read.disabled||index!==unlocked)return;
  read.disabled=true;read.textContent='Прочитано ✓';
  unlocked=index+1;
  if(unlocked<cards.length){
   const next=cards[unlocked].querySelector<HTMLButtonElement>('.mentor-cover')!;
   next.disabled=false;
   next.querySelector<HTMLElement>('.mystery-caption')!.textContent='Открой следующего наставника ↗';
   progress.textContent=`Доступна карточка ${unlocked+1} из ${cards.length}. Нажми на знак вопроса.`;
   next.focus({preventScroll:true});
  }else progress.textContent='Ты познакомился со всеми тремя наставниками TRIADA music lab.';
 });
});
export {};
