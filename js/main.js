const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Mobile menu */
const toggle = document.querySelector('.nav__toggle');
const menu = document.getElementById('menu');
const links = [...menu.querySelectorAll('a')];
toggle.addEventListener('click', () => {
  const open = menu.classList.toggle('is-open');
  toggle.setAttribute('aria-expanded', String(open));
});
links.forEach(a => a.addEventListener('click', () => {
  menu.classList.remove('is-open');
  toggle.setAttribute('aria-expanded', 'false');
}));

/* Highlight the current section in the nav */
const targets = links.map(a => document.querySelector(a.getAttribute('href')));
const spy = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    links.forEach(a => {
      if (a.getAttribute('href') === '#' + e.target.id) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  });
}, { rootMargin: '-30% 0px -60% 0px' });
targets.forEach(t => t && spy.observe(t));

/* Hero ledger: starts as a messy raw export, then each row cleans itself once */
(function cleanLedger() {
  if (reduceMotion) return;
  const rows = [...document.querySelectorAll('#ledger tbody tr')];
  const raw = [
    ['rev_q3_fy25', '4812033.5', '(2.4)'],
    ['COGS-hosting ', ' 318,442.0', '1.2 pct'],
    ['S&M  exp??', '906 114', '-3.1%'],
    ['ebitda_calc', '1274.2k', '5.8'],
  ];
  const clean = rows.map(r => [...r.cells].map(c => c.textContent));
  rows.forEach((r, i) => {
    [...r.cells].forEach((c, j) => { c.textContent = raw[i][j]; });
    r.classList.add('is-raw');
  });
  rows.forEach((r, i) => {
    setTimeout(() => {
      [...r.cells].forEach((c, j) => { c.textContent = clean[i][j]; });
      r.classList.remove('is-raw');
    }, 900 + i * 450);
  });
})();

/* Live bot numbers: read the published dashboard, fall back to the snapshot in the HTML */
(async function liveBot() {
  const box = document.getElementById('live');
  try {
    const res = await fetch(box.dataset.source, { cache: 'no-store' });
    if (!res.ok) throw new Error(res.status);
    const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
    const stats = {};
    doc.querySelectorAll('.stat').forEach(s => {
      stats[s.querySelector('.label').textContent.trim()] = s.querySelector('.value').textContent.trim();
    });
    const updated = (doc.querySelector('.updated')?.textContent || '').replace('Last updated:', '').trim();
    let filled = 0;
    box.querySelectorAll('[data-key]').forEach(el => {
      const v = stats[el.dataset.key];
      if (v) { el.textContent = v.replace('-', '−'); filled++; }
    });
    if (!filled) throw new Error('no stats');
    box.classList.add('live--on');
    document.getElementById('live-status').textContent = 'Live from the dashboard';
    if (updated) document.getElementById('live-time').textContent = 'Updated ' + updated;
  } catch (err) {
    /* keep the snapshot already in the page */
  }
})();

/* Resume preview loads only when opened */
const preview = document.getElementById('preview');
preview.addEventListener('toggle', () => {
  const pdf = preview.querySelector('object');
  if (preview.open && !pdf.data) pdf.data = 'assets/resume.pdf';
});

/* Copy email */
const copy = document.getElementById('copy');
const msg = document.getElementById('copy-msg');
copy.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(copy.dataset.email);
    msg.textContent = 'Copied to clipboard';
  } catch (err) {
    msg.textContent = 'Copy failed. Select the address above instead.';
  }
  setTimeout(() => { msg.textContent = ''; }, 3000);
});

document.getElementById('yr').textContent = new Date().getFullYear();
