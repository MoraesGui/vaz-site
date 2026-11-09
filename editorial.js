'use strict';
const products={
  "camisa": {
    "title": "OVER Carteiro",
    "description": "Boas notícias para levar por aí. A estampa Good News acompanha o seu caminho.",
    "variants": [
      {
        "name": "Branca",
        "image": "Camisas/Arquivo/Mockups/carteiro/carteiro-branca.png"
      },
      {
        "name": "Azul-escura",
        "image": "Camisas/Arquivo/Mockups/carteiro/carteiro-azul.png"
      }
    ]
  },
  "moletom": {
    "title": "Moletom Boas Novas",
    "description": "Azul profundo e a assinatura VAZ em tom claro. Boas novas para acompanhar o seu dia.",
    "variants": [
      {
        "name": "Azul-escuro",
        "image": "Moletons/Mockups/moletom-azul.png"
      }
    ]
  },
  "caca": {
    "title": "OVER Caça-palavras",
    "description": "Boas novas entre letras e descobertas. Encontre a sua cor.",
    "variants": [
      {
        "name": "Branca",
        "image": "Camisas/Mockups/caca-palavras/caca-palavras-branco-verso.png"
      },
      {
        "name": "Azul-escura",
        "image": "Camisas/Mockups/caca-palavras/caca-palavras-azul-marinho-verso.png"
      }
    ]
  },
  "selos": {
    "title": "Camisa Selos",
    "description": "Pequenas mensagens que viajam com você. Escolha a sua cor.",
    "variants": [
      {
        "name": "Branca",
        "image": "Camisas/Arquivo/Mockups/selos/selos-branca.png"
      },
      {
        "name": "Azul-escura",
        "image": "Camisas/Arquivo/Mockups/selos/selos-azul.png"
      }
    ]
  },
  "virao": {
    "title": "Camisa Dias Melhores Virão",
    "description": "Dias melhores virão. Uma mensagem para vestir e compartilhar.",
    "variants": [
      {
        "name": "Branca",
        "image": "Camisas/Arquivo/Mockups/virao/virao-branca.png"
      },
      {
        "name": "Azul-escura",
        "image": "Camisas/Arquivo/Mockups/virao/virao-azul.png"
      }
    ]
  },
  "sempre": {
    "title": "Camisa Para Sempre Boas Novas",
    "description": "Para sempre boas novas. Palavras que seguem com você.",
    "variants": [
      {
        "name": "Branca",
        "image": "Camisas/Arquivo/Mockups/para-sempre/para-sempre-branca.png"
      },
      {
        "name": "Azul-escura",
        "image": "Camisas/Arquivo/Mockups/para-sempre/para-sempre-azul.png"
      }
    ]
  }
};
const capColors = [
  {name:'Preto',slug:'preto',hex:'#202020',ink:'#ffffff'},
  {name:'Branco',slug:'branco',hex:'#faf9f6',ink:'#182744'},
  {name:'Azul',slug:'azul',hex:'#2349dc',ink:'#ffffff'},
  {name:'Marrom',slug:'marrom',hex:'#59372b',ink:'#ffffff'},
  {name:'Verde',slug:'verde',hex:'#254737',ink:'#ffffff'}
];
const capDesigns = [
  {id:'01-vaz-good-news',name:'vaz. / GOOD NEWS!'},
  {id:'02-cartas-para-viver',name:'Cartas para viver.'},
  {id:'03-good-news-manual',name:'GOOD NEWS manual'},
  {id:'00-logo-vaz',name:'VAZ'}
];
products.bone = {
  title:'Boné VAZ',
  description:'Quatro jeitos de levar boas novas. Escolha a cor e encontre a sua estampa.',
  variants:capColors
};

