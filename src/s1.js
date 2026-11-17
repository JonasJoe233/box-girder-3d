// ===== s1: 渲染器、材质、工具、场地 =====
const $=s=>document.querySelector(s);
const view=$('#view');
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
view.insertBefore(renderer.domElement,view.firstChild);
const scene=new THREE.Scene();
scene.background=new THREE.Color(0xdce7f0);
scene.fog=new THREE.Fog(0xdce7f0,320,760);
const camera=new THREE.PerspectiveCamera(40,1,0.5,2500);
camera.position.set(-60,110,170);
const controls=new THREE.OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;controls.dampingFactor=.08;
controls.maxPolarAngle=Math.PI*.485;controls.minDistance=10;controls.maxDistance=520;
controls.target.set(70,5,0);
scene.add(new THREE.HemisphereLight(0xffffff,0x8d8470,.5));
const sun=new THREE.DirectionalLight(0xfff6e8,.75);
sun.position.set(20,170,110);sun.castShadow=true;
sun.shadow.mapSize.set(4096,4096);
Object.assign(sun.shadow.camera,{left:-200,right:200,top:130,bottom:-130,near:20,far:520});
sun.shadow.bias=-0.0004;
sun.target.position.set(80,0,0);scene.add(sun.target);scene.add(sun);

const mat=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.85,metalness:.05},o||{}));
const MAT={
 ground:mat(0xa9b38f),yard:mat(0xa8a49a),old:mat(0xd2cfc7),bed:mat(0x96928a),
 form:mat(0x2f6fb5,{metalness:.3,roughness:.5}),endform:mat(0x245a94,{metalness:.3,roughness:.5}),
 inner:mat(0x8d949c,{metalness:.45,roughness:.45}),red:mat(0xc8321e,{metalness:.3,roughness:.55}),
 yellow:mat(0xe8b21a,{metalness:.3,roughness:.55}),orange:mat(0xe06a1b,{metalness:.3,roughness:.5}),
 dark:mat(0x34353a,{roughness:.6}),steel:mat(0x6b7178,{metalness:.6,roughness:.4}),
 pier:mat(0xc9c5bb),rail:mat(0x50504c,{metalness:.7,roughness:.35}),earth:mat(0xb9a785),
 road:mat(0x7d7a73),tire:mat(0x1d1d1d,{roughness:.95}),white:mat(0xf2f2ee),tree:mat(0x6f9460),
 trunk:mat(0x7a5a3a),glass:mat(0x9cc3e0,{metalness:.2,roughness:.2}),jig:mat(0x3b82c4,{metalness:.3,roughness:.5}),
 bearing:mat(0x5d6670,{metalness:.6,roughness:.35}),
 mark:new THREE.MeshBasicMaterial({color:0xf2c230})
};
function box(w,h,d,m,x,y,z,p){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x||0,y||0,z||0);o.castShadow=o.receiveShadow=true;(p||scene).add(o);return o;}
function cyl(r,h,m,x,y,z,p,axis,seg){const g=new THREE.CylinderGeometry(r,r,h,seg||16);if(axis==='x')g.rotateZ(Math.PI/2);if(axis==='z')g.rotateX(Math.PI/2);const o=new THREE.Mesh(g,m);o.position.set(x||0,y||0,z||0);o.castShadow=true;(p||scene).add(o);return o;}
function grp(x,y,z,p){const g=new THREE.Group();g.position.set(x||0,y||0,z||0);(p||scene).add(g);return g;}
const PICK=[];
function tag(o,key){o.traverse(m=>{if(m.isMesh){m.userData.key=key;PICK.push(m);}});return o;}
// 竖向缆绳：一根细长方体，按两端高度拉伸
function cable(p){const c=box(.14,1,.14,MAT.dark,0,0,0,p);c.castShadow=false;return c;}
function setCable(c,x,yTop,yBot,z){const L=Math.max(.05,yTop-yBot);c.scale.y=L;c.position.set(x,(yTop+yBot)/2,z);}
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const ease=t=>t*t*(3-2*t);
const seg=(P,a,b)=>ease(clamp((P-a)/(b-a),0,1));
const mix=(a,b,t)=>a+(b-a)*t;

