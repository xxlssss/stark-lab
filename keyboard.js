import * as THREE from 'three';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry.js';

const root=document.querySelector('#scene');
// CSS tokens also drive the 3D material palette.
const brandStyles=getComputedStyle(document.documentElement);
const brand={brown:brandStyles.getPropertyValue('--brand-brown').trim(),cream:brandStyles.getPropertyValue('--brand-cream').trim(),blue:brandStyles.getPropertyValue('--brand-blue').trim(),surface:brandStyles.getPropertyValue('--brand-surface').trim(),line:brandStyles.getPropertyValue('--brand-line').trim()};
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
const metal=new THREE.MeshPhysicalMaterial({color:'#c3b5a7',metalness:.87,roughness:.26,clearcoat:.45,envMapIntensity:1.15});
const edge=new THREE.MeshPhysicalMaterial({color:'#d1d3d7',metalness:1,roughness:.16,clearcoat:.5});
const inset=new THREE.MeshPhysicalMaterial({color:brand.line,roughness:.3,metalness:.55,clearcoat:.35});
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
box(.19,.025,.012,.005,new THREE.MeshBasicMaterial({color:brand.blue}),-1.3,-.37,2.064);
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
const ivory=new THREE.MeshPhysicalMaterial({color:brand.cream,metalness:0,roughness:.25,clearcoat:.48,clearcoatRoughness:.17,envMapIntensity:.85});
const black=new THREE.MeshPhysicalMaterial({color:brand.brown,metalness:.12,roughness:.22,clearcoat:.85,clearcoatRoughness:.12});
// Neutral panoramic reflection rig for solid polished chrome.
const chromeCanvas=document.createElement('canvas');chromeCanvas.width=2048;chromeCanvas.height=1024;
const cc=chromeCanvas.getContext('2d');
const cg=cc.createLinearGradient(0,0,0,1024);
for(const [p,c] of [[0,'#f9fbff'],[.16,'#b5bac2'],[.30,'#f7f9fc'],[.39,'#ffffff'],[.43,'#303640'],[.47,'#10141b'],[.485,'#f8fbff'],[.51,'#ffffff'],[.535,'#454c57'],[.58,'#8c949f'],[.69,'#e7ebf0'],[.78,'#ffffff'],[1,'#777f89']])cg.addColorStop(p,c);
cc.fillStyle=cg;cc.fillRect(0,0,2048,1024);
// Long studio light cards and narrow dark flags are reflected around the rolled edges.
for(const [x,w] of [[180,130],[780,80],[1470,190]]){
 const g=cc.createLinearGradient(x,0,x+w,0);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.12,'rgba(255,255,255,.95)');g.addColorStop(.88,'rgba(255,255,255,.95)');g.addColorStop(1,'rgba(255,255,255,0)');cc.fillStyle=g;cc.fillRect(x,80,w,820);
}
const chromePanorama=new THREE.CanvasTexture(chromeCanvas);chromePanorama.mapping=THREE.EquirectangularReflectionMapping;chromePanorama.colorSpace=THREE.SRGBColorSpace;
const chromePmrem=new THREE.PMREMGenerator(renderer);const chromeEnvironment=chromePmrem.fromEquirectangular(chromePanorama);chromePmrem.dispose();chromePanorama.dispose();
const chrome=new THREE.MeshPhysicalMaterial({color:'#ffffff',metalness:1,roughness:.035,clearcoat:0,envMap:chromeEnvironment.texture,envMapIntensity:1.05});
const orange=new THREE.MeshPhysicalMaterial({color:brand.blue,metalness:.07,roughness:.23,clearcoat:.8,clearcoatRoughness:.13,iridescence:0,iridescenceIOR:1.25,iridescenceThicknessRange:[120,210]});
const amber=new THREE.MeshPhysicalMaterial({color:brand.blue,metalness:0,roughness:.12,transmission:.72,thickness:.5,ior:1.46,clearcoat:1,attenuationColor:new THREE.Color(brand.blue),attenuationDistance:1.2,envMapIntensity:1.2});
const serviceTop=ivory.clone();serviceTop.color.set(brand.surface);
const botCream=ivory.clone();botCream.color.set(brand.surface);
const step=1.18,unit=1.06;
const layout=[{n:1,x:-step,z:-step,w:unit,mat:black,ink:'#ffffff'},{n:2,x:step/2,z:-step,w:unit+step,mat:ivory},{n:3,x:-step/2,z:0,w:unit+step,mat:chrome},{n:5,x:step,z:0,w:unit,mat:botCream,ink:brand.brown},{n:6,x:-step/2,z:step,w:unit+step,mat:orange,ink:brand.brown},{n:7,x:step,z:step,w:unit,mat:amber}];
await document.fonts.load('600 64px Unbounded');

