import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
export async function initScene(host,{reduce=false}={}){
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(36,1,.1,60);
 scene.add(new THREE.HemisphereLight(0xfff9e9,0x9a6915,1.5));
 const key=new THREE.DirectionalLight(0xfff5dc,2.2);key.position.set(-4,6,5);scene.add(key);
 const rim=new THREE.DirectionalLight(0xffffff,2.4);rim.position.set(4,3,-3);scene.add(rim);
 const group=new THREE.Group();scene.add(group);
 const gltf=await new GLTFLoader().loadAsync('assets/conk.glb');
 reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const model=gltf.scene,box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
 const scale=3.65/size.y;model.scale.setScalar(scale);model.position.set(-center.x*scale,-box.min.y*scale,-center.z*scale);
 model.traverse(o=>{if(o.isMesh){o.material.emissiveIntensity=.025;o.material.color.setRGB(.62,.62,.62);o.material.roughnessMap=null;o.material.roughness=.72;o.material.metalness=0;o.material.side=THREE.FrontSide}});group.add(model);
 // A shallow sculptural ring frames the character without covering its face.
 const ring=new THREE.Mesh(new THREE.TorusGeometry(2.3,.2,16,72),new THREE.MeshStandardMaterial({color:0xffe485,roughness:.55}));ring.position.set(0,2,-1.35);ring.rotation.x=.15;scene.add(ring);
 const accents=new THREE.MeshStandardMaterial({color:0xe93733,roughness:.5});
 for(let i=0;i<3;i++){const arc=new THREE.Mesh(new THREE.TorusGeometry(2.3,.215,8,12,.32),accents);arc.rotation.z=i*Math.PI*2/3;ring.add(arc)}
 const tile=new THREE.PlaneGeometry(22,22,40,40),pos=tile.attributes.position;
 for(let i=0;i<pos.count;i++){const x=pos.getX(i),y=pos.getY(i);pos.setZ(i,Math.pow(Math.max(0,Math.abs(y)-4),2)*.035+Math.sin(x*.2)*.05)}tile.computeVertexNormals();
 const floor=new THREE.Mesh(tile,new THREE.ShaderMaterial({uniforms:{opacity:{value:.6}},vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform float opacity;varying vec2 vUv;void main(){vec2 p=vUv*26.;float c=mod(floor(p.x)+floor(p.y),2.);vec3 a=vec3(.94,.74,.11),b=vec3(1.,.84,.28);float fade=smoothstep(.09,.4,vUv.y);gl_FragColor=vec4(mix(a,b,c),fade*opacity);}',transparent:true,depthWrite:false}));floor.rotation.x=-Math.PI/2;floor.position.y=-.035;scene.add(floor);
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=128;shadowCanvas.height=128;const ctx=shadowCanvas.getContext('2d'),g=ctx.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(57,32,0,.42)');g.addColorStop(1,'rgba(57,32,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,128,128);
 const shadow=new THREE.Mesh(new THREE.PlaneGeometry(3.7,2.8),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.015;scene.add(shadow);
 host.append(renderer.domElement);
 let target=0,p=0,drag=0,targetDrag=0,pointerId=null,startX=0,startDrag=0,kick=-1000,active=true,raf=0,last=0,time=0,mobile=false,dead=false,hoverX=0,hoverY=0,lookX=0,lookY=0;
 const look=new THREE.Vector3(),desired=new THREE.Vector3();
 const beat=(v,a,b)=>THREE.MathUtils.clamp((v-a)/(b-a),0,1),ease=v=>v*v*(3-2*v);
 function resize(){const w=host.clientWidth,h=host.clientHeight;mobile=w<=700;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();renderOnce()}
 function draw(dt){p=THREE.MathUtils.damp(p,target,5,dt);drag=THREE.MathUtils.damp(drag,targetDrag,8,dt);lookX=THREE.MathUtils.damp(lookX,hoverX,5,dt);lookY=THREE.MathUtils.damp(lookY,hoverY,5,dt);
  const elapsed=reduce?1000:time-kick,flight=elapsed>=.14&&elapsed<.78?Math.sin((elapsed-.14)/.64*Math.PI):0;
  const anticipation=elapsed>=0&&elapsed<.14?Math.sin(elapsed/.14*Math.PI):0,landing=elapsed>=.78&&elapsed<1.02?Math.sin((elapsed-.78)/.24*Math.PI):0;
  const leap=reduce?0:Math.sin(beat(p,.28,.7)*Math.PI),windup=reduce?0:Math.sin(beat(p,.16,.28)*Math.PI),touchdown=reduce?0:Math.sin(beat(p,.7,.81)*Math.PI),turn=ease(beat(p,.22,.75));
  const bounce=flight*(mobile?.7:1.05)+leap*(mobile?.85:1.25),idle=reduce?0:.1*Math.pow(Math.sin(time*1.1),2),squash=.2*anticipation+.16*landing+.21*windup+.17*touchdown;
  group.rotation.y=-.16+turn*(Math.PI*2+.25)+drag+(reduce?0:Math.sin(time)*.12+lookX*.22+flight*.3);group.rotation.z=reduce?0:Math.sin(time*1.25)*.025-leap*.18-flight*.07;group.rotation.x=reduce?0:lookY*.07-leap*.12;
  const travel=ease(beat(p,.12,.72));
  group.position.set((mobile?-.25+travel*.15:.35+travel*1.6)+(reduce?0:Math.sin(time*.65)*.08),bounce+idle,leap*.65);group.scale.set(1+squash*.45,1-squash,1+squash*.45);
  desired.set(mobile?.2+travel*.25:1.3+travel*.4,mobile?2.5:2.75,(mobile?14:8.5)+bounce*.95+travel*(mobile?.6:.3));camera.position.copy(desired);look.set(mobile?0:travel*.2,1.6+bounce*.35,0);camera.lookAt(look);
  ring.rotation.z=p*Math.PI*1.6+(reduce?0:time*.12);ring.rotation.y=reduce?0:Math.sin(time*.6)*.08+leap*.65;ring.rotation.x=.15+leap*.45;ring.position.x=travel*(mobile?.6:1.4);ring.scale.setScalar((1-p*.1)*(1+leap*.16+flight*.1));floor.material.uniforms.opacity.value=.6*(1-p);floor.rotation.z=p*.16;shadow.position.x=group.position.x;shadow.scale.setScalar(1-bounce*.12);shadow.material.opacity=Math.max(.12,1-bounce*.5);
  renderer.render(scene,camera);
 }
 function renderOnce(){draw(.016)}
 function frame(now){raf=0;if(!active||document.hidden||dead)return;const dt=Math.min(.04,(now-last)/1000||.016);last=now;time+=dt;draw(dt);if(!reduce||Math.abs(p-target)>.001||Math.abs(drag-targetDrag)>.001)raf=requestAnimationFrame(frame)}
 function wake(){if(active&&!document.hidden&&!raf&&!dead){last=performance.now();raf=requestAnimationFrame(frame)}}
 const io=new IntersectionObserver(([e])=>{active=e.isIntersecting;if(active)wake();else{cancelAnimationFrame(raf);raf=0}},{threshold:0});io.observe(host);
 new ResizeObserver(resize).observe(host);document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0}else wake()});
 matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{reduce=e.matches;if(reduce){target=p=0;targetDrag=drag=0;hoverX=hoverY=lookX=lookY=0;kick=-1000}renderOnce();wake()});
 const release=()=>{pointerId=null;host.style.cursor='grab'};
 host.addEventListener('pointerdown',e=>{if(!e.isPrimary||e.button!==0)return;pointerId=e.pointerId;startX=e.clientX;startDrag=targetDrag;host.setPointerCapture(e.pointerId);host.style.cursor='grabbing'});
 host.addEventListener('pointermove',e=>{if(pointerId===e.pointerId){targetDrag=startDrag+(e.clientX-startX)*.008;wake()}else if(e.pointerType==='mouse'&&!reduce){hoverX=e.clientX/host.clientWidth-.5;hoverY=e.clientY/host.clientHeight-.5;wake()}});
 host.addEventListener('pointerleave',()=>{hoverX=hoverY=0});
 host.addEventListener('pointerup',release);host.addEventListener('pointercancel',release);host.addEventListener('lostpointercapture',release);host.style.cursor='grab';
 host.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();targetDrag+=e.key==='ArrowLeft'?-.3:.3;wake()}});
 renderer.domElement.addEventListener('webglcontextlost',()=>{dead=true;cancelAnimationFrame(raf);raf=0;host.parentElement.classList.remove('model-ready');host.dataset.ready='false';host.style.pointerEvents='none';release();host.removeAttribute('tabindex');host.setAttribute('aria-label','CONK character preview');const hint=document.querySelector('#interaction-hint');if(hint)hint.textContent='Tap for a little chaos'});
 resize();wake();
 return {progress(v){target=reduce?0:v;wake()},nudge(){if(!reduce){kick=time;targetDrag+=.32;wake()}}};
}