// ---- 地面与梁场 ----
const ground=new THREE.Mesh(new THREE.PlaneGeometry(1600,900),MAT.ground);
ground.rotation.x=-Math.PI/2;ground.position.set(100,0,0);ground.receiveShadow=true;scene.add(ground);
const pad=box(140,.1,66,MAT.yard,-27,.05,6);pad.castShadow=false;tag(pad,'yard');
// 提梁机轨道（沿 x），z=-12 与 z=24
[-12,24].forEach(z=>{box(136,.25,1.2,MAT.road,-27,.15,z);[-0.4,0.4].forEach(dz=>box(136,.2,.15,MAT.rail,-27,.38,z+dz));});
// 喂梁区地面标线
[[25,-4.2],[25,4.2]].forEach(([x,z])=>box(36,.02,.3,MAT.mark,x,.12,z));
[7,43].forEach(x=>box(.3,.02,8.4,MAT.mark,x,.12,0));
// 制梁台座
const bed=box(33.6,.5,6.4,MAT.bed,-60,.25,0);tag(bed,'bed');
// 存梁台座（目标位）与另外几孔已存放的梁做背景
function pedestal(x,z,y){[-14.6,14.6].forEach(dx=>tag(box(2,.8,7,MAT.bed,x+dx,(y||0)+.4,z),'store'));}
pedestal(-15,0);pedestal(-15,12);pedestal(20,12);
// 坡道（路基）：从喂梁区爬到桥面高度
const DECK=11.15,BEAMY=8.15;
const rs=new THREE.Shape();rs.moveTo(44,0);rs.lineTo(96,DECK);rs.lineTo(101.1,DECK);rs.lineTo(101.1,0);rs.closePath();
const rg=new THREE.ExtrudeGeometry(rs,{depth:14,bevelEnabled:false});rg.translate(0,0,-7);
const ramp=new THREE.Mesh(rg,MAT.earth);ramp.castShadow=ramp.receiveShadow=true;scene.add(ramp);tag(ramp,'ramp');
function groundY(x){if(x<44)return 0;if(x<96)return (x-44)/52*DECK;return DECK;}
// 桥墩与桥台
const XP=[101,133,165,197,229,261,293,325];
const BC=k=>(XP[k]+XP[k+1])/2; // 第 k 孔梁中心
function pier(x){const g=grp(x,0,0);box(3,7.3,6.5,MAT.pier,0,3.65,0,g);box(4.4,.85,15,MAT.pier,0,7.725,0,g);
 [-1,1].forEach(s=>[-2.3,2.3].forEach(z=>tag(box(1,.15,1,MAT.bearing,s*.7,8.075,z,g),'bearing')));tag(g,'pier');return g;}
XP.slice(1).forEach(pier);
tag(box(4,8,15,MAT.pier,101,4,0),'pier');
[-2.3,2.3].forEach(z=>box(1,.15,1,MAT.bearing,101.7,8.075,z));
// 树，给尺度感
const rnd=(s=>()=>(s=(s*16807)%2147483647)/2147483647)(7);
for(let i=0;i<70;i++){const x=-120+rnd()*460,z=(rnd()<.5?-1:1)*(48+rnd()*120);if(x>-100&&x<50&&z>-40&&z<50)continue;
 const t=grp(x,0,z);cyl(.35,3,MAT.trunk,0,1.5,0,t,null,6);const c=new THREE.Mesh(new THREE.ConeGeometry(2.2+rnd()*1.2,6+rnd()*3,7),MAT.tree);c.position.y=6;c.castShadow=true;t.add(c);}