const keys=[];
const logoUrl = new URL('./assets/stark-logo.png?v=sl-binary', import.meta.url).href;
const backdrop = new Image();
backdrop.alt = '';
backdrop.setAttribute('aria-hidden', 'true');
Object.assign(backdrop.style, {
  position: 'absolute', zIndex: '-1', pointerEvents: 'none',
  opacity: '0', maxWidth: 'none', height: 'auto'
});
root.prepend(backdrop);
// Sole visible RGB value in assets/stark-logo.png; the binary fade changes alpha only.
const logoInk = '#8EC5FF';
const artwork = new Map([[1, logoUrl]]);
const buttons = [...root.querySelectorAll('[data-key]')];
let visibleKey = null;

let revealAnimation;
function activateBackdrop(id) {
  visibleKey = id;
  revealAnimation?.cancel();
  for (const button of buttons) {
    button.setAttribute('aria-pressed', String(Number(button.dataset.key) === visibleKey));
  }
  if (!captions.has(id)) backdrop.src = artwork.get(visibleKey);
  resize();
  backdrop.style.opacity = '0.62';
  if (!reduced.matches) {
    revealAnimation = backdrop.animate([{ opacity: 0 }, { opacity: 0.62 }],
      { duration: 280, easing: 'ease-out' });
  }
}

// A stepped outline keeps the heart crisp even on the small keycap.
function drawHeart(ctx, x, y, width) {
  const rows = ['01100110','11111111','11111111','01111110','00111100','00011000'];
  const step = width / 8;
  rows.forEach((row, j) => [...row].forEach((pixel, i) => {
    if (pixel === '1') ctx.fillRect(x + i * step, y + j * step, step, step);
  }));
}

function binaryInk(ctx, left, right, step, ink) {
  const layer = document.createElement('canvas');
  layer.width = ctx.canvas.width;
  layer.height = ctx.canvas.height;
  const paint = layer.getContext('2d');
  const fade = paint.createLinearGradient(left, 0, right, 0);
  fade.addColorStop(0, ink + '00');
  fade.addColorStop(1, ink);
  paint.fillStyle = fade;
  paint.fillRect(0, 0, layer.width, layer.height);
  paint.fillStyle = ink;
  paint.font = 'bold ' + step + 'px monospace';
  for (let y = 0, row = 0; y < layer.height + step; y += step, row++) {
    for (let x = left, col = 0; x < right; x += step * 0.72, col++) {
      paint.fillText((row * 7 + col * 3 + row * col) % 5 < 2 ? '1' : '0', x, y);
    }
  }
  ctx.save();
  ctx.globalCompositeOperation = 'source-in';
  ctx.drawImage(layer, 0, 0);
  ctx.restore();
}

await document.fonts.load('700 96px Unbounded', 'САЙТЫ TELEGRAM');
const captions = new Map([
  [2, ['САЙТЫ']],
  [3, ['ИИ АГЕНТЫ', 'ДЛЯ БИЗНЕСА']],
  [5, ['TELEGRAM', 'MINI-APP /', 'БОТЫ']]
]);

