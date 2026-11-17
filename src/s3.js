// ===== s3: 龙门吊、提梁机、运梁车、架桥机、汽车吊、平板车 =====
// 钢筋笼用的小龙门吊（黄色），横跨胎具和台座
const smallG=[-66,-54].map(x=>{const g=grp(x,0,0);
 [-8,20].forEach(z=>{[-1.6,1.6].forEach(dx=>box(.6,10.5,.6,MAT.yellow,dx,5.25,z,g));box(4,.6,1.2,MAT.dark,0,.3,z,g);});
 box(1.4,1.2,29,MAT.yellow,0,11,6,g);
 const tr=box(2.2,.9,2,MAT.dark,0,12,0,g);const c=cable(g);tag(g,'smallg');return {g,tr,c};});
const spreaderC=box(BL-1,.35,.5,MAT.yellow,-60,6,12);
function setSmallG(z,yTop){smallG.forEach(o=>{o.tr.position.z=z;setCable(o.c,0,11.5,yTop+.35,z);});spreaderC.position.set(-60,yTop+.18,z);}

// 提梁机（红色，450 t ×2）
function bigGantry(){const g=grp(0,0,0);const o={g};
 const leg=z=>{const L=grp(0,9,z,g);[-4,4].forEach(dx=>{const p=box(1.3,17.2,1.3,MAT.red,dx,0,0,L);p.rotation.z=dx>0?.12:-.12;});
  box(11,1,1.6,MAT.red,0,-8.1,0,L);[-4.5,4.5].forEach(dx=>box(2,1.1,1.4,MAT.dark,dx,-8.45,0,L));box(3,1,1.6,MAT.red,0,8.4,0,L);return L;};
 o.legA=leg(-12);o.legB=leg(24);
 o.gird=grp(0,18.9,6,g);[-1.3,1.3].forEach(dx=>box(1.6,2.2,38.5,MAT.red,dx,0,0,o.gird));
 [-19,19].forEach(z=>box(4.2,1.6,1,MAT.red,0,0,z,o.gird));
 o.troll=grp(0,20.6,0,g);box(4.4,1.2,5,MAT.dark,0,0,0,o.troll);box(2,1,2,MAT.red,0,1,0,o.troll);
 o.hook=grp(0,8,0,g);box(1.6,1,2.4,MAT.yellow,0,1.1,0,o.hook);box(1,.5,9,MAT.yellow,0,.25,0,o.hook);
 o.cab=[-.5,.5].map(dz=>cable(g));
 tag(g,'gantry');return o;}
const G=[bigGantry(),bigGantry()];
function setGantry(o,x,hookY,z){o.g.position.x=x;z=z||0;o.troll.position.z=z;o.hook.position.set(0,hookY,z);
 o.cab.forEach((c,i)=>setCable(c,0,20,hookY+1.6,z+(i?.5:-.5)));}

// 运梁车（橙色，多轴轮胎车）
const TTOP=2.3;
const trG=grp(25,0,0);
(function(){const tg=new THREE.CylinderGeometry(.55,.55,.45,14);tg.rotateX(Math.PI/2);
 for(let i=0;i<16;i++){const x=-15.5+i*31/15;[-2.6,-1.6,1.6,2.6].forEach(z=>{const t=new THREE.Mesh(tg,MAT.tire);t.position.set(x,.55,z);t.castShadow=true;trG.add(t);});}
 box(34,1,6.2,MAT.orange,0,1.55,0,trG);box(34,.3,6.4,MAT.dark,0,1.0,0,trG);
 box(1.4,.25,5,MAT.dark,14.5,2.17,0,trG);
 const cab=grp(18.4,0,0,trG);box(2.6,2.6,6,MAT.orange,0,2.3,0,cab);box(.1,1,5,MAT.glass,1.32,2.9,0,cab);
 })();
tag(trG,'transporter');
// 后支点做成可滑动的驮梁台车，喂梁时托着梁尾往前送
const trRear=box(2,.25,5,MAT.yellow,-14.5,2.17,0,trG);
function setTransporter(x){const f=groundY(x+13),r=groundY(x-13);trG.position.set(x,(f+r)/2,0);trG.rotation.z=Math.atan2(f-r,26);}

