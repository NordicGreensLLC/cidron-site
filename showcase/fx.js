/* Cidron showcase engine: sideways-treadmill backgrounds + cursor effects that switch every 10 s.
   Vanilla JS, no libraries. Each page sets body[data-bgs], body[data-trackers], body[data-pal]. */
(function(){
'use strict';
var body=document.body,reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
var TAU=Math.PI*2,PI=Math.PI,sin=Math.sin,cos=Math.cos,R=Math.random,hyp=Math.hypot;
function rr(a,b){return a+R()*(b-a)}
function mod(a,n){return((a%n)+n)%n}
function clamp(v,a,b){return v<a?a:v>b?b:v}
function hexA(h,a){var n=parseInt(h.slice(1),16);return'rgba('+(n>>16)+','+((n>>8)&255)+','+(n&255)+','+a+')'}
function hash(n,m){var s=sin(n*12.9898+m*78.233)*43758.5453;return s-Math.floor(s)}
var PAL=(body.dataset.pal||'#ff2e93,#22e6ff,#ffd166,#8f5bff').split(',');
function C(i){return PAL[i%PAL.length]}
var EMOJI=(body.dataset.emoji||'⭐,✨,🌟').split(',');

/* ---------- offscreen helpers ---------- */
var S=1; /* background render scale, lowered automatically on slow devices */
function mk(w,h){var c=document.createElement('canvas');c.width=Math.max(1,Math.round(w*S));c.height=Math.max(1,Math.round(h*S));var x=c.getContext('2d');x.scale(S,S);return{c:c,x:x}}
function pat(g,c,m){var p=g.createPattern(c,m||'repeat-x');if(p.setTransform)p.setTransform(new DOMMatrix().scale(1/S));return p}
/* draw a seamless horizontally repeating strip; sh = how far content has travelled (px) */
function strip(g,p,pw,sh,y,h,W){g.save();g.translate(mod(sh,pw),y);g.fillStyle=p;g.fillRect(-pw,0,W+pw,h);g.restore()}
function vgrad(g,h,stops){var gr=g.createLinearGradient(0,0,0,h);for(var i=0;i<stops.length;i++)gr.addColorStop(stops[i][0],stops[i][1]);return gr}
function glow(g,x,y,r,col,a){var gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,hexA(col,a));gr.addColorStop(1,hexA(col,0));g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2)}
/* periodic ridge: sum of sines with whole numbers of cycles across width pw, so the tile wraps with no seam */
function ridge(x,pw,ph,ks,as){var v=0;for(var i=0;i<ks.length;i++)v+=as[i]*sin(TAU*ks[i]*x/pw+ph[i]);return v}

/* =====================  BACKGROUNDS  (dir +1 = content travels left-to-right)  ===================== */
var BG={};

BG.skyline={label:'Parallax Skyline',dir:-1,make:function(){
  var L=[],sky=null,W0=0;
  var cfg=[{sp:9,min:.16,max:.34,col:'#1a2058',win:'#6a70c4',wp:.05,bw:[46,100],mist:'#ff2e93',ma:.3},
           {sp:22,min:.2,max:.44,col:'#101646',win:'#ffb347',wp:.12,bw:[56,126],mist:'#8f5bff',ma:.24},
           {sp:48,min:.24,max:.56,col:'#080b28',win:'#ffd98a',wp:.2,bw:[66,150],mist:'#22e6ff',ma:.16}];
  return{resize:function(W,H){W0=W;
    var m=mk(W,H),g=m.x;g.fillStyle=vgrad(g,H,[[0,'#070a26'],[.5,'#2a1058'],[.82,'#a8246f'],[1,'#ff6a88']]);g.fillRect(0,0,W,H);
    for(var i=0;i<90;i++){g.fillStyle='rgba(255,255,255,'+rr(.2,.8)+')';g.fillRect(rr(0,W),rr(0,H*.55),1.4,1.4)}
    glow(g,W*.8,H*.2,H*.28,'#ffd6f5',.35);g.fillStyle='rgba(235,220,245,.6)';g.beginPath();g.arc(W*.8,H*.2,H*.055,0,TAU);g.fill();sky=m.c;
    L=cfg.map(function(c){var pw=Math.round(Math.max(W,1100)),t=mk(pw,H),x=t.x,cx=0,ants=[];
      while(cx<pw-1){var bw=rr(c.bw[0],c.bw[1]);if(pw-cx-bw<c.bw[0]*.8)bw=pw-cx;var bh=rr(c.min,c.max)*H,by=H-bh;
        x.fillStyle=c.col;x.fillRect(cx,by,bw+.5,bh+2);
        if(R()<.4){x.fillRect(cx+bw*.15,by-12,bw*.2,12)}
        if(R()<.3){var ah=rr(24,46);x.fillRect(cx+bw*.55-1,by-ah,2,ah);ants.push({x:cx+bw*.55,y:by-ah,p:rr(0,6)})}
        var cw=8,ch=11,gx=10,gy=12,cols=Math.floor((bw-10)/(cw+gx)),rows=Math.floor((bh-14)/(ch+gy));
        for(var r=0;r<rows;r++)for(var k=0;k<cols;k++){if(R()<c.wp){x.fillStyle=R()<.13?(R()<.5?'#ff2e93':'#22e6ff'):c.win;x.globalAlpha=rr(.35,.8);x.fillRect(cx+8+k*(cw+gx),by+10+r*(ch+gy),cw,ch);x.globalAlpha=1}}
        cx+=bw}
      x.globalCompositeOperation='source-atop';x.fillStyle=vgrad(x,H,[[0,hexA(c.mist,0)],[.55,hexA(c.mist,0)],[1,hexA(c.mist,c.ma)]]);x.fillRect(0,0,pw,H);
      return{p:null,c:t.c,pw:pw,sp:c.sp,ants:ants}})},
  draw:function(g,W,H,t){g.drawImage(sky,0,0,W,H);
    for(var i=0;i<L.length;i++){var l=L[i];if(!l.p)l.p=pat(g,l.c);var sh=-l.sp*t;strip(g,l.p,l.pw,sh,0,H,W);
      var off=mod(sh,l.pw);for(var a=0;a<l.ants.length;a++){var an=l.ants[a],al=.35+.65*Math.max(0,sin(t*2.4+an.p));
        for(var k=-1;k<=1;k++){var x=an.x+off+k*l.pw;if(x>-10&&x<W+10){g.fillStyle='rgba(255,60,90,'+al+')';g.beginPath();g.arc(x,an.y,2.2,0,TAU);g.fill();g.fillStyle='rgba(255,60,90,'+al*.25+')';g.beginPath();g.arc(x,an.y,7,0,TAU);g.fill()}}}}}}
}};

BG.neongrid={label:'Neon Grid Road',dir:1,make:function(){
  var back=null,hy=0,rid=null,rpw=0;
  return{resize:function(W,H){hy=H*.56;var m=mk(W,H),g=m.x;
    g.fillStyle=vgrad(g,hy,[[0,'#0d0024'],[.6,'#35085c'],[1,'#c0267a']]);g.fillRect(0,0,W,hy);
    var sr=Math.min(W,H)*.2,sx=W*.5,sy=hy-sr*.35;
    g.save();g.beginPath();for(var i=0;i<9;i++){var yy=sy-sr+i*sr*.26+ (i>3?(i-3)*3:0),hh=i<4?sr*.26:sr*.26-(i-3)*3.4;if(i<3){g.rect(sx-sr,yy,sr*2,hh)}else g.rect(sx-sr,yy+ (i-3)*2,sr*2,Math.max(2,hh-(i-3)*2.5))}
    g.clip();var gr=g.createLinearGradient(0,sy-sr,0,sy+sr);gr.addColorStop(0,'#ffe66d');gr.addColorStop(1,'#ff2e93');g.fillStyle=gr;g.beginPath();g.arc(sx,sy,sr,0,TAU);g.fill();g.restore();
    glow(g,sx,sy,sr*2.2,'#ff2e93',.25);
    g.fillStyle=vgrad(g,H,[[0,'#12002b'],[1,'#12002b']]);g.fillRect(0,hy,W,H-hy);
    var fg=g.createLinearGradient(0,hy,0,H);fg.addColorStop(0,'rgba(255,46,147,.55)');fg.addColorStop(.12,'rgba(40,0,70,.9)');fg.addColorStop(1,'#0a0018');g.fillStyle=fg;g.fillRect(0,hy,W,H-hy);
    back=m.c;
    rpw=Math.round(Math.max(W,1000));var t=mk(rpw,hy),x=t.x;x.beginPath();x.moveTo(0,hy);for(var px=0;px<=rpw;px+=6){x.lineTo(px,hy-24-(ridge(px,rpw,[0,1.2,2.1],[3,7,13],[hy*.1,hy*.05,hy*.025])+hy*.17))}x.lineTo(rpw,hy);x.closePath();
    x.fillStyle='rgba(10,0,30,.9)';x.fill();x.strokeStyle='#22e6ff';x.lineWidth=2;x.shadowColor='#22e6ff';x.shadowBlur=10;x.stroke();rid=t.c;rid.p=null},
  draw:function(g,W,H,t){g.drawImage(back,0,0,W,H);
    if(!rid.p)rid.p=pat(g,rid);strip(g,rid.p,rpw,t*10,0,hy,W);
    g.fillStyle='#0a0018';g.fillRect(0,hy,W,2);
    var G=W/9,off=mod(t*60,G),cx=W/2,km=Math.ceil(W*.8/(G*2.4))+2;
    g.lineCap='round';
    for(var pass=0;pass<2;pass++){g.beginPath();
      for(var k=-km;k<=km;k++){var xb=cx+(k*G+off)*2.4;g.moveTo(cx+(xb-cx)*.015,hy);g.lineTo(xb,H)}
      for(var j=1;j<=14;j++){var y=hy+(H-hy)*Math.pow(j/14,2.1);g.moveTo(0,y);g.lineTo(W,y)}
      g.lineWidth=pass?1.4:5;g.strokeStyle=pass?'#ff5cc0':'rgba(255,46,147,.22)';g.stroke()}
    var px=mod(t*140,W+300)-150,gr=g.createLinearGradient(px-150,0,px+150,0);gr.addColorStop(0,'rgba(34,230,255,0)');gr.addColorStop(.5,'rgba(34,230,255,.5)');gr.addColorStop(1,'rgba(34,230,255,0)');g.fillStyle=gr;g.fillRect(px-150,hy-1,300,3)}
}}};

