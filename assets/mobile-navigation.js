(() => {
  const header=document.querySelector('header#inicio');
  const source=header?.querySelector('nav.page-nav');
  if(!header||!source)return;
  let actions=header.querySelector('.mobile-home-actions');
  if(!actions) {
    actions=document.createElement('div');
    actions.className='mobile-home-actions';
    actions.innerHTML='<button type="button" data-mobile-home-menu aria-label="Abrir menu" aria-expanded="false"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 7h22M5 16h22M5 25h22"/></svg></button><a href="colecao.html" aria-label="Ver produtos da coleção"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M7 10h18l2 19H5zM11 11V7a5 5 0 0 1 10 0v4"/></svg></a>';
    header.append(actions);
  }
  const toggle=actions.querySelector('[data-mobile-home-menu]');
  const drawer=document.createElement('dialog');
  drawer.id='mobile-navigation-drawer';
  drawer.className='mobile-nav-drawer';
  drawer.setAttribute('aria-label','Menu de navegação');
  drawer.innerHTML='<div class="mobile-drawer-heading"><a href="home.html" aria-label="VAZ, início"><img src="assets/marca/logo.png" alt="VAZ" width="76" height="30"></a><button type="button" class="mobile-drawer-close" aria-label="Fechar menu" autofocus><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 5 14 14M19 5 5 19"/></svg></button></div><nav class="mobile-drawer-links" aria-label="Navegação principal"></nav>';
  const links=drawer.querySelector('nav');
  source.querySelectorAll('a').forEach(link=>links.append(link.cloneNode(true)));
  document.body.append(drawer);
  const media=matchMedia('(max-width:760px)');
  const reducedMotion=matchMedia('(prefers-reduced-motion:reduce)');
  let closeTimer;
  function finishClose() {
    clearTimeout(closeTimer);
    if(drawer.open)drawer.close();
    drawer.classList.remove('is-closing');
  }
  function requestClose() {
    if(!drawer.open||drawer.classList.contains('is-closing'))return;
    if(reducedMotion.matches||!media.matches){finishClose();return;}
    drawer.classList.add('is-closing');
    closeTimer=setTimeout(finishClose,260);
  }
  toggle.setAttribute('aria-controls',drawer.id);
  toggle.setAttribute('aria-haspopup','dialog');
  toggle.addEventListener('click',()=>{
    if(!media.matches)return;
    if(drawer.open)requestClose();
    else { clearTimeout(closeTimer);drawer.classList.remove('is-closing');drawer.showModal();toggle.setAttribute('aria-expanded','true'); }
  });
  drawer.querySelector('.mobile-drawer-close').addEventListener('click',requestClose);
  drawer.addEventListener('cancel',event=>{event.preventDefault();requestClose();});
  drawer.addEventListener('animationend',event=>{
    if(event.target===drawer&&event.animationName==='mobile-drawer-exit')finishClose();
  });
  drawer.addEventListener('click',event=>{
    if(event.target!==drawer)return;
    const rect=drawer.getBoundingClientRect();
    if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)requestClose();
  });
  links.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>drawer.close()));
  drawer.addEventListener('close',()=>{
    clearTimeout(closeTimer);
    drawer.classList.remove('is-closing');
    toggle.setAttribute('aria-expanded','false');
    if(media.matches)toggle.focus({preventScroll:true});
  });
  media.addEventListener('change',()=>{if(!media.matches&&drawer.open)finishClose();});
  reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches&&drawer.classList.contains('is-closing'))finishClose();});
})();
