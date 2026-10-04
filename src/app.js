(() => {
 'use strict';
 const $=s=>document.querySelector(s),reduce=matchMedia('(prefers-reduced-motion: reduce)'),phone=matchMedia('(max-width:700px)');
 const opening=$('.opening'),studio=$('.studio'),world=$('.world'),city=$('.city-frame'),friends=$('.friends'),footer=$('footer');
 const sections=[opening,world,friends,footer],animations=new Map(),cooldown=new WeakSet();
 let scene,footerScene,sceneModule,scheduled=0,metrics,cityPointer=null;
 const clamp=v=>Math.max(0,Math.min(1,v)),phase=(v,a,b)=>clamp((v-a)/(b-a)),smooth=v=>v*v*(3-2*v);
 function measure(){metrics={h:innerHeight,opening:opening.offsetHeight,studio:studio.offsetHeight,world:world.offsetHeight,city:city.offsetHeight,friends:friends.offsetHeight,friendStage:$('.friend-stage').offsetHeight,footer:footer.offsetHeight};schedule()}
 function update(){
  scheduled=0;
  const a=opening.getBoundingClientRect(),b=world.getBoundingClientRect(),c=friends.getBoundingClientRect(),d=footer.getBoundingClientRect(),frame=city.getBoundingClientRect();
  const p=reduce.matches?0:clamp(-a.top/Math.max(1,metrics.opening-metrics.studio));
  const w=reduce.matches?0:phone.matches?clamp((metrics.h-b.top)/(metrics.h+metrics.world)):clamp(-b.top/Math.max(1,metrics.world-metrics.city));
  const f=reduce.matches?1:clamp(-c.top/Math.max(1,metrics.friends-metrics.friendStage));
  const end=reduce.matches?1:smooth(phase((metrics.h-d.top)/Math.min(metrics.h,metrics.footer),.04,.85)),arrive=reduce.matches?1:smooth(clamp((metrics.h-c.top)/metrics.h));
  studio.style.setProperty('--p',p.toFixed(4));studio.dataset.progress=p.toFixed(3);scene?.progress(p);footerScene?.progress(end);
  $('.hero-actions').inert=p>.38;$('.scroll-cue').inert=p>.48;
  const set=(el,key,value)=>el.style.setProperty(key,Number(value).toFixed(4));
  set(city,'--p',w);set(city,'--push',Math.sin(w*Math.PI));set(city,'--streak',Math.sin(phase(w,.2,.65)*Math.PI));set(friends,'--p',f);set(friends,'--arrive',arrive);set(friends,'--settle',smooth(phase(f,0,.24)));set(footer,'--p',end);set(studio,'--story',smooth(phase(p,.23,.43)));
  footer.dataset.progress=end.toFixed(3);city.dataset.progress=w.toFixed(3);friends.dataset.progress=f.toFixed(3);
  const mx=!reduce.matches&&cityPointer?clamp(cityPointer.x/Math.max(1,frame.width))-.5:0,my=!reduce.matches&&cityPointer?clamp((cityPointer.y-frame.top)/Math.max(1,frame.height))-.5:0;
  set(city,'--mx',mx);set(city,'--my',my);
 }
 function schedule(){if(!scheduled)scheduled=requestAnimationFrame(update)}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',measure,{passive:true});
 new ResizeObserver(measure).observe(document.querySelector('main'));new ResizeObserver(measure).observe(city);measure();
 function animate(el,frames,options,owner){if(!el||reduce.matches)return;const a=el.animate(frames,options);animations.set(a,owner);a.finished.then(()=>animations.delete(a)).catch(()=>animations.delete(a));return a}
 const visibility=new IntersectionObserver(entries=>{for(const e of entries){e.target.classList.toggle('is-active',e.isIntersecting);if(e.isIntersecting)e.target.classList.add('is-seen');else for(const[a,owner]of animations)if(owner===e.target)a.cancel()}},{threshold:0});
 sections.forEach(s=>visibility.observe(s));
 city.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'){cityPointer={x:e.clientX,y:e.clientY};schedule()}});city.addEventListener('pointerleave',()=>{cityPointer=null;schedule()});
 const films=[...document.querySelectorAll('video[data-src]')].map(video=>({video,film:video.closest('.film'),loaded:false,near:false,visible:false,failed:false}));
 function syncFilm(record){const {video}=record;if(reduce.matches||document.hidden||!record.visible){video.pause();return}if(!record.loaded||record.failed)return;video.play().catch(()=>{video.dataset.blocked='true'})}
 function loadFilm(record){if(record.loaded||record.failed||reduce.matches)return;record.loaded=true;record.video.muted=true;record.video.src=record.video.dataset.src;record.video.load();syncFilm(record)}
 const nearFilms=new IntersectionObserver(entries=>{entries.forEach(e=>{const r=films.find(x=>x.video===e.target);r.near=e.isIntersecting;if(r.near)loadFilm(r)})},{rootMargin:'600px 0px',threshold:0});
 const activeFilms=new IntersectionObserver(entries=>{entries.forEach(e=>{const r=films.find(x=>x.video===e.target);r.visible=e.isIntersecting;syncFilm(r)})},{threshold:.01});
 films.forEach(r=>{
  nearFilms.observe(r.video);activeFilms.observe(r.video);
  r.video.addEventListener('playing',()=>{const ready=()=>{r.film.classList.add('film-ready');r.video.dataset.ready='true';delete r.video.dataset.blocked};if('requestVideoFrameCallback'in r.video)r.video.requestVideoFrameCallback(ready);else ready()});
  r.video.addEventListener('error',()=>{r.failed=true;r.film.classList.remove('film-ready');r.video.dataset.ready='false'});
 });
 function replay(selector){const r=films.find(x=>x.video.matches(selector));if(!r||reduce.matches)return;loadFilm(r);if(!r.failed){r.video.currentTime=0;r.video.play().catch(()=>{});r.video.playbackRate=1.12;setTimeout(()=>{r.video.playbackRate=1},1800)}}
 document.addEventListener('visibilitychange',()=>{document.body.classList.toggle('motion-paused',document.hidden);for(const a of animations.keys())document.hidden?a.pause():a.play();films.forEach(syncFilm);if(!document.hidden)schedule()});
 reduce.addEventListener('change',()=>{for(const a of animations.keys())a.cancel();cityPointer=null;films.forEach(r=>{if(r.near)loadFilm(r);if(reduce.matches)r.film.classList.remove('film-ready');syncFilm(r)});measure()});
 function burst(container,owner){if(!container||reduce.matches)return;[...container.children].forEach((mark,i)=>{const angle=(-150+i*30)*Math.PI/180,distance=innerWidth<700?65:110,x=Math.cos(angle)*distance,y=Math.sin(angle)*distance;animate(mark,[{opacity:0,transform:'translate(0,0) scale(.3)'},{opacity:1,transform:`translate(${x*.5}px,${y*.5}px) rotate(${i*12-30}deg) scale(1.2)`,offset:.25},{opacity:0,transform:`translate(${x}px,${y}px) rotate(${i*12-30}deg) scale(.65)`}],{duration:750,easing:'cubic-bezier(.2,.7,.3,1)'},owner)})}
 function press(button,owner){animate(button,[{transform:'scale(1)'},{transform:'scale(.93)',offset:.35},{transform:'scale(1)'}],{duration:280,easing:'ease-out'},owner)}
 function react(button,owner,action){if(cooldown.has(owner))return;cooldown.add(owner);press(button,owner);action();setTimeout(()=>cooldown.delete(owner),1050)}
 $('#nudge').addEventListener('click',()=>react($('#nudge'),opening,()=>{
  $('#reaction-status').textContent=reduce.matches?'CONK noticed you!':'CONK jumps with surprise!';if(reduce.matches)return;
  if(scene&&$('#renderer').dataset.ready==='true')scene.nudge();else animate($('.poster img'),[{transform:'translateY(0) scale(1)'},{transform:'translateY(7px) scale(1.1,.86)',offset:.12},{transform:'translateY(-65px) rotate(7deg)',offset:.45},{transform:'translateY(0) scale(1.08,.9)',offset:.82},{transform:'translateY(0) scale(1)'}],{duration:950,easing:'ease-in-out'},opening);
  animate($('.impact'),[{opacity:0,transform:'rotate(-15deg) scale(.3)'},{opacity:1,transform:'rotate(-8deg) scale(1.12)',offset:.25},{opacity:1,transform:'rotate(-8deg) scale(1)',offset:.65},{opacity:0,transform:'translateY(-35px) rotate(-8deg) scale(1.1)'}],{duration:1000,easing:'cubic-bezier(.2,.7,.3,1)'},opening);burst($('.studio .reaction-burst'),opening);
 }));
 $('#wake-city').addEventListener('click',()=>react($('#wake-city'),world,()=>{$('#city-status').textContent=reduce.matches?'CONK and BONK on the rooftop.':'CONK and BONK react to the skyline.';replay('.city-video')}));
 function duoBonk(button){react(button,friends,()=>{$('#duo-status').textContent=reduce.matches?'Good company!':'CONK and BONK play together!';replay('.friend-video');burst($('.friend-art .reaction-burst'),friends)})}
 $('#duo-bonk').addEventListener('click',()=>duoBonk($('#duo-bonk')));$('.friend-toy').addEventListener('click',()=>duoBonk($('.friend-toy')));
 $('.footer-character').addEventListener('click',()=>react($('.footer-character'),footer,()=>{$('#footer-status').textContent=reduce.matches?'CONK noticed you!':'One more surprise from CONK!';footerScene?.nudge();burst($('.footer-character .reaction-burst'),footer)}));
 const module=()=>sceneModule??=import('./scene.js?v=scene-version');
 const load=()=>module().then(m=>m.initScene($('#renderer'),{reduce:reduce.matches})).then(s=>{scene=s;studio.classList.add('model-ready');$('#renderer').dataset.ready='true';schedule()}).catch(()=>{$('#interaction-hint').textContent='Tap for a little chaos';$('#renderer').style.pointerEvents='none';$('#renderer').removeAttribute('tabindex')});
 if('requestIdleCallback'in window)requestIdleCallback(load,{timeout:900});else setTimeout(load,450);
 const footerLoader=new IntersectionObserver(entries=>{if(!entries.some(e=>e.isIntersecting))return;footerLoader.disconnect();module().then(m=>m.initFooter($('#footer-renderer'),{reduce:reduce.matches})).then(s=>{footerScene=s;$('.footer-float').classList.add('footer-model-ready');$('#footer-renderer').dataset.ready='true';schedule()}).catch(()=>{$('#footer-renderer').dataset.ready='false'})},{rootMargin:'450px 0px'});footerLoader.observe(footer);
})();