const shirtColors=[
  {name:'Preto',slug:'preto',hex:'#202020',ink:'#fff'},
  {name:'Branco',slug:'branco',hex:'#faf9f6',ink:'#182744'},
  {name:'Azul marinho',slug:'azul-marinho',hex:'#102747',ink:'#fff'}
];
const overColors=[shirtColors[1],shirtColors[0],{name:'Marrom',slug:'marrom',hex:'#654632',ink:'#f4efdf'},{name:'Off-white',slug:'off-white',hex:'#eae3d3',ink:'#182744'}];
const shirtDesigns={camisa:'carteiro',caca:'caca-palavras',selos:'selos',virao:'virao'};
Object.entries(shirtDesigns).forEach(([key,design])=>{
  products[key].shirtDesign=design;
  
  products[key].variants=(key==='camisa'||key==='caca')?overColors:shirtColors;
});
products.caca.description='Escolha branco, preto, marrom ou off-white e explore as estampas da frente e das costas.';
delete products.sempre;
let activeSide='verso';
function shirtPath(product,index,side='verso'){
  if(product.logoOnly)return logoProductPath(product,index,side);
  if(product.sweatshirt)return sweatshirtPath(product,index,side);
  return 'Camisas/Mockups/'+product.shirtDesign+'/'+product.shirtDesign+'-'+product.variants[index].slug+'-'+side+'.png?v='+(product.shirtDesign==='carteiro'?'carteiro-contrast-11':product.shirtDesign==='selos'?'selos-vintage-6':product.shirtDesign==='virao'?'virao-nova-arte-5':'tintas-marrons-9');
}
function updateShirt(){
  modalImage.dataset.flat='true';
  if(activeProduct.singleSide)activeSide='frente';
  modalImage.src=shirtPath(activeProduct,activeVariant,activeSide);
  modalImage.alt=activeProduct.title+' — '+activeProduct.variants[activeVariant].name+' — '+(activeSide==='frente'?'frente':'verso');
  document.querySelector('#variant-status').textContent=activeProduct.variants[activeVariant].name+' · '+(activeSide==='frente'?'Frente':'Verso');
  document.querySelectorAll('#shirt-sides button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.side===activeSide)));
}

Object.assign(products,sweatshirtProducts,logoProducts);
const dialog=document.querySelector('#product-dialog');
let opener, activeProduct, activeVariant=0, activeDesign=0;
const modalImage=document.querySelector('#modal-image');
const colorLabel=document.querySelector('#selected-color');


function updateMontinkLink(productKey) {
  const actions = dialog.querySelector('.modal-actions');
  if (!actions) return;

  actions.querySelector('[data-montink-buy]')?.remove();
  const configuredUrl = window.vazMontinkProductUrls?.[productKey];
  if (!configuredUrl) return;

  let url;
  try {
    url = new URL(configuredUrl);
  } catch {
    return;
  }
  if (url.protocol !== 'https:') return;

  const link = document.createElement('a');
  link.className = 'button dark';
  link.dataset.montinkBuy = '';
  link.href = url.href;
  link.textContent = 'Comprar na Montink';
  actions.prepend(link);
}

function updateCap() {
  const color=capColors[activeVariant], design=capDesigns[activeDesign];
  updateMontinkLink(design.id);
  modalImage.dataset.flat='true';
  modalImage.src='Bonés/Mockups/sem-fundo/'+color.slug+'-'+design.id+'.png'+(design.id==='00-logo-vaz'?'?v=bordado-2':'');
  modalImage.alt='Boné '+color.name+' — '+design.name;
  document.querySelector('#variant-status').textContent=color.name+' · '+design.name;
  document.querySelectorAll('#cap-designs button').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===activeDesign)));
}
function selectVariant(product,index) {
  activeVariant=index;
  const variant=product.variants[index];
  colorLabel.textContent='— '+variant.name;
  document.querySelectorAll('#variants button').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
  if(product===products.bone){updateCap();return;}
  updateMontinkLink(dialog.dataset.product);
  if(product.shirtDesign){updateShirt();return;}
  modalImage.dataset.flat=String(product.logoOnly||/^(caca-palavras|selos|virao|para-sempre)-/.test(variant.image.split('/').pop()));
  modalImage.src=variant.image;
  modalImage.alt=product.title+' — '+variant.name;
  document.querySelector('#variant-status').textContent=variant.name;
}
document.querySelectorAll('[data-product]').forEach(button=>button.addEventListener('click',()=>{
  opener=button;
  const product=products[button.dataset.product];
  activeProduct=product;
  activeSide=product.defaultSide||'verso';
  document.querySelector('#shirt-side-field').hidden=!product.shirtDesign||product.singleSide===true;
  const isCap=product===products.bone;
  dialog.dataset.product=button.dataset.product;
  document.querySelector('#modal-title').textContent=product.title;
  document.querySelector('#modal-description').textContent=product.description;
  document.querySelector('#cap-design-field').hidden=!isCap;
  const variants=document.querySelector('#variants');
  variants.replaceChildren();
  product.variants.forEach((variant,i)=>{
    const color=(isCap||product.shirtDesign||product.logoOnly)?variant:capColors.find(c=>variant.name.toLocaleLowerCase('pt-BR').startsWith(c.slug==='branco'?'branc':c.slug));
    const choice=document.createElement('button');
    choice.type='button';
    choice.textContent=product.sweatshirt?variant.name:variant.name.slice(0,2)+'.';
    if(product.sweatshirt)choice.classList.add('sweatshirt-color');
    choice.title=variant.name;
    choice.setAttribute('aria-label',choice.textContent+' — '+variant.name);
    window.VazColors?.decorate(choice,variant);
    choice.style.setProperty('--swatch',/escura|escuro/.test(variant.name)?'#102747':(color?.hex||'#102747'));
    choice.style.setProperty('--swatch-ink',color?.ink||'#ffffff');
    choice.addEventListener('click',()=>selectVariant(product,i));
    variants.append(choice);
  });
  activeDesign=Number(button.dataset.capDesign ?? button.querySelector('.cap-portrait')?.dataset.frame)||0;
  selectVariant(product,product.sweatshirt?3:isCap?2:product.shirtDesign?1:0);
  dialog.showModal();
  document.body.style.overflow='hidden';
  document.dispatchEvent(new Event('cap-dialog-change'));
}));
document.querySelectorAll('#shirt-sides button').forEach(button=>button.addEventListener('click',()=>{
  activeSide=activeProduct.singleSide?'frente':button.dataset.side;updateShirt();
}));
capDesigns.forEach((design,i)=>{
  const button=document.createElement('button');
  button.type='button';
  button.textContent=design.name;
  button.addEventListener('click',()=>{activeDesign=i;updateCap();});
  document.querySelector('#cap-designs').append(button);
});
document.querySelector('.close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{
  if(event.target===dialog){
    const rect=dialog.getBoundingClientRect();
    if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();
  }
});
dialog.addEventListener('close',()=>{
  document.body.style.overflow='';opener?.focus();
  document.dispatchEvent(new Event('cap-dialog-change'));
});

