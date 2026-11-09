'use strict';
(() => {
  const form = document.querySelector('#note-form');
  if (form) {
    const board = document.querySelector('#notes');
    const status = document.querySelector('#note-status');
    const key = 'vaz-community-notes-v1';
    const examples = [{name:'VAZ · recado da marca',message:'Tem coisa boa acontecendo perto de você. Conta pra gente.',example:true},{name:'VAZ · recado da marca',message:'Dias melhores também começam com uma conversa.',example:true},{name:'VAZ · recado da marca',message:'Que as boas novas encontrem espaço no seu dia.',example:true}];
    let notes = [];
    try { const saved = JSON.parse(localStorage.getItem(key) || '[]'); if(Array.isArray(saved)) notes = saved.filter(n => typeof n.message==='string' && typeof n.name==='string').slice(0,100); } catch { status.textContent='Não foi possível carregar os recados salvos. Você ainda pode escrever nesta visita.'; }
    function render() {
      board.replaceChildren();
      [...notes,...examples].forEach(note => {
        const article=document.createElement('article'); article.className='sticky-note';
        const p=document.createElement('p');p.textContent=note.message;
        const by=document.createElement('small');by.textContent=note.name;
        article.append(p,by);
        if(!note.example){const remove=document.createElement('button');remove.type='button';remove.textContent='Remover meu recado';remove.addEventListener('click',()=>{notes=notes.filter(n=>n!==note);save('Recado removido.');render();form.querySelector('textarea').focus();});article.append(remove);}
        board.append(article);
      });
      document.querySelector('#note-count').textContent=notes.length+' recado'+(notes.length===1?' seu':'s seus');
    }
    function save(success) { try { localStorage.setItem(key,JSON.stringify(notes));status.textContent=success; } catch { status.textContent='Seu recado aparece nesta visita, mas o navegador não permitiu salvá-lo.'; } }
    form.addEventListener('submit',event=>{event.preventDefault();const message=form.elements.message.value.trim();if(!message){form.elements.message.setCustomValidity('Escreva uma mensagem para o mural.');form.elements.message.reportValidity();return;}notes.unshift({name:form.elements.name.value.trim()||'Alguém da comunidade',message});notes=notes.slice(0,100);save('Sua boa nova chegou ao mural e foi salva neste navegador.');render();form.reset();form.elements.message.focus();});
    form.elements.message.addEventListener('input',()=>form.elements.message.setCustomValidity(''));
    render();
  }
  const filters=[...document.querySelectorAll('[data-category]')];
  if(filters.length){let category='todos';const search=document.querySelector('#catalog-search');const groups=[...document.querySelectorAll('.catalog-group')];function update(){let count=0;const query=search.value.trim().toLocaleLowerCase('pt-BR');groups.forEach(group=>{let visible=0;group.querySelectorAll('[data-product]').forEach(card=>{const show=(category==='todos'||group.dataset.group===category)&&card.textContent.toLocaleLowerCase('pt-BR').includes(query);card.hidden=!show;if(show){count++;visible++;}});group.hidden=!visible;});document.querySelector('#catalog-status').textContent=count?count+' peças para explorar. Selecione uma peça para ver cores e detalhes.':'Nenhuma peça encontrada. Tente outro nome ou categoria.';}filters.forEach(button=>button.addEventListener('click',()=>{category=button.dataset.category;filters.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));update();}));search.addEventListener('input',update);update();}
})();
