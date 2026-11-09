'use strict';
(() => {
  const rack = document.querySelector('[data-clothing-rack]');
  if (!rack) return;
  const viewport = rack.querySelector('.rack-viewport');
  const pieces = [...rack.querySelectorAll('[data-rack-product]')];
  const previous = rack.querySelector('[data-rack-prev]');
  const next = rack.querySelector('[data-rack-next]');
  const colors = rack.querySelector('.rack-colors');
  const colorField = colors.closest('fieldset');
  const colorAnchor = document.createComment('cores da peça');
  colorField.before(colorAnchor);
  const sideField = rack.querySelector('[data-rack-side-field]');
  const sideButtons = [...rack.querySelectorAll('[data-rack-side]')];
  const status = rack.querySelector('.rack-status');
  const details = rack.querySelector('.rack-details');
  const detailsAnchor = document.createElement('div');
  detailsAnchor.hidden = true;
  details.after(detailsAnchor);
  const hangerShape = 'M64 51V24c0-7 10-7 10-14 0-9-15-9-15 0M64 49 9 90c-4 3-3 6 2 6h106c5 0 6-3 2-6L64 49Z';
  pieces.forEach(piece => {
    const hanger = piece.querySelector('.rack-hanger');
    hanger.setAttribute('viewBox', '0 0 128 110');
    hanger.querySelector('path').setAttribute('d', hangerShape);
  });
  const focusView = document.createElement('dialog');
  focusView.className = 'rack-focus';
  focusView.id = 'rack-focus-dialog';
  focusView.setAttribute('aria-labelledby', 'rack-focus-title');
  focusView.innerHTML = `<div class="rack-focus-header"><button type="button" class="rack-focus-back" autofocus>← Voltar à arara</button><div class="rack-nav" role="group" aria-label="Navegar pelas peças"><button type="button" data-focus-prev aria-label="Peça anterior">←</button><span class="rack-focus-count" aria-hidden="true"></span><button type="button" data-focus-next aria-label="Próxima peça">→</button></div></div><div class="rack-focus-layout"><div class="rack-focus-stage"><svg class="rack-hanger" viewBox="0 0 128 110" aria-hidden="true"><path d="${hangerShape}"/></svg><img class="rack-focus-image" alt="" draggable="false"></div><div class="rack-focus-details"></div></div><p class="rack-focus-error" role="status"></p><p class="rack-focus-status" role="status" aria-live="polite" aria-atomic="true"></p>`;
  rack.append(focusView);
  const focusImage = focusView.querySelector('.rack-focus-image');
  focusImage.id = 'rack-focus-image';
  window.VazZoom?.attachInline(focusImage);
  const zoomSlider = focusView.querySelector('.inline-zoom-control input');
  const focusPrevious = focusView.querySelector('[data-focus-prev]');
  const focusNext = focusView.querySelector('[data-focus-next]');
  const focusBack = focusView.querySelector('.rack-focus-back');
  let focusOpener;
  let bodyOverflow;
  pieces.forEach(piece => {
    const garment = document.createElement('span');
    garment.className = 'rack-garment';
    const image = piece.querySelector('img');
    image.before(garment);
    garment.append(image);
    const profile = document.createElement('img');
    profile.className = 'rack-profile';
    profile.alt = '';
    profile.setAttribute('aria-hidden', 'true');
    profile.draggable = false;
    // São apenas sete peças: carregue as duas perspectivas sem depender
    // da heurística de lazy loading para imagens sobrepostas e transparentes.
    profile.loading = 'eager';
    garment.append(profile);
    const opposite = profile.cloneNode();
    opposite.className = 'rack-profile rack-profile-opposite';
    garment.append(opposite);
  });
  const mobile = matchMedia('(max-width: 760px)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const showcaseColors = {overVaz:'branco',moletomCapuz:'azul-marinho',capuzVaz:'branco',caca:'branco',selos:'azul-marinho',camisaVaz:'branco',virao:'azul-marinho'};
  const states = pieces.map(piece => {
    const product = products[piece.dataset.rackProduct];
    const showcaseColor = product.variants.findIndex(variant => variant.slug === showcaseColors[piece.dataset.rackProduct]);
    return {product, showcaseColor, color: showcaseColor, side: 'frente'};
  });
  let selected = Math.floor(pieces.length / 2);
  let preview = null;
  let expanded = false;
  let scrollingTo = null;
  let scrollFrame = 0;
  let scrollTimer;
  let layoutWidth = 0;
  let layoutMobile = mobile.matches;
  let imageRequest = 0;
  let imageAnimation;

  function announce(message) { (focusView.open ? focusView.querySelector('.rack-focus-status') : status).textContent = message; }
  function label(index) { return states[index].product.title; }

  function paint() {
    const pieceWidth = pieces[0].clientWidth;
    const emphasized = preview ?? selected;
    rack.dataset.expanded = String(expanded);
    pieces.forEach((piece, index) => {
      const distance = index - selected;
      const focus = index === emphasized;
      const offset = distance === 0 ? 0 : Math.sign(distance) * (pieceWidth * .58 + 30 + (Math.abs(distance) - 1) * (pieceWidth * .38 + 28));
      const spread = preview !== null && index !== preview ? Math.sign(index - preview) * 14 : 0;
      piece.style.setProperty('--rack-x', `${offset + spread}px`);
      piece.style.setProperty('--rack-sway', focus ? '0deg' : `${Math.sign(index - emphasized) * -.6}deg`);
      piece.style.setProperty('--rack-order', focus ? '10' : String(5 - Math.min(Math.abs(distance), 4)));
      piece.dataset.facing = focus ? 'front' : 'side';
      piece.dataset.direction = index < emphasized ? 'right' : 'left';
      piece.setAttribute('aria-pressed', String(index === selected));
      piece.tabIndex = index === selected ? 0 : -1;
      piece.setAttribute('aria-label', `${label(index)}${index === selected ? ', selecionada' : ''}. Abrir peça em tela inteira.`);
      piece.setAttribute('aria-haspopup', 'dialog');
      piece.setAttribute('aria-controls', focusView.id);
    });
    previous.disabled = selected === 0;
    next.disabled = selected === pieces.length - 1;
    focusPrevious.disabled = previous.disabled;
    focusNext.disabled = next.disabled;
    rack.querySelector('.rack-count').textContent = `${String(selected + 1).padStart(2, '0')} / ${String(pieces.length).padStart(2, '0')}`;
    focusView.querySelector('.rack-focus-count').textContent = rack.querySelector('.rack-count').textContent;
    rack.querySelector('[data-rack-inspect]').textContent = 'Ver peça em tela inteira ↗';
    rack.querySelector('[data-rack-inspect]').setAttribute('aria-haspopup', 'dialog');
    rack.querySelector('[data-rack-inspect]').setAttribute('aria-controls', focusView.id);
    rack.querySelector('[data-rack-inspect]').removeAttribute('aria-pressed');
    if (focusView.open) window.VazFocus?.updateScene(focusView,pieces[selected].dataset.rackProduct);
  }

  // Somente o atributo src muda: estampas, recorte e proporções são os originais.
  function loadImage(index) {
    // A vitrine tem uma curadoria fixa branco/marinho. A etiqueta conserva
    // todas as variações comerciais sem recolorir as peças da arara.
    const {product, showcaseColor} = states[index];
    const image = pieces[index].querySelector('.rack-photo');
    const source = shirtPath(product, showcaseColor, 'frente');
    const alt = `${product.title} — ${product.variants[showcaseColor].name} — frente`;
    image.alt = alt;
    pieces[index].dataset.showcaseColor = product.variants[showcaseColor].slug;
    image.onload = () => {
      pieces[index].dataset.imageError = 'false';
      if (index === selected) rack.querySelector('[data-rack-image-status]').textContent = '';
    };
    image.onerror = () => {
      pieces[index].dataset.imageError = 'true';
      if (index === selected) rack.querySelector('[data-rack-image-status]').textContent = 'Imagem indisponível. Experimente outra cor ou vista.';
    };
    if (image.getAttribute('src') !== source) image.src = source;
    const piece = pieces[index];
    const profile = piece.querySelector('.rack-profile');
    const opposite = piece.querySelector('.rack-profile-opposite');
    const stem = `assets/rack-side/${piece.dataset.rackProduct}-${product.variants[showcaseColor].slug}`;
    [[profile,'profileRight',`${stem}.png?v=5`],[opposite,'profileLeft',`${stem}-toward-left.png?v=5`]].forEach(([photo,state,path]) => {
      piece.dataset[state] = 'loading';
      const ready = () => {
        piece.dataset[state] = photo.naturalWidth ? 'ready' : 'error';
        piece.classList.toggle('profile-ready',piece.dataset.profileRight === 'ready' && piece.dataset.profileLeft === 'ready');
      };
      photo.onload = ready;
      photo.onerror = () => { piece.dataset[state] = 'error'; piece.classList.remove('profile-ready'); };
      photo.src = path;
      if (photo.complete && photo.naturalWidth) ready();
    });
  }

  function renderDetails() {
    const {product, color, side} = states[selected];
    rack.querySelector('[data-rack-name]').textContent = product.title;
    rack.querySelector('[data-rack-description]').textContent = product.description;
    rack.querySelector('[data-rack-color-name]').textContent = product.variants[color].name;
    rack.querySelector('[data-rack-image-status]').textContent = pieces[selected].dataset.imageError === 'true' ? 'Imagem indisponível. Experimente outra cor ou vista.' : '';
    // Mantém os botões de cor e o foco ao mudar apenas a variação.
    if (colors.dataset.product !== pieces[selected].dataset.rackProduct) {
      colors.replaceChildren();
      colors.dataset.product = pieces[selected].dataset.rackProduct;
      product.variants.forEach((variant, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'rack-color';
        button.style.setProperty('--swatch', variant.hex);
        button.style.setProperty('--swatch-ink', variant.ink);
        button.title = variant.name;
        button.setAttribute('aria-label', variant.name);
        window.VazColors?.decorate(button,variant);
        button.addEventListener('click', () => {
          states[selected].color = index;
          renderDetails();
          announce(`${label(selected)}, ${variant.name}, vista ${states[selected].side === 'frente' ? 'de frente' : 'das costas'}.`);
        });
        colors.append(button);
      });
    }
    [...colors.children].forEach((button, index) => button.setAttribute('aria-pressed', String(index === color)));
    sideField.hidden = product.singleSide === true;
    sideButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.rackSide === side)));
    const contact = rack.querySelector('[data-rack-contact]');
    const buyUrl = window.vazMontinkProductUrls?.[pieces[selected].dataset.rackProduct];
    if (buyUrl) {
      contact.href = buyUrl;
      contact.removeAttribute('target');
      contact.removeAttribute('rel');
      contact.textContent = 'Comprar na Montink';
      contact.setAttribute('aria-label', `Comprar ${product.title} na Montink`);
    }
    if (focusView.open) syncFocusImage();
  }

  async function syncFocusImage() {
    const {product, color, side} = states[selected];
    const source = shirtPath(product, color, side);
    const request = ++imageRequest;
    focusView.querySelector('.rack-focus-stage').dataset.sweatshirt = String(Boolean(product.sweatshirt));
    focusView.querySelector('.rack-focus-error').textContent = '';
    if (focusImage.getAttribute('src') === source) {
      focusView.dataset.imageLoading = 'false';
      focusView.querySelector('.rack-focus-stage').setAttribute('aria-busy', 'false');
      if (zoomSlider) zoomSlider.disabled = false;
      return;
    }
    focusView.dataset.imageLoading = 'true';
    focusView.querySelector('.rack-focus-stage').setAttribute('aria-busy', 'true');
    if (zoomSlider) zoomSlider.disabled = true;
    const incoming = new Image();
    incoming.src = source;
    try {
      await incoming.decode();
      if (request !== imageRequest || !focusView.open) return;
      imageAnimation?.cancel();
      focusImage.src = source;
      focusImage.alt = `${product.title} — ${product.variants[color].name} — ${side === 'frente' ? 'frente' : 'costas'}`;
      if (!reducedMotion.matches) imageAnimation = focusImage.animate([
        {opacity:.25,filter:'blur(2px)',transform:'translateY(5px)'},
        {opacity:1,filter:'blur(0)',transform:'translateY(0)'}
      ], {duration:340,easing:'cubic-bezier(.2,.7,.2,1)'});
    } catch {
      if (request === imageRequest) focusView.querySelector('.rack-focus-error').textContent = 'Esta imagem não carregou. Experimente outra cor ou vista.';
    } finally {
      if (request === imageRequest) {
        focusView.dataset.imageLoading = 'false';
        focusView.querySelector('.rack-focus-stage').setAttribute('aria-busy', 'false');
        if (zoomSlider) zoomSlider.disabled = false;
      }
    }
  }
  focusImage.addEventListener('error', () => { focusView.querySelector('.rack-focus-error').textContent = 'Imagem indisponível. Experimente outra cor ou vista.'; });

  function center(animate = true) {
    if (!mobile.matches) return;
    const piece = pieces[selected];
    const left = piece.offsetLeft + piece.offsetWidth / 2 - viewport.clientWidth / 2;
    scrollingTo = selected;
    viewport.scrollTo({left, behavior: animate && !reducedMotion.matches ? 'smooth' : 'instant'});
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(settleScroll, 700);
  }

  function select(index, {scroll = true, focus = false, speak = true} = {}) {
    if (index < 0 || index >= pieces.length) return;
    const changed = selected !== index;
    selected = index;
    preview = null;
    const focusedControl = document.activeElement;
    paint();
    if (changed) renderDetails();
    if (scroll) center();
    if (!focusView.open && (focus || (focusedControl === previous && previous.disabled) || (focusedControl === next && next.disabled))) pieces[selected].focus({preventScroll: true});
    if (focusView.open && ((focusedControl === focusPrevious && focusPrevious.disabled) || (focusedControl === focusNext && focusNext.disabled))) focusBack.focus({preventScroll: true});
    if (speak) announce(`${selected + 1} de ${pieces.length}. ${label(selected)}. ${states[selected].product.variants[focusView.open ? states[selected].color : states[selected].showcaseColor].name}.`);
  }

  function toggleExpanded(value) {
    if (!value) { if (focusView.open) focusView.close(); return; }
    if (focusView.open) return;
    focusOpener = document.activeElement;
    detailsAnchor.style.height = `${details.getBoundingClientRect().height}px`;
    detailsAnchor.hidden = false;
    focusView.querySelector('.rack-focus-details').append(details);
    colorField.classList.add('product-color-tags');
    focusView.querySelector('.rack-focus-stage').append(colorField);
    details.querySelector('[data-rack-name]').id = 'rack-focus-title';
    details.querySelector('.eyebrow').textContent = 'VAZ / ETIQUETA DA PEÇA';
    bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    focusView.showModal();
    focusView.scrollTop = 0;
    syncFocusImage();
    expanded = value;
    preview = null;
    paint();
    focusBack.focus({preventScroll: true});
    announce(`${label(selected)} em tela inteira. Use Voltar à arara ou Escape para sair.`);
  }
  focusView.addEventListener('close', () => {
    imageRequest++;
    imageAnimation?.cancel();
    focusView.dataset.imageLoading = 'false';
    focusView.querySelector('.rack-focus-stage').setAttribute('aria-busy', 'false');
    if (zoomSlider) zoomSlider.disabled = false;
    details.querySelector('.eyebrow').textContent = 'A PEÇA DA VEZ';
    colorAnchor.after(colorField);
    colorField.classList.remove('product-color-tags');
    detailsAnchor.before(details);
    detailsAnchor.hidden = true;
    details.querySelector('[data-rack-name]').removeAttribute('id');
    document.body.style.overflow = bodyOverflow;
    expanded = false;
    paint();
    resize();
    reserveDetailsHeight();
    const target = focusOpener?.isConnected && focusOpener !== rack.querySelector('[data-rack-inspect]') ? pieces[selected] : focusOpener;
    target?.focus({preventScroll: true});
    announce('Arara completa.');
  });
  focusBack.addEventListener('click', () => toggleExpanded(false));
  focusPrevious.addEventListener('click', () => select(selected - 1));
  focusNext.addEventListener('click', () => select(selected + 1));

  pieces.forEach((piece, index) => {
    piece.dataset.sweatshirt = String(Boolean(states[index].product.sweatshirt));
    piece.querySelector('.rack-piece-label').textContent = 'ABRIR PEÇA ↗';
    loadImage(index);
    piece.addEventListener('click', () => { select(index, {speak: false}); toggleExpanded(true); });
    // A prévia abre a peça no lugar; a centralização acontece ao selecionar.
    // Assim a arara não corre sob o ponteiro e não produz ciclos de hover.
    piece.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'mouse' || mobile.matches || expanded || index === selected) return;
      preview = index;
      paint();
    });
    piece.addEventListener('pointerleave', () => { if (preview !== null) { preview = null; paint(); } });
    // O foco do mouse não recentraliza a peça antes do pointerup: isso
    // cancelaria o clique ao mover o alvo entre pressionar e soltar.
  });
  previous.addEventListener('click', () => select(selected - 1));
  next.addEventListener('click', () => select(selected + 1));
  rack.querySelector('[data-rack-inspect]').addEventListener('click', () => toggleExpanded(!expanded));
  sideButtons.forEach(button => button.addEventListener('click', () => {
    states[selected].side = button.dataset.rackSide;
    renderDetails();
    announce(`${label(selected)}, ${button.textContent.toLocaleLowerCase('pt-BR')}.`);
  }));
  rack.addEventListener('keydown', event => {
    // Escape é gerenciado pelo dialog nativo, com foco contido e retorno.
    if (!event.target.matches('[data-rack-product]')) return;
    const target = {ArrowLeft: selected - 1, ArrowRight: selected + 1, Home: 0, End: pieces.length - 1}[event.key];
    if (target !== undefined) { event.preventDefault(); select(target, {focus: true}); }
  });

  function nearestPiece() {
    const midpoint = viewport.scrollLeft + viewport.clientWidth / 2;
    return pieces.reduce((nearest, piece, index) => Math.abs(piece.offsetLeft + piece.offsetWidth / 2 - midpoint) < Math.abs(pieces[nearest].offsetLeft + pieces[nearest].offsetWidth / 2 - midpoint) ? index : nearest, 0);
  }
  function settleScroll() {
    clearTimeout(scrollTimer);
    if (!mobile.matches || mobile.matches !== layoutMobile || viewport.clientWidth !== layoutWidth) return;
    if (scrollingTo !== null) {
      // Uma troca de breakpoint pode emitir scrollend antes de aplicar o
      // espaçamento da pista. Conserva o alvo da centralização nesse intervalo.
      if (nearestPiece() !== scrollingTo) { center(false); return; }
      scrollingTo = null;
      return;
    }
    const nearest = nearestPiece();
    if (nearest !== selected) select(nearest, {scroll: false});
  }
  viewport.addEventListener('scroll', () => {
    if (!mobile.matches || mobile.matches !== layoutMobile || viewport.clientWidth !== layoutWidth) return;
    if (!scrollFrame) scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      if (mobile.matches !== layoutMobile || viewport.clientWidth !== layoutWidth) return;
      if (scrollingTo !== null) return;
      const nearest = nearestPiece();
      if (nearest !== selected) select(nearest, {scroll: false, speak: false});
    });
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(settleScroll, 140);
  }, {passive: true});
  viewport.addEventListener('scrollend', settleScroll);
  viewport.addEventListener('pointerdown', () => { scrollingTo = null; }, {passive: true});
  viewport.addEventListener('wheel', () => { scrollingTo = null; }, {passive: true});

  function resize() {
    layoutMobile = mobile.matches;
    layoutWidth = viewport.clientWidth;
    rack.style.setProperty('--rack-viewport-width', `${viewport.clientWidth}px`);
    preview = null;
    paint();
    if (mobile.matches) center(false);
    else { scrollingTo = null; viewport.scrollLeft = 0; }
  }
  // A altura reserva o maior título/descrição entre as peças e as variações.
  // A navegação e a aproximação não deslocam as seções seguintes.
  function reserveDetailsHeight() {
    if (focusView.open) return;
    details.style.minHeight = '';
    let height = parseFloat(getComputedStyle(details).minHeight) || 0;
    // Mede uma cópia invisível com todas as cores de cada peça. Cinco cores
    // podem ocupar duas linhas no celular; medir só o texto não reserva isso.
    // A cópia também preserva o foco e os listeners dos controles reais.
    const measurement = details.cloneNode(true);
    measurement.removeAttribute('id');
    measurement.setAttribute('aria-hidden', 'true');
    measurement.inert = true;
    Object.assign(measurement.style, {
      position: 'absolute', visibility: 'hidden', pointerEvents: 'none',
      width: `${details.getBoundingClientRect().width}px`, minHeight: '0',
      left: '0', top: '0'
    });
    rack.append(measurement);
    states.forEach(({product}) => {
      measurement.querySelector('[data-rack-name]').textContent = product.title;
      measurement.querySelector('[data-rack-description]').textContent = product.description;
      measurement.querySelector('[data-rack-color-name]').textContent = 'Azul marinho';
      measurement.querySelector('[data-rack-side-field]').hidden = product.singleSide === true;
      measurement.querySelector('.rack-colors').replaceChildren(...product.variants.map(() => {
        const button = document.createElement('button');
        button.className = 'rack-color';
        button.type = 'button';
        return button;
      }));
      height = Math.max(height, measurement.getBoundingClientRect().height);
    });
    measurement.remove();
    details.style.minHeight = `${Math.ceil(height)}px`;
  }
  let previousWidth = 0;
  new ResizeObserver(() => {
    if (viewport.clientWidth === previousWidth) return;
    previousWidth = viewport.clientWidth;
    resize();
    reserveDetailsHeight();
  }).observe(viewport);
  mobile.addEventListener('change', resize);
  reducedMotion.addEventListener('change', () => center(false));
  rack.classList.add('is-ready');
  renderDetails();
  resize();
  document.fonts.ready.then(reserveDetailsHeight);
})();