BG.aurora={label:'Aurora Ribbons',dir:-1,make:function(){
  var back=null,spr=[],rib=[
    {c:'#2dffb2',b:.34,a:[.07,.03],k:[1,3],sp:-28,ph:[0,1],len:.34,al:.5},
    {c:'#37c8ff',b:.42,a:[.06,.035],k:[2,4],sp:-18,ph:[2,.5],len:.3,al:.42},
    {c:'#9b6bff',b:.3,a:[.08,.025],k:[1,5],sp:-40,ph:[4,3],len:.28,al:.4},
    {c:'#ff6bd6',b:.5,a:[.05,.03],k:[3,2],sp:-30,ph:[1,5],len:.22,al:.3}];
  return{resize:function(W,H){var m=mk(W,H),g=m.x;g.fillStyle=vgrad(g,H,[[0,'#02030c'],[.55,'#07183a'],[1,'#0c3a46']]);g.fillRect(0,0,W,H);
    for(var i=0;i<140;i++){g.fillStyle='rgba(255,255,255,'+rr(.15,.85)+')';var r=R()<.1?1.8:1;g.fillRect(rr(0,W),rr(0,H*.8),r,r)}
    g.fillStyle='#030610';g.beginPath();g.moveTo(0,H);for(var x=0;x<=W;x+=8){g.lineTo(x,H-H*.06-ridge(x,W,[0,2],[3,9],[H*.025,H*.012]))}g.lineTo(W,H);g.fill();
    back=m.c;spr=rib.map(function(r){var c=document.createElement('canvas');c.width=4;c.height=256;var x=c.getContext('2d'),gr=x.createLinearGradient(0,0,0,256);gr.addColorStop(0,hexA(r.c,0));gr.addColorStop(.7,hexA(r.c,.55));gr.addColorStop(.93,hexA(r.c,1));gr.addColorStop(1,hexA(r.c,.2));x.fillStyle=gr;x.fillRect(0,0,4,256);return c})},
  draw:function(g,W,H,t){g.drawImage(back,0,0,W,H);g.globalCompositeOperation='lighter';
    var step=W<600?6:5;
    for(var i=0;i<rib.length;i++){var r=rib[i],sh=r.sp*t;g.globalAlpha=r.al;
      for(var x=0;x<=W;x+=step){var u=x-sh,y=H*r.b+H*r.a[0]*sin(TAU*r.k[0]*u/W+r.ph[0])+H*r.a[1]*sin(TAU*r.k[1]*(u-sh*.35)/W+r.ph[1]);
        var l=H*r.len*(.6+.4*sin(TAU*(r.k[1]+1)*u/W+t*.6+i)),f=.65+.35*sin(TAU*(r.k[0]+2)*u/W-t*.9+i*2);
        g.globalAlpha=r.al*f;g.drawImage(spr[i],x,y-l,step+1,l+4)}}
    g.globalAlpha=1;g.globalCompositeOperation='source-over'}
}}};

BG.starfield={label:'Drifting Starfield',dir:1,make:function(){
  var stars=[],neb=[],shoot=null,nextShoot=3;
  return{resize:function(W,H){stars=[];var n=Math.round(W*H/2600);for(var i=0;i<n;i++){var d=R();stars.push({x:rr(0,W+60),y:rr(0,H),r:.5+d*1.7,d:.15+d*.85,tw:rr(0,6),c:R()<.18?C(R()<.5?1:3):'#ffffff'})}
    neb=[{x:W*.2,y:H*.35,r:H*.55,c:'#5b2bd6',a:.28,sp:5},{x:W*.62,y:H*.65,r:H*.5,c:'#d6339a',a:.2,sp:8},{x:W*.9,y:H*.25,r:H*.4,c:'#22a6ff',a:.18,sp:11}]},
  draw:function(g,W,H,t){g.fillStyle=vgrad(g,H,[[0,'#04030f'],[1,'#12062e']]);g.fillRect(0,0,W,H);
    g.globalCompositeOperation='lighter';
    for(var i=0;i<neb.length;i++){var n=neb[i],x=mod(n.x+n.sp*t,W+n.r*2)-n.r;glow(g,x,n.y,n.r,n.c,n.a);if(x<n.r)glow(g,x+W+n.r*2,n.y,n.r,n.c,n.a)}
    g.globalCompositeOperation='source-over';
    var px=mod(W*.7+t*14,W+500)-250;g.save();g.translate(px,H*.3);g.rotate(-.35);var pg=g.createRadialGradient(-10,-10,4,0,0,H*.1);pg.addColorStop(0,'#ffd9a8');pg.addColorStop(1,'#a8438f');g.fillStyle=pg;g.beginPath();g.arc(0,0,H*.075,0,TAU);g.fill();
    g.strokeStyle='rgba(255,220,240,.55)';g.lineWidth=3;g.beginPath();g.ellipse(0,0,H*.14,H*.03,0,0,TAU);g.stroke();g.restore();
    for(var s=0;s<stars.length;s++){var q=stars[s],x2=mod(q.x+t*q.d*60,W+60)-30,a=.55+.45*sin(t*2+q.tw);g.globalAlpha=a;g.fillStyle=q.c;
      if(q.r>1.7){g.fillRect(x2-q.r*3,q.y-.5,q.r*6,1);g.fillRect(x2-.5,q.y-q.r*3,1,q.r*6)}g.beginPath();g.arc(x2,q.y,q.r,0,TAU);g.fill()}
    g.globalAlpha=1;
    if(!shoot&&t>nextShoot){shoot={x:rr(0,W*.5)-100,y:rr(0,H*.4),s:rr(500,800),l:0};nextShoot=t+rr(3,6)}
    if(shoot){shoot.x+=shoot.s*.016;shoot.y+=shoot.s*.016*.25;shoot.l+=.016;var gr=g.createLinearGradient(shoot.x-160,shoot.y-40,shoot.x,shoot.y);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(1,'rgba(255,255,255,.95)');g.strokeStyle=gr;g.lineWidth=2;g.beginPath();g.moveTo(shoot.x-160,shoot.y-40);g.lineTo(shoot.x,shoot.y);g.stroke();if(shoot.x>W+200)shoot=null}}
}}};

BG.clouds={label:'Clouds & Birds',dir:-1,make:function(){
  var back=null,cl=[],birds=[],sprs=[];
  function cloud(w,a){var m=mk(w*1.2,w*.55),g=m.x,h=w*.55;g.fillStyle='#b4d0ee';[[.25,.7,.2],[.45,.55,.28],[.7,.68,.22],[.52,.78,.3]].forEach(function(p){g.beginPath();g.arc(w*p[0]+w*.1,h*p[1]+w*.03,w*p[2],0,TAU);g.fill()});
    g.fillStyle='#ffffff';[[.25,.62,.2],[.45,.45,.28],[.7,.6,.22],[.52,.7,.3],[.15,.72,.14]].forEach(function(p){g.beginPath();g.arc(w*p[0]+w*.1,h*p[1],w*p[2],0,TAU);g.fill()});m.c.al=a;return m.c}
  return{resize:function(W,H){var m=mk(W,H),g=m.x;g.fillStyle=vgrad(g,H,[[0,'#3aa8ff'],[.55,'#9adcff'],[1,'#fff1d0']]);g.fillRect(0,0,W,H);back=m.c;
    sprs=[cloud(140,.55),cloud(240,.8),cloud(380,.95)];cl=[];var n=Math.max(8,Math.round(W/150));
    for(var i=0;i<n;i++){var d=i%3;cl.push({s:d,x:rr(0,W+500),y:rr(H*.05,H*.62),v:[8,16,30][d]*rr(.8,1.2)})}
    cl.sort(function(a,b){return a.s-b.s});
    birds=[];for(var f=0;f<3;f++){var fx=rr(0,W),fy=H*(.15+f*.17),sc=.7+f*.25;for(var b=0;b<7;b++)birds.push({x:fx-Math.abs(b-3)*-0,ox:(b%2?1:-1)*Math.ceil(b/2)*34*sc,oy:Math.ceil(b/2)*18*sc,y:fy,v:55+f*14,sc:sc,p:rr(0,6),fx:fx,f:f})}},
  draw:function(g,W,H,t){g.drawImage(back,0,0,W,H);
    var sx=W*.82,sy=H*.2;glow(g,sx,sy,H*.4,'#fff7c2',.9);g.save();g.translate(sx,sy);g.rotate(t*.15);g.fillStyle='rgba(255,236,150,.55)';for(var r=0;r<12;r++){g.rotate(TAU/12);g.beginPath();g.moveTo(H*.07,-8);g.lineTo(H*.2,0);g.lineTo(H*.07,8);g.fill()}g.restore();
    g.fillStyle='#ffe066';g.beginPath();g.arc(sx,sy,H*.06,0,TAU);g.fill();
    for(var i=0;i<cl.length;i++){var c=cl[i],sp=sprs[c.s],w=sp.width/S,x=mod(c.x-c.v*t,W+w*2)-w;g.globalAlpha=sp.al;g.drawImage(sp,x,c.y,w,sp.height/S);g.globalAlpha=1}
    g.strokeStyle='#27456b';g.lineCap='round';g.lineWidth=2.2;
    for(var b=0;b<birds.length;b++){var o=birds[b],x2=mod(o.fx+o.ox*0+t*-o.v,W+300)-150+o.ox,y2=o.y+o.oy+sin(t*1.2+o.f)*14,fl=sin(t*7+o.p)*7*o.sc,s=o.sc*11;
      g.beginPath();g.moveTo(x2-s,y2-fl);g.quadraticCurveTo(x2-s*.4,y2-s*.5-fl*.3,x2,y2);g.quadraticCurveTo(x2+s*.4,y2-s*.5-fl*.3,x2+s,y2-fl);g.stroke()}}
}}};

