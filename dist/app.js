(() => {
 'use strict';
 const reduce = matchMedia('(prefers-reduced-motion: reduce)'), $ = s => document.querySelector(s);
 const stage = $('.hero-stage'), world = $('.world'), play = $('.play'), toy = $('.toy');
 let sound = false, audio, busy = false, frame = 0;
 const visible = new Set();
 if (!reduce.matches) document.documentElement.classList.add('js-motion');
 const visibility = new IntersectionObserver(entries => {
  for (const e of entries) {e.target.classList.toggle('offscreen', !e.isIntersecting);if (e.isIntersecting) visible.add(e.target); else visible.delete(e.target);}
  requestScene();
 }, {threshold:0});
 document.querySelectorAll('main>section').forEach(el => visibility.observe(el));
 const reveal = new IntersectionObserver(entries => {for (const e of entries) if(e.isIntersecting){e.target.classList.add('is-visible');reveal.unobserve(e.target);}}, {threshold:.12});
 document.querySelectorAll('.reveal').forEach(el => reveal.observe(el));
 function updateScene() {
  frame = 0;if (reduce.matches || !visible.has(world)) return;
  const rect = world.getBoundingClientRect();
  const progress = Math.min(1,Math.max(0,(-rect.top + innerHeight*.18)/(world.offsetHeight-innerHeight + innerHeight*.18)));
  world.style.setProperty('--p',progress.toFixed(4));
 }
 function requestScene(){if(!frame)frame=requestAnimationFrame(updateScene);}
 addEventListener('scroll', requestScene, {passive:true});addEventListener('resize', requestScene, {passive:true});requestScene();
 stage.addEventListener('pointermove', e => {if (reduce.matches || e.pointerType==='touch') return;const r=stage.getBoundingClientRect();stage.style.setProperty('--mx', ((e.clientX-r.left)/r.width-.5)*2);stage.style.setProperty('--my', ((e.clientY-r.top)/r.height-.5)*2);});
 stage.addEventListener('pointerleave',()=>{stage.style.setProperty('--mx',0);stage.style.setProperty('--my',0);});
 function tone(){if(!sound)return;try{audio ||= new (window.AudioContext||window.webkitAudioContext)();audio.resume();const now=audio.currentTime,osc=audio.createOscillator(),gain=audio.createGain();osc.type='sine';osc.frequency.setValueAtTime(170,now);osc.frequency.exponentialRampToValueAtTime(48,now+.2);gain.gain.setValueAtTime(.18,now);gain.gain.exponentialRampToValueAtTime(.001,now+.3);osc.connect(gain);gain.connect(audio.destination);osc.start(now);osc.stop(now+.31);}catch{sound=false;$('#sound-button').textContent='Sound unavailable';}}
 $('#sound-button').addEventListener('click',()=>{sound=!sound;$('#sound-button').textContent=sound?'Sound on':'Sound off';$('#sound-button').setAttribute('aria-pressed',String(sound));if(sound)tone();});
 const duration=900,ease='cubic-bezier(.2,.8,.25,1)';
 function sparks(){const host=$('.spark-field');for(let i=0;i<10;i++){const s=document.createElement('span');s.className='spark';host.append(s);const a=i/10*Math.PI*2,x=Math.cos(a)*210,y=Math.sin(a)*210;s.animate([{transform:'translate(0,0) scale(.3)',opacity:1},{transform:`translate(${x}px,${y}px) rotate(${i*45}deg) scale(.7)`,opacity:0}],{duration:650,easing:'cubic-bezier(.1,.6,.3,1)'}).finished.then(()=>s.remove());}}
 async function conk(){
  if(busy)return;busy=true;tone();play.classList.add('is-conked');$('#reaction-status').textContent='CONK! The cat jumps with surprise.';
  if(reduce.matches){$('.impact-word').style.opacity='1';setTimeout(()=>{$('.impact-word').style.opacity='';play.classList.remove('is-conked');busy=false;},600);return;}
  sparks();
  const a=toy.animate([{transform:'translateY(0) rotate(2deg) scale(1)'},{transform:'translateY(18px) rotate(-5deg) scale(1.07,.88)',offset:.16},{transform:'translateY(-105px) rotate(10deg) scale(.95,1.06)',offset:.42},{transform:'translateY(8px) rotate(-5deg) scale(1.04,.92)',offset:.76},{transform:'translateY(0) rotate(2deg) scale(1)'}],{duration,easing:ease});
  $('.impact-word').animate([{opacity:0,transform:'rotate(-12deg) scale(.4)'},{opacity:1,transform:'rotate(-8deg) scale(1.1)',offset:.22},{opacity:1,transform:'rotate(-12deg) scale(1)',offset:.65},{opacity:0,transform:'translateY(-25px) rotate(-12deg) scale(1)'}],{duration,easing:ease});
  $('.impact-ring').animate([{opacity:.8,transform:'scale(.4)'},{opacity:0,transform:'scale(1.8)'}],{duration:700,easing:'ease-out'});
  $('.play-machine').animate([{transform:'translateX(0)'},{transform:'translateX(-8px)'},{transform:'translateX(8px)'},{transform:'translateX(-4px)'},{transform:'translateX(0)'}],{duration:360,easing:'ease-out'});
  await a.finished;play.classList.remove('is-conked');busy=false;
 }
 $('#conk-button').addEventListener('click',conk);
 let heroBusy=false;
 $('.character-button').addEventListener('click',async()=>{if(heroBusy)return;heroBusy=true;if(reduce.matches){heroBusy=false;return;}const cat=$('.cat-float');cat.style.animationPlayState='paused';const a=cat.animate([{transform:'rotate(-3deg)'},{transform:'translateY(10px) rotate(-8deg) scale(1.06,.9)',offset:.15},{transform:'translateY(-65px) rotate(8deg)',offset:.43},{transform:'rotate(-3deg)'}],{duration:750,easing:ease});$('.hero-pop').animate([{opacity:0,transform:'scale(.5) rotate(-15deg)'},{opacity:1,transform:'scale(1) rotate(-9deg)',offset:.3},{opacity:0,transform:'translateY(-30px) scale(1.15) rotate(-9deg)'}],{duration:750,easing:ease});await a.finished;cat.style.animationPlayState='';heroBusy=false;});
 $('#copy-button').addEventListener('click',async()=>{const text=$('#contract-address').textContent;try{if(navigator.clipboard&&window.isSecureContext)await navigator.clipboard.writeText(text);else{const ta=document.createElement('textarea');ta.value=text;ta.setAttribute('readonly','');ta.style.cssText='position:fixed;left:-9999px';document.body.append(ta);ta.select();const ok=document.execCommand('copy');ta.remove();if(!ok)throw Error('Copy unavailable');}$('#copy-button').textContent='Copied!';$('#copy-status').textContent='Contract address copied.';setTimeout(()=>$('#copy-button').textContent='Copy address',2000);}catch{$('#copy-button').textContent='Select address';$('#copy-status').textContent='Copy is unavailable. Select the address to copy it.';const r=document.createRange();r.selectNodeContents($('#contract-address'));const selection=getSelection();selection.removeAllRanges();selection.addRange(r);}});
 document.addEventListener('visibilitychange',()=>{document.body.classList.toggle('offscreen',document.hidden);});
 reduce.addEventListener('change',()=>{document.documentElement.classList.toggle('js-motion',!reduce.matches);document.querySelectorAll('.reveal').forEach(el=>el.classList.add('is-visible'));requestScene();});
})();
