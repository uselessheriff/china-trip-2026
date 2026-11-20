(() => {
  "use strict";
  const bar=document.querySelector('.trip-section-bar'), button=document.querySelector('.trip-section-toggle'), drawer=document.getElementById('trip-sections-dialog');
  if(!bar || !button || !drawer || !drawer.showModal) return;
  bar.hidden=false;
  document.documentElement.classList.add('trip-menu-enabled');
  let targetAfterClose=null;
  let openedDown=false;
  function reveal(target){
    for(let e=target;e;e=e.parentElement){if(e.tagName==='DETAILS')e.open=true;}
  }
  button.addEventListener('click',()=>{targetAfterClose=null;drawer.showModal();button.setAttribute('aria-expanded','true');drawer.querySelector('.trip-section-close').focus()});
  drawer.addEventListener('pointerdown',e=>{openedDown=e.target===drawer});
  drawer.addEventListener('click',e=>{if(openedDown && e.target===drawer)drawer.close()});
  drawer.addEventListener('close',()=>{
    button.setAttribute('aria-expanded','false');
    if (!targetAfterClose) button.focus({preventScroll:true});
  });
  drawer.querySelector('.trip-section-close').addEventListener('click',()=>drawer.close());
  drawer.querySelectorAll('nav a').forEach(a=>{
    a.addEventListener('click',event=>{
      if(event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
      const url=new URL(a.href), target=document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if(!target) return;
      const day=url.searchParams.get('day'), current=new URL(location.href);
      targetAfterClose=target;
      drawer.close();
      if(day && day!==current.searchParams.get('day')){
        current.searchParams.set('day',day);current.hash=url.hash;location.assign(current.href);event.preventDefault();return;
      }
      event.preventDefault();
      reveal(target);
      if(location.hash!==url.hash)location.hash=url.hash;
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        if(!target.hasAttribute('tabindex'))target.setAttribute('tabindex','-1');
        target.focus({preventScroll:true});target.scrollIntoView({block:'start'});
      }));
    });
  });
})();
