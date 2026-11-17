// ===== s4: 世界状态。整个流程是进度 P（0~10）的纯函数，可任意拖动 =====
const V3=(x,y,z)=>new THREE.Vector3(x,y,z);
const TCOL=[[0,0x8a8a8a],[1,0xf2c230],[2,0xff8a1a],[3,0xe5321e],[4,0x2f7fe0]].map(a=>[a[0],new THREE.Color(a[1])]);
const _c=new THREE.Color();
const BEAR=[];PICK.forEach(m=>{if(m.userData.key==='bearing'){const p=new THREE.Vector3();m.getWorldPosition(p);if(Math.abs(p.x-165.7)<.2||Math.abs(p.x-196.3)<.2)BEAR.push(m);}});
const bearHL=new THREE.MeshStandardMaterial({color:0xffb020,emissive:0xff8800,emissiveIntensity:.8});
const W={}; // 给 UI 读的状态
function beamOnTransporter(){trG.updateMatrixWorld();const p=trG.localToWorld(V3(0,TTOP,0));return {x:p.x,y:p.y,rz:trG.rotation.z};}
function txAt(P){ // 运梁车位置
 if(P<5)return 70; if(P<6)return mix(70,25,seg(P,5,5.12));
 if(P<7)return mix(25,144,seg(P,6,6.95));
 if(P<8)return mix(144,120,seg(P,7.6,7.75));
 if(P<9)return mix(120,70,seg(P,8.1,8.9)); return 70;}