// Mantém as imagens carregadas; a troca de estampa não muda o tamanho da vitrine.
(() => {
  const portrait=document.querySelector('#cap-portrait');
  if(!portrait)return;
  const frames=[...portrait.querySelectorAll('.cap-frame')];
  const toggle=document.querySelector('#cap-motion-toggle');
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let visible=false, ready=false, paused=false, timer=null, index=0, started=false;
  function sync(){
    clearInterval(timer);timer=null;
    if(toggle){
      toggle.textContent=paused?'Retomar estampas':'Pausar estampas';
      toggle.setAttribute('aria-pressed',String(paused));
      toggle.hidden=motion.matches;
    }
    if(!ready||!visible||paused||motion.matches||document.hidden||dialog.open)return;
    timer=setInterval(()=>{
      frames[index].classList.remove('is-active');
      index=(index+1)%frames.length;
      frames[index].classList.add('is-active');
      portrait.dataset.frame=String(index);
    },1000);
  }
  async function loadFrames(){
    if(started)return;started=true;
    try{
      await Promise.all(frames.map(async image=>{
        if(image.dataset.src)image.src=image.dataset.src;
        await image.decode();
      }));
      ready=true;sync();
    }catch{
      if(toggle)toggle.hidden=true;
    }
  }
  toggle?.addEventListener('click',()=>{paused=!paused;sync();});
  if('IntersectionObserver' in window){
    new IntersectionObserver(entries=>{
      visible=entries[0].isIntersecting;
      if(visible)loadFrames();
      sync();
    },{threshold:0.05}).observe(portrait);
  }else{visible=true;loadFrames();}
  motion.addEventListener('change',sync);
  document.addEventListener('visibilitychange',sync);
  document.addEventListener('cap-dialog-change',sync);
  window.addEventListener('pagehide',()=>clearInterval(timer));
  window.addEventListener('pageshow',sync);
  sync();
})();

// Cada cor aparece de costas e de frente enquanto a peça está sob o ponteiro ou foco.
(() => {
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('[data-product]').forEach(card=>{
    const product=products[card.dataset.product];
    if(!product?.shirtDesign)return;
    const colors=product.variants;
    const colorOrder=product.sweatshirt?[1,2,0,3,4]:colors.length===4?[0,1,2,3]:[1,2,0];
    const sides=product.singleSide?['frente']:product.logoOnly?['frente','verso']:['verso','frente'];
    const frames=colorOrder.flatMap(color=>sides.map(side=>({color,side})));
    const image=card.querySelector('img');
    let frame=0,timer=null,hovered=false,focused=false,ready=false;
    function paint(){
      const current=frames[frame];
      image.src=shirtPath(product,current.color,current.side);
      image.alt=product.title+' — '+colors[current.color].name+' — '+current.side;
    }
    function stop(){clearInterval(timer);timer=null;}
    function sync(){
      const engaged=hovered||focused;
      if(!engaged){stop();frame=0;paint();return;}
      if(!ready||document.hidden||dialog.open){stop();return;}
      if(motion.matches){stop();frame=product.singleSide||product.logoOnly?0:1;paint();return;}
      if(timer!==null)return;
      if(frame===0){frame=1;paint();}
      timer=setInterval(()=>{frame=(frame+1)%frames.length;paint();},1200);
    }
    paint();
    Promise.all(frames.map(current=>{
      const img=new Image();img.src=shirtPath(product,current.color,current.side);return img.decode();
    })).then(()=>{ready=true;sync();}).catch(()=>stop());
    card.addEventListener('pointerenter',event=>{if(event.pointerType==='touch')return;hovered=true;sync();});
    card.addEventListener('pointerleave',()=>{hovered=false;sync();});
    card.addEventListener('focus',()=>{focused=true;sync();});
    card.addEventListener('blur',()=>{focused=false;sync();});
    motion.addEventListener('change',sync);
    document.addEventListener('visibilitychange',sync);
    document.addEventListener('cap-dialog-change',sync);
    window.addEventListener('pagehide',stop);
    window.addEventListener('pageshow',sync);
  });
})();

