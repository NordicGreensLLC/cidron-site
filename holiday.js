(function(){
  "use strict";
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var santa=document.getElementById('santa');
  if(reduce){ if(santa) santa.classList.add('on'); return; }

  /* ---------- Snow: flat paper flakes on a canvas ---------- */
  var cv=document.getElementById('snow'), cx=cv.getContext('2d'), W=0,H=0,DPR=1,flakes=[];
  function size(){
    DPR=Math.min(window.devicePixelRatio||1,1.5); W=innerWidth; H=innerHeight;
    cv.width=W*DPR; cv.height=H*DPR; cx.setTransform(DPR,0,0,DPR,0,0);
    var n=Math.min(Math.round(W*H/14000),W<760?45:110);
    while(flakes.length<n) flakes.push(mk(true));
    flakes.length=n;
  }
  function mk(any){return{x:Math.random()*W,y:any?Math.random()*H:-10,r:1.6+Math.random()*2.6,s:18+Math.random()*30,w:Math.random()*6.28,ws:.6+Math.random(),hex:Math.random()<.3,a:Math.random()*6.28}}
  function hex(x,y,r,a){cx.beginPath();for(var i=0;i<6;i++){var t=a+i*Math.PI/3;cx.lineTo(x+Math.cos(t)*r,y+Math.sin(t)*r)}cx.closePath();cx.fill()}
  function drawSnow(dt){
    cx.clearRect(0,0,W,H);
    for(var i=0;i<flakes.length;i++){var f=flakes[i];
      f.y+=f.s*dt; f.w+=f.ws*dt; f.a+=.3*dt; var x=f.x+Math.sin(f.w)*10;
      if(f.y>H+10){flakes[i]=mk(false);continue}
      var r=f.hex?f.r*1.5:f.r;
      cx.fillStyle='rgba(31,42,68,.55)'; f.hex?hex(x+1,f.y+1,r,f.a):(cx.beginPath(),cx.arc(x+1,f.y+1,r,0,6.283),cx.fill());
      cx.fillStyle='#FFFFFF'; f.hex?hex(x,f.y,r,f.a):(cx.beginPath(),cx.arc(x,f.y,r,0,6.283),cx.fill());
    }
  }
  size(); addEventListener('resize',size,{passive:true});

  /* ---------- Santa follower ----------
     Yule goat on nordicgreensllc.com: EASE = 0.10 per frame.
     Santa: SANTA_EASE = 0.05 per 60fps frame (half speed), frame-rate independent. */
  var SANTA_EASE=0.05, parts=santa?[].slice.call(santa.querySelectorAll('.rd')):[];
  var SW=santa?santa.offsetWidth:120, x=innerWidth*.6, y=innerHeight*.5, tx=x, ty=y, ox=-SW-18, left=false;
  var phase=0, mouseT=0, tapT=0, t0=performance.now();
  santa&&santa.classList.add('on');
  var fine=window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  addEventListener('pointermove',function(e){ if(e.pointerType==='touch')return; mx=e.clientX; my=e.clientY; mouseT=performance.now(); },{passive:true});
  addEventListener('pointerdown',function(e){ if(e.pointerType!=='touch')return; mx=e.clientX; my=e.clientY; tapT=performance.now(); },{passive:true});
  document.documentElement.addEventListener('pointerleave',function(){ mouseT=0; });
  var mx=0,my=0;

  var last=0;
  function frame(now){
    var dt=last?Math.min((now-last)/1000,.1):0; last=now;
    if(document.hidden){requestAnimationFrame(frame);return}
    drawSnow(dt);
    if(santa){
      SW=santa.offsetWidth;
      var active=(mouseT&&now-mouseT<6000)||(tapT&&now-tapT<5000), px,py;
      if(active){px=mx;py=my+16}
      else{var t=(now-t0)/1000; px=innerWidth*.5+(innerWidth*.5-90)*Math.sin(t*.11); py=innerHeight*.55+innerHeight*.28*Math.sin(t*.19+1)}
      var k=1-Math.pow(1-SANTA_EASE,dt*60);
      var dx=px-x, dy=py-y; x+=dx*k; y+=dy*k;
      var sp=Math.sqrt(dx*dx+dy*dy)*k/(dt||1/60)/60;           // px per frame
      if(dx<-4&&!left){left=true;santa.classList.add('left')} else if(dx>4&&left){left=false;santa.classList.remove('left')}
      var want=left?18:-SW-18; ox+=(want-ox)*Math.min(1,k*1.6);
      // riding a wave: whole team bobs, and the bob rolls back from the lead reindeer to the sleigh
      phase+=dt*(4+Math.min(sp,8)*.9);
      var amp=2+Math.min(sp,6)*.9;
      var ride=Math.sin(phase*.5)*amp*1.4;
      for(var i=0;i<parts.length;i++){var idx=+parts[i].getAttribute('data-i');
        var b=Math.sin(phase-idx*1.1)*amp, r=Math.cos(phase-idx*1.1)*amp*1.2;
        parts[i].style.transform='translateY('+b.toFixed(2)+'px) rotate('+r.toFixed(2)+'deg)';
        parts[i].style.transformBox='fill-box'; parts[i].style.transformOrigin='50% 100%';
      }
      var tilt=Math.max(-12,Math.min(12,dy*k*2));
      santa.style.transform='translate3d('+(x+ox).toFixed(1)+'px,'+(y-28+ride).toFixed(1)+'px,0) rotate('+(left?-tilt:tilt).toFixed(1)+'deg)';
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
