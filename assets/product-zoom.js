(() => {
  const colorInitials = {branco:'B',branca:'B',preto:'P',preta:'P','azul-marinho':'AM','azul-escuro':'AM','azul-escura':'AM',marrom:'M','off-white':'OW',cinza:'C',azul:'A',verde:'V'};
  window.VazColors = {
    decorate(button,variant) {
      const key = (variant.slug || variant.name).toLocaleLowerCase('pt-BR').trim().replace(/\s+/g,'-');
      const initials = colorInitials[key] || variant.name.split(/[\s-]+/).map(word=>word[0]).join('').toLocaleUpperCase('pt-BR');
      const label = document.createElement('span');
      label.className = 'color-tag-initials'; label.textContent = initials; label.setAttribute('aria-hidden','true');
      button.replaceChildren(label);
      button.setAttribute('aria-label',`${initials} — ${variant.name}`);
      button.title = variant.name;
    }
  };
  const viewer = document.createElement('dialog');
  viewer.className = 'product-zoom';
  viewer.setAttribute('aria-labelledby', 'zoom-title');
  viewer.innerHTML = `<div class="zoom-toolbar"><h2 id="zoom-title">Detalhe da estampa</h2><div class="zoom-controls"><button type="button" data-zoom="out" aria-label="Diminuir zoom">−</button><output aria-live="polite" id="zoom-level">100%</output><button type="button" data-zoom="in" aria-label="Aumentar zoom">+</button><button type="button" data-zoom="fit">Ver peça inteira</button><button type="button" data-zoom="close" aria-label="Fechar zoom">Fechar ×</button></div></div><p class="zoom-help" id="zoom-help">Arraste ou role para explorar a estampa. Use + e − para ampliar.</p><div class="zoom-viewport" tabindex="0" aria-label="Imagem ampliada, use as setas para explorar" aria-describedby="zoom-help"><div class="zoom-canvas"><img alt="" draggable="false"></div></div><p class="zoom-error" role="status" hidden>Não foi possível carregar esta imagem. Feche o zoom e tente novamente.</p>`;
  document.body.append(viewer);
  const viewport = viewer.querySelector('.zoom-viewport');
  const canvas = viewer.querySelector('.zoom-canvas');
  const image = viewer.querySelector('img');
  const level = viewer.querySelector('#zoom-level');
  const error = viewer.querySelector('.zoom-error');
  const minus = viewer.querySelector('[data-zoom="out"]');
  const plus = viewer.querySelector('[data-zoom="in"]');
  let zoom = 1, baseWidth = 1, baseHeight = 1, trigger, drag;

  function render(point = {x: .5, y: .5}) {
    baseWidth = Math.min(viewport.clientWidth, viewport.clientHeight * image.naturalWidth / image.naturalHeight);
    baseHeight = baseWidth * image.naturalHeight / image.naturalWidth;
    image.style.width = `${baseWidth * zoom}px`;
    image.style.height = `${baseHeight * zoom}px`;
    canvas.style.width = `${Math.max(viewport.clientWidth, baseWidth * zoom)}px`;
    canvas.style.height = `${Math.max(viewport.clientHeight, baseHeight * zoom)}px`;
    viewport.scrollLeft = Math.max(0, (canvas.clientWidth - baseWidth * zoom) / 2 + point.x * baseWidth * zoom - viewport.clientWidth / 2);
    viewport.scrollTop = Math.max(0, (canvas.clientHeight - baseHeight * zoom) / 2 + point.y * baseHeight * zoom - viewport.clientHeight / 2);
    level.value = `${Math.round(zoom * 100)}%`;
    minus.disabled = zoom <= 1;
    plus.disabled = zoom >= 8;
  }
  function center() {
    return {
      x: (viewport.scrollLeft + viewport.clientWidth / 2 - (canvas.clientWidth - baseWidth * zoom) / 2) / (baseWidth * zoom),
      y: (viewport.scrollTop + viewport.clientHeight / 2 - (canvas.clientHeight - baseHeight * zoom) / 2) / (baseHeight * zoom)
    };
  }
  function change(amount) {
    if (!image.complete || !image.naturalWidth) return;
    const point = center();
    zoom = Math.max(1, Math.min(8, zoom + amount));
    render(point);
  }
  function open(source, button) {
    trigger = button;
    error.hidden = true;
    image.removeAttribute('src');
    image.alt = source.alt;
    viewer.querySelector('#zoom-title').textContent = source.alt || 'Detalhe da estampa';
    const front = /Camisas\/Mockups\//.test(source.src) && /-frente\.png/.test(source.src);
    zoom = front ? 4 : 2;
    image.onload = () => render({x: .5, y: front ? 358.5 / 1254 : .5});
    image.onerror = () => { error.hidden = false; };
    viewer.showModal();
    document.dispatchEvent(new Event('vaz-zoom-change'));
    image.src = front ? source.src.replace(/-frente\.png/, '-frente.svg') : source.src;
    viewer.querySelector('[data-zoom="close"]').focus();
  }
  viewer.querySelector('[data-zoom="out"]').addEventListener('click', () => change(-1));
  viewer.querySelector('[data-zoom="in"]').addEventListener('click', () => change(1));
  viewer.querySelector('[data-zoom="fit"]').addEventListener('click', () => {
    if (!image.naturalWidth) return;
    zoom = 1; render();
  });
  viewer.querySelector('[data-zoom="close"]').addEventListener('click', () => viewer.close());
  viewer.addEventListener('close', () => {
    drag = null;
    trigger?.focus({preventScroll: true});
    document.dispatchEvent(new Event('vaz-zoom-change'));
  });
  viewer.addEventListener('keydown', event => {
    if (['+', '=', '-'].includes(event.key)) {
      event.preventDefault(); change(event.key === '-' ? -1 : 1);
    }
  });
  viewport.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    drag = {x: event.clientX, y: event.clientY, left: viewport.scrollLeft, top: viewport.scrollTop};
    viewport.setPointerCapture(event.pointerId);
    viewport.classList.add('is-dragging');
  });
  viewport.addEventListener('pointermove', event => {
    if (!drag) return;
    viewport.scrollLeft = drag.left + drag.x - event.clientX;
    viewport.scrollTop = drag.top + drag.y - event.clientY;
  });
  function endDrag() { drag = null; viewport.classList.remove('is-dragging'); }
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);
  viewport.addEventListener('lostpointercapture', endDrag);
  new ResizeObserver(() => {
    if (viewer.open && image.naturalWidth) render(center());
  }).observe(viewport);

  function attach(source) {
    if (source.id === 'modal-image') return attachInline(source);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'product-zoom-trigger';
    button.setAttribute('aria-label', 'Ampliar imagem da peça e ver detalhes da estampa');
    const hint = document.createElement('span');
    hint.className = 'product-zoom-hint';
    hint.textContent = 'Ampliar estampa +';
    source.before(button);
    button.append(source, hint);
    source.removeAttribute('tabindex');
    button.addEventListener('click', () => open(source, button));
    return button;
  }
  function attachInline(source) {
    if (source.closest('.inline-zoom-canvas')) return source.closest('.inline-zoom-viewport');
    const host = source.parentElement;
    host.classList.add('has-inline-zoom');
    const frame = document.createElement('div');
    frame.className = 'inline-zoom-viewport';
    frame.tabIndex = 0;
    frame.setAttribute('aria-label', 'Imagem da peça. Quando ampliada, use as setas ou arraste para explorar.');
    const stage = document.createElement('div');
    stage.className = 'inline-zoom-canvas';
    source.before(frame);
    frame.append(stage);
    stage.append(source);
    source.draggable = false;
    const controls = document.createElement('label');
    controls.className = 'inline-zoom-control';
    if (!source.id) source.id = 'piece-image-' + document.querySelectorAll('.inline-zoom-viewport').length;
    controls.innerHTML = '<span>Zoom</span><input type="range" min="100" max="500" step="10" value="100" aria-label="Zoom da peça"><output>100%</output>';
    host.append(controls);
    const slider = controls.querySelector('input');
    slider.setAttribute('aria-controls', source.id);
    const output = controls.querySelector('output');
    let scale = 1, pan, originalSource = source.getAttribute('src'), zoomResource = null, resourceRequest = 0;
    function draw(reset = false) {
      if (!source.naturalWidth || !frame.clientWidth) return;
      const width = Math.min(frame.clientWidth, frame.clientHeight * source.naturalWidth / source.naturalHeight);
      const height = width * source.naturalHeight / source.naturalWidth;
      const x = reset ? .5 : (frame.scrollLeft + frame.clientWidth / 2) / stage.clientWidth;
      const y = reset ? .5 : (frame.scrollTop + frame.clientHeight / 2) / stage.clientHeight;
      source.style.width = `${width * scale}px`;
      source.style.height = `${height * scale}px`;
      stage.style.width = `${Math.max(frame.clientWidth, width * scale)}px`;
      stage.style.height = `${Math.max(frame.clientHeight, height * scale)}px`;
      frame.scrollLeft = x * stage.clientWidth - frame.clientWidth / 2;
      frame.scrollTop = y * stage.clientHeight - frame.clientHeight / 2;
      frame.classList.toggle('is-zoomed', scale > 1);
      output.value = `${Math.round(scale * 100)}%`;
      slider.setAttribute('aria-valuetext', output.value);
    }
    async function upgrade() {
      if (scale <= 1 || !originalSource || !/\/(Camisas|Moletons)\/Mockups\/|^(Camisas|Moletons)\/Mockups\//.test(originalSource) || !/-frente\.png/.test(originalSource)) return;
      const candidate = originalSource.replace(/-frente\.png/, '-frente.svg');
      if (zoomResource === candidate) return;
      const request = ++resourceRequest;
      const highResolution = new Image();
      highResolution.src = candidate;
      try {
        await highResolution.decode();
        if (request !== resourceRequest || scale <= 1) return;
        zoomResource = candidate;
        source.src = candidate;
      } catch { /* A imagem PNG continua utilizável quando não há SVG. */ }
    }
    slider.addEventListener('input', () => { scale = Number(slider.value) / 100; draw(); upgrade(); });
    let colorAnimation;
    source.addEventListener('load', () => {
      draw(true);
      if (source.id !== 'modal-image' || source.getAttribute('src') === zoomResource || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      colorAnimation?.cancel();
      colorAnimation = source.animate([{opacity:.25,filter:'blur(2px)'},{opacity:1,filter:'blur(0)'}],{duration:340,easing:'cubic-bezier(.2,.7,.2,1)'});
    });
    new MutationObserver(() => {
      const next = source.getAttribute('src');
      if (next === zoomResource) return;
      originalSource = next; zoomResource = null; resourceRequest++;
      scale = 1; slider.value = '100'; pan = null; draw(true);
    }).observe(source, {attributes:true, attributeFilter:['src']});
    new ResizeObserver(() => draw()).observe(frame);
    source.closest('dialog')?.addEventListener('close', () => { scale = 1; slider.value = '100'; pan = null; resourceRequest++; colorAnimation?.cancel(); draw(true); });
    frame.addEventListener('keydown', event => {
      if (!['+','=','-'].includes(event.key)) return;
      event.preventDefault();
      scale = Math.max(1, Math.min(5, scale + (event.key === '-' ? -.25 : .25)));
      slider.value = String(Math.round(scale * 100)); draw(); upgrade();
    });
    frame.addEventListener('pointerdown', event => {
      if (scale <= 1 || event.pointerType !== 'mouse' || event.button !== 0) return;
      pan = {x:event.clientX, y:event.clientY, left:frame.scrollLeft, top:frame.scrollTop};
      frame.setPointerCapture(event.pointerId);
      frame.classList.add('is-dragging');
    });
    frame.addEventListener('pointermove', event => {
      if (!pan) return;
      frame.scrollLeft = pan.left + pan.x - event.clientX;
      frame.scrollTop = pan.top + pan.y - event.clientY;
    });
    ['pointerup','pointercancel','lostpointercapture'].forEach(name => frame.addEventListener(name, () => { pan = null; frame.classList.remove('is-dragging'); }));
    draw(true);
    return frame;
  }
  const sceneKeys = ['overVaz','moletomCapuz','capuzVaz','caca','selos','camisaVaz','virao'];
  const sceneColors = ['branco','azul-marinho','branco','branco','azul-marinho','branco','azul-marinho'];
  function updateScene(dialog, selectedKey) {
    let scene = dialog.querySelector('.product-focus-scene');
    if (!scene) {
      scene = document.createElement('div'); scene.className = 'product-focus-scene';
      scene.setAttribute('aria-hidden','true'); dialog.prepend(scene);
    }
    scene.replaceChildren();
    sceneKeys.filter(key => key !== selectedKey).slice(0,6).forEach((key,index) => {
      const distance = index < 3 ? index - 3 : index - 2;
      const slot = sceneKeys.indexOf(key);
      const image = document.createElement('img'); image.alt = ''; image.draggable = false;
      image.src = `assets/rack-side/${key}-${sceneColors[slot]}${distance > 0 ? '-toward-left' : ''}.png?v=5`;
      // Cenário decorativo: falhas não devem aparecer como ícones quebrados.
      image.onerror = () => { image.hidden = true; };
      image.style.setProperty('--scene-offset', `${Math.sign(distance) * (265 + (Math.abs(distance)-1) * 155)}px`);
      scene.append(image);
    });
  }
  window.VazFocus = {updateScene};
  window.VazZoom = {attach, attachInline, get isOpen() {return viewer.open;}};
  const modalImage = document.querySelector('#modal-image');
  if (modalImage) attach(modalImage);
  const productDialog = document.querySelector('#product-dialog');
  if (productDialog) {
    productDialog.classList.add('vaz-product-view');
    const hanger = document.createElementNS('http://www.w3.org/2000/svg','svg');
    hanger.classList.add('product-focus-hanger'); hanger.setAttribute('viewBox','0 0 128 110'); hanger.setAttribute('aria-hidden','true');
    hanger.innerHTML = '<path d="M64 51V24c0-7 10-7 10-14 0-9-15-9-15 0M64 49 9 90c-4 3-3 6 2 6h106c5 0 6-3 2-6L64 49Z"/>';
    productDialog.querySelector('.modal-image').prepend(hanger);
    const colorField = productDialog.querySelector('#variants')?.closest('fieldset');
    if (colorField) { colorField.classList.add('product-color-tags'); productDialog.querySelector('.modal-image').append(colorField); }
    const close = productDialog.querySelector('.close');
    if (close) { close.textContent = '← Voltar'; close.setAttribute('aria-label','Voltar à vitrine'); }
    const update = () => updateScene(productDialog,productDialog.dataset.product);
    new MutationObserver(update).observe(productDialog,{attributes:true,attributeFilter:['data-product']});
    update();
  }
  document.querySelectorAll('[data-zoom-image]').forEach(attach);
})();
