const header = document.querySelector('.site-header');
const menu = document.querySelector('.menu');
if (menu) menu.onclick = () => header.classList.toggle('open');

const page = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('nav>a').forEach(link => {
  if (link.getAttribute('href') === page) link.setAttribute('aria-current', 'page');
});

let language = 'en';
let refreshViewer = () => {};

function artworkText(card, field) {
  return (language === 'zh' ? card.dataset[`${field}Zh`] : undefined) ?? card.dataset[field] ?? '';
}

function formatDimensions(size, lang) {
  const match = size.match(/^\s*(\d+(?:\.\d+)?)\s*[×x]\s*(\d+(?:\.\d+)?)\s*(in|cm)\s*$/);
  if (!match) return size;

  const dimensions = [Number(match[1]), Number(match[2])];
  const convert = factor => dimensions.map(value => Number((value * factor).toFixed(2)));
  const inches = match[3] === 'in' ? dimensions : convert(1 / 2.54);
  const centimeters = match[3] === 'cm' ? dimensions : convert(2.54);
  const inchUnit = lang === 'zh' ? '英寸' : 'in';
  const cmUnit = lang === 'zh' ? '厘米' : 'cm';
  return `${inches.join(' × ')} ${inchUnit} / ${centimeters.join(' × ')} ${cmUnit}`;
}

function setLang(lang) {
  language = lang === 'zh' ? 'zh' : 'en';
  localStorage.setItem('lang', language);
  document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
  document.querySelectorAll('[data-en][data-zh]').forEach(element => {
    element.textContent = element.dataset[language];
  });
  document.querySelectorAll('[data-label-en][data-label-zh]').forEach(element => {
    element.setAttribute('aria-label', language === 'zh' ? element.dataset.labelZh : element.dataset.labelEn);
  });
  document.querySelectorAll('.work-card').forEach(card => {
    const image = card.querySelector('img');
    if (image) image.alt = artworkText(card, 'title');
  });
  document.querySelectorAll('.lang button').forEach(button => {
    button.classList.toggle('active', button.dataset.lang === language);
  });
  refreshViewer();
}

document.querySelectorAll('.lang button').forEach(button => {
  button.onclick = () => setLang(button.dataset.lang);
});
setLang(localStorage.getItem('lang') || 'en');

const cards = [...document.querySelectorAll('.work-card')];
const viewer = document.querySelector('#viewer');
if (viewer) {
  let current = 0;
  const image = document.querySelector('#viewer-image');

  refreshViewer = () => {
    const card = cards[current];
    if (!card) return;
    document.querySelector('#viewer-title').textContent = artworkText(card, 'title');
    document.querySelector('#viewer-year').textContent = card.dataset.year;
    document.querySelector('#viewer-medium').textContent = artworkText(card, 'medium');
    document.querySelector('#viewer-size').textContent = formatDimensions(card.dataset.size, language);

    const description = document.querySelector('#viewer-description');
    if (description) {
      const text = artworkText(card, 'description');
      description.textContent = text;
      description.hidden = !text;
    }

    const quote = document.querySelector('#viewer-quote');
    const source = document.querySelector('#viewer-source');
    const quoteText = artworkText(card, 'quote');
    const sourceText = artworkText(card, 'source');
    if (quote) {
      quote.textContent = quoteText;
      quote.style.display = quoteText ? 'block' : 'none';
    }
    if (source) {
      source.textContent = sourceText ? `— ${sourceText}` : '';
      source.style.display = sourceText ? 'block' : 'none';
    }
    image.alt = artworkText(card, 'title');
  };

  const show = index => {
    current = (index + cards.length) % cards.length;
    refreshViewer();
    image.src = cards[current].dataset.src;
    viewer.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    viewer.classList.remove('open');
    document.body.style.overflow = '';
  };

  cards.forEach((card, index) => card.onclick = () => show(index));
  document.querySelector('.viewer-close').onclick = close;
  document.querySelector('.viewer-prev').onclick = () => show(current - 1);
  document.querySelector('.viewer-next').onclick = () => show(current + 1);
  document.addEventListener('keydown', event => {
    if (!viewer.classList.contains('open')) return;
    if (event.key === 'Escape') close();
    if (event.key === 'ArrowLeft') show(current - 1);
    if (event.key === 'ArrowRight') show(current + 1);
  });
}


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
