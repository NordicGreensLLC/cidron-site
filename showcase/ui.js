/* Cidron showcase: scroll reveals, staggered text, parallax, counters, tilt, page transitions */
(function(){
'use strict';
var doc=document.documentElement,reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
var $=function(s,r){return[].slice.call((r||document).querySelectorAll(s))};
/* split text into letters/words with a stagger index */
$('.split').forEach(function(el){
  var txt=el.textContent,words=el.classList.contains('words'),i=0;el.setAttribute('aria-label',txt.replace(/\s+/g,' ').trim());el.textContent='';
  txt.split(/(\s+)/).forEach(function(part){
    if(/^\s+$/.test(part)||!part){el.appendChild(document.createTextNode(' '));return}
    var w=document.createElement('span');w.className='wd';w.setAttribute('aria-hidden','true');
    if(words){w.textContent=part;w.style.setProperty('--i',i++)}
    else part.split('').forEach(function(ch){var c=document.createElement('span');c.className='ch';c.textContent=ch;c.style.setProperty('--i',i++);w.appendChild(c)});
    el.appendChild(w)});
});
/* reveal on scroll */
var targets=$('.rv,.split'),heroDelay=reduce?0:650;
function show(el){el.classList.add('in')}
if(reduce||!('IntersectionObserver' in window)){targets.forEach(show)}
else{
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){show(e.target);io.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  targets.forEach(function(el){if(el.closest('.s-hero')){setTimeout(function(){show(el)},heroDelay+(+el.dataset.delay||0))}else io.observe(el)});
  setTimeout(function(){targets.forEach(function(el){var r=el.getBoundingClientRect();if(r.top<innerHeight*1.2)show(el)})},4000);
}
/* animated counters */
function fmt(n,dec){return n.toLocaleString('en-US',{minimumFractionDigits:dec,maximumFractionDigits:dec})}
function count(el){var to=parseFloat(el.dataset.count),dec=+el.dataset.dec||0,suf=el.dataset.suffix||'',pre=el.dataset.prefix||'';
  if(reduce){el.textContent=pre+fmt(to,dec)+suf;return}var t0=performance.now(),dur=+el.dataset.dur||2200;
  (function step(n){var k=Math.min(1,(n-t0)/dur),e=k===1?1:1-Math.pow(2,-10*k);el.textContent=pre+fmt(to*e,dec)+suf;if(k<1)requestAnimationFrame(step)})(t0)}
var cs=$('[data-count]');if(!reduce)cs.forEach(function(el){el.textContent=(el.dataset.prefix||'')+fmt(0,+el.dataset.dec||0)+(el.dataset.suffix||'')});
if(reduce)cs.forEach(count);else if('IntersectionObserver' in window){var cio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){count(e.target);cio.unobserve(e.target)}})},{threshold:.5});cs.forEach(function(el){cio.observe(el)})}else cs.forEach(count);
/* scroll-linked: progress bar, header, parallax, scrolling big text */
var bar=$('.progress')[0],top=$('.sc-top')[0],pars=$('[data-par]'),bigs=$('.bigtext div'),ticking=false;
function onScroll(){ticking=false;var y=scrollY,h=doc.scrollHeight-innerHeight;
  if(bar)bar.style.transform='scaleX('+(h>0?y/h:0)+')';if(top)top.classList.toggle('sm',y>40);
  if(reduce)return;var vh=innerHeight;
  pars.forEach(function(el){var r=el.parentNode.getBoundingClientRect();if(r.bottom<-200||r.top>vh+200)return;var c=(r.top+r.height/2-vh/2),sp=parseFloat(el.dataset.par)||.2;el.style.transform='translate3d(0,'+(c*sp*-1).toFixed(1)+'px,0)'});
  bigs.forEach(function(el){var r=el.parentNode.getBoundingClientRect();if(r.bottom<0||r.top>vh)return;var p=(vh-r.top)/(vh+r.height),span=Math.max(0,el.scrollWidth-innerWidth),x=el.dataset.dir==='r'?-(1-p)*span:-p*span;el.style.transform='translate3d('+x.toFixed(1)+'px,0,0)'})}
function req(){if(!ticking){ticking=true;requestAnimationFrame(onScroll)}}
addEventListener('scroll',req,{passive:true});addEventListener('resize',req,{passive:true});onScroll();
/* 3-D tilt on hover (mouse only) */
if(!reduce&&matchMedia('(hover:hover) and (pointer:fine)').matches){$('.tilt').forEach(function(el){
  el.addEventListener('pointermove',function(e){var r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;el.style.transform='perspective(800px) rotateY('+(x*10).toFixed(2)+'deg) rotateX('+(-y*10).toFixed(2)+'deg) translateY(-6px)'});
  el.addEventListener('pointerleave',function(){el.style.transform=''})})}
/* smooth in-page anchors with highlight */
$('a[href^="#"]').forEach(function(a){a.addEventListener('click',function(e){var t=document.getElementById(a.getAttribute('href').slice(1));if(!t)return;e.preventDefault();t.scrollIntoView({behavior:reduce?'auto':'smooth',block:'center'});history.replaceState(null,'','#'+t.id);if(t.tagName==='LI'){t.style.animation='none';void t.offsetWidth;t.style.animation=''}})});
/* page-to-page curtain transition */
var cur=$('.curtain')[0];
$('a[data-go]').forEach(function(a){a.addEventListener('click',function(e){
  if(reduce||e.metaKey||e.ctrlKey||e.shiftKey||e.button!==0||!cur)return;e.preventDefault();var back=a.dataset.go==='prev';
  try{sessionStorage.setItem('cidron-dir',back?'back':'fwd')}catch(x){}
  cur.classList.toggle('fl2',back);doc.classList.add('leaving');setTimeout(function(){location.href=a.href},470)})});
addEventListener('pageshow',function(e){if(e.persisted){doc.classList.remove('leaving');doc.classList.remove('cin')}});
setTimeout(function(){doc.classList.remove('cin')},1200);
var y=$('#y')[0];if(y)y.textContent=new Date().getFullYear();
})();