BG.waves={label:'Rolling Waves',dir:-1,make:function(){
  var back=null,boat=null,L=[
    {y:.62,a:[.018,.01],k:[2,5],sp:14,c0:'#9be7e0',c1:'#5fc8d0',ph:[0,1]},
    {y:.7,a:[.024,.012],k:[3,6],sp:22,c0:'#5fd0d6',c1:'#2aa3bd',ph:[2,3]},
    {y:.78,a:[.03,.014],k:[2,4],sp:34,c0:'#2aa3bd',c1:'#16789a',ph:[4,1]},
    {y:.87,a:[.034,.016],k:[3,5],sp:50,c0:'#16789a',c1:'#0b4f78',ph:[1,5]},
    {y:.95,a:[.03,.012],k:[2,7],sp:70,c0:'#0b4f78',c1:'#06304f',ph:[3,2]}];
  function wy(l,x,W,H,t){var u=x-l.sp*t;return H*l.y+H*l.a[0]*sin(TAU*l.k[0]*u/W+l.ph[0])+H*l.a[1]*sin(TAU*l.k[1]*(u*1.0)/W+l.ph[1]+t*.4)}
  return{resize:function(W,H){var m=mk(W,H),g=m.x;g.fillStyle=vgrad(g,H*.7,[[0,'#ffb56b'],[.5,'#ffd9a0'],[1,'#fff0cf']]);g.fillRect(0,0,W,H);
    glow(g,W*.3,H*.58,H*.5,'#fff3b0',.9);g.fillStyle='#fff6c8';g.beginPath();g.arc(W*.3,H*.58,H*.1,0,TAU);g.fill();back=m.c},
  draw:function(g,W,H,t){g.drawImage(back,0,0,W,H);
    for(var i=0;i<L.length;i++){var l=L[i];g.beginPath();g.moveTo(0,H);for(var x=0;x<=W+8;x+=8)g.lineTo(x,wy(l,x,W,H,t));g.lineTo(W+8,H);g.closePath();
      var gr=g.createLinearGradient(0,H*(l.y-.05),0,H);gr.addColorStop(0,l.c0);gr.addColorStop(1,l.c1);g.fillStyle=gr;g.fill();
      g.beginPath();for(var x2=0;x2<=W+8;x2+=8){var y=wy(l,x2,W,H,t);x2?g.lineTo(x2,y):g.moveTo(x2,y)}g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=2;g.stroke();
      if(i===2){var bx=W*.62,by=wy(l,bx,W,H,t),sl=(wy(l,bx+10,W,H,t)-wy(l,bx-10,W,H,t))/20,s=Math.max(26,H*.05);
        g.save();g.translate(bx,by);g.rotate(Math.atan(sl)*.8);g.fillStyle='#8a4b2a';g.beginPath();g.moveTo(-s,-2);g.lineTo(s,-2);g.lineTo(s*.7,s*.35);g.lineTo(-s*.7,s*.35);g.fill();
        g.fillStyle='#fff';g.beginPath();g.moveTo(0,-s*1.9);g.lineTo(s*.8,-s*.2);g.lineTo(0,-s*.2);g.fill();g.fillStyle='#ff6b4a';g.beginPath();g.moveTo(-.5,-s*1.5);g.lineTo(-s*.7,-s*.2);g.lineTo(-.5,-s*.2);g.fill();g.restore()}}
    g.fillStyle='rgba(255,255,255,.8)';for(var q=0;q<26;q++){var gx=mod(q*97.3-t*(20+q%5*9),W),gy=H*(.64+hash(q,3)*.3),a=.5+.5*sin(t*3+q);g.globalAlpha=a*.7;g.fillRect(gx,gy,3,1.4)}g.globalAlpha=1}
}}};

BG.mountains={label:'Mountain Ranges',dir:-1,make:function(){
  var back=null,L=[],mist=null,mpw=0,cfg=[
    {sp:5,col:'#8b6bb5',base:.58,amp:.17,ks:[2,5,11],ph:[0,1,2],pine:0},
    {sp:12,col:'#5c4590',base:.68,amp:.14,ks:[3,7,13],ph:[1,2,0],pine:0},
    {sp:26,col:'#372c66',base:.78,amp:.12,ks:[2,6,15],ph:[2,0,1],pine:.5},
    {sp:48,col:'#1a1440',base:.9,amp:.09,ks:[4,9,19],ph:[3,1,2],pine:1}];
  return{resize:function(W,H){var m=mk(W,H),g=m.x;g.fillStyle=vgrad(g,H,[[0,'#1a0f3a'],[.4,'#7a2f77'],[.7,'#ff8a5b'],[1,'#ffd29d']]);g.fillRect(0,0,W,H);
    glow(g,W*.7,H*.62,H*.55,'#ffd29d',.6);g.fillStyle='#ffe6b8';g.beginPath();g.arc(W*.7,H*.62,H*.1,0,TAU);g.fill();
    for(var i=0;i<60;i++){g.fillStyle='rgba(255,255,255,'+rr(.2,.7)+')';g.fillRect(rr(0,W),rr(0,H*.35),1.3,1.3)}back=m.c;
    L=cfg.map(function(c){var pw=Math.round(Math.max(W,1100)),t=mk(pw,H),x=t.x,tops=[];
      var amp=H*c.amp,base=H*c.base;x.beginPath();x.moveTo(0,H);for(var px=0;px<=pw;px+=4){var y=base-amp*.55-ridge(px,pw,c.ph,c.ks,[amp*.5,amp*.28,amp*.12]);tops.push([px,y]);x.lineTo(px,y)}x.lineTo(pw,H);x.closePath();
      x.fillStyle=c.col;x.fill();x.save();x.clip();x.fillStyle='rgba(255,255,255,.14)';x.beginPath();tops.forEach(function(p,i){i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1])});x.lineTo(pw,H);x.lineTo(0,H);x.closePath();x.translate(0,0);
      var sg=x.createLinearGradient(0,base-amp*1.3,0,base-amp*.5);sg.addColorStop(0,'rgba(255,255,255,.55)');sg.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=sg;x.fillRect(0,0,pw,H);x.restore();
      if(c.pine){x.fillStyle=c.col;var n=Math.round(pw/(c.pine>.7?26:40));for(var i2=0;i2<n;i2++){var tx=(i2+hash(i2,c.sp))*pw/n,ty=base-amp*.55-ridge(tx,pw,c.ph,c.ks,[amp*.5,amp*.28,amp*.12]),th=rr(26,52)*(c.pine>.7?1.5:1);
        for(var tr=0;tr<3;tr++){x.beginPath();x.moveTo(tx,ty-th+tr*th*.28);x.lineTo(tx+th*.22*(1+tr*.5),ty-th*.55+tr*th*.3);x.lineTo(tx-th*.22*(1+tr*.5),ty-th*.55+tr*th*.3);x.fill()}x.fillRect(tx-1.5,ty-6,3,12)}}
      return{c:t.c,pw:pw,sp:c.sp,p:null}});
    mpw=Math.round(Math.max(W,1100));var mt=mk(mpw,H*.4),mx=mt.x;for(var e=0;e<9;e++){var ex=e*mpw/9+rr(-30,30),ey=rr(H*.1,H*.3),er=rr(140,260);for(var k=-1;k<=1;k++){var gr=mx.createRadialGradient(ex+k*mpw,ey,0,ex+k*mpw,ey,er);gr.addColorStop(0,'rgba(255,220,200,.35)');gr.addColorStop(1,'rgba(255,220,200,0)');mx.fillStyle=gr;mx.save();mx.scale(1,.35);mx.translate(0,ey*(1/.35-1));mx.fillRect(ex+k*mpw-er,ey-er,er*2,er*2);mx.restore()}}
    mist=mt.c;mist.p=null},
  draw:function(g,W,H,t){g.drawImage(back,0,0,W,H);
    for(var i=0;i<L.length;i++){var l=L[i];if(!l.p)l.p=pat(g,l.c);strip(g,l.p,l.pw,-l.sp*t,0,H,W);
      if(i===1||i===2){if(!mist.p)mist.p=pat(g,mist);g.globalAlpha=.7;strip(g,mist.p,mpw,-(18+i*14)*t,H*(.45+i*.12),H*.4,W);g.globalAlpha=1}}}
}}};

BG.tiles={label:'Sliding Tile Rows',dir:1,make:function(){
  var cs=80,rows=0;
  var cols=['#2a1d5e','#3a2780','#4d2f9e','#1f1648','#ff8a5b','#ffb86b','#d6458a'];
  return{resize:function(W,H){cs=W<600?56:84;rows=Math.ceil(H/(cs*.866))+1},
  draw:function(g,W,H,t){g.fillStyle='#120c2c';g.fillRect(0,0,W,H);var rh=cs*.866,hw=cs/2;
    for(var r=0;r<rows;r++){var dir=1,sh=dir*t*(18+r*3.2),y=r*rh,n0=Math.floor((-cs-sh)/hw)-1,n1=Math.ceil((W+cs-sh)/hw)+1;
      for(var n=n0;n<=n1;n++){var x=n*hw+sh,up=(n+r)%2===0,h1=hash(n*(dir>0?1:-1),r),ci=h1<.62?Math.floor(h1/.62*4):h1<.9?4+Math.floor((h1-.62)/.28*2):6;
        var pulse=.5+.5*sin(t*1.1+n*.45+r*.7);g.globalAlpha=ci>=4?.25+.35*pulse:.55+.35*pulse*.6;g.fillStyle=cols[ci];g.beginPath();
        if(up){g.moveTo(x,y+rh);g.lineTo(x+hw,y);g.lineTo(x+cs,y+rh)}else{g.moveTo(x,y);g.lineTo(x+cs,y);g.lineTo(x+hw,y+rh)}g.closePath();g.fill()}}
    g.globalAlpha=1;var vg=g.createRadialGradient(W/2,H/2,H*.2,W/2,H/2,Math.max(W,H)*.75);vg.addColorStop(0,'rgba(18,12,44,0)');vg.addColorStop(1,'rgba(18,12,44,.7)');g.fillStyle=vg;g.fillRect(0,0,W,H)}
}}};