// Typeset directly at the target width; never scale an existing inscription.
function typesetCaption(lines, width) {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 3);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(2, Math.ceil(width * pixelRatio));
  const ctx = canvas.getContext('2d');
  ctx.font = '700 100px Unbounded';
  const widest = Math.max(...lines.map(line => ctx.measureText(line).width));
  const size = (canvas.width - 4) * 100 / widest;
  const leading = size * 1.06;
  canvas.height = Math.ceil(size * 1.24 + leading * (lines.length - 1));
  ctx.font = '700 ' + size + 'px Unbounded';
  ctx.fillStyle = logoInk;
  lines.forEach((line, i) => ctx.fillText(line, 2, size + i * leading));
  binaryInk(ctx, 0, canvas.width * 0.52, Math.max(3, size * 0.095), logoInk);
  return canvas.toDataURL();
}
for (const id of [6, 7]) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = logoInk;
  if (id === 6) drawHeart(ctx, 180, 293, 640);
  else {
    ctx.textAlign = 'center';
    ctx.font = 'bold 620px system-ui';
    ctx.fillText('⌘', 512, 800);
  }
  binaryInk(ctx, 105, 540, 15, logoInk);
  artwork.set(id, canvas.toDataURL());
}
for (const button of buttons) {
  button.setAttribute('aria-pressed', 'false');
  button.addEventListener('click', () => activateBackdrop(Number(button.dataset.key)));
}
function labelTexture(n, ink) {
  const canvas = document.createElement('canvas');
  canvas.width = [2,3,6].includes(n) ? 768 : 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = ctx.strokeStyle = ink || brand.brown;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (n === 1) {
    // Print the studio mark synchronously onto the cap's own texture.
    ctx.save();
    ctx.setTransform(1.15, 0, -0.228, 1.055, 71, 75);
    ctx.fillStyle = '#ffffff';
    ctx.fill(new Path2D('M 30 6 L 91 6 Q 94 6 94 9 L 94 20 Q 94 23 91 23 L 30 23 Q 20 23 20 33 Q 20 42 30 42 L 48 42 Q 74 42 74 67 Q 74 93 47 93 L 8 93 Q 5 93 5 90 L 5 79 Q 5 76 8 76 L 47 76 Q 57 76 57 67 Q 57 59 47 59 L 30 59 Q 3 59 3 33 Q 3 6 30 6 Z M 81 29 L 92 29 Q 95 29 95 32 L 95 68 Q 95 76 103 76 L 129 76 Q 132 76 132 79 L 132 90 Q 132 93 129 93 L 102 93 Q 78 93 78 69 L 78 32 Q 78 29 81 29 Z'));
    ctx.restore();
    binaryInk(ctx, 54, 130, 4, '#ffffff');
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = brand.brown;
    ctx.fillRect(0, 0, 256, 256);
  } else if (n === 2) {
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(0, 0, 96, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.lineWidth = 3;
    for (let tick = 0; tick < 36; tick++) {
      ctx.beginPath();
      ctx.moveTo(0, -87);
      ctx.lineTo(0, tick % 3 === 0 ? -71 : -79);
      ctx.stroke();
      ctx.rotate(Math.PI / 18);
    }
    ctx.rotate(Math.PI / 4);
    ctx.fill(new Path2D('M0 -82 L15 0 L-15 0 Z'));
    ctx.lineWidth = 5;
    ctx.stroke(new Path2D('M0 82 L-15 0 L15 0 Z'));
  } else if (n === 3 || n === 7) {
    ctx.font = n === 3 ? '600 148px Unbounded' : '184px system-ui';
    ctx.fillText(n === 3 ? 'AI' : '⌘', canvas.width / 2, 134);
  } else if (n === 6) {
    drawHeart(ctx, 256, 32, 256);
    binaryInk(ctx, 256, 400, 13, brand.brown);
  } else if (n === 5) {
    ctx.translate(24, 24);
    ctx.scale(8.7, 8.7);
    ctx.fill(new Path2D('M21.5 3.2 18.3 20c-.2 1-1 1.2-1.8.7l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9.1-8.2c.4-.3-.1-.5-.6-.2L5.8 13.6 1 12.1c-1-.3-1-1 .2-1.5L20 3c.9-.3 1.6.2 1.5.2Z'));
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return texture;
}
for(const config of layout){
 box(config.w+.055,.055,unit+.055,.14,inset,config.x,.058,config.z);
 const stemMat=new THREE.MeshPhysicalMaterial({color:config.n===7?brand.blue:brand.line,roughness:.32,metalness:.15});
 box(.38,.25,.38,.04,stemMat,config.x,.19,config.z);
 const group=new THREE.Group();group.position.set(config.x,.16,config.z);board.add(group);
 const capGeo=capGeometry(config.w,unit);
 // Preserve all vertices; assign cream to the dish and chrome to the skirt/shoulder.
 if(config.n===3){const rimIndices=5*4*13*6;capGeo.clearGroups();capGeo.addGroup(0,rimIndices,0);capGeo.addGroup(rimIndices,capGeo.index.count-rimIndices,1);}
 if (config.n === 1) {
   const logoMaterial = config.mat.clone();
   logoMaterial.color.set(0xffffff);
   logoMaterial.map = labelTexture(1);
   logoMaterial.map.flipY = false;
   config.mat = logoMaterial;
 }
 const cap=new THREE.Mesh(capGeo,config.n===3?[chrome,serviceTop]:config.mat);cap.castShadow=true;cap.receiveShadow=true;group.add(cap);
 if (config.n !== 1) {
  const label=new THREE.Mesh(new THREE.PlaneGeometry((config.n===6||config.n===3||config.n===2)?1.75:config.n===5?.76:.62,(config.n===6||config.n===3||config.n===2)?.58:config.n===5?.76:.62),new THREE.MeshBasicMaterial({map:labelTexture(config.n,config.ink),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,toneMapped:false}));label.rotation.x=-Math.PI/2;label.position.y=.662;group.add(label);
 }
 const key={...config,group,cap,down:false,position:0,velocity:0};cap.userData.key=key;keys.push(key);
}
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let active=null,tiltX=0,tiltY=0,audio;
let recoil=0,recoilV=0,rockX=0,rockXV=0,rockZ=0,rockZV=0;
function sound(up=false){try{audio??=new(window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();const now=audio.currentTime,osc=audio.createOscillator(),gain=audio.createGain();osc.type='sine';osc.frequency.setValueAtTime(up?480:220,now);osc.frequency.exponentialRampToValueAtTime(up?180:70,now+.035);gain.gain.setValueAtTime(up?.018:.035,now);gain.gain.exponentialRampToValueAtTime(.0001,now+.045);osc.connect(gain).connect(audio.destination);osc.start(now);osc.stop(now+.05);const buffer=audio.createBuffer(1,audio.sampleRate*.018,audio.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.exp(-i/(audio.sampleRate*.003));const noise=audio.createBufferSource(),ng=audio.createGain(),filter=audio.createBiquadFilter();noise.buffer=buffer;filter.type='lowpass';filter.frequency.value=up?2300:1400;ng.gain.value=up?.026:.05;noise.connect(filter).connect(ng).connect(audio.destination);noise.start();}catch{}}
function setDown(key,down){if(!key||key.down===down)return;key.down=down;if (down) activateBackdrop(key.n);sound(!down);if(!reduced.matches){recoilV=THREE.MathUtils.clamp(recoilV+(down?3.6:.45),-4,4);if(down){rockXV+=key.z*1.75;rockZV-=key.x*1.75;}}}
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
for(const button of document.querySelectorAll('[data-key]')){const key=keys.find(k=>k.n===Number(button.dataset.key));button.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&!e.repeat){e.preventDefault();setDown(key,true);}});button.addEventListener('keyup',()=>setDown(key,false));button.addEventListener('blur',()=>setDown(key,false));}
const reduced=matchMedia('(prefers-reduced-motion: reduce)');let last=0;
function animate(t){const dt=Math.min((t-last)/1000||.016,.032);last=t;for(const key of keys){const target=key.down?-.22:0;const sub=dt/4;for(let i=0;i<4;i++){key.velocity+=((target-key.position)*(key.down?1850:1000)-key.velocity*(key.down?64:37))*sub;key.position+=key.velocity*sub;}key.group.position.y=.16+key.position;key.group.rotation.x=reduced.matches?0:key.position*key.z*.045;key.group.rotation.z=reduced.matches?0:-key.position*key.x*.045;}const ease=1-Math.exp(-dt*7);board.rotation.y+=((reduced.matches?0:tiltY)-board.rotation.y)*ease;for(let i=0;i<4;i++){const h=dt/4;recoilV+=(-recoil*180-recoilV*12)*h;recoil+=recoilV*h;rockXV+=(-rockX*150-rockXV*16)*h;rockX+=rockXV*h;rockZV+=(-rockZ*150-rockZV*16)*h;rockZ+=rockZV*h;}board.position.y=reduced.matches?0:recoil;board.rotation.x=reduced.matches?0:THREE.MathUtils.clamp(tiltX+rockX,-.24,.24);board.rotation.z=reduced.matches?0:THREE.MathUtils.clamp(rockZ,-.24,.24);renderer.render(scene,camera);
 if (firstFrame) {
   firstFrame = false;
   window.dispatchEvent(new Event('keyboard:first-frame'));
 }
}
let firstFrame = true;
renderer.setAnimationLoop(animate);
document.addEventListener('visibilitychange',()=>{releaseAll();last=0;renderer.setAnimationLoop(document.hidden?null:animate);});
// Fit the mobile view to the case, excluding the wider shadow plane.
const caseBounds = new THREE.Box3().setFromObject(board);
function resize() {
  const {width, height} = root.getBoundingClientRect();
  if (!width || !height) return;
  camera.aspect = width / height;
  camera.zoom = 1;
  camera.clearViewOffset();
  const distance = Math.max(10.5, 9.7 / camera.aspect);
  camera.position.set(6.8, 8.8, 10.4).normalize().multiplyScalar(distance);
  camera.lookAt(0, -.1, 0);
  camera.updateMatrixWorld();
  camera.updateProjectionMatrix();

  if (matchMedia('(max-width: 700px)').matches) {
    const frame = new THREE.Box2();
    for (const x of [caseBounds.min.x, caseBounds.max.x]) {
      for (const y of [caseBounds.min.y, caseBounds.max.y]) {
        for (const z of [caseBounds.min.z, caseBounds.max.z]) {
          const point = new THREE.Vector3(x, y, z).project(camera);
          frame.expandByPoint(new THREE.Vector2(point.x, point.y));
        }
      }
    }
    const size = frame.getSize(new THREE.Vector2());
    const center = frame.getCenter(new THREE.Vector2());
    camera.zoom = 1.94 / Math.max(size.x, size.y);
    camera.setViewOffset(width, height, center.x * camera.zoom * width / 2,
      -center.y * camera.zoom * height / 2, width, height);
  }
  renderer.setSize(width, height);
  // Keep the lower right of the printed logo underneath the rear logo key.
  const logoKey = keys.find(key => key.n === 1);
  const anchor = new THREE.Vector3(logoKey.x, 0.64, logoKey.z).project(camera);
  const right = (anchor.x + 1) * width / 2 + width * 0.035;
  const bottom = (1 - anchor.y) * height / 2 + height * 0.045;
  if (captions.has(visibleKey)) {
    const telegram = visibleKey === 5;
    const textWidth = Math.round(telegram ? Math.min(width * 0.72, height * 0.70) : width * 0.88);
    backdrop.src = typesetCaption(captions.get(visibleKey), textWidth);
    backdrop.style.width = textWidth + 'px';
    if (telegram) {
      const edge = new THREE.Vector3(logoKey.x - 0.4, 0.78, logoKey.z + 0.28).project(camera);
      backdrop.style.left = Math.max(width * 0.025, (edge.x + 1) * width / 2 - textWidth * 0.51) + 'px';
      backdrop.style.top = Math.max(0, (1 - edge.y) * height / 2 - textWidth * 0.32) + 'px';
    } else {
      backdrop.style.left = (width * 0.035) + 'px';
      backdrop.style.top = Math.max(0, bottom - height * 0.32) + 'px';
    }
    return;
  }
  const side = Math.min(width * 0.73, height * 0.8, right / 0.77, bottom / 0.63);
  backdrop.style.width = side + 'px';
  backdrop.style.left = (right - side * 0.87) + 'px';
  backdrop.style.top = (bottom - side * 0.81) + 'px';
}
new ResizeObserver(resize).observe(root);resize();


const panels = [...document.querySelectorAll('[data-page]')];
function renderPage() {
  const requested = location.hash.slice(1);
  const page = panels.some(panel => panel.dataset.page === requested) ? requested : 'home';
  for (const panel of panels) panel.hidden = panel.dataset.page !== page;
  for (const link of document.querySelectorAll('.site-header nav a')) {
    if (link.hash === '#' + page) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
}
function navigateTo(page) {
  if (location.hash !== '#' + page) location.hash = page;
  else document.getElementById(page)?.scrollIntoView({behavior: reduced.matches ? 'instant' : 'smooth'});
  renderPage();
}
window.addEventListener('hashchange', renderPage);
renderPage();
