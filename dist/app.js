(() => {
 'use strict';
 const $=s=>document.querySelector(s), reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const opening=$('.opening'),studio=$('.studio'),world=$('.world'),city=$('.city-frame'),friends=$('.friends'),footer=$('footer');
 const sections=[opening,world,friends,footer],animations=new Map(),cooldown=new WeakSet();
 let scene,scheduled=0,metrics,cityPointer=null;
 const clamp=v=>Math.max(0,Math.min(1,v));
 function measure(){metrics={h:innerHeight,opening:opening.offsetHeight,world:world.offsetHeight,city:city.offsetHeight,friends:friends.offsetHeight,footer:footer.offsetHeight};schedule()}
 function update(){
  scheduled=0;
  // Read all scene geometry before writing transforms.
  const a=opening.getBoundingClientRect(),b=world.getBoundingClientRect(),c=friends.getBoundingClientRect(),d=footer.getBoundingClientRect(),frame=city.getBoundingClientRect();
  const p=reduce.matches?0:clamp(-a.top/Math.max(1,metrics.opening-metrics.h));
  const w=reduce.matches?0:clamp((metrics.h-b.top)/Math.max(1,metrics.h+metrics.world));
  const f=reduce.matches?.5:clamp((metrics.h-c.top)/(metrics.h+metrics.friends));
  const end=reduce.matches?.5:clamp((metrics.h-d.top)/(metrics.h+metrics.footer));
  studio.style.setProperty('--p',p.toFixed(4));studio.dataset.progress=p.toFixed(3);scene?.progress(p);
  city.style.setProperty('--p',w.toFixed(4));friends.style.setProperty('--p',f.toFixed(4));footer.style.setProperty('--p',end.toFixed(4));
  const mx=!reduce.matches&&cityPointer?clamp(cityPointer.x/Math.max(1,frame.width))-.5:0;
  const my=!reduce.matches&&cityPointer?clamp((cityPointer.y-frame.top)/Math.max(1,frame.height))-.5:0;
  city.style.setProperty('--mx',mx.toFixed(3));city.style.setProperty('--my',my.toFixed(3));
 }
 function schedule(){if(!scheduled)scheduled=requestAnimationFrame(update)}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',measure,{passive:true});
 new ResizeObserver(measure).observe(document.querySelector('main'));new ResizeObserver(measure).observe(city);measure();
 function animate(el,frames,options,owner){if(reduce.matches)return;const a=el.animate(frames,options);animations.set(a,owner);a.finished.then(()=>animations.delete(a)).catch(()=>animations.delete(a));return a}
 const visibility=new IntersectionObserver(entries=>{for(const e of entries){e.target.classList.toggle('is-active',e.isIntersecting);if(e.isIntersecting)e.target.classList.add('is-seen');else for(const[a,owner]of animations)if(owner===e.target)a.cancel()}},{threshold:0});
 for(const section of sections)visibility.observe(section);
 document.addEventListener('visibilitychange',()=>{document.body.classList.toggle('motion-paused',document.hidden);for(const a of animations.keys())document.hidden?a.pause():a.play();if(!document.hidden)schedule()});
 reduce.addEventListener('change',()=>{for(const a of animations.keys())a.cancel();cityPointer=null;measure()});
 city.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;cityPointer={x:e.clientX,y:e.clientY};schedule()});
 city.addEventListener('pointerleave',()=>{cityPointer=null;schedule()});
 function burst(container,owner){if(!container||reduce.matches)return;[...container.children].forEach((mark,i)=>{const angle=(-150+i*30)*Math.PI/180,distance=innerWidth<700?65:110,x=Math.cos(angle)*distance,y=Math.sin(angle)*distance;animate(mark,[{opacity:0,transform:'translate(0,0) scale(.3)'},{opacity:1,transform:`translate(${x*.5}px,${y*.5}px) rotate(${i*12-30}deg) scale(1.2)`,offset:.25},{opacity:0,transform:`translate(${x}px,${y}px) rotate(${i*12-30}deg) scale(.65)`}],{duration:750,easing:'cubic-bezier(.2,.7,.3,1)'},owner)})}
 function press(button,owner){animate(button,[{transform:'scale(1)'},{transform:'scale(.93)',offset:.35},{transform:'scale(1)'}],{duration:280,easing:'ease-out'},owner)}
 function react(button,owner,action){if(cooldown.has(owner))return;cooldown.add(owner);press(button,owner);action();setTimeout(()=>cooldown.delete(owner),1050)}
 $('#nudge').addEventListener('click',()=>react($('#nudge'),opening,()=>{
  $('#reaction-status').textContent=reduce.matches?'CONK noticed you!':'CONK jumps with surprise!';
  if(reduce.matches)return;
  if(scene&&$('#renderer').dataset.ready==='true')scene.nudge();
  else animate($('.poster img'),[{transform:'translateY(0) scale(1)'},{transform:'translateY(7px) scale(1.1,.86)',offset:.12},{transform:'translateY(-65px) rotate(7deg)',offset:.45},{transform:'translateY(0) scale(1.08,.9)',offset:.82},{transform:'translateY(0) scale(1)'}],{duration:950,easing:'ease-in-out'},opening);
  animate($('.impact'),[{opacity:0,transform:'rotate(-15deg) scale(.3)'},{opacity:1,transform:'rotate(-8deg) scale(1.12)',offset:.25},{opacity:1,transform:'rotate(-8deg) scale(1)',offset:.65},{opacity:0,transform:'translateY(-35px) rotate(-8deg) scale(1.1)'}],{duration:1000,easing:'cubic-bezier(.2,.7,.3,1)'},opening);burst($('.studio .reaction-burst'),opening);
 }));
 $('#wake-city').addEventListener('click',()=>react($('#wake-city'),world,()=>{
  $('#city-status').textContent='The skyline wakes up.';city.classList.add('is-reacting');
  animate($('.city-orbit'),[{transform:'translateX(0)'},{transform:'translateX(-9px)',offset:.2},{transform:'translateX(7px)',offset:.4},{transform:'translateX(-4px)',offset:.65},{transform:'translateX(0)'}],{duration:650,easing:'ease-out'},world);
  animate($('.city-flash'),[{opacity:0},{opacity:.17,offset:.3},{opacity:0}],{duration:1000,easing:'ease-out'},world);burst($('.city-frame .reaction-burst'),world);setTimeout(()=>city.classList.remove('is-reacting'),1100);
 }));
 function duoBonk(button){react(button,friends,()=>{
  $('#duo-status').textContent=reduce.matches?'Good company!':'CONK and BONK bounce together!';
  animate($('.friend-float'),[{transform:'translateY(0) rotate(0) scale(1)'},{transform:'translateY(8px) rotate(-5deg) scale(1.07,.9)',offset:.15},{transform:'translateY(-35px) rotate(5deg) scale(.98,1.02)',offset:.45},{transform:'translateY(0) rotate(-2deg)',offset:.8},{transform:'translateY(0) rotate(0)'}],{duration:900,easing:'cubic-bezier(.25,.6,.3,1)'},friends);burst($('.friend-art .reaction-burst'),friends);
 })}
 $('#duo-bonk').addEventListener('click',()=>duoBonk($('#duo-bonk')));$('.friend-toy').addEventListener('click',()=>duoBonk($('.friend-toy')));
 $('.footer-character').addEventListener('click',()=>react($('.footer-character'),footer,()=>{
  $('#footer-status').textContent=reduce.matches?'CONK noticed you!':'One more surprise from CONK!';
  animate($('.footer-float'),[{transform:'translateY(0) rotate(0)'},{transform:'translateY(7px) scale(1.08,.88)',offset:.14},{transform:'translateY(-35px) rotate(-8deg)',offset:.45},{transform:'translateY(0) rotate(3deg)',offset:.8},{transform:'translateY(0) rotate(0)'}],{duration:800,easing:'ease-out'},footer);burst($('.footer-character .reaction-burst'),footer);
 }));
 const community=$('.footer-copy .button');for(const event of['pointerenter','focus'])community.addEventListener(event,()=>footer.classList.add('is-perked'));for(const event of['pointerleave','blur'])community.addEventListener(event,()=>footer.classList.remove('is-perked'));
 const load=()=>import('./scene.js').then(m=>m.initScene($('#renderer'),{reduce:reduce.matches})).then(s=>{scene=s;studio.classList.add('model-ready');$('#renderer').dataset.ready='true';schedule()}).catch(()=>{$('#interaction-hint').textContent='Tap for a little chaos';$('#renderer').style.pointerEvents='none';$('#renderer').removeAttribute('tabindex')});
 if('requestIdleCallback'in window)requestIdleCallback(load,{timeout:900});else setTimeout(load,450);
 $('#copy-button').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('#contract-address').textContent);$('#copy-button').textContent='Copied!';$('#copy-status').textContent='Contract address copied.';press($('#copy-button'),footer);setTimeout(()=>$('#copy-button').textContent='Copy address',2000)}catch{const range=document.createRange();range.selectNodeContents($('#contract-address'));getSelection().removeAllRanges();getSelection().addRange(range);$('#copy-status').textContent='Select and copy the contract address.';$('#copy-button').textContent='Select address'}});
})();