// 架桥机（红色），坐标直接用世界坐标
const erG=grp(0,0,0);const GY=19.6;
[-7,7].forEach(z=>box(70,2.4,1.4,MAT.red,171,GY,z,erG));
for(let x=137;x<=205;x+=8.5)box(1,1,14,MAT.red,x,GY+.7,0,erG);
const portal=(x,y0,p,cross)=>{[-7,7].forEach(z=>box(1.2,18.4-y0,1.2,MAT.red,x,(18.4+y0)/2,z,p));if(cross)box(1.4,1,15.4,MAT.red,x,18.1,0,p);[-7,7].forEach(z=>box(2.4,.7,1.8,MAT.dark,x,y0+.35,z,p));};
portal(139,DECK,erG,1);portal(165,8.0,erG,0);
const frontLeg=grp(197,18.4,0,erG);
[-7,7].forEach(z=>box(1.2,10.4,1.2,MAT.red,0,-5.2,z,frontLeg));[-7,7].forEach(z=>box(2.2,.6,1.8,MAT.dark,0,-10.1,z,frontLeg));
box(2,4,3,MAT.dark,206,GY,0,erG); // 前端配重/电控
function trolley(){const t=grp(160,21.5,0,erG);box(3,1.4,16,MAT.yellow,0,0,0,t);[-7,7].forEach(z=>box(2,.8,1.8,MAT.dark,0,-.9,z,t));
 const h=grp(0,0,0,erG);box(1.2,.9,2,MAT.yellow,0,1.1,0,h);box(1,.45,9,MAT.yellow,0,.22,0,h);
 const cs=[-.6,.6].map(()=>cable(erG));return {t,h,cs};}
const TF=trolley(),TR=trolley();
tag(erG,'erector');
function setTrolley(o,x,hookY,dx){o.t.position.x=x;o.h.position.set(x,hookY,0);o.cs.forEach((c,i)=>setCable(c,x,20.8,hookY+1.5,i?.6:-.6));}

// 汽车吊（黄色）
const crG=grp(25,0,-30);
box(13,2.2,3.2,MAT.yellow,0,1.9,0,crG);box(2.6,2.4,3,MAT.yellow,7.5,2.2,0,crG);box(.1,1,2.6,MAT.glass,8.85,2.6,0,crG);
(function(){const tg=new THREE.CylinderGeometry(.6,.6,.5,12);tg.rotateX(Math.PI/2);[-5,-3,1,3,6.5].forEach(x=>[-1.4,1.4].forEach(z=>{const t=new THREE.Mesh(tg,MAT.tire);t.position.set(x,.6,z);crG.add(t);}));})();
const turret=grp(-2,3.2,0,crG);box(4,1.6,3,MAT.yellow,0,.8,0,turret);
const boom=grp(-1,1.6,0,turret);const boomM=box(1,1,1,MAT.yellow,.5,0,0,boom);
const crCab=cable(scene);crCab.visible=false;
tag(crG,'crane');
const boomTip=new THREE.Vector3();
function aimCrane(target,on){// target: 世界坐标，吊钩落点
 turret.updateWorldMatrix(true,false);const pv=new THREE.Vector3();boom.getWorldPosition(pv);
 const dx=target.x-pv.x,dz=target.z-pv.z;turret.rotation.y=Math.atan2(-dz,dx);
 const reach=Math.max(6,Math.hypot(dx,dz));const el=1.05;const L=reach/Math.cos(el);
 boom.rotation.z=el;boomM.scale.set(L,1.1,1.1);boomM.position.x=L/2;
 boomTip.set(target.x,pv.y+L*Math.sin(el),target.z);
 crCab.visible=on;if(on)setCable(crCab,target.x,boomTip.y,target.y,target.z);}
aimCrane(new THREE.Vector3(25,5,0),false);

// 平板车 ×4（沿 z 方向停，往 -z 开走）
function truck(x,len){const g=grp(x,0,-50);box(3,2.6,3,MAT.white,0,2,-len/2-1.8,g);box(.1,1,2.6,MAT.glass,0,2.4,-len/2-3.3,g).rotation.y=Math.PI/2;
 box(3.2,.6,len,MAT.steel,0,1.5,0,g);const tg=new THREE.CylinderGeometry(.5,.5,.4,10);tg.rotateZ(Math.PI/2);
 for(let z=-len/2+1;z<=len/2-1;z+=Math.max(2,len/5))[-1.3,1.3].forEach(dx=>{const t=new THREE.Mesh(tg,MAT.tire);t.position.set(dx,.5,z);g.add(t);});
 [-1.3,1.3].forEach(dx=>{const t=new THREE.Mesh(tg,MAT.tire);t.position.set(dx,.5,-len/2-1.8);g.add(t);});
 tag(g,'truck');return g;}
const TK=[truck(6,14),truck(17,24),truck(33,24),truck(44,16)];
const TBED=1.8;
