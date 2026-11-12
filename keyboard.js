import * as THREE from 'three';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry.js';

const root=document.querySelector('#scene');
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(32,1,.1,100);
camera.position.set(6.8,8.8,10.4);camera.lookAt(0,0,0);
const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
root.prepend(renderer.domElement);

// A photographic studio environment supplies broad, coherent moving reflections.
const studio=new THREE.Scene();studio.background=new THREE.Color('#9498a2');
function softbox(w,h,x,y,z,power,color){const panel=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(color).multiplyScalar(power),side:THREE.DoubleSide}));panel.position.set(x,y,z);panel.lookAt(0,0,0);studio.add(panel);}
softbox(8,6,0,2,9,1.4,'#d8dce5');softbox(8,5,-4,8,3,5,'#fff4df');softbox(3,7,6,4,1,3,'#e2eaff');softbox(7,1,0,4,-6,5,'#ffffff');softbox(1.5,5,-7,1,-2,2,'#ffbd7a');
const pmrem=new THREE.PMREMGenerator(renderer);const environment=pmrem.fromScene(studio,.035);scene.environment=environment.texture;pmrem.dispose();
scene.add(new THREE.HemisphereLight(0xfff5eb,0x3d4353,.85));
const light=new THREE.DirectionalLight(0xfff3e2,2.3);light.position.set(-3,8,5);light.castShadow=true;light.shadow.mapSize.set(2048,2048);Object.assign(light.shadow.camera,{left:-5,right:5,top:5,bottom:-5,near:.5,far:20});light.shadow.bias=-.0002;light.shadow.normalBias=.025;light.shadow.radius=3;scene.add(light);
const fill=new THREE.DirectionalLight(0xdde7ff,1.25);fill.position.set(5,3,-3);scene.add(fill);
const board=new THREE.Group();scene.add(board);
const metal=new THREE.MeshPhysicalMaterial({color:'#b9bdc5',metalness:.87,roughness:.26,clearcoat:.45,envMapIntensity:1.15});
const edge=new THREE.MeshPhysicalMaterial({color:'#d1d3d7',metalness:1,roughness:.16,clearcoat:.5});
const inset=new THREE.MeshPhysicalMaterial({color:'#c9cbd0',roughness:.3,metalness:.55,clearcoat:.35});
function box(w,h,d,r,mat,x=0,y=0,z=0,parent=board){const mesh=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,5,r),mat);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
// Plan-view corner radius is independent of plate thickness.
function housing(w,h,d,r,mat,y){
 const x=-w/2,z=-d/2,shape=new THREE.Shape();
 shape.moveTo(x+r,z);shape.lineTo(x+w-r,z);shape.quadraticCurveTo(x+w,z,x+w,z+r);
 shape.lineTo(x+w,z+d-r);shape.quadraticCurveTo(x+w,z+d,x+w-r,z+d);
 shape.lineTo(x+r,z+d);shape.quadraticCurveTo(x,z+d,x,z+d-r);
 shape.lineTo(x,z+r);shape.quadraticCurveTo(x,z,x+r,z);
 const bevel=Math.min(.075,h*.24);
 const geometry=new THREE.ExtrudeGeometry(shape,{depth:h-2*bevel,bevelEnabled:true,bevelThickness:bevel,bevelSize:bevel,bevelSegments:5,curveSegments:20,steps:1});
 geometry.center();geometry.rotateX(-Math.PI/2);
 const mesh=new THREE.Mesh(geometry,mat);mesh.position.y=y;mesh.castShadow=true;mesh.receiveShadow=true;board.add(mesh);return mesh;
}
housing(4.12,.54,4.12,.52,metal,-.38);
housing(4.10,.085,4.10,.51,edge,-.095);
housing(3.94,.065,3.94,.45,inset,-.025);
// Light silicone feet; no black trim or switch inserts.
for(const x of [-1.4,1.4])for(const z of [-1.4,1.4])box(.46,.08,.46,.1,inset,x,-.68,z);
box(.19,.025,.012,.005,new THREE.MeshBasicMaterial({color:'#00bffe'}),-1.3,-.37,2.064);
const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=256;
const sc=shadowCanvas.getContext('2d'),gradient=sc.createRadialGradient(128,128,20,128,128,128);gradient.addColorStop(0,'rgba(36,19,13,.36)');gradient.addColorStop(.5,'rgba(36,19,13,.18)');gradient.addColorStop(1,'rgba(36,19,13,0)');sc.fillStyle=gradient;sc.fillRect(0,0,256,256);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(6.9,6.9),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}));ground.rotation.x=-Math.PI/2;ground.position.y=-.73;scene.add(ground);

