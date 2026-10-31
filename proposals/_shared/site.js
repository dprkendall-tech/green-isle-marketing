(() => {
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
  const t = (value, lang) => {
    if (value == null) return '';
    if (typeof value === 'string') return value;
    return value[lang] || value.en || '';
  };
  const safeUrl = (url) => {
    const value = String(url || '').trim();
    if (!value || /[\s<>]/.test(value)) return '';
    if (/^(javascript|data):/i.test(value) || value.startsWith('//')) return '';
    if (/^[a-z][a-z0-9+.-]*:/i.test(value) && !/^https?:/i.test(value) && !/^mailto:/i.test(value)) return '';
    return value;
  };
  const srcOf = (path) => {
    if (!path) return '';
    if (path.startsWith('../') || path.startsWith('/') || /^https?:/i.test(path)) return path;
    return `../${path}`;
  };
  const fig = (path, alt, cls = '') => {
    const src = srcOf(path);
    if (!src) return `<div class="${cls} ph" role="img" aria-label="${esc(alt || 'Photograph')}"></div>`;
    return `<img class="${cls}" src="${esc(src)}" alt="${esc(alt || '')}" loading="lazy">`;
  };
  const abs = (path) => {
    try { return new URL(srcOf(path), location.href).href; } catch { return ''; }
  };

  const times = () => {
    const out = [];
    for (let minute = 10 * 60; minute <= 23 * 60 + 30; minute += 30) {
      out.push(`${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`);
    }
    return out;
  };
  const bangkokDate = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const bangkokTime = () => new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());

  let config;
  let lang = 'en';
  let formMemory = null;

  const setMeta = (name, content, attr = 'name') => {
    let node = document.head.querySelector(`meta[${attr}="${name}"]`);
    if (!node) {
      node = document.createElement('meta');
      node.setAttribute(attr, name);
      document.head.appendChild(node);
    }
    node.setAttribute('content', content);
  };

  const writeSchema = () => {
    const site = config.site || {};
    const schema = site.schema || {};
    const contact = site.contact || {};
    const data = {
      '@context': 'https://schema.org',
      '@type': schema.types || ['BarOrPub', 'Restaurant'],
      name: site.identity?.name || config.client?.venue,
      description: t(site.meta?.description, lang),
      url: location.href.split('#')[0],
      image: abs(site.hero?.image),
      servesCuisine: schema.servesCuisine,
      priceRange: schema.priceRange,
      address: {
        '@type': 'PostalAddress',
        streetAddress: schema.streetAddress,
        addressLocality: schema.addressLocality,
        addressRegion: schema.addressRegion,
        postalCode: schema.postalCode,
        addressCountry: schema.addressCountry
      },
      geo: contact.lat ? { '@type': 'GeoCoordinates', latitude: contact.lat, longitude: contact.lng } : undefined,
      hasMap: contact.googleMaps,
      sameAs: [contact.facebook, contact.tripadvisor, contact.googleMaps].filter(Boolean),
      openingHours: schema.openingHours,
      aggregateRating: schema.ratingValue ? {
        '@type': 'AggregateRating',
        ratingValue: schema.ratingValue,
        reviewCount: schema.reviewCount,
        bestRating: '5'
      } : undefined,
      inLanguage: ['en', 'th']
    };
    let node = document.getElementById('place-schema');
    if (!node) {
      node = document.createElement('script');
      node.id = 'place-schema';
      node.type = 'application/ld+json';
      document.head.appendChild(node);
    }
    node.textContent = JSON.stringify(data);
  };

  const messageLink = (label, cls) => {
    const contact = config.site.contact || {};
    const digits = String(contact.whatsapp || '').replace(/\D/g, '');
    const hello = lang === 'th' ? 'สวัสดี 79 อยากถามเรื่องโต๊ะ' : 'Hello, I would like to ask about a table.';
    if (digits) return `<a class="${cls}" href="https://wa.me/${digits}?text=${encodeURIComponent(hello)}">${esc(label)}</a>`;
    const email = contact.email || '';
    return `<a class="${cls}" href="mailto:${esc(email)}?subject=${encodeURIComponent('Table question')}&body=${encodeURIComponent(hello)}">${esc(label)}</a>`;
  };

  const render = () => {
    const site = config.site;
    const id = site.identity || {};
    const hero = site.hero || {};
    const exp = site.experience || {};
    const menu = site.menu || {};
    const events = site.events || {};
    const reviews = site.reviews || {};
    const book = site.booking || {};
    const visit = site.visit || {};
    const contact = site.contact || {};
    const fields = book.fields || {};
    const guest = (n) => (n === 1 ? t(book.guestOne, lang) : `${n} ${t(book.guestLabel, lang)}`);
    document.documentElement.lang = lang === 'th' ? 'th' : 'en';
    document.title = t(site.meta?.title, lang) || document.title;
    setMeta('description', t(site.meta?.description, lang));
    setMeta('og:title', document.title, 'property');
    setMeta('og:description', t(site.meta?.description, lang), 'property');
    if (hero.image) setMeta('og:image', abs(hero.image), 'property');
    writeSchema();
    const heroImage = srcOf(hero.image);

    return `<a class="skip" href="#main">${lang === 'th' ? 'ข้ามไปเนื้อหา' : 'Skip to content'}</a>
    <header class="bar">
      <a class="logo" href="#top"><b>${esc(id.mark || '79')}</b><small>${esc(t(id.tag, lang))}</small></a>
      <nav aria-label="${lang === 'th' ? 'ในหน้า' : 'On this page'}">${(site.nav || []).map((item) => `<a href="${esc(item.href)}">${esc(t(item.label, lang))}</a>`).join('')}</nav>
      <div class="bar-actions">
        <div class="lang" role="group" aria-label="${lang === 'th' ? 'ภาษา' : 'Language'}">
          <button type="button" data-lang="en" aria-pressed="${lang === 'en'}">EN</button>
          <button type="button" data-lang="th" aria-pressed="${lang === 'th'}">TH</button>
        </div>
        ${messageLink(t(hero.secondary, lang), 'btn ghost desktop-only')}
        <a class="btn desktop-only" href="#book">${esc(t(hero.primary, lang))}</a>
      </div>
    </header>
    <main id="main">
      <section class="hero" id="top" style="${heroImage ? `background-image:linear-gradient(180deg,rgba(20,14,12,.12),rgba(20,14,12,.72)),url('${esc(heroImage)}')` : ''}">
        <div class="hero-copy">
          <p class="eyebrow">${esc(t(hero.eyebrow, lang))}</p>
          <h1>${esc(t(hero.title, lang))}<br><em>${esc(t(hero.titleEm, lang))}</em></h1>
          <p class="lead">${esc(t(hero.lead, lang))}</p>
          <div class="hero-actions"><a class="btn gold" href="#book">${esc(t(hero.primary, lang))}</a>${messageLink(t(hero.secondary, lang), 'btn')}</div>
          <p class="sub">${esc(t(hero.sub, lang))}</p>
          <div class="trust">${(hero.trust || []).map((item) => `<div><span>${esc(t(item.k, lang))}</span><strong>${esc(t(item.v, lang))}</strong></div>`).join('')}</div>
        </div>
      </section>
      <section class="section" id="experience"><div class="wrap experience">
        <div class="stack">${fig(exp.image, t(exp.imageAlt, lang))}${fig(exp.inset, t(exp.insetAlt, lang), 'inset')}</div>
        <div>
          <p class="eyebrow">${esc(t(exp.eyebrow, lang))}</p>
          <h2>${esc(t(exp.title, lang))}<br><em>${esc(t(exp.titleEm, lang))}</em></h2>
          <p class="lead">${esc(t(exp.body, lang))}</p>
          <div class="cards">${(exp.cards || []).map((card) => `<article class="card"><span>${esc(card.n)}</span><h3>${esc(t(card.title, lang))}</h3><p>${esc(t(card.body, lang))}</p></article>`).join('')}</div>
        </div>
      </div></section>
      <section class="section" id="menu"><div class="wrap">
        <div class="menu-head"><p class="eyebrow">${esc(t(menu.eyebrow, lang))}</p><h2>${esc(t(menu.title, lang))} <em>${esc(t(menu.titleEm, lang))}</em></h2><p class="lead">${esc(t(menu.lead, lang))}</p></div>
        <div class="menu-grid">${(menu.items || []).map((item) => `<article class="menu-card">${fig(item.image, t(item.alt, lang))}<div><h3>${esc(t(item.title, lang))}<span>${esc(item.kicker || '')}</span></h3><p>${esc(t(item.body, lang))}</p></div></article>`).join('')}</div>
        <p class="fine" style="margin-top:14px">${esc(t(menu.note, lang))}</p>
        <div class="hero-actions"><a class="btn" href="#book">${esc(t(menu.cta, lang))}</a></div>
      </div></section>
      <section class="section band" id="events"><div class="wrap">
        <p class="eyebrow">${esc(t(events.eyebrow, lang))}</p>
        <h2>${esc(t(events.title, lang))} <em>${esc(t(events.titleEm, lang))}</em></h2>
        <p class="lead">${esc(t(events.lead, lang))}</p>
        <div class="event-grid" style="margin-top:18px">${(events.items || []).map((item) => `<article class="event-card"><h3>${esc(t(item.title, lang))}</h3><p>${esc(t(item.body, lang))}</p></article>`).join('')}</div>
        <p class="locals">${esc(t(events.localsNote, lang))}</p>
      </div></section>
      <section class="section" id="reviews"><div class="wrap review-band">
        <div>
          <p class="eyebrow">${esc(t(reviews.eyebrow, lang))}</p>
          <h2>${esc(t(reviews.title, lang))}<br><em>${esc(t(reviews.titleEm, lang))}</em></h2>
          <p class="lead">${esc(t(reviews.body, lang))}</p>
        </div>
        <div>
          <p class="quote">“${esc(reviews.quote || '')}”</p>
          <p class="fine">${esc(reviews.quoteBy || '')}</p>
          <div class="review-actions" style="margin-top:16px">
            <a class="btn" href="${esc(safeUrl(contact.googleMaps))}" target="_blank" rel="noopener">${esc(t(reviews.google, lang))}</a>
            <a class="btn ghost" href="${esc(safeUrl(contact.tripadvisor))}" target="_blank" rel="noopener">${esc(t(reviews.tripadvisor, lang))}</a>
          </div>
          <p class="fine" style="margin-top:10px">${esc(t(reviews.hint, lang))}</p>
        </div>
      </div></section>
      <section class="section" id="book"><div class="wrap book">
        <div>
          <p class="eyebrow">${esc(t(book.eyebrow, lang))}</p>
          <h2>${esc(t(book.title, lang))}<br><em>${esc(t(book.titleEm, lang))}</em></h2>
          <p class="lead">${esc(t(book.lead, lang))}</p>
          <p class="fine" style="margin-top:12px">${esc(t(book.emailNote, lang))}</p>
        </div>
        <form id="booking-form">
          <h3>${esc(t(book.formTitle, lang))}</h3>
          <div class="form-grid">
            <label>${esc(t(fields.name, lang))}<input name="name" autocomplete="name" required maxlength="80"></label>
            <label>${esc(t(fields.contact, lang))}<input name="contact" autocomplete="tel" required maxlength="120"></label>
            <label>${esc(t(fields.date, lang))}<input name="date" type="date" required></label>
            <label>${esc(t(fields.time, lang))}<select name="time" required><option value="">${esc(t(book.chooseTime, lang))}</option>${times().map((time) => `<option>${time}</option>`).join('')}</select></label>
            <label>${esc(t(fields.guests, lang))}<select name="guests" required>${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n) => `<option value="${n}">${esc(guest(n))}</option>`).join('')}<option value="12+">${esc(t(book.guestMany, lang))}</option></select></label>
            <label>${esc(t(fields.seating, lang))}<select name="seating">${(book.seatingOptions || []).map((option, index) => `<option value="${index}">${esc(t(option, lang))}</option>`).join('')}</select></label>
            <label class="wide">${esc(t(fields.type, lang))}<select name="type">${(book.typeOptions || []).map((option, index) => `<option value="${index}">${esc(t(option, lang))}</option>`).join('')}</select></label>
            <label class="wide">${esc(t(fields.notes, lang))} <span class="fine">${esc(t(fields.notesHint, lang))}</span><textarea name="notes" maxlength="600"></textarea></label>
          </div>
          <button class="btn full" type="submit">${esc(t(book.submit, lang))}</button>
          <p class="fine">${esc(t(book.privacy, lang))}</p>
        </form>
      </div></section>
      <section class="section" id="visit"><div class="wrap visit">
        <div>
          <p class="eyebrow">${esc(t(visit.eyebrow, lang))}</p>
          <h2>${esc(t(visit.title, lang))}<br><em>${esc(t(visit.titleEm, lang))}</em></h2>
          <p class="lead" style="white-space:pre-line">${esc(t(visit.address, lang))}</p>
          <p class="fine">${esc(t(visit.note, lang))}</p>
          <div class="visit-actions">
            <a class="btn" href="${esc(safeUrl(contact.googleMaps))}" target="_blank" rel="noopener">${esc(t(visit.maps, lang))}</a>
            <a class="btn ghost" href="${esc(safeUrl(contact.facebook))}" target="_blank" rel="noopener">${esc(t(visit.facebook, lang))}</a>
            ${contact.lineUrl ? `<a class="btn ghost" href="${esc(safeUrl(contact.lineUrl))}" target="_blank" rel="noopener">LINE</a>` : ''}
          </div>
        </div>
        <iframe class="map" title="${esc(t(visit.mapTitle, lang))}" src="${esc(safeUrl(contact.mapEmbed))}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
      </div></section>
    </main>
    <footer class="site-footer wrap">
      <div><strong>${esc(id.name || '')}</strong><p>${esc(t(site.footer?.line, lang))}</p><p>${esc(t(site.footer?.hours, lang))}</p></div>
      <div>${site.showAgencyCredit ? `<p>${esc(t(site.footer?.credit, lang))}</p>` : ''}<p><a href="${esc(safeUrl(contact.facebook))}">Facebook</a> · <a href="${esc(safeUrl(contact.tripadvisor))}">Tripadvisor</a></p></div>
    </footer>
    ${(() => { try { return window.self !== window.top; } catch { return true; } })() ? '' : `<a class="btn gold dock" href="#book">${esc(t(site.dock, lang))}</a>`}
    <dialog id="booking-dialog" aria-labelledby="dialog-title">
      <button class="btn ghost" type="button" id="close-dialog">${lang === 'th' ? 'ปิด' : 'Close'}</button>
      <h2 id="dialog-title">${esc(t(book.dialogTitle, lang))}</h2>
      <p>${esc(t(book.dialogBody, lang))}</p>
      <pre id="booking-summary"></pre>
      <div class="actions">
        <a class="btn" id="email-request" href="#">${esc(t(book.emailButton, lang))}</a>
        <button class="btn ghost" type="button" id="copy-request">${esc(t(book.copyButton, lang))}</button>
        <a class="btn ghost" id="wa-request" hidden href="#">${esc(t(book.whatsappButton, lang))}</a>
      </div>
      <p id="copy-status" role="status"></p>
    </dialog>`;
  };

  const bind = () => {
    const form = document.querySelector('#booking-form');
    if (formMemory && form) {
      Object.entries(formMemory).forEach(([key, value]) => { if (form.elements[key]) form.elements[key].value = value; });
    }
    document.querySelectorAll('[data-lang]').forEach((button) => {
      button.addEventListener('click', () => {
        if (button.dataset.lang === lang) return;
        formMemory = form ? Object.fromEntries(new FormData(form).entries()) : null;
        lang = button.dataset.lang;
        try { sessionStorage.setItem(`${config.meta?.slug || 'proposal'}-lang`, lang); } catch { /* private mode */ }
        paint();
      });
    });
    const date = form?.elements.date;
    if (date) date.min = bangkokDate();
    form?.addEventListener('submit', (event) => {
      event.preventDefault();
      const book = config.site.booking || {};
      date.min = bangkokDate();
      date.setCustomValidity('');
      form.elements.time.setCustomValidity('');
      if (date.value < date.min) {
        date.setCustomValidity(t(book.dateError, lang));
        date.reportValidity();
        return;
      }
      if (date.value === bangkokDate() && form.elements.time.value <= bangkokTime()) {
        form.elements.time.setCustomValidity(t(book.timeError, lang));
        form.elements.time.reportValidity();
        return;
      }
      const data = new FormData(form);
      const val = (key) => String(data.get(key) || '').trim();
      const dateLabel = new Date(`${val('date')}T12:00:00+07:00`).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-GB', { timeZone: 'Asia/Bangkok', weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
      const venue = config.site.identity?.name || 'the restaurant';
      const party = val('guests') === '12+' ? t(book.guestMany, lang) : (Number(val('guests')) === 1 ? t(book.guestOne, lang) : `${val('guests')} ${t(book.guestLabel, lang)}`);
      const seating = t(book.seatingOptions?.[Number(val('seating'))], lang);
      const occasion = t(book.typeOptions?.[Number(val('type'))], lang);
      const message = `Hello ${venue},\n\nI would like to request a table. This is not a confirmed booking.\n\nName: ${val('name')}\nReply to: ${val('contact')}\nDate: ${dateLabel}\nTime: ${val('time')} (Thailand)\nParty: ${party}\nSeating: ${seating}\nOccasion: ${occasion}${val('notes') ? `\nNotes: ${val('notes')}` : ''}\n\nPlease tell me if you can confirm. Thank you.`;
      document.querySelector('#booking-summary').textContent = message;
      const email = config.site.contact?.email || '';
      document.querySelector('#email-request').href = `mailto:${email}?subject=${encodeURIComponent(`Table request — ${val('date')} ${val('time')}`)}&body=${encodeURIComponent(message)}`;
      const digits = String(config.site.contact?.whatsapp || '').replace(/\D/g, '');
      const wa = document.querySelector('#wa-request');
      if (digits) {
        wa.hidden = false;
        wa.href = `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
      } else wa.hidden = true;
      document.querySelector('#copy-status').textContent = '';
      document.querySelector('#booking-dialog').showModal();
    });
    document.querySelector('#close-dialog')?.addEventListener('click', () => document.querySelector('#booking-dialog').close());
    document.querySelector('#copy-request')?.addEventListener('click', async () => {
      const status = document.querySelector('#copy-status');
      const book = config.site.booking || {};
      try {
        await navigator.clipboard.writeText(document.querySelector('#booking-summary').textContent);
        status.textContent = t(book.copied, lang);
      } catch {
        status.textContent = t(book.copyFail, lang);
      }
    });
    document.querySelector('#booking-dialog')?.addEventListener('click', (event) => {
      if (event.target.tagName === 'DIALOG') event.currentTarget.close();
    });
    const dock = document.querySelector('.dock');
    const booking = document.querySelector('#book');
    if (dock && booking && 'IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => dock.classList.toggle('is-hidden', entry.isIntersecting), { threshold: 0.2 }).observe(booking);
    }
  };

  const paint = () => {
    document.querySelector('#site').innerHTML = render();
    document.querySelector('#site').removeAttribute('aria-busy');
    bind();
  };

  const start = async () => {
    const root = document.querySelector('#site');
    try {
      const response = await fetch(new URL('../config.json', location.href), { cache: 'no-cache' });
      if (!response.ok) throw new Error('missing config');
      config = await response.json();
      if (!config.site) throw new Error('missing site');
      try { lang = sessionStorage.getItem(`${config.meta?.slug || 'proposal'}-lang`) || 'en'; } catch { lang = 'en'; }
      if (lang !== 'th') lang = 'en';
      paint();
    } catch (error) {
      root.innerHTML = '<div class="boot">This page needs config.json beside the proposal folder.</div>';
      root.removeAttribute('aria-busy');
    }
  };
  start();
})();
