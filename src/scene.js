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
 const model=gltf.scene,box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
 const scale=3.65/size.y;model.scale.setScalar(scale);model.position.set(-center.x*scale,-box.min.y*scale,-center.z*scale);
 model.traverse(o=>{if(o.isMesh){o.material.emissiveIntensity=.025;o.material.color.setRGB(.62,.62,.62);o.material.roughnessMap=null;o.material.roughness=.72;o.material.metalness=0;o.material.side=THREE.FrontSide}});group.add(model);
 // A shallow sculptural ring frames the character without covering its face.
 const ring=new THREE.Mesh(new THREE.TorusGeometry(2.3,.2,16,72),new THREE.MeshStandardMaterial({color:0xffe485,roughness:.55}));ring.position.set(0,2,-1.35);ring.rotation.x=.15;scene.add(ring);
 const tile=new THREE.PlaneGeometry(22,22,40,40),pos=tile.attributes.position;
 for(let i=0;i<pos.count;i++){const x=pos.getX(i),y=pos.getY(i);pos.setZ(i,Math.pow(Math.max(0,Math.abs(y)-4),2)*.035+Math.sin(x*.2)*.05)}tile.computeVertexNormals();
 const floor=new THREE.Mesh(tile,new THREE.ShaderMaterial({uniforms:{opacity:{value:.6}},vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform float opacity;varying vec2 vUv;void main(){vec2 p=vUv*26.;float c=mod(floor(p.x)+floor(p.y),2.);vec3 a=vec3(.94,.74,.11),b=vec3(1.,.84,.28);float fade=smoothstep(.09,.4,vUv.y);gl_FragColor=vec4(mix(a,b,c),fade*opacity);}',transparent:true,depthWrite:false}));floor.rotation.x=-Math.PI/2;floor.position.y=-.035;scene.add(floor);
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=128;shadowCanvas.height=128;const ctx=shadowCanvas.getContext('2d'),g=ctx.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(57,32,0,.42)');g.addColorStop(1,'rgba(57,32,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,128,128);
 const shadow=new THREE.Mesh(new THREE.PlaneGeometry(3.7,2.8),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.015;scene.add(shadow);
 host.append(renderer.domElement);
 let target=0,p=0,drag=0,targetDrag=0,down=false,startX=0,startDrag=0,kick=-1000,active=true,raf=0,last=0,time=0,mobile=false;
 const look=new THREE.Vector3(),desired=new THREE.Vector3();
 function resize(){const w=host.clientWidth,h=host.clientHeight;mobile=w<700;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();renderOnce()}
 function draw(dt){p=THREE.MathUtils.damp(p,target,5,dt);drag=THREE.MathUtils.damp(drag,targetDrag,8,dt);const elapsed=reduce?1000:time-kick,bounce=elapsed>=0&&elapsed<1.15?Math.sin(Math.min(1,elapsed/1.15)*Math.PI)*(mobile?.6:.95):0;
  group.rotation.y=-.16+p*1.25+drag+(reduce?0:Math.sin(time*.7)*.07);group.rotation.z=reduce?0:Math.sin(time*.8)*.012;
  group.position.set(mobile?-.2+p*.1:.35+p*1.3,bounce,0);group.scale.setScalar(1);if(elapsed>=0&&elapsed<.16)group.scale.set(1.05,1-elapsed*.7,1.05);
  desired.set(mobile?.2+p*.5:1.3+p*.5,mobile?2.5-p*.2:2.75-p*.3,mobile?13.2-p*.4:8.5-p*.45);camera.position.copy(desired);look.set(mobile?0:p*.2,1.6,0);camera.lookAt(look);
  ring.rotation.z=p*.8+(reduce?0:time*.025);ring.position.x=p*.5;ring.scale.setScalar(1-p*.12);floor.material.uniforms.opacity.value=.6*(1-p);shadow.position.x=group.position.x;shadow.scale.setScalar(1+bounce*.15);shadow.material.opacity=1-bounce*.5;
  renderer.render(scene,camera);
 }
 function renderOnce(){draw(.016)}
 function frame(now){raf=0;if(!active||document.hidden)return;const dt=Math.min(.04,(now-last)/1000||.016);last=now;time+=dt;draw(dt);if(!reduce||Math.abs(p-target)>.001||time-kick<1.2)raf=requestAnimationFrame(frame)}
 function wake(){if(active&&!document.hidden&&!raf){last=performance.now();raf=requestAnimationFrame(frame)}}
 const io=new IntersectionObserver(([e])=>{active=e.isIntersecting;if(active)wake();else{cancelAnimationFrame(raf);raf=0}},{threshold:0});io.observe(host);
 new ResizeObserver(resize).observe(host);document.addEventListener('visibilitychange',wake);
 matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{reduce=e.matches;if(reduce){target=0;targetDrag=0}wake()});
 host.addEventListener('pointerdown',e=>{down=true;startX=e.clientX;startDrag=targetDrag;host.setPointerCapture(e.pointerId);host.style.cursor='grabbing'});
 host.addEventListener('pointermove',e=>{if(down){targetDrag=startDrag+(e.clientX-startX)*.008;wake()}});
 host.addEventListener('pointerup',()=>{down=false;host.style.cursor='grab'});host.addEventListener('pointercancel',()=>down=false);host.style.cursor='grab';
 renderer.domElement.addEventListener('webglcontextlost',()=>{cancelAnimationFrame(raf);host.parentElement.classList.remove('model-ready');host.style.pointerEvents='none'});
 resize();wake();
 return {progress(v){target=reduce?0:v;wake()},nudge(){if(!reduce){kick=time;targetDrag+=.32;wake()}}};
}
