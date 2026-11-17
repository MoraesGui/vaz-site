(() => {
  const toggle=document.querySelector('[data-mobile-home-menu]');
  const header=document.querySelector('header#inicio');
  if(!toggle||!header)return;
  const mobile=matchMedia('(max-width:760px)');
  function setOpen(open) {
    document.body.toggleAttribute('data-mobile-menu-open',open);
    toggle.setAttribute('aria-expanded',String(open));
    toggle.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');
  }
  toggle.addEventListener('click',()=>setOpen(toggle.getAttribute('aria-expanded')!=='true'));
  header.querySelectorAll('nav a').forEach(link=>link.addEventListener('click',()=>setOpen(false)));
  document.addEventListener('click',event=>{if(!header.contains(event.target))setOpen(false);});
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&toggle.getAttribute('aria-expanded')==='true') {
      setOpen(false);toggle.focus();
    }
  });
  mobile.addEventListener('change',()=>setOpen(false));
})();
