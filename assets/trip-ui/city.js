/* Progressive enhancements only: no radio/panel reparenting, no content deletion. */
(() => {
 'use strict';
 function init(){
  if(document.body.dataset.cityEnhanced)return;
  document.body.dataset.cityEnhanced='true';document.body.classList.add('city-guide');
  const main=document.querySelector('main');if(!main)return;
  const q=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const fold=(node,title)=>{
   if(!node||node.closest('.city-fold, .trip-ui-extra'))return;
   const details=document.createElement('details');details.className='city-fold';
   const summary=document.createElement('summary');summary.textContent=title;
   node.before(details);details.append(summary,node);return details;
  };
  const cityNav=main.querySelector(':scope > nav[aria-label="Города путешествия"]');
  if(cityNav){
   const links=q('a[href]',cityNav);
   links.forEach(a=>{if(new URL(a.href).pathname===location.pathname)a.setAttribute('aria-current','page')});
   const offline=links.find(a=>a.hash==='#offline-maps');
   const expenses=links.find(a=>/expenses-guide\.html$/.test(a.pathname));
   if(offline&&expenses){
    const quick=document.createElement('nav');quick.className='city-quick-nav';quick.setAttribute('aria-label','Путеводитель по Китаю');
    const route=new URL(offline.href);route.hash='';
    [[route.href,'Все города'],[offline.href,'Карты и офлайн'],[expenses.href,'Расходы']].forEach(([href,text])=>{
     const a=document.createElement('a');a.href=href;a.textContent=text;quick.append(a);
    });
    cityNav.before(quick);
   }
   fold(cityNav,'Маршрут путешествия · города и расходы');
  }
  const header=main.querySelector(':scope > header');
  if(header){
   fold(header.querySelector('nav'),'Справка по городу');
   // Long cost notes remain available but do not occupy the travel header.
   q(':scope > p:not(.lead):not(.eyebrow)',header).filter(p=>p.textContent.length>180).forEach(p=>fold(p,'Расходы и условия расчёта'));
  }
  if(document.body.dataset.city==='chengdu'||document.getElementById('d2026-11-29')){
   fold(document.getElementById('maps'),'Карты Чэнду по дням');
   const dateLinks=[['d2026-11-29','29 ноя · Прилёт'],['d2026-11-30','30 ноя · Панды'],['d2026-12-01','1 дек · Поезд']];
   const days=document.createElement('nav');days.className='city-date-links';days.setAttribute('aria-label','Дни в Чэнду');
   dateLinks.forEach(([id,text])=>{
    if(!document.getElementById(id))return;
    const a=document.createElement('a');a.href='#'+id;a.textContent=text;days.append(a);
   });
   if(days.childElementCount)header?.querySelector('h1')?.after(days);
  }
  q('.support-nav').forEach(n=>fold(n,'Билеты, бюджет и справка'));
  // Only named supporting sections are folded. Day roots and radio sibling chains stay unchanged.
  ['arrival','hotel','food','evenings','budget','booking','sources','compare'].forEach(id=>{
   const node=document.getElementById(id);
   if(!node||node.matches('details')||node.closest('.day-panel')||node.querySelector('input[type=radio]'))return;
   const h=node.querySelector('h2,h3');if(h)fold(node,h.textContent.trim());
  });
  q('main > .photos').forEach(n=>fold(n,'Фотографии города · архивные виды'));
  const labels=q('.day-labels label');
  function radioFor(label){return document.getElementById(label.htmlFor)}
  function updateLabels(){labels.forEach(l=>{
   const r=radioFor(l);if(!r)return;
   l.setAttribute('aria-pressed',String(r.checked));l.setAttribute('role','button');l.tabIndex=0;
   if(r.checked){const strip=l.closest('.day-labels');if(strip){const a=l.getBoundingClientRect(),b=strip.getBoundingClientRect();if(a.right>b.right)strip.scrollLeft+=a.right-b.right;if(a.left<b.left)strip.scrollLeft-=b.left-a.left;}}
  });}
  labels.forEach(l=>{
   // Beijing already implements Enter/Space; do not add duplicate activation there.
   if(!l.classList.contains('day-label'))l.addEventListener('keydown',e=>{
    if(e.key==='Enter'||e.key===' '){e.preventDefault();l.click();}
   });
   l.addEventListener('keydown',e=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
    const group=labels.filter(x=>radioFor(x)?.name===radioFor(l)?.name);
    const i=group.indexOf(l),next=e.key==='Home'?0:e.key==='End'?group.length-1:(i+(e.key==='ArrowRight'?1:-1)+group.length)%group.length;
    e.preventDefault();group[next].click();group[next].focus();
   });
  });
  const radios=labels.map(radioFor).filter(Boolean);
  radios.forEach(r=>r.addEventListener('change',()=>{
   updateLabels();
   if(document.body.dataset.city!=='beijing'&&!document.querySelector('.travel-layout')){
    const u=new URL(location.href);const index=radios.indexOf(r);
    // Existing public day numbering is 1-based, including zero-based Zhangjiajie IDs.
    if(r.name!=='map-day'){u.searchParams.set('day',String(index+1));history.replaceState(null,'',u);}
   }
  }));
  q('.day-panel').forEach(panel=>{
   if(panel.querySelector('.city-day-tools'))return;
   const title=panel.querySelector('h2,h3');if(!title)return;
   const tools=document.createElement('nav');tools.className='city-day-tools';tools.setAttribute('aria-label','Карты выбранного дня');
   const mapTab=panel.querySelector('[data-view="maps"]');
   if(mapTab){const b=document.createElement('button');b.type='button';b.textContent='Карта этого дня ↗';b.addEventListener('click',()=>mapTab.click());tools.append(b);}
   else {
    const map=q('a[href]',panel).find(a=>a.querySelector('img.map, .route-image img, img')&&/\.(png|jpe?g|webp)(?:[?#]|$)/i.test(a.getAttribute('href'))&&!a.closest('.trip-transport, .photos, .travel-photo, .photo-gallery'));
    if(map){const a=document.createElement('a');a.href=map.href;a.target='_blank';a.rel='noopener';a.textContent='Карта этого дня ↗';tools.append(a);}
   }
   const transport=panel.querySelector('.trip-transport[id]');
   if(transport){const a=document.createElement('a');a.href='#'+transport.id;a.textContent='Вокзал / аэропорт · схема';tools.append(a);}
   if(tools.children.length)title.after(tools);
  });
  function revealHash(){
   let id;try{id=decodeURIComponent(location.hash.slice(1))}catch{return}
   if(!id)return;const target=document.getElementById(id);if(!target)return;
   const panel=target.closest('.day-panel');
   if(panel){const m=panel.className.match(/\bpanel-(\d+)\b/);if(m){
    const r=radios.find(x=>x.id==='day'+m[1]||x.id==='tab-'+m[1]);
    if(r)r.checked=true;
   }
   const view=target.closest('.day-view');if(view){const button=panel.querySelector('[data-view="'+view.dataset.section+'"]');if(button)button.click();}
   }
   let el=target;while(el){if(el.tagName==='DETAILS')el.open=true;el=el.parentElement;}
   updateLabels();requestAnimationFrame(()=>target.scrollIntoView({block:'start'}));
  }
  function readQuery(){
   const day=new URLSearchParams(location.search).get('day');
   if(day&&radios[Number(day)-1]&&radios[0]?.name!=='map-day')radios[Number(day)-1].checked=true;
   updateLabels();revealHash();
  }
  // Run after existing day handlers, so a nested anchor wins over their default day.
  addEventListener('hashchange',()=>queueMicrotask(revealHash));
  addEventListener('popstate',()=>queueMicrotask(readQuery));
  document.addEventListener('click',e=>{
   const a=e.target.closest('a[href]');if(!a)return;
   const url=new URL(a.href,location.href);
   if(url.origin===location.origin&&url.pathname===location.pathname&&url.hash===location.hash&&url.hash)queueMicrotask(revealHash);
  });
  readQuery();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