// Lofted keycaps: rounded skirt, tapered walls, rolled shoulders and a shallow dish.
function capGeometry(width,depth){
 const rings=[{w:width-.08,d:depth-.08,r:.16,y:0},{w:width,d:depth,r:.19,y:.07},{w:width-.035,d:depth-.035,r:.19,y:.16},{w:width-.24,d:depth-.24,r:.19,y:.54},{w:width-.31,d:depth-.31,r:.18,y:.63},{w:width-.40,d:depth-.40,r:.16,y:.666},{w:width-.52,d:depth-.52,r:.14,y:.657},{w:(width-.52)*.65,d:(depth-.52)*.65,r:.095,y:.636},{w:.035,d:.035,r:.012,y:.627}];
 const verts=[],indices=[],uv=[];const segments=12,N=4*(segments+1);
 rings.forEach(r=>{for(let corner=0;corner<4;corner++){const angle=corner*Math.PI/2;const cx=(corner===0||corner===3?1:-1)*(r.w/2-r.r),cz=(corner<2?1:-1)*(r.d/2-r.r);for(let j=0;j<=segments;j++){const a=angle+j/segments*Math.PI/2;const x=cx+Math.cos(a)*r.r,z=cz+Math.sin(a)*r.r;verts.push(x,r.y,z);uv.push(x/width+.5,z/depth+.5);}}});
 for(let row=0;row<rings.length-1;row++)for(let j=0;j<N;j++){const a=row*N+j,b=row*N+(j+1)%N,c=(row+1)*N+j,d=(row+1)*N+(j+1)%N;indices.push(a,c,b,b,c,d);}
 const center=verts.length/3;verts.push(0,.627,0);uv.push(.5,.5);for(let j=0;j<N;j++)indices.push((rings.length-1)*N+j,center,(rings.length-1)*N+(j+1)%N);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;
}
const ivory=new THREE.MeshPhysicalMaterial({color:'#d9d7d3',metalness:0,roughness:.25,clearcoat:.48,clearcoatRoughness:.17,envMapIntensity:.85});
const black=new THREE.MeshPhysicalMaterial({color:'#08090c',metalness:.12,roughness:.22,clearcoat:.85,clearcoatRoughness:.12});
const chrome=new THREE.MeshPhysicalMaterial({color:'#eeeeed',metalness:1,roughness:.045,clearcoat:1,envMapIntensity:1.6});
const orange=new THREE.MeshPhysicalMaterial({color:'#00bffe',metalness:.07,roughness:.23,clearcoat:.8,clearcoatRoughness:.13,iridescence:.13,iridescenceIOR:1.25,iridescenceThicknessRange:[120,210]});
const amber=new THREE.MeshPhysicalMaterial({color:'#00bffe',metalness:0,roughness:.12,transmission:.72,thickness:.5,ior:1.46,clearcoat:1,attenuationColor:new THREE.Color('#007fa9'),attenuationDistance:1.2,envMapIntensity:1.2});
const step=1.18,unit=1.06;
const layout=[{n:1,x:-step,z:-step,w:unit,mat:black,ink:'#ffffff'},{n:2,x:step/2,z:-step,w:unit+step,mat:ivory},{n:3,x:-step,z:0,w:unit,mat:ivory},{n:4,x:0,z:0,w:unit,mat:chrome},{n:5,x:step,z:0,w:unit,mat:amber,ink:'#13334a'},{n:6,x:-step/2,z:step,w:unit+step,mat:orange,ink:'#13334a'},{n:7,x:step,z:step,w:unit,mat:ivory}];
const keys=[];
function labelTexture(n,ink){const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d');ctx.fillStyle=ink||'#29282b';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='600 152px Arial';ctx.fillText(n,128,140);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t;}
for(const config of layout){
 box(config.w+.055,.055,unit+.055,.14,inset,config.x,.058,config.z);
 const stemMat=new THREE.MeshPhysicalMaterial({color:config.n===5?'#00bffe':'#d6d8dc',roughness:.32,metalness:.15});
 box(.38,.25,.38,.04,stemMat,config.x,.19,config.z);
 const group=new THREE.Group();group.position.set(config.x,.16,config.z);board.add(group);
 const cap=new THREE.Mesh(capGeometry(config.w,unit),config.mat);cap.castShadow=true;cap.receiveShadow=true;group.add(cap);
 const label=new THREE.Mesh(new THREE.PlaneGeometry(.62,.62),new THREE.MeshBasicMaterial({map:labelTexture(config.n,config.ink),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,toneMapped:false}));label.rotation.x=-Math.PI/2;label.position.y=.662;group.add(label);
 const key={...config,group,cap,down:false,position:0,velocity:0};cap.userData.key=key;keys.push(key);
}
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let active=null,tiltX=0,tiltY=0,audio;
let recoil=0,recoilV=0,rockX=0,rockXV=0,rockZ=0,rockZV=0;
function sound(up=false){try{audio??=new(window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();const now=audio.currentTime,osc=audio.createOscillator(),gain=audio.createGain();osc.type='sine';osc.frequency.setValueAtTime(up?480:220,now);osc.frequency.exponentialRampToValueAtTime(up?180:70,now+.035);gain.gain.setValueAtTime(up?.018:.035,now);gain.gain.exponentialRampToValueAtTime(.0001,now+.045);osc.connect(gain).connect(audio.destination);osc.start(now);osc.stop(now+.05);const buffer=audio.createBuffer(1,audio.sampleRate*.018,audio.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.exp(-i/(audio.sampleRate*.003));const noise=audio.createBufferSource(),ng=audio.createGain(),filter=audio.createBiquadFilter();noise.buffer=buffer;filter.type='lowpass';filter.frequency.value=up?2300:1400;ng.gain.value=up?.026:.05;noise.connect(filter).connect(ng).connect(audio.destination);noise.start();}catch{}}
function setDown(key,down){if(!key||key.down===down)return;key.down=down;sound(!down);if(!reduced.matches){recoilV+=down?-.65:.26;rockXV+=key.z*(down?.18:-.07);rockZV-=key.x*(down?.18:-.07);}}
function release(){if(active)setDown(active,false);active=null;}
function hit(event){const rect=renderer.domElement.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);return raycaster.intersectObjects(keys.map(k=>k.cap),false)[0]?.object.userData.key;}
renderer.domElement.addEventListener('pointerdown',e=>{if(e.button!==0)return;release();active=hit(e);if(active){setDown(active,true);renderer.domElement.setPointerCapture(e.pointerId);}});
for(const event of ['pointerup','pointercancel','lostpointercapture'])renderer.domElement.addEventListener(event,release);
renderer.domElement.addEventListener('pointermove',e=>{renderer.domElement.style.cursor=hit(e)?'pointer':'default';const r=root.getBoundingClientRect();tiltY=((e.clientX-r.left)/r.width-.5)*.09;tiltX=((e.clientY-r.top)/r.height-.5)*.045;});
renderer.domElement.addEventListener('pointerleave',()=>{tiltX=tiltY=0;});
function releaseAll(){release();keys.forEach(k=>k.down=false);tiltX=tiltY=0;}
window.addEventListener('blur',releaseAll);
window.addEventListener('keydown',e=>{if(e.repeat||e.metaKey||e.ctrlKey||e.altKey)return;const key=keys.find(k=>String(k.n)===e.key);if(key){e.preventDefault();setDown(key,true);}});
window.addEventListener('keyup',e=>setDown(keys.find(k=>String(k.n)===e.key),false));
for(const button of document.querySelectorAll('[data-key]')){const key=keys[Number(button.dataset.key)-1];button.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&!e.repeat){e.preventDefault();setDown(key,true);}});button.addEventListener('keyup',()=>setDown(key,false));button.addEventListener('blur',()=>setDown(key,false));}
const reduced=matchMedia('(prefers-reduced-motion: reduce)');let last=0;
function animate(t){const dt=Math.min((t-last)/1000||.016,.032);last=t;for(const key of keys){const target=key.down?-.22:0;const sub=dt/4;for(let i=0;i<4;i++){key.velocity+=((target-key.position)*(key.down?1850:1000)-key.velocity*(key.down?64:37))*sub;key.position+=key.velocity*sub;}key.group.position.y=.16+key.position;key.group.rotation.x=reduced.matches?0:key.position*key.z*.045;key.group.rotation.z=reduced.matches?0:-key.position*key.x*.045;}const ease=1-Math.exp(-dt*7);board.rotation.x+=((reduced.matches?0:tiltX)-board.rotation.x)*ease;board.rotation.y+=((reduced.matches?0:tiltY)-board.rotation.y)*ease;for(let i=0;i<4;i++){const h=dt/4;recoilV+=(-recoil*180-recoilV*17)*h;recoil+=recoilV*h;rockXV+=(-rockX*150-rockXV*16)*h;rockX+=rockXV*h;rockZV+=(-rockZ*150-rockZV*16)*h;rockZ+=rockZV*h;}board.position.y=reduced.matches?0:recoil;board.rotation.x+=reduced.matches?0:rockX;board.rotation.z=reduced.matches?0:rockZ;renderer.render(scene,camera);}
renderer.setAnimationLoop(animate);
document.addEventListener('visibilitychange',()=>{releaseAll();last=0;renderer.setAnimationLoop(document.hidden?null:animate);});
function resize(){const {width,height}=root.getBoundingClientRect();camera.aspect=width/height;const distance=Math.max(10.5,9.7/camera.aspect);camera.position.set(6.8,8.8,10.4).normalize().multiplyScalar(distance);camera.lookAt(0,-.1,0);camera.updateProjectionMatrix();renderer.setSize(width,height);}
new ResizeObserver(resize).observe(root);resize();
