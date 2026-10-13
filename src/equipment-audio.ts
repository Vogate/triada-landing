/** One audio source and one transport for both the track and equipment jog. */
export function setupEquipmentAudio(card: HTMLElement, trigger: HTMLButtonElement) {
 const player = document.createElement('div'); player.className = 'equipment-player';
 const title = document.createElement('p'); title.className='track-title'; title.textContent='Акула — Кислотный DJ';
 const audio = document.createElement('audio'); audio.controls=true;audio.preload='none';
 audio.src=`${import.meta.env.BASE_URL}assets/acid-dj.mp3`;
 audio.setAttribute('aria-label','Акула — Кислотный DJ: воспроизведение и громкость');
 const label=document.createElement('label');label.className='track-start';label.textContent='Начать с, сек';
 const start=document.createElement('input');start.type='number';start.min='0';start.max='3600';start.step='1';start.value='55';
 start.setAttribute('aria-label','Начало фрагмента в секундах');label.append(start);
 const status=document.createElement('p');status.className='track-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 const hint=document.createElement('p');hint.className='track-hint';hint.textContent='Нажми на пульт: музыка и джог включатся вместе. Повторное нажатие — пауза.';
 player.append(title,audio,label,hint,status);card.append(player);
 let firstStart=true;let loading=false;let requested=false;
 function sync(){
  const playing=!audio.paused&&!audio.ended;
  card.classList.toggle('jog-spinning',playing);
  trigger.setAttribute('aria-pressed',String(playing));
  trigger.setAttribute('aria-label',playing?'Поставить трек и джог на паузу':'Включить трек и вращение джога');
 }
 function seekStart(){
  const value=Number(start.value);
  const position=Number.isFinite(value)?Math.max(0,value):0;
  if(Number.isFinite(audio.duration))audio.currentTime=Math.min(position,Math.max(0,audio.duration-.1));
 }
 audio.addEventListener('loadedmetadata',()=>{
  start.max=String(Math.max(0,Math.floor(audio.duration)-1));
  if(firstStart && requested){seekStart();firstStart=false;}
 });
 audio.addEventListener('play',()=>{requested=true;if(firstStart && audio.readyState>=1){seekStart();firstStart=false;}sync();status.textContent='';});
 audio.addEventListener('pause',sync);audio.addEventListener('ended',()=>{firstStart=true;requested=false;sync();});
 audio.addEventListener('error',()=>{loading=false;requested=false;sync();status.textContent='Не удалось загрузить трек. Проверь соединение и нажми ещё раз.';});
 start.addEventListener('change',()=>{if(audio.readyState>=1){seekStart();firstStart=false;}else firstStart=true;});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){requested=false;audio.pause();sync();}});
 new MutationObserver(()=>{if(document.body.classList.contains('motion-paused')){requested=false;audio.pause();sync();}}).observe(document.body,{attributes:true,attributeFilter:['class']});
 sync();
 return () => {
  if(loading || !audio.paused){requested=false;loading=false;audio.pause();sync();status.textContent='';return;}
  requested=true;loading=true;status.textContent='Загружаем трек…';
  if(firstStart && audio.readyState>=1){seekStart();firstStart=false;}
  // Call play directly inside the user's click so iOS allows sound.
  audio.play().then(()=>{loading=false;if(!requested){audio.pause();sync();return;}sync();status.textContent='';}).catch(()=>{loading=false;requested=false;sync();status.textContent='Звук не включился. Попробуй кнопку воспроизведения ниже.';});
 };
}