BG.lanterns={label:'Lantern Drift',dir:1,make:function(){
  var back=null,fl=[],town=null,tpw=0,tH=0,dust=[];
  return{resize:function(W,H){var m=mk(W,H),g=m.x;g.fillStyle=vgrad(g,H,[[0,'#04120b'],[.6,'#0f3322'],[1,'#1d4a2f']]);g.fillRect(0,0,W,H);
    for(var i=0;i<110;i++){g.fillStyle='rgba(255,246,214,'+rr(.15,.7)+')';g.fillRect(rr(0,W),rr(0,H*.6),1.3,1.3)}back=m.c;
    fl=[];var n=Math.round(clamp(W/60,10,26));for(var j=0;j<n;j++){var d=R();fl.push({x:rr(0,W+200),y:rr(H*.08,H*.66),s:12+d*d*52,v:6+d*38,p:rr(0,6),c:R()<.7?'#ffb347':(R()<.5?'#ff6b6b':'#ffe08a')})}
    fl.sort(function(a,b){return a.s-b.s});dust=[];for(var k=0;k<40;k++)dust.push({x:rr(0,W),y:rr(0,H),v:rr(10,30),r:rr(.8,2.2),p:rr(0,6)});
    tpw=Math.round(Math.max(W,1100));tH=H*.26;var t=mk(tpw,tH),x=t.x;x.fillStyle='#071a10';x.beginPath();x.moveTo(0,tH);for(var px=0;px<=tpw;px+=6)x.lineTo(px,tH*.62-ridge(px,tpw,[0,1],[3,8],[tH*.12,tH*.05]));x.lineTo(tpw,tH);x.fill();
    var cx=10;while(cx<tpw-60){var w=rr(34,60),h=rr(30,56),by=tH-rr(4,26);x.fillStyle='#0a2216';x.fillRect(cx,by-h,w,h+30);x.beginPath();x.moveTo(cx-6,by-h);x.lineTo(cx+w/2,by-h-w*.5);x.lineTo(cx+w+6,by-h);x.fill();
      x.fillStyle='#e8f1ea';x.beginPath();x.moveTo(cx-7,by-h+1);x.lineTo(cx+w/2,by-h-w*.52);x.lineTo(cx+w+7,by-h+1);x.lineTo(cx+w/2,by-h-w*.3);x.closePath();x.fill();
      var nw=Math.max(1,Math.floor(w/22));for(var q=0;q<nw;q++){if(R()<.8){x.fillStyle='#ffc857';x.fillRect(cx+8+q*20,by-h+10,8,10)}}
      if(R()<.5){x.fillStyle='#0a2216';x.fillRect(cx+w*.7,by-h-w*.5,6,14)}
      cx+=w+rr(10,44)}
    town=t.c;town.p=null},
  draw:function(g,W,H,t){g.drawImage(back,0,0,W,H);
    g.globalCompositeOperation='lighter';for(var d=0;d<dust.length;d++){var q=dust[d],x=mod(q.x+t*q.v,W+20)-10,y=q.y+sin(t*.8+q.p)*12;g.fillStyle='rgba(255,230,160,'+(.2+.2*sin(t*2+q.p))+')';g.beginPath();g.arc(x,y,q.r,0,TAU);g.fill()}g.globalCompositeOperation='source-over';
    for(var i=0;i<fl.length;i++){var l=fl[i],lw=l.s*.7,x2=mod(l.x+l.v*t,W+lw*4)-lw*2,y2=l.y+sin(t*.7+l.p)*l.s*.35,fk=.85+.15*sin(t*7+l.p*3);
      g.globalCompositeOperation='lighter';glow(g,x2,y2,l.s*2.4,l.c,.55*fk);g.globalCompositeOperation='source-over';
      var h=l.s,w=lw;g.strokeStyle='rgba(255,230,160,.5)';g.lineWidth=1;g.beginPath();g.moveTo(x2,y2-h*.55);g.lineTo(x2,y2-h*.55-h*.35);g.stroke();
      g.fillStyle='#7a1f1f';g.fillRect(x2-w*.38,y2-h*.55,w*.76,h*.1);g.fillRect(x2-w*.38,y2+h*.45,w*.76,h*.1);
      var lg=g.createLinearGradient(0,y2-h*.45,0,y2+h*.45);lg.addColorStop(0,'#fff1b8');lg.addColorStop(1,l.c);g.fillStyle=lg;g.beginPath();g.ellipse(x2,y2,w*.5,h*.46,0,0,TAU);g.fill();
      g.strokeStyle='rgba(120,40,20,.35)';g.lineWidth=1;g.beginPath();g.ellipse(x2,y2,w*.2,h*.46,0,0,TAU);g.stroke()}
    if(!town.p)town.p=pat(g,town);strip(g,town.p,tpw,t*8,H-tH,tH,W)}
}}};

BG.candy={label:'Candy Ribbons',dir:1,make:function(){
  var P1=[],back=null;
  function stripeTile(a,b,P){var m=mk(P,P),g=m.x;g.fillStyle=a;g.fillRect(0,0,P,P);g.strokeStyle=b;g.lineWidth=P/(2*Math.SQRT2);for(var k=-2;k<=2;k++){g.beginPath();g.moveTo(k*P-P,-P);g.lineTo(k*P+2*P,2*P);g.stroke()}return m.c}
  var rb=[{y:.2,a:.07,k:1,sp:34,th:.16,s:['#c8102e','#fff6e6'],ph:0,tw:2},{y:.42,a:.08,k:2,sp:26,th:.11,s:['#e9b23f','#fff0b8'],ph:2,tw:3},{y:.62,a:.07,k:1,sp:46,th:.15,s:['#1f6b3a','#f6eedd'],ph:4,tw:2},{y:.84,a:.06,k:2,sp:38,th:.12,s:['#c8102e','#e9b23f'],ph:1,tw:3}];
  return{resize:function(W,H){var m=mk(W,H),g=m.x;g.fillStyle=vgrad(g,H,[[0,'#3a0713'],[.5,'#6e0f24'],[1,'#2c0710']]);g.fillRect(0,0,W,H);
    for(var i=0;i<70;i++){g.fillStyle='rgba(255,230,160,'+rr(.1,.4)+')';g.beginPath();g.arc(rr(0,W),rr(0,H),rr(1,3),0,TAU);g.fill()}back=m.c;
    P1=rb.map(function(r){var P=Math.round(Math.max(28,H*.05));return stripeTile(r.s[0],r.s[1],P)});P1.forEach(function(c){c.p=null;c.P=c.width/S})},
  draw:function(g,W,H,t){g.drawImage(back,0,0,W,H);
    for(var i=0;i<rb.length;i++){var r=rb[i],c=P1[i],sh=r.sp*t;if(!c.p)c.p=pat(g,c,'repeat');
      function ty(x){var u=x-sh;return H*r.y+H*r.a*sin(TAU*r.k*u/W+r.ph)}
      function th(x){var u=x-sh;return H*r.th*(.62+.38*sin(TAU*r.tw*u/W+r.ph*2+t*.5))}
      g.save();g.beginPath();g.moveTo(0,ty(0)+10);for(var x=0;x<=W+10;x+=10)g.lineTo(x,ty(x)+th(x)+12);for(var x2=W+10;x2>=0;x2-=10)g.lineTo(x2,ty(x2)+th(x2)+12);g.closePath();g.fillStyle='rgba(0,0,0,.28)';g.fill();g.restore();
      g.save();g.beginPath();for(var a=0;a<=W+10;a+=10){var y=ty(a);a?g.lineTo(a,y):g.moveTo(a,y)}for(var b=W+10;b>=0;b-=10)g.lineTo(b,ty(b)+th(b));g.closePath();g.clip();
      g.translate(mod(sh*1.2,c.P*Math.SQRT2*0+c.P),0);g.fillStyle=c.p;g.fillRect(-c.P,0,W+c.P,H);
      var sg=g.createLinearGradient(0,H*(r.y-.1),0,H*(r.y+.3));sg.addColorStop(0,'rgba(255,255,255,.25)');sg.addColorStop(.5,'rgba(255,255,255,0)');sg.addColorStop(1,'rgba(0,0,0,.25)');g.setTransform(S,0,0,S,0,0);g.fillStyle=sg;g.fillRect(0,0,W,H);g.restore();
      g.beginPath();for(var a2=0;a2<=W+10;a2+=10){var y2=ty(a2);a2?g.lineTo(a2,y2):g.moveTo(a2,y2)}g.strokeStyle='rgba(255,255,255,.45)';g.lineWidth=2;g.stroke()}
    g.fillStyle='rgba(34,4,14,.42)';g.fillRect(0,0,W,H)}
}}};

/* =====================  CURSOR EFFECTS  ===================== */
var P={x:-999,y:-999,tx:-999,ty:-999,dx:0,dy:0,d:0,sp:0,ready:false,down:false,hit:0};
function stepper(step){var acc=0;return function(cb){var d=P.d;acc+=d;while(acc>=step){acc-=step;var f=d?acc/d:0;cb(P.x-P.dx*f,P.y-P.dy*f)}}}
function purge(a,test){for(var i=a.length-1;i>=0;i--)if(test(a[i]))a.splice(i,1)}
function star(g,x,y,r,rot,pts,inner){g.beginPath();for(var i=0;i<pts*2;i++){var a=rot+i*PI/pts,rad=i%2?r*inner:r;g.lineTo(x+cos(a)*rad,y+sin(a)*rad)}g.closePath();g.fill()}
function flake(g,x,y,r,rot){g.beginPath();for(var i=0;i<3;i++){var a=rot+i*PI/3;g.moveTo(x+cos(a)*r,y+sin(a)*r);g.lineTo(x-cos(a)*r,y-sin(a)*r);
  for(var s=-1;s<=1;s+=2){var bx=x+cos(a)*r*.55*s,by=y+sin(a)*r*.55*s;g.moveTo(bx,by);g.lineTo(bx+cos(a+.9)*r*.28*s,by+sin(a+.9)*r*.28*s);g.moveTo(bx,by);g.lineTo(bx+cos(a-.9)*r*.28*s,by+sin(a-.9)*r*.28*s)}}g.stroke()}
