(function(){
  var y=document.getElementById('y'); if(y) y.textContent=new Date().getFullYear();
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var els=document.querySelectorAll('.reveal');
  if(reduce||!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('in')});return;}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}})},{threshold:.15});
  els.forEach(function(e){io.observe(e)});
  setTimeout(function(){els.forEach(function(e){e.classList.add('in')})},3500);
  // gentle parallax on hero paper layers
  var layers=[].slice.call(document.querySelectorAll('.hero-art .layer'));
  var sp=[0,.06,.12,.18,.24],tick=false;
  function run(){var s=window.scrollY;layers.forEach(function(l,i){l.style.translate='0 '+(-s*sp[i])+'px'});tick=false;}
  window.addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(run)}},{passive:true});
})();