function setWorld(P){
 const T=clamp(P,0,10);W.P=T;
 // --- 钢筋笼 ---
 cageG.visible=T>=1&&T<2.85;ducts.visible=T>=1.3;setCageGrow(seg(T,1,1.5));
 let cz=12,cy=.55;
 cy+=3.95*seg(T,1.65,1.72)-3.95*seg(T,1.88,1.96);cz=mix(12,0,seg(T,1.72,1.88));
 cageG.position.set(-60,cy,cz);
 let sy=9;if(T>=1.55&&T<2)sy=mix(9,cy+3.1,seg(T,1.55,1.65)-seg(T,1.96,2));if(T>=1.65&&T<1.96)sy=cy+3.1;
 setSmallG(T<1.55?12:cz,sy);
 // --- 内模、端模 ---
 const inX=mix(-94,-60,seg(T,2.05,2.2)-seg(T,3.3,3.45));innerG.position.x=inX;
 endF.visible=T>=2.2&&T<3.38;endF.position.y=.5+6*(1-seg(T,2.2,2.25))+6*seg(T,3.3,3.38);
 // --- 浇筑 ---
 beamG.visible=T>=2.25;const fill=Math.max(.01,seg(T,2.25,2.85));beam.scale.y=fill;
 boomG.visible=T<0.999||(T>=2&&T<2.95);
 arm.rotation.y=(T>2.25&&T<2.9)?-Math.PI/2+Math.sin(T*40)*.9:-.25;
 // --- 养护 ---
 shed.visible=T>=2.95&&T<3.32;updSteam(performance.now()/1000,shed.visible);
 // --- 张拉：钢绞线颜色、上拱、千斤顶 ---
 const xr=(T>=3.45&&T<4.02)||(T>=4.5&&T<5.0);beamMat.opacity=xr?.28:1;beamMat.depthWrite=!xr;tendons.visible=xr||T>=3.45&&T<5;
 let tl=0;tl+=seg(T,3.5,3.65);tl+=seg(T,3.7,3.9);tl+=seg(T,4.55,4.8);tl+=seg(T,4.8,4.95);
 const i0=Math.min(3,Math.floor(tl));_c.copy(TCOL[i0][1]).lerp(TCOL[Math.min(4,i0+1)][1],tl-i0);tendonMat.color.copy(_c);
 jacks.visible=(T>=3.48&&T<3.95)||(T>=4.52&&T<4.82);
 const camber=.15*seg(T,3.7,3.9)+.25*seg(T,4.55,4.8);setCamber(camber);
 W.camber=camber;W.xray=xr;
 W.strength=T<2.85?null:Math.round(T<3.3?mix(0,60,seg(T,2.85,3.3)):T<3.7?mix(60,80,seg(T,3.3,3.7)):T<4.55?mix(80,100,seg(T,3.9,4.55)):100);
 W.tlevel=tl;
 // --- 梁的位置 ---
 let bx=-60,by=.5,bz=0,brz=0;
 if(T>=4.05){by=mix(.5,4.5,seg(T,4.05,4.15));bx=mix(-60,-15,seg(T,4.15,4.45));if(T>=4.45)by=mix(4.5,.8,seg(T,4.45,4.5));}
 if(T>=5.05){by=mix(.8,4.8,seg(T,5.05,5.12));bx=mix(-15,25,seg(T,5.12,5.4));if(T>=5.45)by=mix(4.8,TTOP,seg(T,5.45,5.6));}
 const tx=txAt(T);setTransporter(tx);
 let rear=-14.5;
 if(T>=6&&T<7){const b=beamOnTransporter();bx=b.x;by=b.y;brz=b.rz;}
 let fHook=13,rHook=13,fX=185,rX=172;
 if(T>=7){const top0=DECK+TTOP;let cx=144,y=top0;
  cx=mix(144,170.5,seg(T,7.15,7.45));y+=.6*seg(T,7.55,7.6);cx=mix(cx,181,seg(T,7.65,7.85));y=mix(y,BEAMY,seg(T,7.85,7.97));
  rear=(T<7.6)?(cx-14.5)-tx:mix(cx-14.5-144,-14.5,seg(T,7.6,7.75));
  bx=cx;by=y;
  const hTop=y+3+camber;
  fX=T<7.08?mix(185,158.5,seg(T,7,7.06)):cx+14.5;fHook=T<7.15?mix(13,hTop,seg(T,7.04,7.12)):hTop;
  rX=T<7.45?mix(172,156,seg(T,7.3,7.45)):cx-14.5;rHook=T<7.45?13:hTop;if(T>=7.45&&T<7.55)rHook=mix(13,hTop,seg(T,7.45,7.53));
  if(T>=7.97){fHook=rHook=mix(hTop,13,seg(T,7.97,8));}
  if(T>=8){fX=mix(cx+14.5,185,seg(T,8,8.1));rX=mix(cx-14.5,172,seg(T,8,8.1));fHook=rHook=13;}}
 trRear.position.x=rear;
 beamG.position.set(bx,by,bz);beamG.rotation.z=brz;
 // --- 提梁机 ---
 let gx=-15;if(T>=3.9)gx=mix(-15,-60,seg(T,3.9,4.02));if(T>=4.15)gx=bx;if(T>=4.5)gx=-15;if(T>=5.12)gx=bx;if(T>=5.6)gx=25;
 const bTop=by+3+camber;let att=0;
 att=seg(T,4.0,4.05)-seg(T,4.5,4.55)+seg(T,4.98,5.05)-seg(T,5.6,5.66);
 const gh=mix(12,bTop,att);
 setGantry(G[0],gx-14.5,gh);setGantry(G[1],gx+14.5,gh);
 // --- 架桥机 ---
 const ex=32*seg(T,8.15,8.75);erG.position.x=ex;
 frontLeg.scale.y=1-.72*(seg(T,8,8.12)-seg(T,8.75,8.88));
 setTrolley(TF,fX,fHook);setTrolley(TR,rX,rHook);
 // 支座灌浆高亮
 const bh=T>=7.9&&T<8.05;BEAR.forEach(m=>{if(!m.userData.m0)m.userData.m0=m.material;m.material=bh?bearHL:m.userData.m0;});
 // --- 转场 ---
 transfer(T);
 W.tx=tx;W.bx=bx;W.by=by;W.ex=ex;
}
// 拆解：每个部件从原位吊到平板车上，再随车开走
const PARTS=[ // [部件, 所属提梁机, 目标车, 车上偏移, 起止 P, 是否放倒]
 [G[0].troll,0,0,V3(0,.6,-3),9.1,9.22,0],[G[1].troll,1,0,V3(0,.6,3),9.22,9.34,0],
 [G[0].gird,0,1,V3(0,1.1,0),9.36,9.5,0],[G[1].gird,1,2,V3(0,1.1,0),9.5,9.62,0],
 [G[0].legA,0,3,V3(0,.7,-3),9.64,9.7,1],[G[0].legB,0,3,V3(0,1.4,-3),9.66,9.72,1],
 [G[1].legA,1,3,V3(0,.7,3.5),9.72,9.78,1],[G[1].legB,1,3,V3(0,1.4,3.5),9.74,9.8,1]];
PARTS.forEach(p=>p.push(p[0].position.clone()));
function transfer(T){
 const on=T>=9;const away=seg(T,9.84,10);
 const tz=mix(-150,-50,seg(T,9,9.08))-160*away;
 TK.forEach(t=>{t.visible=on;t.position.z=tz;});
 crG.visible=on;crG.position.z=mix(-90,-30,seg(T,9,9.08))-160*away;
 G.forEach(o=>{o.hook.visible=o.cab[0].visible=o.cab[1].visible=!(T>=9.08);});
 let active=null;
 PARTS.forEach(p=>{const [obj,gi,ti,off,a,b,flat,home]=p;const g=G[gi].g;const k=seg(T,a,b);
  const tgt=V3(TK[ti].position.x+off.x-g.position.x,TBED+off.y,TK[ti].position.z+off.z);
  const pos=home.clone().lerp(tgt,k);pos.y+=Math.sin(Math.PI*k)*10*(T<9.84?1:0);
  obj.position.copy(on?pos:home);obj.rotation.x=on&&flat?Math.PI/2*k:0;
  if(on&&T>=a&&T<=b)active=obj;});
 if(on&&T<9.84){const tp=new THREE.Vector3();if(active){active.getWorldPosition(tp);tp.y+=2;}else tp.set(25,8,0);aimCrane(tp,!!active);}
 else aimCrane(V3(25,8,crG.position.z+20),false);
}