function emojiFont(g,s){g.font=s+'px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';g.textAlign='center';g.textBaseline='middle'}
function burstAt(arr,mkp,n){for(var i=0;i<n;i++)arr.push(mkp(i))}

var TR={};
TR.comet={label:'Comet Trail',make:function(){var pts=[],sparks=[];return{draw:function(g,dt,t){
  pts.push({x:P.x,y:P.y,a:0});for(var i=0;i<pts.length;i++)pts[i].a+=dt;while(pts.length&&pts[0].a>.75)pts.shift();
  g.globalCompositeOperation='lighter';g.lineCap='round';g.lineJoin='round';
  for(var i2=1;i2<pts.length;i2++){var a=pts[i2],b=pts[i2-1],k=1-a.a/.75;g.beginPath();g.moveTo(b.x,b.y);g.lineTo(a.x,a.y);g.lineWidth=22*k;g.strokeStyle=hexA(C(0),.16*k);g.stroke();g.lineWidth=6*k+1;g.strokeStyle=hexA(C(1),.85*k);g.stroke()}
  if(P.sp>30)for(var s=0;s<2;s++)sparks.push({x:P.x,y:P.y,vx:rr(-60,60)-P.dx*3,vy:rr(-60,60)-P.dy*3,l:1});
  for(var j=0;j<sparks.length;j++){var q=sparks[j];q.x+=q.vx*dt;q.y+=q.vy*dt;q.l-=dt*1.6;g.fillStyle=hexA(C(2),Math.max(0,q.l));g.beginPath();g.arc(q.x,q.y,1.8*q.l+.4,0,TAU);g.fill()}purge(sparks,function(q){return q.l<=0});
  glow(g,P.x,P.y,34,C(1),.9);g.fillStyle='#fff';g.beginPath();g.arc(P.x,P.y,5,0,TAU);g.fill()}}}};

TR.sparkles={label:'Sparkle Dust',make:function(){var ps=[],st=stepper(16);return{draw:function(g,dt,t){
  st(function(x,y){ps.push({x:x+rr(-6,6),y:y+rr(-6,6),vx:rr(-30,30),vy:rr(-40,10),r:rr(5,12),rot:rr(0,PI),l:1,c:C(Math.floor(R()*4))})});
  if(R()<.25)ps.push({x:P.x+rr(-14,14),y:P.y+rr(-14,14),vx:0,vy:-12,r:rr(4,9),rot:0,l:1,c:C(2)});
  g.globalCompositeOperation='lighter';for(var i=0;i<ps.length;i++){var p=ps[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=40*dt;p.l-=dt*1.1;p.rot+=dt*2;var s=Math.max(0,p.l);g.fillStyle=hexA(p.c,s);star(g,p.x,p.y,p.r*s+1,p.rot,4,.25);}
  purge(ps,function(p){return p.l<=0});glow(g,P.x,P.y,18,C(2),.5)}}}};

TR.ripple={label:'Ripple Rings',make:function(){var rs=[],st=stepper(46),i0=0;return{draw:function(g,dt,t){
  st(function(x,y){rs.push({x:x,y:y,r:4,mr:rr(70,110),c:C(i0++)})});if(P.hit){rs.push({x:P.x,y:P.y,r:4,mr:200,c:C(2)});P.hit=0}
  g.lineWidth=2.4;for(var i=0;i<rs.length;i++){var r=rs[i];r.r+=(r.mr-r.r)*dt*2.2+dt*14;var k=1-r.r/r.mr;g.strokeStyle=hexA(r.c,Math.max(0,k)*.9);g.beginPath();g.arc(r.x,r.y,r.r,0,TAU);g.stroke();g.strokeStyle=hexA(r.c,Math.max(0,k)*.4);g.beginPath();g.arc(r.x,r.y,r.r*.62,0,TAU);g.stroke()}
  purge(rs,function(r){return r.mr-r.r<1.5});g.fillStyle=C(0);g.beginPath();g.arc(P.x,P.y,4,0,TAU);g.fill()}}}};

TR.magnetic={label:'Magnetic Dots',make:function(){var cx=P.x,cy=P.y;return{draw:function(g,dt,t){
  cx+=(P.x-cx)*Math.min(1,dt*9);cy+=(P.y-cy)*Math.min(1,dt*9);var W=innerWidth,H=innerHeight,sp=W<600?30:36,Rr=190;
  var x0=Math.max(0,Math.floor((cx-Rr)/sp)),x1=Math.ceil((cx+Rr)/sp),y0=Math.max(0,Math.floor((cy-Rr)/sp)),y1=Math.ceil((cy+Rr)/sp);
  for(var gy=y0;gy<=y1;gy++)for(var gx=x0;gx<=x1;gx++){var x=gx*sp+sp/2,y=gy*sp+sp/2,dx=cx-x,dy=cy-y,d=hyp(dx,dy);if(d>Rr)continue;var f=1-d/Rr,f2=f*f,px=x+dx*f2*.55,py=y+dy*f2*.55;
    g.fillStyle=hexA(f>.6?C(2):f>.3?C(1):C(0),.25+.75*f);g.beginPath();g.arc(px,py,1.5+f2*8,0,TAU);g.fill()}
  g.strokeStyle=hexA(C(1),.6);g.lineWidth=1.5;g.beginPath();g.arc(cx,cy,22+sin(t*3)*3,0,TAU);g.stroke()}}}};

TR.orb={label:'Glowing Orb',make:function(){var x=P.x,y=P.y,h=[];return{draw:function(g,dt,t){
  x+=(P.x-x)*Math.min(1,dt*7);y+=(P.y-y)*Math.min(1,dt*7);h.push({x:x,y:y});if(h.length>16)h.shift();g.globalCompositeOperation='lighter';
  for(var i=0;i<h.length;i++){var k=i/h.length;glow(g,h[i].x,h[i].y,40*k+8,C(i%2?1:3),.12*k)}
  var pr=1+.12*sin(t*4);glow(g,x,y,90*pr,C(1),.4);glow(g,x,y,48*pr,C(3),.6);glow(g,x,y,22,'#ffffff',.95);
  g.strokeStyle=hexA(C(2),.5);g.lineWidth=1.5;g.beginPath();g.arc(x,y,30+sin(t*2)*4,0,TAU);g.stroke()}}}};

TR.constellation={label:'Constellation',make:function(){var ns=[];for(var i=0;i<30;i++)ns.push({x:P.x+rr(-200,200),y:P.y+rr(-200,200),vx:rr(-20,20),vy:rr(-20,20)});return{draw:function(g,dt,t){
  g.lineWidth=1;for(var i=0;i<ns.length;i++){var n=ns[i];n.x+=n.vx*dt;n.y+=n.vy*dt;var dx=P.x-n.x,dy=P.y-n.y,d=hyp(dx,dy)||1;n.vx+=dx/d*40*dt+rr(-30,30)*dt;n.vy+=dy/d*40*dt+rr(-30,30)*dt;n.vx*=.985;n.vy*=.985;
    if(d>280){n.x=P.x+rr(-160,160);n.y=P.y+rr(-160,160);n.vx=n.vy=0}}
  for(var a=0;a<ns.length;a++){for(var b=a+1;b<ns.length;b++){var d2=hyp(ns[a].x-ns[b].x,ns[a].y-ns[b].y);if(d2<120){g.strokeStyle=hexA(C(1),(1-d2/120)*.6);g.beginPath();g.moveTo(ns[a].x,ns[a].y);g.lineTo(ns[b].x,ns[b].y);g.stroke()}}
    var dc=hyp(ns[a].x-P.x,ns[a].y-P.y);if(dc<170){g.strokeStyle=hexA(C(2),(1-dc/170)*.8);g.beginPath();g.moveTo(ns[a].x,ns[a].y);g.lineTo(P.x,P.y);g.stroke()}
    g.fillStyle='#fff';g.beginPath();g.arc(ns[a].x,ns[a].y,2+(a%3)*.6,0,TAU);g.fill()}
  glow(g,P.x,P.y,26,C(2),.8)}}}};

TR.ink={label:'Ink Trail',make:function(){var pts=[];return{draw:function(g,dt,t){
  pts.push({x:P.x,y:P.y,w:clamp(16-P.sp*.012,2.5,14),a:0});for(var i=0;i<pts.length;i++)pts[i].a+=dt;while(pts.length&&pts[0].a>1.5)pts.shift();
  g.lineCap='round';g.lineJoin='round';for(var i2=1;i2<pts.length;i2++){var a=pts[i2],b=pts[i2-1],k=1-a.a/1.5;g.beginPath();g.moveTo(b.x,b.y);g.lineTo(a.x,a.y);g.lineWidth=a.w*(.35+.65*k);g.strokeStyle=hexA(k>.5?C(0):C(3),.9*k);g.stroke()}
  g.fillStyle=C(0);g.beginPath();g.arc(P.x,P.y,6,0,TAU);g.fill();g.fillStyle=hexA('#ffffff',.7);g.beginPath();g.arc(P.x-1.5,P.y-1.5,2,0,TAU);g.fill()}}}};

TR.fireflies={label:'Firefly Swarm',make:function(){var cx=P.x,cy=P.y,f=[];for(var i=0;i<22;i++)f.push({a:rr(0,TAU),r:rr(20,110),s:rr(.5,1.6)*(R()<.5?-1:1),p:rr(0,6),x:P.x,y:P.y});return{draw:function(g,dt,t){
  cx+=(P.x-cx)*Math.min(1,dt*5);cy+=(P.y-cy)*Math.min(1,dt*5);g.globalCompositeOperation='lighter';
  for(var i=0;i<f.length;i++){var q=f[i];q.a+=q.s*dt;var tx=cx+cos(q.a)*q.r*(1+.3*sin(t+q.p)),ty=cy+sin(q.a*1.3)*q.r*.8;q.x+=(tx-q.x)*Math.min(1,dt*3);q.y+=(ty-q.y)*Math.min(1,dt*3);
    var fl=.35+.65*Math.max(0,sin(t*2.2+q.p*3));glow(g,q.x,q.y,20,i%3?C(2):C(1),.8*fl);g.fillStyle=hexA('#ffffff',fl);g.beginPath();g.arc(q.x,q.y,1.8,0,TAU);g.fill()}}}}};

TR.emoji={label:'Emoji Parade',make:function(){var ch=[];for(var i=0;i<6;i++)ch.push({x:P.x,y:P.y,a:0});return{draw:function(g,dt,t){
  emojiFont(g,34);var tx=P.x,ty=P.y;for(var i=0;i<ch.length;i++){var c=ch[i],k=Math.min(1,dt*(12-i*1.4));c.x+=(tx-c.x)*k;c.y+=(ty-c.y)*k;c.a=Math.atan2(ty-c.y,tx-c.x);
    var s=1-i*.1;g.save();g.translate(c.x,c.y+sin(t*6-i)*3);g.scale(s,s);g.globalAlpha=1-i*.1;g.fillText(EMOJI[i%EMOJI.length],0,0);g.restore();tx=c.x-cos(c.a)*8;ty=c.y-sin(c.a)*8}
  g.globalAlpha=1}}}};

TR.bubbles={label:'Soap Bubbles',make:function(){var bs=[],st=stepper(22);return{draw:function(g,dt,t){
  st(function(x,y){bs.push({x:x+rr(-8,8),y:y,r:rr(5,18),vy:-rr(30,70),w:rr(0,6),l:1,c:C(Math.floor(R()*3))})});
  for(var i=0;i<bs.length;i++){var b=bs[i];b.y+=b.vy*dt;b.w+=dt*3;b.x+=sin(b.w)*18*dt;b.l-=dt*.45;var a=Math.max(0,Math.min(1,b.l*1.5));
    g.fillStyle=hexA(b.c,.12*a);g.beginPath();g.arc(b.x,b.y,b.r,0,TAU);g.fill();g.strokeStyle=hexA(b.c,.85*a);g.lineWidth=1.6;g.stroke();
    g.fillStyle='rgba(255,255,255,'+.9*a+')';g.beginPath();g.arc(b.x-b.r*.35,b.y-b.r*.35,b.r*.2,0,TAU);g.fill()}
  purge(bs,function(b){return b.l<=0});g.strokeStyle=hexA(C(1),.7);g.lineWidth=2;g.beginPath();g.arc(P.x,P.y,10,0,TAU);g.stroke()}}}};

TR.confetti={label:'Confetti Cannon',make:function(){var cs=[],st=stepper(10);function add(x,y,n,sp){for(var i=0;i<n;i++)cs.push({x:x,y:y,vx:rr(-sp,sp)+P.dx*4,vy:rr(-sp,sp*.3)-60,r:rr(0,TAU),vr:rr(-9,9),w:rr(5,10),h:rr(3,6),l:1,c:C(Math.floor(R()*5))})}
  return{draw:function(g,dt,t){st(function(x,y){add(x,y,1,90)});if(P.hit){add(P.x,P.y,40,380);P.hit=0}
  for(var i=0;i<cs.length;i++){var c=cs[i];c.vy+=520*dt;c.vx*=.99;c.x+=c.vx*dt;c.y+=c.vy*dt;c.r+=c.vr*dt;c.l-=dt*.55;g.save();g.translate(c.x,c.y);g.rotate(c.r);g.scale(1,Math.abs(sin(c.r*1.3))*.8+.2);g.fillStyle=hexA(c.c,Math.max(0,Math.min(1,c.l*2)));g.fillRect(-c.w/2,-c.h/2,c.w,c.h);g.restore()}
  purge(cs,function(c){return c.l<=0||c.y>innerHeight+20});g.fillStyle=C(2);g.beginPath();g.arc(P.x,P.y,5,0,TAU);g.fill()}}}};

TR.rainbow={label:'Rainbow Ribbon',make:function(){var pts=[];return{draw:function(g,dt,t){
  pts.push({x:P.x,y:P.y});if(pts.length>34)pts.shift();var cols=['#ff4d6d','#ffa94d','#ffe066','#69db7c','#4dabf7','#9775fa'];g.lineCap='round';g.lineJoin='round';
  for(var j=0;j<cols.length;j++){g.beginPath();for(var i=0;i<pts.length;i++){var a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],nx=-(b.y-a.y),ny=b.x-a.x,l=hyp(nx,ny)||1,k=i/pts.length,o=(j-2.5)*5*k+sin(t*8+i*.5)*3*k*(j%2?1:-1);
      var x=pts[i].x+nx/l*o,y=pts[i].y+ny/l*o;i?g.lineTo(x,y):g.moveTo(x,y)}g.lineWidth=4;g.strokeStyle=cols[j];g.globalAlpha=.9;g.stroke()}
  g.globalAlpha=1;g.fillStyle='#fff';g.beginPath();g.arc(P.x,P.y,5,0,TAU);g.fill()}}}};