// O texto ocupa sua medida final desde o início: a digitação não desloca a página.
(() => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches || !('IntersectionObserver' in window)) return;

  const targets = document.querySelectorAll([
    '.hero-copy > p:not(.eyebrow)',
    '.collection-intro > p',
    '.acervo-heading > p:last-child',
    '.community-copy > p:not(.eyebrow)',
    '.story > p',
    '.story > details > p:not(.demo-note)',
    '.margin-notes > p:last-child',
    '.invitation-bottom > p'
  ].join(','));
  const states = new Map();
  const segmenter = typeof Intl.Segmenter === 'function'
    ? new Intl.Segmenter('pt-BR', { granularity: 'grapheme' }) : null;

  function finish(element) {
    const state = states.get(element);
    if (!state) return;
    clearTimeout(state.timer);
    state.visual.querySelectorAll('.type-char').forEach(char => char.replaceWith(char.textContent));
    element.replaceChildren(...state.visual.childNodes);
    element.normalize();
    element.dataset.typing = 'done';
    states.delete(element);
    observer.unobserve(element);
  }

  function start(element) {
    const state = states.get(element);
    if (!state || state.started) return;
    state.started = true;
    element.dataset.typing = 'active';
    // Cada parágrafo termina em até 1,8 s, mesmo com textos maiores.
    const batch = Math.max(1, Math.ceil(state.chars.length / 75));
    function tick() {
      if (!states.has(element)) return;
      if (motion.matches) return finish(element);
      state.chars[state.index - 1]?.classList.remove('type-caret');
      const end = Math.min(state.index + batch, state.chars.length);
      while (state.index < end) state.chars[state.index++].classList.add('is-typed');
      if (state.index === state.chars.length) return finish(element);
      state.chars[state.index - 1]?.classList.add('type-caret');
      state.timer = setTimeout(tick, 24);
    }
    tick();
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) start(entry.target);
      else if (states.get(entry.target)?.started) finish(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -20px 0px' });

  targets.forEach(element => {
    const accessible = document.createElement('span');
    accessible.className = 'type-accessible';
    accessible.textContent = element.textContent;
    const visual = document.createElement('span');
    visual.className = 'type-visual';
    visual.setAttribute('aria-hidden', 'true');
    visual.append(...element.childNodes);
    const walker = document.createTreeWalker(visual, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    const chars = [];
    textNodes.forEach(node => {
      const fragment = document.createDocumentFragment();
      const glyphs = segmenter
        ? Array.from(segmenter.segment(node.textContent), item => item.segment)
        : Array.from(node.textContent);
      glyphs.forEach(glyph => {
        const span = document.createElement('span');
        span.className = 'type-char';
        span.textContent = glyph;
        chars.push(span);
        fragment.append(span);
      });
      node.replaceWith(fragment);
    });
    element.append(accessible, visual);
    element.dataset.typing = 'pending';
    states.set(element, { visual, chars, index: 0, started: false, timer: null });
    observer.observe(element);
    // Quem clicar para selecionar ou copiar não precisa esperar a animação.
    element.addEventListener('pointerdown', () => finish(element), { once: true });
  });

  function finishAll() { [...states.keys()].forEach(finish); }
  // A prévia pode estar dentro de um iframe. A rolagem também verifica a
  // posição real, sem depender do momento em que o navegador entrega o observer.
  let scrollCheck;
  function queueViewportCheck() {
    if (scrollCheck || !states.size) return;
    scrollCheck = setTimeout(() => {
      scrollCheck = null;
      states.forEach((state, element) => {
        const rect = element.getBoundingClientRect();
        const visible = rect.height > 0 && rect.top < innerHeight - 20 && rect.bottom > 20;
        if (visible) start(element);
        else if (state.started) finish(element);
      });
    }, 24);
  }
  window.addEventListener('scroll', queueViewportCheck, { passive: true });
  window.addEventListener('resize', queueViewportCheck, { passive: true });
  document.addEventListener('toggle', queueViewportCheck, true);
  queueViewportCheck();
  motion.addEventListener('change', event => { if (event.matches) finishAll(); });
  window.addEventListener('beforeprint', finishAll);
  window.addEventListener('pagehide', finishAll, { once: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) states.forEach((state, element) => { if (state.started) finish(element); });
  });
})();
