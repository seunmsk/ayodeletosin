(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- EXPERIENCE ---------- */
  var roles = [
    { dates: 'Present', title: 'Head, Building Management', org: 'Tengen Properties', text: 'Leading building management. Exploring a first pilot of the sustainability advisory model here, subject to internal approval.', current: true },
    { dates: 'Dec 2023 – 2025', title: 'Senior Facility Manager', org: 'Knight Frank Nigeria', text: 'Led facilities and project delivery across a Grade A portfolio, including the Benin City Mall energy work above. Shared knowledge with Knight Frank Academy cohorts in 2024 and 2025.' },
    { dates: 'Feb 2022 – Nov 2023', title: 'Head of Facilities Operations', org: 'Misa Ltd, Lagos', text: 'Led facilities operations and won new mandates through proposal writing and bid presentations.' },
    { dates: 'Nov 2019 – Feb 2022', title: 'Facilities Manager', org: 'Horizon II Estate, Lagos', text: 'Managed facilities for a residential estate, leading the on-site team and delivering maintenance and improvement projects.' },
    { dates: 'Jan 2016 – Oct 2019', title: 'Project Associate', org: 'Formwork Limited, Lekki', text: 'Construction, project management and procurement: the grounding in how buildings are made that now shapes how I think about how they are run.' }
  ];
  $('timeline').innerHTML = roles.map(function (r) {
    return '<li class="tl reveal' + (r.current ? ' current' : '') + '"><span class="tl-date">' + esc(r.dates) + '</span><h4>' + esc(r.title) + '</h4><span class="tl-org">' + esc(r.org) + '</span><p>' + esc(r.text) + '</p></li>';
  }).join('');

  /* ---------- TESTIMONIALS ----------
     Add real quotes here, with the person's permission. The section stays hidden while this list is empty.
     Example: { quote: '...', name: 'Full Name', role: 'Title, Organisation' } */
  var testimonials = [
    { quote: 'Tosin is a very industrious person. I know him to be reliable, accountable and very knowledgeable, and someone who genuinely cares about the environment in our country. I have worked with Tosin for more than seven years.', name: 'Seun Mosaku', role: 'CEO, Eppcheck Technologies' }
  ];
  function renderQuotes(list) {
    if (!list.length) { return; }
    $('quotes').innerHTML = list.map(function (t) {
      return '<figure class="quote in"><blockquote>' + esc(t.quote) + '</blockquote><figcaption><strong>' + esc(t.name) + '</strong><span>' + esc(t.role || '') + '</span></figcaption></figure>';
    }).join('');
    $('testimonials').hidden = false;
  }
  renderQuotes(testimonials);
  /* approved testimonials submitted through ayodeletosin.com/testimonial */
  fetch('/api/testimonials', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : { testimonials: [] }; })
    .then(function (d) { if (d && d.testimonials && d.testimonials.length) { renderQuotes(testimonials.concat(d.testimonials)); } })
    .catch(function () {});

  /* ---------- METHODOLOGY STEPPER ---------- */
  var method = [
    ['Establish the baseline', 'Energy, water, operating costs, waste management and relevant environmental or climate risks.'],
    ['Diagnose', 'Identify where resources are being wasted and where building performance can improve.'],
    ['Prioritise', 'Assess interventions against environmental benefit, cost, feasibility, payback and operational disruption.'],
    ['Build the business case', 'Translate environmental opportunities into evidence that owners, investors and decision-makers can evaluate.'],
    ['Implement and measure', 'Track performance before and after agreed interventions.'],
    ['Refine and replicate', 'Use the findings to improve the methodology before applying it elsewhere.']
  ];
  var tabs = $('methodTabs'), panel = $('methodPanel');
  tabs.innerHTML = method.map(function (m, i) {
    return '<button type="button" role="tab" class="method-tab" id="mt' + i + '" aria-controls="methodPanel" data-i="' + i + '"><b>' + (i + 1) + '</b>' + esc(m[0]) + '</button>';
  }).join('');
  var tabBtns = tabs.querySelectorAll('button');
  var current = 0, auto = null;
  function showStep(i) {
    current = i;
    tabBtns.forEach(function (b, j) { b.setAttribute('aria-selected', String(i === j)); b.tabIndex = i === j ? 0 : -1; });
    panel.setAttribute('aria-labelledby', 'mt' + i);
    panel.style.animation = 'none'; void panel.offsetWidth; panel.style.animation = '';
    panel.innerHTML = '<span class="mp-num">0' + (i + 1) + '</span><h4>' + esc(method[i][0]) + '</h4><p>' + esc(method[i][1]) + '</p><div class="method-progress" aria-hidden="true">' +
      method.map(function (_, k) { return '<i' + (k <= i ? ' class="on"' : '') + '></i>'; }).join('') + '</div>';
  }
  function stopAuto() { if (auto) { clearInterval(auto); auto = null; } }
  tabs.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { stopAuto(); showStep(+b.dataset.i); } });
  tabs.addEventListener('keydown', function (e) {
    if (['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].indexOf(e.key) < 0) { return; }
    e.preventDefault(); stopAuto();
    var n = (current + ((e.key === 'ArrowDown' || e.key === 'ArrowRight') ? 1 : -1) + method.length) % method.length;
    tabBtns[n].focus(); showStep(n);
  });
  showStep(0);

  /* ---------- 2030 VISION ---------- */
  var vision = [
    ['Learn', 'Deepen expertise in environmental sustainability, climate resilience, policy and sustainable development.'],
    ['Test', 'Conduct a pilot sustainability assessment using measurable building-performance baselines.'],
    ['Demonstrate', 'Develop at least one documented case showing the baseline, intervention, outcome and lessons.'],
    ['Measure', 'Track indicators such as energy, water, operating costs, waste, payback, resilience and occupant outcomes.'],
    ['Share', 'Publish practical insights, tools and case studies for property owners and professionals.'],
    ['Influence', 'Use evidence to engage developers, investors, property owners and institutions on integrating sustainability earlier.'],
    ['Scale', 'Develop a repeatable approach that can be tested across property environments in Nigeria and other African markets.']
  ];
  var vl = $('vision-list');
  vl.innerHTML = '<span class="bar" aria-hidden="true"></span>' + vision.map(function (v, i) {
    return '<li class="v" style="transition-delay:' + (i * 0.15) + 's"><span class="v-dot" style="transition-delay:' + (i * 0.25) + 's">' + (i + 1) + '</span><h3>' + esc(v[0]) + '</h3><p>' + esc(v[1]) + '</p></li>';
  }).join('');

  /* ---------- MUSIC ---------- */
  var heights = [34, 64, 48, 86, 58, 108, 72, 94, 52, 80];
  var eq = $('eq');
  eq.innerHTML = heights.map(function (h, i) { return '<span style="height:' + h + 'px;animation-delay:' + ((i * 0.13) % 1).toFixed(2) + 's"></span>'; }).join('');
  var playBtn = $('playBtn');
  playBtn.addEventListener('click', function () {
    var playing = playBtn.getAttribute('aria-pressed') === 'true';
    playBtn.setAttribute('aria-pressed', String(!playing));
    playBtn.textContent = playing ? 'Play' : 'Pause';
    eq.classList.toggle('paused', playing);
  });

  /* ---------- MOBILE NAV ---------- */
  var menuBtn = $('menuBtn'), navLinks = $('navLinks');
  menuBtn.addEventListener('click', function () {
    var open = navLinks.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  navLinks.addEventListener('click', function (e) {
    if (e.target.closest('a')) { navLinks.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); }
  });
  var navWrap = $('navWrap');
  window.addEventListener('scroll', function () { navWrap.classList.toggle('scrolled', window.scrollY > 8); }, { passive: true });

  /* ---------- ACTIVE NAV LINK ---------- */
  var navAnchors = navLinks.querySelectorAll('a[href^="#"]:not(.btn)');

  /* ---------- COUNT-UP ---------- */
  function countUp() {
    if (reduceMotion) { return; }
    document.querySelectorAll('[data-count]').forEach(function (el) {
      var to = +el.dataset.count, suf = el.dataset.suffix || '', start = null;
      function step(ts) {
        if (start === null) { start = ts; }
        var p = Math.min(1, (ts - start) / 1500), e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(to * e) + suf;
        if (p < 1) { requestAnimationFrame(step); }
      }
      requestAnimationFrame(step);
    });
  }

  /* ---------- REVEAL / OBSERVERS ---------- */
  var reveals = document.querySelectorAll('.reveal, .found, .vision');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.15 });
    reveals.forEach(function (el) { io.observe(el); });

    var stripObs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { countUp(); stripObs.disconnect(); }
    }, { threshold: 0.4 });
    stripObs.observe($('evidenceStrip'));

    var secObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          navAnchors.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id); });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['story', 'work', 'building', 'education', 'ideas', 'vision'].forEach(function (id) { secObs.observe($(id)); });

    var methodObs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting && !auto) {
        auto = setInterval(function () { showStep((current + 1) % method.length); }, 4000);
      } else if (!entries[0].isIntersecting) { stopAuto(); }
    }, { threshold: 0.5 });
    methodObs.observe(panel);
    tabs.addEventListener('focusin', stopAuto);
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- STORY VIDEOS: play when visible, pausable ---------- */
  document.querySelectorAll('.vid').forEach(function (fig) {
    var v = fig.querySelector('video'), btn = fig.querySelector('.vid-btn'), userPaused = reduceMotion;
    function sync() {
      var paused = v.paused;
      btn.setAttribute('aria-label', paused ? 'Play video' : 'Pause video');
      btn.firstElementChild.textContent = paused ? '\u25B6' : '\u275A\u275A';
    }
    btn.addEventListener('click', function () {
      if (v.paused) { userPaused = false; v.play().catch(function () {}); } else { userPaused = true; v.pause(); }
    });
    v.addEventListener('play', sync); v.addEventListener('pause', sync); sync();
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        if (en[0].isIntersecting && !userPaused) { v.play().catch(function () {}); } else if (!en[0].isIntersecting) { v.pause(); }
      }, { threshold: 0.4 }).observe(v);
    }
  });

  /* ---------- HORIZONTAL ROWS: arrow buttons ---------- */
  document.querySelectorAll('.hs').forEach(function (row) {
    var nav = document.createElement('div');
    nav.className = 'hs-nav';
    var label = row.getAttribute('data-hs-label') || 'items';
    nav.innerHTML = '<button type="button" class="hs-btn" data-dir="-1" aria-label="Scroll ' + esc(label) + ' left">\u2190</button><button type="button" class="hs-btn" data-dir="1" aria-label="Scroll ' + esc(label) + ' right">\u2192</button>';
    row.parentNode.insertBefore(nav, row);
    var btns = nav.querySelectorAll('button');
    function update() {
      var max = row.scrollWidth - row.clientWidth - 4;
      btns[0].disabled = row.scrollLeft <= 4;
      btns[1].disabled = row.scrollLeft >= max;
      nav.hidden = max <= 0;
    }
    nav.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) { return; }
      row.scrollBy({ left: +b.dataset.dir * Math.max(260, row.clientWidth * 0.8), behavior: reduceMotion ? 'auto' : 'smooth' });
    });
    row.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    setTimeout(update, 300); update();
  });

  /* ---------- LIGHTBOX (magazine pages) ---------- */
  var lb = $('lightbox'), lbImg = $('lbImg');
  document.querySelectorAll('[data-lightbox]').forEach(function (el) {
    el.addEventListener('click', function () {
      lbImg.src = el.getAttribute('data-lightbox'); lbImg.alt = el.getAttribute('data-alt') || '';
      if (lb.showModal) { lb.showModal(); } else { window.open(lbImg.src, '_blank'); }
    });
  });
  $('lbClose').addEventListener('click', function () { lb.close(); });
  lb.addEventListener('click', function (e) { if (e.target === lb) { lb.close(); } });

  /* ---------- CONTACT FORM → WHATSAPP ---------- */
  var form = $('contactForm');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements, name = f.name.value.trim(), msg = f.message.value.trim();
    if (!name || !msg) { $('formError').hidden = false; return; }
    $('formError').hidden = true;
    var lines = ['Hello Tosin, I found you through your website.', '', 'Name: ' + name];
    if (f.email.value.trim()) { lines.push('Email: ' + f.email.value.trim()); }
    if (f.organisation.value.trim()) { lines.push('Organisation: ' + f.organisation.value.trim()); }
    lines.push('', msg);
    window.open('https://wa.me/2348167898186?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
    $('thanks').hidden = false;
  });

  /* Show CV button only once the PDF has been added to /assets */
  fetch('assets/Tosin-Ayodele-CV.pdf', { method: 'HEAD' }).then(function (r) { if (r.ok) { $('cvBtn').hidden = false; } }).catch(function () {});

  $('year').textContent = new Date().getFullYear();
})();