TR.electric={label:'Electric Arc',make:function(){var anchors=[],ft=0,paths=[];for(var i=0;i<4;i++)anchors.push({x:P.x,y:P.y});return{draw:function(g,dt,t){
  var tx=P.x,ty=P.y;for(var i=0;i<anchors.length;i++){var a=anchors[i],k=Math.min(1,dt*(9-i*1.7));a.x+=(tx-a.x)*k;a.y+=(ty-a.y)*k;tx=a.x;ty=a.y}
  ft-=dt;if(ft<=0){ft=.04;paths=[];var prev={x:P.x,y:P.y};for(var j=0;j<anchors.length;j++){var q=anchors[j],pts=[[prev.x,prev.y]],n=7;for(var s=1;s<n;s++){var f=s/n;pts.push([prev.x+(q.x-prev.x)*f+rr(-18,18),prev.y+(q.y-prev.y)*f+rr(-18,18)])}pts.push([q.x,q.y]);paths.push(pts);prev=q}
    for(var b=0;b<2;b++){var an=anchors[Math.floor(R()*anchors.length)],bp=[[an.x,an.y]];var ang=rr(0,TAU);for(var s2=1;s2<5;s2++)bp.push([an.x+cos(ang+rr(-.5,.5))*s2*14,an.y+sin(ang+rr(-.5,.5))*s2*14]);paths.push(bp)}}
  g.globalCompositeOperation='lighter';g.lineJoin='round';for(var pass=0;pass<2;pass++){g.lineWidth=pass?1.6:7;g.strokeStyle=pass?'#ffffff':hexA(C(1),.3);for(var p=0;p<paths.length;p++){g.beginPath();paths[p].forEach(function(pt,i){i?g.lineTo(pt[0],pt[1]):g.moveTo(pt[0],pt[1])});g.stroke()}}
  glow(g,P.x,P.y,40,C(1),.9);for(var a2=0;a2<anchors.length;a2++)glow(g,anchors[a2].x,anchors[a2].y,14,C(0),.8)}}}};

TR.pixel={label:'Pixel Trail',make:function(){var cells={},list=[],cs=16;return{draw:function(g,dt,t){
  var gx=Math.floor(P.x/cs),gy=Math.floor(P.y/cs),key=gx+','+gy;var steps=Math.max(1,Math.ceil(P.d/cs));
  for(var s=0;s<=steps;s++){var px=P.x-P.dx*(1-s/steps),py=P.y-P.dy*(1-s/steps),k2=Math.floor(px/cs)+','+Math.floor(py/cs);if(!cells[k2]){var c={x:Math.floor(px/cs)*cs,y:Math.floor(py/cs)*cs,l:1,c:C(Math.floor(t*3+s)%4)};cells[k2]=c;list.push({k:k2,c:c})}else cells[k2].l=1}
  for(var i=0;i<list.length;i++){var c2=list[i].c;c2.l-=dt*.9;var l=Math.floor(c2.l*5)/5;if(l>0){g.fillStyle=hexA(c2.c,l);var sz=cs*(.4+.6*l);g.fillRect(c2.x+(cs-sz)/2,c2.y+(cs-sz)/2,sz,sz)}}
  for(var j=list.length-1;j>=0;j--)if(list[j].c.l<=0){delete cells[list[j].k];list.splice(j,1)}
  g.strokeStyle='#fff';g.lineWidth=2;g.strokeRect(gx*cs,gy*cs,cs,cs)}}}};

TR.satellites={label:'Orbiting Moons',make:function(){var cx=P.x,cy=P.y,m=[{r:30,s:4,c:0,h:[]},{r:52,s:-2.8,c:1,h:[]},{r:78,s:2,c:2,h:[]}];return{draw:function(g,dt,t){
  cx+=(P.x-cx)*Math.min(1,dt*10);cy+=(P.y-cy)*Math.min(1,dt*10);g.globalCompositeOperation='lighter';glow(g,cx,cy,30,C(3),.6);
  for(var i=0;i<m.length;i++){var o=m[i],a=t*o.s+i*2,x=cx+cos(a)*o.r,y=cy+sin(a)*o.r*.9;o.h.push({x:x,y:y});if(o.h.length>14)o.h.shift();
    g.strokeStyle=hexA(C(o.c),.18);g.lineWidth=1;g.beginPath();g.arc(cx,cy,o.r,0,TAU);g.stroke();
    for(var j=1;j<o.h.length;j++){var k=j/o.h.length;g.strokeStyle=hexA(C(o.c),k*.7);g.lineWidth=5*k;g.lineCap='round';g.beginPath();g.moveTo(o.h[j-1].x,o.h[j-1].y);g.lineTo(o.h[j].x,o.h[j].y);g.stroke()}
    glow(g,x,y,16,C(o.c),.9);g.fillStyle='#fff';g.beginPath();g.arc(x,y,3.2,0,TAU);g.fill()}}}}};

