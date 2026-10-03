const header=document.querySelector('.site-header'),menu=document.querySelector('.menu');if(menu)menu.onclick=()=>header.classList.toggle('open');const page=location.pathname.split('/').pop()||'index.html';document.querySelectorAll('nav>a').forEach(a=>{if(a.getAttribute('href')===page)a.setAttribute('aria-current','page')});function setLang(lang){localStorage.setItem('lang',lang);document.documentElement.lang=lang==='zh'?'zh-CN':'en';document.querySelectorAll('[data-en][data-zh]').forEach(el=>el.textContent=el.dataset[lang]);document.querySelectorAll('.lang button').forEach(b=>b.classList.toggle('active',b.dataset.lang===lang))}document.querySelectorAll('.lang button').forEach(b=>b.onclick=()=>setLang(b.dataset.lang));setLang(localStorage.getItem('lang')||'en');const cards=[...document.querySelectorAll('.work-card')],viewer=document.querySelector('#viewer');if(viewer){let current=0;const show=i=>{current=(i+cards.length)%cards.length;const c=cards[current];document.querySelector('#viewer-title').textContent=c.dataset.title;document.querySelector('#viewer-year').textContent=c.dataset.year;document.querySelector('#viewer-medium').textContent=c.dataset.medium;document.querySelector('#viewer-size').textContent=c.dataset.size;const q=document.querySelector('#viewer-quote'),s=document.querySelector('#viewer-source');if(q){q.textContent=c.dataset.quote||'';q.style.display=c.dataset.quote?'block':'none'}if(s){s.textContent=c.dataset.source?('— '+c.dataset.source):'';s.style.display=c.dataset.source?'block':'none'}const img=document.querySelector('#viewer-image');img.src=c.dataset.src;img.alt=c.dataset.title;viewer.classList.add('open');document.body.style.overflow='hidden'};const close=()=>{viewer.classList.remove('open');document.body.style.overflow=''};cards.forEach((c,i)=>c.onclick=()=>show(i));document.querySelector('.viewer-close').onclick=close;document.querySelector('.viewer-prev').onclick=()=>show(current-1);document.querySelector('.viewer-next').onclick=()=>show(current+1);document.addEventListener('keydown',e=>{if(!viewer.classList.contains('open'))return;if(e.key==='Escape')close();if(e.key==='ArrowLeft')show(current-1);if(e.key==='ArrowRight')show(current+1)})}

// Keep the original figures (and their viewer handlers) while grouping artwork rows.
document.querySelectorAll('.work-grid').forEach(grid => {
  const artworks = [...grid.querySelectorAll('.work-card')];
  if (!artworks.length) return;

  artworks.forEach(card => {
    const image = card.querySelector('img');
    if (!image) return;

    const updateRatio = () => {
      // HTML dimensions reserve the correct space before lazy images load.
      // Natural dimensions also handle replacement images with different ratios.
      const width = image.naturalWidth || Number(image.getAttribute('width'));
      const height = image.naturalHeight || Number(image.getAttribute('height'));
      if (width > 0 && height > 0) {
        card.style.setProperty('--artwork-ratio', width / height);
      }
    };
    image.addEventListener('load', updateRatio);
    updateRatio();
  });

  const mobile = window.matchMedia('(max-width: 760px)');
  const firstRowSize = Number(grid.dataset.firstRowSize) || 2;
  const arrangeRows = () => {
    const rows = document.createDocumentFragment();
    let offset = 0;
    while (offset < artworks.length) {
      const slots = artworks.length === 1 ? 1 : mobile.matches ? 2 : offset === 0 ? firstRowSize : 3;
      const rowArtworks = artworks.slice(offset, offset + slots);
      const row = document.createElement('div');
      row.className = 'work-row';
      row.style.setProperty('--work-row-fill', rowArtworks.length / slots);
      row.append(...rowArtworks);
      rows.append(row);
      offset += rowArtworks.length;
    }
    grid.replaceChildren(rows);
  };

  arrangeRows();
  mobile.addEventListener('change', arrangeRows);
});
