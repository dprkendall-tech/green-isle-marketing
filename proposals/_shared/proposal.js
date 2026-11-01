(() => {
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
  const rich = (value) => esc(value).replace(/\*([^*]+)\*/g, '<em>$1</em>');
  const safeUrl = (url) => {
    const value = String(url || '').trim();
    if (!value || /[\s<>]/.test(value)) return '';
    if (/^(javascript|data):/i.test(value) || value.startsWith('//')) return '';
    if (/^[a-z][a-z0-9+.-]*:/i.test(value) && !/^https?:/i.test(value) && !/^mailto:/i.test(value)) return '';
    return value;
  };
  const link = (href, label, cls = '') => {
    const url = safeUrl(href);
    if (!url) return '';
    const external = /^https?:/i.test(url);
    return `<a class="${cls}" href="${esc(url)}"${external ? ' target="_blank" rel="noopener"' : ''}>${label}</a>`;
  };
  const fig = (src, alt, cls = '', eager = false) => {
    if (!src) return `<div class="${cls} ph" role="img" aria-label="${esc(alt || 'Add a photograph')}"></div>`;
    return `<img class="${cls}" src="${esc(src)}" alt="${esc(alt || '')}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'}>`;
  };
  const paras = (items = []) => `<div class="prose">${items.map((p) => `<p>${rich(p)}</p>`).join('')}</div>`;

  const navItems = (config) => {
    const items = [...(config.nav || [])];
    if (config.pricing?.enabled) {
      const item = { id: 'pricing', label: config.pricing.navLabel || 'Investment' };
      const closeAt = items.findIndex((item) => item.id === 'close');
      if (closeAt === -1) items.push(item);
      else items.splice(closeAt, 0, item);
    }
    return items;
  };

  const ring = (score, max) => {
    const radius = 46;
    const circ = (2 * Math.PI * radius).toFixed(2);
    const pct = Math.max(0, Math.min(1, Number(score) / Number(max || 100)));
    const offset = (circ * (1 - pct)).toFixed(2);
    return `<svg class="ring" viewBox="0 0 116 116" role="img" aria-label="${esc(score)} out of ${esc(max)}">
      <circle cx="58" cy="58" r="${radius}" fill="none" stroke="rgba(255,255,255,.16)" stroke-width="8"></circle>
      <circle class="ring-value" cx="58" cy="58" r="${radius}" fill="none" stroke="#f3d7a4" stroke-width="8" stroke-linecap="round" stroke-dasharray="${circ}" stroke-dashoffset="${offset}" transform="rotate(-90 58 58)"></circle>
      <text x="58" y="66" text-anchor="middle">${esc(score)}</text>
    </svg>`;
  };

  const render = (c) => {
    const client = c.client || {};
    const agency = c.agency || {};
    const video = c.video || {};
    const snap = c.snapshot || {};
    const site = c.website || {};
    const fb = c.facebook || {};
    const presence = c.presence || {};
    const google = c.google || {};
    const plan = c.plan || {};
    const close = c.close || {};
    const contact = c.site?.contact || {};
    const posts = fb.posts || [];
    const pinned = posts.filter((post) => post.pinned);
    const grid = posts.filter((post) => !post.pinned);
    const waDigits = String(agency.whatsapp || '').replace(/\D/g, '');
    const waHref = waDigits ? `https://wa.me/${waDigits}?text=${encodeURIComponent(close.whatsappText || '')}` : '';
    const mailHref = `mailto:${agency.email || ''}?subject=${encodeURIComponent(close.emailSubject || 'Hello')}&body=${encodeURIComponent(close.whatsappText || '')}`;
    const postCard = (post) => `<article class="post card">
      <div class="post-head">${fig(fb.profile, fb.profileAlt, '')}<div><strong>${esc(fb.name)}</strong><div class="muted">${esc(post.when || 'Proposed sample')}</div></div></div>
      <p>${rich(post.text || '')}</p>
      ${fig(post.image, post.alt, 'shot')}
      <p class="fine">Sample for review. Not published.</p>
    </article>`;

    return `${c.meta?.template ? `<div class="template-banner">${esc(c.meta.templateBanner || 'Template only. Replace every fact in config.json before sending.')}</div>` : ''}
    <header class="top">
      <div class="top-row">
        ${link(agency.homeHref || '../../index.html', `<img src="../_shared/mark.svg" alt=""><span>${esc(agency.name || 'Green Isle')}<small>${esc(agency.place || '')}</small></span>`, 'brand')}
        <p class="badge">${esc(c.commercial?.badge || '')}</p>
      </div>
      <nav class="section-nav" aria-label="Proposal sections">
        ${navItems(c).map((item, index) => `<a href="#${esc(item.id)}"${index === 0 ? ' aria-current="true"' : ''}>${esc(item.label)}</a>`).join('')}
      </nav>
    </header>
    <main>
      <section class="hero" id="intro">
        <div class="wrap hero-grid">
          <div>
            <p class="kicker">${esc(video.kicker || `For ${client.name || 'the owner'}`)}</p>
            <h1>${esc(video.title || '')}<br><em>${esc(video.titleEm || '')}</em></h1>
            <p class="welcome" id="welcome-line">${esc(video.welcome || '')}</p>
          </div>
          <div>
            ${video.src ? `<div class="video-frame"><video controls playsinline preload="metadata" poster="${esc(video.poster || '')}" width="1280" height="720" aria-describedby="welcome-line"><source src="${esc(safeUrl(video.src))}" type="video/mp4"></video></div>
            <div class="video-meta"><span>${esc(video.eyebrow || '')}</span><span>${esc(video.durationLabel || '')}</span></div>` : '<p class="note">Add video.src in the client config to show the intro film.</p>'}
          </div>
        </div>
      </section>
      ${(c.ribbon || []).length ? `<div class="ribbon" aria-hidden="true"><div class="ribbon-track">${[...c.ribbon, ...c.ribbon].map((item) => `<span>${esc(item)} ✦</span>`).join('')}</div></div>` : ''}
      <section class="section" id="snapshot">
        <div class="wrap">
          <p class="eyebrow">${esc(snap.eyebrow || '')}</p>
          <h2>${esc(snap.title || '')} <em>${esc(snap.titleEm || '')}</em></h2>
          <p class="lead">${esc(snap.lead || '')}</p>
          <div class="score-layout reveal">
            <article class="score-card">
              ${ring(snap.score, snap.scoreMax || 100)}
              <div><p class="eyebrow">${esc(snap.scoreLabel || 'Audit score')}</p><strong>${esc(snap.score)} / ${esc(snap.scoreMax || 100)}</strong><p>${esc(snap.scoreNote || '')}</p></div>
            </article>
            <div class="stats">
              ${(snap.stats || []).map((stat) => `<article class="stat"><span>${esc(stat.label)}</span><strong>${esc(stat.value)}</strong><span>${esc(stat.detail)}</span></article>`).join('')}
            </div>
          </div>
          <h3 style="margin-top:28px">${esc(snap.issuesTitle || '')}</h3>
          <div class="issues">
            ${(snap.issues || []).map((issue, index) => `<article class="issue"><i>${index + 1}</i><div><strong>${esc(issue.title)}</strong><p>${esc(issue.detail)}</p></div></article>`).join('')}
          </div>
          ${snap.aside ? `<p class="aside">${esc(snap.aside)}</p>` : ''}
          <div class="source-row">${(snap.sources || []).map((source) => link(source.href, esc(source.label))).join('')}</div>
        </div>
      </section>
      <section class="section" id="website">
        <div class="wrap">
          <p class="eyebrow">${esc(site.eyebrow || '')}</p>
          <h2>${esc(site.title || '')} <em>${esc(site.titleEm || '')}</em></h2>
          <p class="lead">${esc(site.lead || '')}</p>
          <div class="device reveal">
            <div class="device-top"><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="device-url">${esc(site.urlLabel || 'Proposed website')}</span>${link(site.previewHref, 'Open ↗')}</div>
            <iframe src="${esc(safeUrl(site.previewHref || 'site/'))}" title="${esc(site.previewTitle || 'Proposed website')}"></iframe>
          </div>
          <ul class="points">${(site.points || []).map((point) => `<li>${esc(point)}</li>`).join('')}</ul>
          <p class="note">${esc(site.note || '')}</p>
          ${link(site.previewHref, 'Open the full page ↗', 'btn')}
        </div>
      </section>
      <section class="section" id="facebook">
        <div class="wrap">
          <p class="eyebrow">${esc(presence.eyebrow || fb.eyebrow || '')}</p>
          <h2>${esc(presence.title || fb.title || '')} <em>${esc(presence.titleEm || fb.titleEm || '')}</em></h2>
          <p class="lead">${esc(presence.lead || fb.lead || '')}</p>
          <div class="actions">${link(fb.liveHref, esc(fb.liveLabel || 'Current Facebook page'), 'btn light')}</div>
          <div class="presence-tabs" role="tablist" aria-label="Facebook and Google Maps">
            ${(presence.tabs || [
              { id: 'fb', label: 'Facebook: before & after' },
              { id: 'maps', label: 'Google Maps: recommended actions' }
            ]).map((tab, index) => `<button type="button" role="tab" id="ptab-${esc(tab.id)}" data-ptab="${esc(tab.id)}" aria-selected="${index === 0 ? 'true' : 'false'}" aria-controls="ppanel-${esc(tab.id)}">${esc(tab.label)}</button>`).join('')}
          </div>

          <div class="presence-panel" id="ppanel-fb" role="tabpanel" data-ppanel="fb" aria-labelledby="ptab-fb">
            <div class="ba-grid">
              <article class="ba-card before-card">
                <div class="flag muted-flag">${esc(fb.before?.flag || 'Current Facebook page')}</div>
                <h3>${esc(fb.before?.title || 'What guests see today')}</h3>
                <p class="fine">${esc(fb.before?.lead || '')}</p>
                ${fb.before?.image ? fig(fb.before.image, fb.before.imageAlt || 'Current Facebook page', 'ba-shot') : ''}
                ${fb.before?.aboutImage ? fig(fb.before.aboutImage, fb.before.aboutImageAlt || 'Current About section', 'ba-shot') : ''}
                <ul class="points">${(fb.before?.bullets || []).map((item) => `<li>${esc(item)}</li>`).join('')}</ul>
              </article>

              <article class="social reveal fb-mock" aria-label="Proposed Facebook page mockup">
                <div class="flag">${esc(fb.proposedFlag || 'Proposed: Green Isle mockup')}</div>
                <div class="cover">
                  ${fig(fb.cover, fb.coverAlt, '', true)}
                  <div class="cover-copy"><p>${esc(fb.coverKicker || '')}</p><h3>${esc(fb.coverTitle || '')}</h3><p>${esc(fb.coverThai || '')}</p></div>
                </div>
                <div class="social-head">
                  ${fig(fb.profile, fb.profileAlt, 'avatar')}
                  <div class="social-id">
                    <h3>${esc(fb.name || '')}</h3>
                    <p class="handle">${esc(fb.handle || '')}</p>
                    <p>${esc(fb.category || '')}</p>
                    <p class="rating-line">${esc(fb.ratingLine || '')}${fb.followersLine ? ` · ${esc(fb.followersLine)}` : ''}</p>
                  </div>
                  <div class="cta-stack">
                    ${link(fb.ctaHref || 'site/#book', esc(fb.cta || 'WhatsApp'), 'btn gold')}
                    ${fb.ctaSecondary ? `<span class="btn light mock-btn">${esc(fb.ctaSecondary)}</span>` : ''}
                  </div>
                </div>
                <div class="highlights strip">${(fb.highlights || []).map((item) => `<div class="highlight"><b>${fig(item.image, item.alt)}</b>${esc(item.label)}</div>`).join('')}</div>
                <div class="social-tabs" role="tablist" aria-label="Proposed page sections">
                  ${(fb.tabs || []).map((tab, index) => `<button type="button" role="tab" id="stab-${esc(tab.id)}" data-stab="${esc(tab.id)}" aria-selected="${index === 0 ? 'true' : 'false'}" aria-controls="spanel-${esc(tab.id)}">${esc(tab.label)}</button>`).join('')}
                </div>
                <div class="social-body" id="spanel-posts" role="tabpanel" data-spanel="posts" aria-labelledby="stab-posts">
                  <aside class="card intro-card">
                    <h3>Intro</h3>
                    <p>${esc(fb.bio || '')}</p>
                    <p>${esc(fb.bioTh || '')}</p>
                    <dl class="about-list tight">${(fb.aboutRows || []).filter((row) => /hours|address|category|location/i.test(row.k || '')).map((row) => `<div><dt>${esc(row.k)}</dt><dd>${esc(row.v)}</dd></div>`).join('')}</dl>
                  </aside>
                  <div>
                    ${pinned.map(postCard).join('')}
                    <div class="post-grid">${grid.map(postCard).join('')}</div>
                  </div>
                </div>
                <div class="social-body single" id="spanel-about" role="tabpanel" data-spanel="about" aria-labelledby="stab-about" hidden>
                  <div class="card"><h3>About</h3><p>${esc(fb.bio || '')}</p><p>${esc(fb.bioTh || '')}</p>
                    <dl class="about-list">${(fb.aboutRows || []).map((row) => `<div><dt>${esc(row.k)}</dt><dd>${esc(row.v)}</dd></div>`).join('')}</dl>
                  </div>
                </div>
                <div class="social-body single" id="spanel-reviews" role="tabpanel" data-spanel="reviews" aria-labelledby="stab-reviews" hidden>
                  <div class="card">
                    <p class="quote">“${esc(fb.reviewQuote || '')}”</p>
                    <p class="muted">${esc(fb.reviewBy || '')}</p>
                    <p class="lead">Google ${esc((c.snapshot?.stats || []).find((stat) => /google/i.test(stat.label))?.value || '')} · Tripadvisor ${esc((c.snapshot?.stats || []).find((stat) => /trip/i.test(stat.label))?.value || '')}. Real public reviews only — not a widget.</p>
                    <div class="actions">${link(contact.googleMaps, 'Google reviews', 'btn light')}${link(contact.tripadvisor, 'Tripadvisor', 'btn light')}</div>
                  </div>
                </div>
                <div class="social-body single" id="spanel-photos" role="tabpanel" data-spanel="photos" aria-labelledby="stab-photos" hidden>
                  <div class="photo-grid">${(fb.photos || []).map((photo) => fig(photo.image, photo.alt)).join('')}</div>
                </div>
              </article>
            </div>
            ${(fb.changes || []).length ? `<div class="why-list"><h3>Why these Facebook changes help Don get found</h3>${(fb.changes || []).map((row) => `<article class="why-row"><strong>${esc(row.change)}</strong><p>${esc(row.why || '')}</p></article>`).join('')}</div>` : ''}
          </div>

          <div class="presence-panel" id="ppanel-maps" role="tabpanel" data-ppanel="maps" aria-labelledby="ptab-maps" hidden>
            <div id="google" class="maps-anchor">
              <p class="eyebrow">${esc(google.eyebrow || '')}</p>
              <h3 class="maps-title">${esc(google.title || '')} <em>${esc(google.titleEm || '')}</em></h3>
              <p class="lead">${esc(google.lead || '')}</p>
              <div class="bars">
                ${(google.breakdown || []).map((row) => {
                  const pct = Math.round((Number(row.score) / Number(row.max || 1)) * 100);
                  return `<div class="bar-row"><span><strong>${esc(row.label)}</strong><em class="prio">${esc(row.score)}/${esc(row.max)}${row.opportunity ? ' · opportunity' : ''}</em></span><div class="${row.opportunity ? 'track opportunity' : 'track'}" aria-hidden="true">${row.opportunity ? '' : `<b style="width:${pct}%"></b>`}</div><p class="fine">${esc(row.why || '')}</p></div>`;
                }).join('')}
              </div>
              ${google.pairTitle ? `<h3 class="gbp-heading">${esc(google.pairTitle)}</h3>` : ''}
              ${google.pairNote ? `<p class="fine gbp-intro">${esc(google.pairNote)}</p>` : ''}
              <div class="gbp-pair">
                ${['before', 'after'].map((key) => {
                  const card = google[key] || {};
                  const mock = card.mock;
                  if (!mock) {
                    return `<article class="listing ${key}"><p class="eyebrow">${esc(card.label || '')}</p><h3>${esc(card.name || client.venue || '')}</h3><div class="chips">${(card.chips || []).map((chip) => `<span class="chip">${esc(chip)}</span>`).join('')}</div><dl>${(card.rows || []).map((row) => `<div><dt class="muted">${esc(row.k)}</dt><dd>${esc(row.v)}</dd></div>`).join('')}</dl></article>`;
                  }
                  const facts = mock.facts || card.rows || [];
                  const photos = mock.photos || [];
                  const cover = mock.cover
                    ? fig(mock.cover, mock.coverAlt || mock.name || '', 'gbp-cover')
                    : `<div class="gbp-cover gbp-cover-empty"><p>${esc(mock.coverNote || 'No owner-chosen cover')}</p></div>`;
                  const actions = (mock.actions || []).map((label) => `<span class="btn light mock-btn">${esc(label)}</span>`).join('');
                  return `<article class="gbp ${key}" aria-label="${esc(mock.flag || card.label || 'Listing mockup')}">
                    <div class="gbp-top">
                      <p class="flag ${key === 'before' ? 'muted-flag' : ''}">${esc(mock.flag || card.label || '')}</p>
                      <p class="gbp-note">${esc(mock.note || 'Mockup. Not a Google screen.')}</p>
                    </div>
                    ${cover}
                    <div class="gbp-body">
                      <h3>${esc(mock.name || card.name || client.venue || '')}</h3>
                      <p class="gbp-rating">${esc(mock.rating || '')}${mock.reviews ? ` <span>· ${esc(mock.reviews)}</span>` : ''}</p>
                      ${mock.category ? `<p class="gbp-cat">${esc(mock.category)}</p>` : ''}
                      <div class="chips">${(card.chips || []).map((chip) => `<span class="chip">${esc(chip)}</span>`).join('')}</div>
                      <dl class="gbp-facts">${facts.map((row) => `<div><dt>${esc(row.k)}</dt><dd>${esc(row.v)}</dd></div>`).join('')}</dl>
                      ${mock.blurb ? `<p class="gbp-blurb">${esc(mock.blurb)}</p>` : ''}
                      ${photos.length ? `<div class="gbp-photos">${photos.map((photo) => fig(photo.image, photo.alt)).join('')}</div>` : ''}
                      ${mock.photoNote ? `<p class="fine">${esc(mock.photoNote)}</p>` : ''}
                      ${actions ? `<div class="gbp-actions">${actions}</div>` : ''}
                    </div>
                  </article>`;
                }).join('')}
              </div>
              <article class="card" style="margin-top:14px"><h3>Description to approve</h3><p>${esc(google.description || '')}</p><p class="fine">${esc(google.descriptionTh || '')}</p></article>
              ${(google.fixes || []).length ? '<h3 class="fixes-heading">Recommended actions</h3>' : ''}
              <div class="fixes">${(google.fixes || []).map((fix) => `<article class="fix"><i class="prio ${esc(fix.priority)}">${esc(fix.priority)} · ${esc(fix.when || '')}</i><h3>${esc(fix.title)}</h3><p>${esc(fix.detail)}</p>${fix.why ? `<p class="why-line"><strong>Why it gets you found:</strong> ${esc(fix.why)}</p>` : ''}</article>`).join('')}</div>
              <article class="card" style="margin-top:14px">
                <h3>${esc(google.reviewPlan?.title || '')}</h3>
                <p class="lead">${esc(google.reviewPlan?.lead || '')}</p>
                <div class="table-wrap"><table><thead><tr><th>What</th><th>How</th></tr></thead><tbody>${(google.reviewPlan?.rows || []).map((row) => `<tr><td>${esc(row.tactic)}</td><td>${esc(row.how)}</td></tr>`).join('')}</tbody></table></div>
                <p class="never">${esc(google.reviewPlan?.never || '')}</p>
                <ul class="points">${(google.reviewPlan?.kpis || []).map((item) => `<li>${esc(item)}</li>`).join('')}</ul>
              </article>
            </div>
          </div>
        </div>
      </section>
      <section class="section" id="plan">
        <div class="wrap">
          <p class="eyebrow">${esc(plan.eyebrow || '')}</p>
          <h2>${esc(plan.title || '')} <em>${esc(plan.titleEm || '')}</em></h2>
          <p class="lead">${esc(plan.lead || '')}</p>
          <p class="disclaimer">${esc(plan.disclaimer || '')}</p>
          <div class="audience-grid">
            ${(plan.audiences || []).map((group) => `<article class="card"><p class="eyebrow">${esc(group.eyebrow || '')}</p><h3>${esc(group.title || '')}</h3>${(group.items || []).map((item) => `<h4 style="margin:14px 0 4px">${esc(item.title)}</h4><p>${esc(item.body)}</p>`).join('')}</article>`).join('')}
          </div>
          <ol class="timeline">${(plan.timeline || []).map((phase) => `<li class="phase card"><p class="eyebrow">${esc(phase.phase)}</p><h3>${esc(phase.name)}</h3><ol>${(phase.points || []).map((point) => `<li>${esc(point)}</li>`).join('')}</ol></li>`).join('')}</ol>
          <h3 style="margin-top:22px">What to watch</h3>
          <ul class="kpis">${(plan.kpis || []).map((kpi) => `<li><strong>${esc(kpi.name)}</strong><span>${esc(kpi.where)}</span></li>`).join('')}</ul>
          <p class="note">${esc(plan.budget || '')}</p>
        </div>
      </section>
      ${c.pricing?.enabled ? `<section class="section" id="pricing"><div class="wrap"><p class="eyebrow">${esc(c.pricing.eyebrow || '')}</p><h2>${esc(c.pricing.title || '')} <em>${esc(c.pricing.titleEm || '')}</em></h2><p class="lead">${esc(c.pricing.intro || '')}</p><div class="stats">${(c.pricing.items || []).map((item) => `<article class="price-card"><span>${esc(item.name)}</span><strong>${esc(item.price)}</strong><p>${esc(item.detail || '')}</p></article>`).join('')}</div><p class="note">${esc(c.pricing.excludes || '')}</p><p class="disclaimer">${esc(c.pricing.disclaimer || '')}</p></div></section>` : ''}
      <section class="close" id="close">
        <div class="wrap">
          <p class="eyebrow">${esc(close.eyebrow || '')}</p>
          <h2>${esc(close.title || '')}<br><em>${esc(close.titleEm || '')}</em></h2>
          ${paras(close.paragraphs || [])}
          ${close.ask ? `<p class="aside">${esc(close.ask)}</p>` : ''}
          <div class="actions">
            ${link(mailHref, `Email ${esc(agency.person || '')}`, 'btn gold')}
            ${waHref ? link(waHref, `WhatsApp ${esc(agency.person || '')}`, 'btn light') : `<button class="btn light" type="button" data-copy="wa">Copy a WhatsApp note</button>`}
          </div>
          <p class="fine" style="margin-top:10px">${esc(agency.email || '')}${agency.whatsapp ? ` · ${esc(agency.whatsapp)}` : ` · If you already have ${esc(agency.person || 'us')} on WhatsApp, paste the note.`}</p>
          <p class="fine" id="wa-status" role="status"></p>
          <article class="forward">
            <h3>A note ${esc(client.name || 'they')} can forward</h3>
            <p id="forward-text">${esc(close.forwardable || '')}</p>
            <button class="btn light" type="button" data-copy="forward">Copy this note</button>
            <p class="fine" id="forward-status" role="status"></p>
          </article>
        </div>
      </section>
    </main>
    <footer class="colophon"><div class="wrap"><span>Prepared ${esc(c.meta?.prepared || '')} for ${esc(client.name || '')} · ${esc(client.venue || '')}</span><span>${esc(agency.name || '')} · ${esc(agency.place || '')}</span></div></footer>`;
  };

  const bind = (config) => {
    const links = [...document.querySelectorAll('.section-nav a')];
    const sections = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
    if (sections.length && 'IntersectionObserver' in window) {
      const watcher = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = `#${entry.target.id}`;
          links.forEach((a) => {
            const on = a.getAttribute('href') === id;
            a.toggleAttribute('aria-current', on);
            if (on) a.setAttribute('aria-current', 'true');
            else a.removeAttribute('aria-current');
          });
        });
      }, { rootMargin: '-45% 0px -45% 0px', threshold: 0.01 });
      sections.forEach((section) => watcher.observe(section));
    }
    document.querySelectorAll('[data-stab]').forEach((button) => {
      button.addEventListener('click', () => {
        document.querySelectorAll('[data-stab]').forEach((tab) => tab.setAttribute('aria-selected', String(tab === button)));
        document.querySelectorAll('[data-spanel]').forEach((panel) => { panel.hidden = panel.dataset.spanel !== button.dataset.stab; });
      });
    });
    const showPresence = (id) => {
      document.querySelectorAll('[data-ptab]').forEach((tab) => tab.setAttribute('aria-selected', String(tab.dataset.ptab === id)));
      document.querySelectorAll('[data-ppanel]').forEach((panel) => { panel.hidden = panel.dataset.ppanel !== id; });
    };
    document.querySelectorAll('[data-ptab]').forEach((button) => {
      button.addEventListener('click', () => showPresence(button.dataset.ptab));
    });
    document.querySelectorAll('.section-nav a[href="#google"]').forEach((a) => {
      a.addEventListener('click', () => showPresence('maps'));
    });
    document.querySelectorAll('.section-nav a[href="#facebook"]').forEach((a) => {
      a.addEventListener('click', () => showPresence('fb'));
    });
    if (location.hash === '#google') showPresence('maps');
    const copy = async (text, status) => {
      try {
        await navigator.clipboard.writeText(text);
        status.textContent = 'Copied.';
      } catch {
        status.textContent = 'Select the note and copy it.';
      }
    };
    document.querySelector('[data-copy="wa"]')?.addEventListener('click', () => copy(config.close?.whatsappText || '', document.querySelector('#wa-status')));
    document.querySelector('[data-copy="forward"]')?.addEventListener('click', () => copy(config.close?.forwardable || '', document.querySelector('#forward-status')));
  };

  const start = async () => {
    const app = document.querySelector('#app');
    try {
      const response = await fetch('config.json', { cache: 'no-cache' });
      if (!response.ok) throw new Error('missing config');
      const config = await response.json();
      if (config.meta?.title) document.title = config.meta.title;
      if (config.meta?.description) {
        let meta = document.querySelector('meta[name="description"]');
        if (!meta) {
          meta = document.createElement('meta');
          meta.name = 'description';
          document.head.appendChild(meta);
        }
        meta.content = config.meta.description;
      }
      app.innerHTML = render(config);
      app.removeAttribute('aria-busy');
      bind(config);
    } catch (error) {
      app.innerHTML = '<div class="boot">This proposal could not load config.json. Open it from a local server, in the same folder as the config.</div>';
      app.removeAttribute('aria-busy');
    }
  };
  start();
})();