TR.ember={label:'Ember Trail',make:function(){var ps=[],st=stepper(7);return{draw:function(g,dt,t){
  st(function(x,y){ps.push({x:x+rr(-5,5),y:y+rr(-5,5),vx:rr(-25,25)-P.dx,vy:-rr(40,110),l:1,r:rr(2,5)})});if(R()<.5)ps.push({x:P.x+rr(-6,6),y:P.y,vx:rr(-10,10),vy:-rr(30,80),l:1,r:rr(2,4)});
  g.globalCompositeOperation='lighter';for(var i=0;i<ps.length;i++){var p=ps[i];p.x+=p.vx*dt+sin(t*5+i)*.4;p.y+=p.vy*dt;p.l-=dt*.9;var l=Math.max(0,p.l),col=l>.65?'#fff1a8':l>.35?'#ff9f43':'#e0443a';glow(g,p.x,p.y,p.r*4*l+3,col,.55*l);g.fillStyle=hexA(col,l);g.beginPath();g.arc(p.x,p.y,p.r*l,0,TAU);g.fill()}
  purge(ps,function(p){return p.l<=0});glow(g,P.x,P.y,30,'#ff9f43',.8);glow(g,P.x,P.y,12,'#fff1a8',1)}}}};

TR.lens={label:'Targeting Lens',make:function(){var r=30,rot=0,x=P.x,y=P.y;return{draw:function(g,dt,t){
  x+=(P.x-x)*Math.min(1,dt*14);y+=(P.y-y)*Math.min(1,dt*14);var tr=34+Math.min(26,P.sp*.03)+(P.down?-8:0);r+=(tr-r)*Math.min(1,dt*10);rot+=dt*(.8+P.sp*.004);
  g.strokeStyle=C(2);g.lineWidth=2;g.beginPath();g.arc(x,y,r,0,TAU);g.stroke();g.strokeStyle=hexA(C(2),.35);g.beginPath();g.arc(x,y,r+12,0,TAU);g.stroke();
  g.strokeStyle=C(0);g.lineWidth=3;for(var i=0;i<4;i++){var a=rot+i*PI/2;g.beginPath();g.arc(x,y,r+6,a,a+.5);g.stroke()}
  g.strokeStyle=C(2);g.lineWidth=1.5;g.beginPath();g.moveTo(x-r-16,y);g.lineTo(x-6,y);g.moveTo(x+6,y);g.lineTo(x+r+16,y);g.moveTo(x,y-r-16);g.lineTo(x,y-6);g.moveTo(x,y+6);g.lineTo(x,y+r+16);g.stroke();
  g.fillStyle=C(2);g.font='11px ui-monospace,Menlo,Consolas,monospace';g.textAlign='left';g.textBaseline='alphabetic';g.fillText('x:'+Math.round(x)+' y:'+Math.round(y),x+r+10,y-r-6);
  g.fillStyle=hexA(C(0),.9);g.beginPath();g.arc(x,y,3,0,TAU);g.fill()}}}};

TR.chevrons={label:'Chevron Trail',make:function(){var hd=0,tr=[],st=stepper(26);return{draw:function(g,dt,t){
  if(P.d>.5){var a=Math.atan2(P.dy,P.dx),da=Math.atan2(sin(a-hd),cos(a-hd));hd+=da*Math.min(1,dt*10)}
  st(function(x,y){tr.push({x:x,y:y,a:hd,l:1})});g.lineCap='round';g.lineJoin='round';
  for(var i=0;i<tr.length;i++){var c=tr[i];c.l-=dt*.9;var l=Math.max(0,c.l);g.save();g.translate(c.x,c.y);g.rotate(c.a);g.strokeStyle=hexA(i%2?C(0):C(2),l);g.lineWidth=3;g.beginPath();g.moveTo(-6*l-2,-8*l-1);g.lineTo(4,0);g.lineTo(-6*l-2,8*l+1);g.stroke();g.restore()}
  purge(tr,function(c){return c.l<=0});g.save();g.translate(P.x,P.y);g.rotate(hd);g.fillStyle=C(2);g.beginPath();g.moveTo(16,0);g.lineTo(-10,-11);g.lineTo(-4,0);g.lineTo(-10,11);g.closePath();g.fill();g.strokeStyle=C(0);g.lineWidth=2;g.stroke();g.restore()}}}};

TR.splats={label:'Paint Splats',make:function(){var sp=[],st=stepper(70),i0=0;return{draw:function(g,dt,t){
  function add(x,y,s){var c=C(i0++),drops=[];for(var i=0;i<9;i++){var a=rr(0,TAU),d=rr(.8,2.2)*s;drops.push({x:cos(a)*d*18,y:sin(a)*d*18,r:rr(2,7)*s})}sp.push({x:x,y:y,s:s,c:c,l:0,life:1,drops:drops})}
  st(function(x,y){add(x,y,rr(.8,1.3))});if(P.hit){add(P.x,P.y,2);P.hit=0}
  for(var i=0;i<sp.length;i++){var q=sp[i];q.l=Math.min(1,q.l+dt*6);q.life-=dt*.4;var a=Math.max(0,Math.min(1,q.life*1.6)),e=1-Math.pow(1-q.l,3);g.fillStyle=hexA(q.c,.9*a);g.beginPath();g.arc(q.x,q.y,16*q.s*e,0,TAU);g.fill();
    for(var d=0;d<q.drops.length;d++){var dr=q.drops[d];g.beginPath();g.arc(q.x+dr.x*e,q.y+dr.y*e,dr.r*e,0,TAU);g.fill()}}
  purge(sp,function(q){return q.life<=0});g.fillStyle='#fff';g.strokeStyle=C(0);g.lineWidth=3;g.beginPath();g.arc(P.x,P.y,7,0,TAU);g.fill();g.stroke()}}}};

TR.leaves={label:'Falling Leaves',make:function(){var ls=[],st=stepper(26),cols=['#ff8a5b','#ffb347','#d6452a','#e9b23f'];return{draw:function(g,dt,t){
  st(function(x,y){ls.push({x:x,y:y,vx:rr(-30,30),vy:rr(10,50),r:rr(0,TAU),vr:rr(-3,3),s:rr(8,15),w:rr(0,6),l:1,c:cols[Math.floor(R()*4)]})});
  for(var i=0;i<ls.length;i++){var l=ls[i];l.w+=dt*3;l.x+=(l.vx+sin(l.w)*50)*dt;l.y+=l.vy*dt;l.vy+=22*dt;l.r+=l.vr*dt;l.l-=dt*.4;g.save();g.translate(l.x,l.y);g.rotate(l.r);g.fillStyle=hexA(l.c,Math.max(0,Math.min(1,l.l*2)));
    g.beginPath();g.moveTo(-l.s,0);g.quadraticCurveTo(0,-l.s*.7,l.s,0);g.quadraticCurveTo(0,l.s*.7,-l.s,0);g.fill();g.strokeStyle='rgba(60,20,10,.4)';g.lineWidth=1;g.beginPath();g.moveTo(-l.s,0);g.lineTo(l.s,0);g.stroke();g.restore()}
  purge(ls,function(l){return l.l<=0||l.y>innerHeight+30});g.fillStyle=cols[0];g.beginPath();g.arc(P.x,P.y,6,0,TAU);g.fill()}}}};

TR.snow={label:'Snowflake Flurry',make:function(){var fs=[],st=stepper(14);return{draw:function(g,dt,t){
  st(function(x,y){fs.push({x:x+rr(-8,8),y:y,vx:rr(-20,20),vy:rr(15,45),r:rr(4,10),a:rr(0,PI),va:rr(-1.5,1.5),w:rr(0,6),l:1})});
  g.lineCap='round';for(var i=0;i<fs.length;i++){var f=fs[i];f.w+=dt*2;f.x+=(f.vx+sin(f.w)*25)*dt;f.y+=f.vy*dt;f.a+=f.va*dt;f.l-=dt*.35;g.strokeStyle='rgba(235,248,255,'+Math.max(0,Math.min(1,f.l*2))+')';g.lineWidth=1.4;flake(g,f.x,f.y,f.r,f.a)}
  purge(fs,function(f){return f.l<=0});g.strokeStyle='#fff';g.lineWidth=2;flake(g,P.x,P.y,13,t)}}}};

TR.starshower={label:'Star Shower',make:function(){var ss=[],st=stepper(18);return{draw:function(g,dt,t){
  st(function(x,y){ss.push({x:x+rr(-10,10),y:y,vx:rr(-20,20),vy:rr(40,120),r:rr(5,11),rot:rr(0,PI),l:1})});g.globalCompositeOperation='lighter';
  for(var i=0;i<ss.length;i++){var s=ss[i];s.vy+=160*dt;s.x+=s.vx*dt;s.y+=s.vy*dt;s.rot+=dt*3;s.l-=dt*.8;var l=Math.max(0,s.l);var gr=g.createLinearGradient(s.x,s.y-s.vy*.12,s.x,s.y);gr.addColorStop(0,hexA(C(0),0));gr.addColorStop(1,hexA(C(0),.7*l));g.strokeStyle=gr;g.lineWidth=2;g.beginPath();g.moveTo(s.x-s.vx*.05,s.y-s.vy*.12);g.lineTo(s.x,s.y);g.stroke();
    g.fillStyle=hexA(C(0),l);star(g,s.x,s.y,s.r*(.5+l*.5),s.rot,5,.45)}
  purge(ss,function(s){return s.l<=0});glow(g,P.x,P.y,28,C(0),.7);g.fillStyle='#fff7d6';star(g,P.x,P.y,12,t*2,5,.45)}}}};

