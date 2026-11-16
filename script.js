(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var ARROW = '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E3A43A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>';
  var LEAF = '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5FC4B8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 4 13c0-5 4-9 16-9 0 12-4 16-9 16z"/><path d="M4 20l8-8"/></svg>';

  /* ---------- DATA ---------- */
  var stats = [
    { to: 700, fmt: function (n) { return '$' + n + 'M+'; }, label: 'Value of Grade A facilities I\u2019ve helped deliver and manage' },
    { to: 9, fmt: function (n) { return n + '+ yrs'; }, label: 'In construction, projects and facilities' },
    { to: 3, fmt: String, label: 'Certifications: CFM, FMP, PMP' },
    { to: 6, fmt: String, label: 'Sectors, from offices to healthcare' }
  ];

  var focus = [
    ['01', 'Asset and facilities performance', 'Making sure the way a building is run matches what its owners and investors need from it.'],
    ['02', 'Lifecycle and maintenance planning', 'Planning maintenance and replacement spend over the whole life of a building, so there are fewer surprises.'],
    ['03', 'ESG and sustainability', 'Bringing energy, waste and wellbeing into everyday operations.'],
    ['04', 'Risk and resilience', 'Spotting what could fail early, and having a plan for when something does.'],
    ['05', 'Setting up new developments', 'Getting operations, contracts and teams in place before handover.'],
    ['06', 'Managing vendors', 'Clear standards and regular performance checks for every service provider.'],
    ['07', 'Occupant experience', 'Comfortable, well-run spaces that make it easier for people to do their work.']
  ];

  var esg = [
    { letter: 'E', name: 'Environmental', headline: 'Using less energy, water and diesel, and wasting less.', items: ['Tracking energy and utility use, and acting on it', 'Lifecycle planning that extends asset life and cuts replacement waste', 'Considering water, waste and emissions in maintenance decisions', 'Sustainable systems specified before handover on new developments'] },
    { letter: 'S', name: 'Social', headline: 'Safe, healthy and comfortable spaces for the people who use them.', items: ['Healthy, safe and comfortable spaces for occupants', 'Spaces that help people work well', 'Fair, accountable relationships with vendors and site teams', 'Resilience planning that protects the people who use the building'] },
    { letter: 'G', name: 'Governance', headline: 'Clear accountability and honest reporting to owners.', items: ['Vendor governance and performance systems', 'Transparent reporting to owners, investors and occupiers', 'Operational risk registers and resilience plans', 'Using data to make decisions'] }
  ];

  var sdgs = [['7', 'Affordable & clean energy'], ['9', 'Industry, innovation & infrastructure'], ['11', 'Sustainable cities & communities'], ['12', 'Responsible consumption'], ['13', 'Climate action']];
  var ticker = ['Energy efficiency', 'Lifecycle thinking', 'Water stewardship', 'Waste reduction', 'Healthy workplaces', 'Climate resilience'];

  var stages = [
    { num: '01', name: 'Develop', headline: 'Getting new buildings ready to run', lead: 'Operating problems are cheapest to fix before a building opens. I get involved early on new developments so that handover goes smoothly.', items: ['Facilities setup and transition planning for new developments', 'Operating model, staffing and budget ready before handover', 'Maintainability and lifecycle input during design and construction', 'Vendor and service contracts structured from the start'] },
    { num: '02', name: 'Operate', headline: 'Keeping day-to-day operations under control', lead: 'How a building is run every day decides whether it holds its value. I put structure around maintenance, vendors and risk so costs stay in check and occupants are looked after.', items: ['Vendor governance and performance systems', 'Planned and preventive maintenance structures', 'Operational risk reduction and resilience planning', 'Reporting that turns facility data into business decisions'] },
    { num: '03', name: 'Optimise', headline: 'Bringing running costs down', lead: 'Rising costs and ESG targets often point to the same fixes. I look for changes that save money and also improve the building for the people using it.', items: ['Lifecycle planning and operational optimisation', 'ESG and sustainability integration in the built environment', 'Energy, utilities and service cost review', 'Productivity and user-experience improvements'] },
    { num: '04', name: 'Reposition', headline: 'Turning around underperforming buildings', lead: 'When a building starts to decline, owners need a clear picture of why and a realistic plan. I help with both.', items: ['Asset and facilities performance strategy', 'Condition review and capital planning priorities', 'Resilience planning to protect investor value', 'Alignment of operations with long-term real estate strategy'] }
  ];

  var sectors = ['Corporate offices', 'Financial institutions', 'Retail malls', 'Residential developments', 'Healthcare', 'Mixed-use'];

  var roles = [
    { dates: 'Dec 2023 – Present', duration: '3 yrs', title: 'Senior Facility Manager', company: 'Knight Frank', place: 'Nigeria · On-site', summary: 'Strategic leadership for end-to-end facilities and project delivery across a portfolio of Grade A properties for one of the world’s leading independent real estate consultancies.', skills: ['Facilities strategy', 'Project delivery', 'Portfolio management', 'Stakeholder reporting'] },
    { dates: 'Feb 2022 – Nov 2023', duration: '1 yr 10 mos', title: 'Head of Facilities Operations', company: 'Misa Ltd', place: 'Lagos State', summary: 'Led facilities operations, managing projects end to end and winning new mandates through proposal writing and bid presentations.', skills: ['Project management', 'Proposal writing', 'Bid presentation', 'Operations leadership'] },
    { dates: 'Nov 2019 – Feb 2022', duration: '2 yrs 4 mos', title: 'Facilities Manager', company: 'Horizon II Estate', place: 'Lagos State', summary: 'Managed facilities for a residential estate, leading the on-site team and delivering maintenance and improvement projects.', skills: ['Project management', 'Team management', 'Residential FM'] },
    { dates: 'Jan 2016 – Oct 2019', duration: '3 yrs 10 mos', title: 'Project Associate', company: 'Formwork Limited', place: 'Lekki Phase 1, Lagos', summary: 'Worked across construction, project management and procurement: the hands-on grounding in how buildings are made that now shapes how they are run.', skills: ['Construction', 'Procurement', 'Team management', 'Leadership'] }
  ];

  var certs = [
    ['CFM', 'Certified Facility Manager', 'IFMA', 'Issued Dec 2025 · Valid to Dec 2028'],
    ['FMP', 'Facility Management Professional', 'IFMA', 'Issued Jul 2022'],
    ['PMP', 'Project Management Professional', 'Project Management Institute', 'Issued Jun 2022']
  ];
  var edu = [
    ['First Class Honours', 'BTech, Estate Management', 'Bells University of Technology'],
    ['Upper Credit', 'HND, Estate Management', 'Yaba College of Technology'],
    ['Professional Diploma', 'Leadership and Strategy', 'Covenant University']
  ];

  var research = ['Sustainable FM in emerging markets', 'ESG performance of African commercial real estate', 'Lifecycle costing and asset value', 'Building resilience under power and climate stress', 'FM as a strategic business function'];
  var bring = [
    'Hands-on experience across six building sectors in an emerging market, from construction sites to a $700M+ Grade A portfolio.',
    'A practitioner’s view of ESG under real constraints: unstable power, tight budgets and rapid urban growth.',
    'A commitment to share what I learn through practice, mentoring and writing on FM in Africa.'
  ];
  var glance = [
    ['Current role', 'Senior Facility Manager, Knight Frank (Nigeria)'],
    ['Experience', '9+ years, including a $700M+ Grade A portfolio'],
    ['Education', 'BTech, Estate Management (First Class Honours), Bells University of Technology'],
    ['Certifications', 'CFM and FMP (IFMA), PMP (PMI)'],
    ['Referees', 'Available on request']
  ];

  /* ---------- STATIC RENDERS ---------- */
  $('stats').innerHTML = stats.map(function (s, i) {
    return '<div><span class="stat-value" data-stat="' + i + '">' + esc(s.fmt(reduceMotion ? s.to : 0)) + '</span><span class="stat-label">' + esc(s.label) + '</span></div>';
  }).join('');

  $('focus').innerHTML = focus.map(function (f, i) {
    return '<article class="focus-card reveal c' + (i % 4) + '"><span class="dot" aria-hidden="true"></span><h3>' + esc(f[1]) + '</h3><p>' + esc(f[2]) + '</p></article>';
  }).join('');

  $('sdgs').innerHTML = sdgs.map(function (d) { return '<span class="sdg"><b>' + d[0] + '</b>' + esc(d[1]) + '</span>'; }).join('');

  
  $('sectors').innerHTML = sectors.map(function (s) { return '<span class="chip-dark">' + esc(s) + '</span>'; }).join('');

  $('certs').innerHTML = certs.map(function (c) {
    return '<article class="cert reveal ' + c[0].toLowerCase() + '"><span class="code">' + c[0] + '</span><h3>' + esc(c[1]) + '</h3><p>' + esc(c[2]) + '<br>' + esc(c[3]) + '</p></article>';
  }).join('');
  $('edu').innerHTML = edu.map(function (e) {
    return '<div class="edu reveal"><span class="g">' + esc(e[0]) + '</span><span class="dg">' + esc(e[1]) + '</span><span class="s">' + esc(e[2]) + '</span></div>';
  }).join('');

  $('research').innerHTML = research.map(function (r) { return '<span class="chip-dark">' + esc(r) + '</span>'; }).join('');
    $('glance').innerHTML = glance.map(function (g) { return '<div class="item"><span class="k">' + esc(g[0]) + '</span><span class="v">' + esc(g[1]) + '</span></div>'; }).join('');

  /* ---------- TABS (shared helper) ---------- */
  function makeTabs(container, list, btnClass, labelFn, onSelect) {
    container.innerHTML = list.map(function (item, i) {
      return '<button type="button" role="tab" class="' + btnClass + '" aria-selected="' + (i === 0) + '" data-i="' + i + '">' + labelFn(item) + '</button>';
    }).join('');
    var buttons = container.querySelectorAll('button');
    function select(i) {
      buttons.forEach(function (b, j) { b.setAttribute('aria-selected', String(i === j)); b.tabIndex = i === j ? 0 : -1; });
      onSelect(list[i]);
    }
    container.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (b) { select(+b.dataset.i); }
    });
    container.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') { return; }
      var cur = [].indexOf.call(buttons, document.activeElement);
      if (cur < 0) { return; }
      var next = (cur + (e.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
      buttons[next].focus(); select(next);
    });
    select(0);
  }

  makeTabs($('esgTabs'), esg, 'esg-tab', function (g) { return '<span>' + g.letter + '</span>' + esc(g.name); }, function (g) {
    $('esgHeadline').textContent = g.headline;
    $('esgItems').innerHTML = g.items.map(function (it, i) { return '<li style="animation-delay:' + (i * 0.06) + 's">' + LEAF + '<span>' + esc(it) + '</span></li>'; }).join('');
  });

  makeTabs($('stageTabs'), stages, 'stage-tab', function (s) { return '<span>' + s.num + '</span>' + esc(s.name); }, function (s) {
    $('stageHeadline').textContent = s.headline;
    $('stageLead').textContent = s.lead;
    $('stageItems').innerHTML = s.items.map(function (it, i) { return '<li style="animation-delay:' + (i * 0.06) + 's">' + ARROW + '<span>' + esc(it) + '</span></li>'; }).join('');
  });

  /* ---------- CAREER ---------- */
  var roleList = $('roleList');
  roleList.innerHTML = roles.map(function (r, i) {
    return '<button type="button" class="role-btn" aria-pressed="' + (i === 0) + '" data-i="' + i + '"><span class="d">' + esc(r.dates) + '</span><span class="t">' + esc(r.title) + '</span><span class="c">' + esc(r.company) + '</span></button>';
  }).join('');
  function showRole(i) {
    var r = roles[i];
    roleList.querySelectorAll('button').forEach(function (b, j) { b.setAttribute('aria-pressed', String(i === j)); });
    $('roleWhere').textContent = r.company + ' · ' + r.place;
    $('roleDuration').textContent = r.duration;
    $('roleTitle').textContent = r.title;
    $('roleSummary').textContent = r.summary;
    $('roleSkills').innerHTML = r.skills.map(function (s) { return '<span class="chip">' + esc(s) + '</span>'; }).join('');
  }
  roleList.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { showRole(+b.dataset.i); } });
  showRole(0);

  /* ---------- MUSIC ---------- */
  var heights = [38, 72, 54, 96, 64, 120, 80, 104, 58, 88, 46, 70];
  var eq = $('eq');
  eq.innerHTML = heights.map(function (h, i) { return '<span style="height:' + h + 'px;animation-delay:' + ((i * 0.13) % 1).toFixed(2) + 's"></span>'; }).join('');
  var playBtn = $('playBtn');
  playBtn.addEventListener('click', function () {
    var playing = playBtn.getAttribute('aria-pressed') === 'true';
    playBtn.setAttribute('aria-pressed', String(!playing));
    playBtn.textContent = playing ? 'Play' : 'Pause';
    eq.classList.toggle('paused', playing);
  });

  /* ---------- COUNT-UP STATS ---------- */
  function countUp() {
    if (reduceMotion) { return; }
    var start = null;
    var els = document.querySelectorAll('[data-stat]');
    function step(ts) {
      if (start === null) { start = ts; }
      var p = Math.min(1, (ts - start) / 1800);
      var e = 1 - Math.pow(1 - p, 3);
      els.forEach(function (el) { var s = stats[+el.dataset.stat]; el.textContent = s.fmt(Math.round(s.to * e)); });
      if (p < 1) { requestAnimationFrame(step); }
    }
    requestAnimationFrame(step);
  }

  /* ---------- REVEAL ON SCROLL ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el, i) { el.style.transitionDelay = ((i % 4) * 0.07) + 's'; io.observe(el); });
    var statsObs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { countUp(); statsObs.disconnect(); }
    }, { threshold: 0.3 });
    statsObs.observe($('stats'));
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
    countUp();
  }

  /* ---------- CONTACT FORM → WHATSAPP ---------- */
  var form = $('contactForm');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements;
    var name = f.name.value.trim(), msg = f.message.value.trim();
    if (!name || !msg) { $('formError').hidden = false; return; }
    $('formError').hidden = true;
    var lines = ['Hello Tosin, I found you through your website.', '', 'Name: ' + name];
    if (f.email.value.trim()) { lines.push('Email: ' + f.email.value.trim()); }
    if (f.organisation.value.trim()) { lines.push('Organisation: ' + f.organisation.value.trim()); }
    lines.push('Facility type: ' + f.facility.value, '', msg);
    window.open('https://wa.me/2348167898186?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
    $('thanks').hidden = false;
  });

  /* Show CV button only once the PDF has been added to /assets */
  fetch('assets/Tosin-Ayodele-CV.pdf', { method: 'HEAD' }).then(function (r) { if (r.ok) { $('cvBtn').hidden = false; } }).catch(function () {});

  $('year').textContent = new Date().getFullYear();
})();