TR.holly={label:'Holly Wreath',make:function(){var cx=P.x,cy=P.y;return{draw:function(g,dt,t){
  cx+=(P.x-cx)*Math.min(1,dt*9);cy+=(P.y-cy)*Math.min(1,dt*9);var n=8,r=34+sin(t*2)*3;g.lineWidth=2;
  for(var i=0;i<n;i++){var a=t*1.1+i*TAU/n,x=cx+cos(a)*r,y=cy+sin(a)*r;g.save();g.translate(x,y);g.rotate(a+PI/2);g.fillStyle=i%2?'#2f8f4e':'#3fae63';g.beginPath();g.moveTo(0,-11);g.quadraticCurveTo(10,0,0,11);g.quadraticCurveTo(-10,0,0,-11);g.fill();g.restore()}
  for(var j=0;j<3;j++){var b=-t*1.6+j*TAU/3,bx=cx+cos(b)*(r+1),by=cy+sin(b)*(r+1);g.fillStyle='#d61f3d';g.beginPath();g.arc(bx,by,5.5,0,TAU);g.fill();g.fillStyle='rgba(255,255,255,.7)';g.beginPath();g.arc(bx-1.6,by-1.6,1.6,0,TAU);g.fill()}
  glow(g,cx,cy,22,'#e9b23f',.55);g.fillStyle='#e9b23f';star(g,cx,cy,8,-t,5,.45)}}}};

TR.peppermint={label:'Peppermint Pops',make:function(){var ps=[],st=stepper(36);return{draw:function(g,dt,t){
  function add(x,y){ps.push({x:x,y:y,vx:rr(-60,60)+P.dx*2,vy:rr(-120,-20),r:rr(0,TAU),vr:rr(-5,5),s:rr(9,17),l:1})}
  st(function(x,y){add(x,y)});if(P.hit){for(var i=0;i<14;i++)add(P.x,P.y);P.hit=0}
  for(var i2=0;i2<ps.length;i2++){var p=ps[i2];p.vy+=300*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.r+=p.vr*dt;p.l-=dt*.6;g.save();g.translate(p.x,p.y);g.rotate(p.r);g.globalAlpha=Math.max(0,Math.min(1,p.l*2));
    g.fillStyle='#fff6e6';g.beginPath();g.arc(0,0,p.s,0,TAU);g.fill();g.fillStyle='#d61f3d';for(var k=0;k<6;k++){g.beginPath();g.moveTo(0,0);g.arc(0,0,p.s,k*PI/3,k*PI/3+PI/6);g.closePath();g.fill()}
    g.strokeStyle='rgba(120,10,30,.5)';g.lineWidth=1;g.beginPath();g.arc(0,0,p.s,0,TAU);g.stroke();g.restore()}
  g.globalAlpha=1;purge(ps,function(p){return p.l<=0||p.y>innerHeight+30});
  g.save();g.translate(P.x,P.y);g.rotate(t*2);g.fillStyle='#fff6e6';g.beginPath();g.arc(0,0,11,0,TAU);g.fill();g.fillStyle='#d61f3d';for(var k2=0;k2<6;k2++){g.beginPath();g.moveTo(0,0);g.arc(0,0,11,k2*PI/3,k2*PI/3+PI/6);g.closePath();g.fill()}g.restore()}}}};

TR.calm={label:'Soft Glow (calm mode)',make:function(){var x=P.x,y=P.y;return{draw:function(g,dt,t){x+=(P.x-x)*Math.min(1,dt*5);y+=(P.y-y)*Math.min(1,dt*5);glow(g,x,y,46,C(1),.35);g.fillStyle=hexA(C(1),.9);g.beginPath();g.arc(x,y,5,0,TAU);g.fill()}}}};

/* =====================  ENGINE  ===================== */
var bgNames=(body.dataset.bgs||'skyline,neongrid').split(','),trNames=(body.dataset.trackers||'comet,sparkles,ripple').split(',');
var cvA=document.getElementById('bgA'),cvB=document.getElementById('bgB'),cvT=document.getElementById('fx');
if(!cvA||!cvB||!cvT)return;
var gA=cvA.getContext('2d'),gB=cvB.getContext('2d'),gT=cvT.getContext('2d');
var bgs=[BG[bgNames[0]].make(),BG[bgNames[1]].make()],W=0,H=0,TW=0,TH=0,DPR=Math.min(window.devicePixelRatio||1,2);
var dk={trN:document.getElementById('dk-tr-name'),trS:document.getElementById('dk-tr-sec'),trB:document.getElementById('dk-tr-bar'),bgN:document.getElementById('dk-bg-name'),bgI:document.getElementById('dk-bg-n'),tr:document.getElementById('dk-tr'),bg:document.getElementById('dk-bg')};
var q=location.search.match(/[?&]t=([\d.]+)/),T0=q?parseFloat(q[1]):0;

function resize(force){
  var nw=innerWidth,nh=Math.max(cvA.clientHeight||innerHeight,innerHeight);
  TW=innerWidth;TH=innerHeight;cvT.width=Math.round(TW*DPR);cvT.height=Math.round(TH*DPR);gT.setTransform(DPR,0,0,DPR,0,0);
  if(!force&&nw===W&&Math.abs(nh-H)<140)return;
  W=nw;H=nh;[cvA,cvB].forEach(function(c){c.width=Math.round(W*S);c.height=Math.round(H*S)});
  gA.setTransform(S,0,0,S,0,0);gB.setTransform(S,0,0,S,0,0);bgs.forEach(function(b){b.resize(W,H)});
  if(reduce){bgs[0].draw(gA,W,H,6);bgs[1].draw(gB,W,H,6)}
}
var rz;addEventListener('resize',function(){clearTimeout(rz);rz=setTimeout(function(){resize(false)},120)},{passive:true});

/* pointer input (mouse, pen and touch; touch also works while scrolling) */
var lastIn=-99,touching=false,now0=performance.now();
function inp(x,y){P.tx=x;P.ty=y;lastIn=(performance.now()-now0)/1000+T0;P.ready=true}
addEventListener('pointermove',function(e){if(e.pointerType!=='touch')inp(e.clientX,e.clientY)},{passive:true});
addEventListener('pointerdown',function(e){if(e.pointerType!=='touch'){inp(e.clientX,e.clientY);P.hit=1}},{passive:true});
addEventListener('touchstart',function(e){touching=true;var t=e.touches[0];inp(t.clientX,t.clientY);P.hit=1},{passive:true});
addEventListener('touchmove',function(e){var t=e.touches[0];inp(t.clientX,t.clientY)},{passive:true});
addEventListener('touchend',function(){touching=false;lastIn=(performance.now()-now0)/1000+T0},{passive:true});
addEventListener('touchcancel',function(){touching=false},{passive:true});

var BGP=26,FADE=2.6,TRP=10,bgIdx=0,trIdx=-1,cur=null,fadeEnd=-1,calm=reduce,frames=0,slow=0;
function setBG(i,t,first){bgIdx=i;cvA.classList.toggle('on',i===0);cvB.classList.toggle('on',i===1);fadeEnd=first?-1:t+FADE+.2;
  if(dk.bgN){dk.bgN.textContent=BG[bgNames[i]].label;dk.bgI.textContent=(i+1)+'/2';if(!first){dk.bg.classList.remove('pop');void dk.bg.offsetWidth;dk.bg.classList.add('pop')}}}
function setTR(i){trIdx=i;var name=calm?'calm':trNames[i%trNames.length];cur=TR[name].make();gT.clearRect(0,0,TW,TH);
  if(dk.trN){dk.trN.textContent=TR[name].label;dk.tr.classList.remove('pop');void dk.tr.offsetWidth;dk.tr.classList.add('pop')}}
resize(true);setBG(Math.floor(T0/BGP)%2,T0,true);
if(calm){setTR(0);if(dk.trS)dk.trS.textContent='calm';if(dk.trB)dk.trB.style.transform='scaleX(0)'}

var last=performance.now();
function frame(now){requestAnimationFrame(frame);
  var dt=Math.min(.05,(now-last)/1000);last=now;if(dt<=0)return;var t=(now-now0)/1000+T0;
  /* quality guard */
  frames++;if(frames>60&&frames<=150){slow+=dt}else if(frames===151&&slow/90>.027&&S>.7&&!reduce){S=.7;resize(true)}
  /* pointer: follow the real pointer; drift on autopilot when idle so the effect is always on show */
  var idle=!touching&&(t-lastIn>2.5||!P.ready),ox=P.x,oy=P.y;
  if(idle&&!reduce){var ax=TW*.5+cos(t*.55)*TW*.3,ay=TH*.5+sin(t*.83)*TH*.24+sin(t*2.1)*TH*.04;
    if(P.x<-100){P.x=ax;P.y=ay}else{var k=1-Math.exp(-dt*3.2);P.x+=(ax-P.x)*k;P.y+=(ay-P.y)*k}}
  else if(P.ready){if(P.x<-100){P.x=P.tx;P.y=P.ty}else{var k2=1-Math.exp(-dt*45);P.x+=(P.tx-P.x)*k2;P.y+=(P.ty-P.y)*k2}}
  P.dx=P.x>-100&&ox>-100?P.x-ox:0;P.dy=P.x>-100&&ox>-100?P.y-oy:0;P.d=hyp(P.dx,P.dy);P.sp+=((P.d/dt)-P.sp)*Math.min(1,dt*8);
  /* backgrounds */
  if(!reduce){var nb=Math.floor(t/BGP)%2;if(nb!==bgIdx)setBG(nb,t,false)}
  if(!reduce){
    if(bgIdx===0||t<fadeEnd)bgs[0].draw(gA,W,H,t);if(bgIdx===1||t<fadeEnd)bgs[1].draw(gB,W,H,t)}
  else{var nb2=Math.floor(t/(BGP+10))%2;if(nb2!==bgIdx)setBG(nb2,t,false)}
  /* cursor effect: switch immediately every 10 s */
  if(!calm){var ni=Math.floor(t/TRP);if(ni!==trIdx)setTR(ni);
    var rem=TRP-(t%TRP);if(dk.trS){var s=Math.ceil(rem);if(dk.trS._v!==s){dk.trS._v=s;dk.trS.textContent=s+'s'}}if(dk.trB)dk.trB.style.transform='scaleX('+(rem/TRP)+')'}
  gT.clearRect(0,0,TW,TH);
  if(P.x>-100&&(!calm||P.ready)){gT.save();gT.globalCompositeOperation='source-over';gT.globalAlpha=1;gT.lineCap='butt';cur.draw(gT,dt,t);gT.restore()}
  P.hit=0}
requestAnimationFrame(function(n){last=n;now0=n;requestAnimationFrame(frame)});
document.documentElement.classList.add('fx-ready');
})();
