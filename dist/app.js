// 这里只保留数据库尚未返回时的安全空状态，不展示虚构科研资料。
const SITE_DATA = {
  profile: {
    name: "ZH-Ther",
    nameEn: "Research Portfolio",
    role: "",
    affiliation: "",
    email: "",
    bio: "正在读取个人资料…"
  },
  research: [],
  publications: [],
  projects: [],
  notes: []
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function renderProfile() {
  $$('[data-profile]').forEach((el) => {
    const value = SITE_DATA.profile[el.dataset.profile];
    if (value !== undefined && value !== null) el.textContent = value;
  });
  $('#copyEmail').dataset.email = SITE_DATA.profile.email;
}

function applySiteSettings(settings = {}) {
  const setText = (selector, value) => { const element = $(selector); if (element && value !== null && value !== undefined) element.textContent = value; };
  if (settings.site_title) document.title = settings.site_title;
  const description = document.querySelector('meta[name="description"]');
  if (description && settings.site_description) description.content = settings.site_description;
  setText('#heroKicker', settings.hero_kicker);
  setText('#heroPrefix', settings.hero_prefix);
  setText('#heroEmphasis', settings.hero_emphasis);
  setText('#heroSuffix', settings.hero_suffix);
  setText('#statusText', settings.status_text);
  setText('#researchDescription', settings.research_description);
  setText('#publicationsDescription', settings.publications_description);
  setText('#projectsDescription', settings.projects_description);
  setText('#notesDescription', settings.notes_description);
  setText('#footerMotto', settings.footer_motto);

  for (let index = 1; index <= 4; index += 1) {
    setText(`[data-metric-value="${index}"]`, settings[`metric_${index}_value`]);
    setText(`[data-metric-label="${index}"]`, settings[`metric_${index}_label`]);
  }

  $$('[data-social]').forEach((link) => {
    const value = settings[link.dataset.social];
    let validUrl = '';
    try { const parsed = new URL(value); if (['http:', 'https:'].includes(parsed.protocol)) validUrl = parsed.href; } catch {}
    link.hidden = !validUrl;
    if (validUrl) link.href = validUrl;
  });

  const portrait = $('#profilePortrait');
  if (portrait && settings.avatar_url) {
    const image = document.createElement('img');
    image.src = settings.avatar_url;
    image.alt = '';
    image.addEventListener('error', () => { portrait.innerHTML = '<span>ZT</span><i></i>'; }, { once: true });
    portrait.replaceChildren(image);
  }

  const ids = ['about', 'research', 'publications', 'projects', 'notes'];
  const preferred = Array.isArray(settings.module_order) ? settings.module_order.filter((id) => ids.includes(id)) : [];
  const order = [...new Set([...preferred, ...ids])];
  const hidden = new Set(settings.hidden_modules || []);
  const main = $('#main');
  const footer = $('main > footer');
  const nav = $('.nav');
  order.forEach((id) => {
    const section = $(`[data-module-id="${id}"]`);
    const link = $(`[data-nav-id="${id}"]`);
    if (section) { section.hidden = hidden.has(id); main.insertBefore(section, footer); }
    if (link) { link.hidden = hidden.has(id); nav.appendChild(link); }
  });
  const visibleIds = order.filter((id) => !hidden.has(id));
  visibleIds.forEach((id, index) => {
    const link = $(`[data-nav-id="${id}"]`);
    const sectionIndex = $(`[data-module-id="${id}"] .section-index`);
    if (link) {
      link.classList.toggle('active', index === 0);
      const number = link.querySelector('span');
      if (number) number.textContent = String(index + 1).padStart(2, '0');
    }
    if (sectionIndex) sectionIndex.textContent = String(index + 1).padStart(2, '0');
  });
  const firstVisible = visibleIds[0];
  if (firstVisible) {
    $('.identity')?.setAttribute('href', `#${firstVisible}`);
    $('.mobile-brand')?.setAttribute('href', `#${firstVisible}`);
  }
  const resultTarget = visibleIds.includes('publications') ? 'publications' : visibleIds.find((id) => id !== 'about');
  const resultLink = $('.cta-row .primary');
  if (resultLink) resultLink.hidden = !resultTarget;
  if (resultLink && resultTarget) resultLink.href = `#${resultTarget}`;
}

function renderResearch() {
  $('#researchGrid').innerHTML = SITE_DATA.research.length ? SITE_DATA.research.map((item, index) => `
    <article class="research-card">
      <span class="research-number">0${index + 1}</span>
      <h3>${item.title}</h3>
      <p>${item.description}</p>
      <ul>${item.tags.map((tag) => `<li>${tag}</li>`).join('')}</ul>
    </article>`).join('') : '<p class="empty-state">暂无公开研究方向。</p>';
}

let publicationFilter = '全部';
function renderPublications() {
  const types = ['全部', ...new Set(SITE_DATA.publications.map((item) => item.type))];
  $('#publicationFilters').innerHTML = types.map((type) => `<button type="button" class="filter-button ${type === publicationFilter ? 'active' : ''}" data-filter="${type}">${type}</button>`).join('');
  const rows = SITE_DATA.publications.filter((item) => publicationFilter === '全部' || item.type === publicationFilter);
  $('#publicationList').innerHTML = rows.length ? rows.map((item) => `
    <article class="publication">
      <span class="pub-year">${item.year}</span>
      <div class="pub-content"><h3>${item.title}</h3><p class="pub-authors">${item.authors}</p><p class="pub-venue">${item.venue}</p></div>
      <div class="pub-links">${item.links.map(([label, href]) => `<a href="${href}" ${href !== '#' ? 'target="_blank" rel="noreferrer"' : ''}>${label}</a>`).join('')}</div>
    </article>`).join('') : '<p class="empty-state">暂无公开科研成果。</p>';
  $$('.filter-button', $('#publicationFilters')).forEach((button) => button.addEventListener('click', () => {
    publicationFilter = button.dataset.filter;
    renderPublications();
  }));
}

function renderProjects() {
  $('#projectList').innerHTML = SITE_DATA.projects.length ? SITE_DATA.projects.map((item) => `
    <article class="project">
      <time class="project-time">${item.time}</time>
      <div><h3>${item.title}</h3><p>${item.description}</p><div class="project-meta">${item.meta.map((meta) => `<span>${meta}</span>`).join('')}</div></div>
    </article>`).join('') : '<p class="empty-state">暂无公开项目经历。</p>';
}

let noteTag = '全部';
function renderNotes() {
  const tags = ['全部', ...new Set(SITE_DATA.notes.map((item) => item.tag))];
  $('#noteTags').innerHTML = tags.map((tag) => `<button type="button" class="filter-button ${tag === noteTag ? 'active' : ''}" data-tag="${tag}">${tag}</button>`).join('');
  const query = $('#noteSearch').value.trim().toLowerCase();
  const rows = SITE_DATA.notes.filter((item) => {
    const matchesTag = noteTag === '全部' || item.tag === noteTag;
    const haystack = `${item.title} ${item.excerpt} ${item.tag}`.toLowerCase();
    return matchesTag && haystack.includes(query);
  });
  $('#noteGrid').innerHTML = rows.map((item) => `
    <article class="note-card" tabindex="0" role="button" data-note-id="${item.id}" aria-label="阅读：${item.title}">
      <time>${item.date}</time><h3>${item.title}</h3><p>${item.excerpt}</p>
      <footer><span>${item.tag}${item.visibility && item.visibility !== 'public' ? `<i class="visibility-badge">${item.visibility === 'members' ? '成员可见' : '私密'}</i>` : ''}</span><span>${item.minutes} 阅读</span></footer>
    </article>`).join('');
  $('#emptyState').hidden = rows.length > 0;
  $$('.filter-button', $('#noteTags')).forEach((button) => button.addEventListener('click', () => {
    noteTag = button.dataset.tag;
    renderNotes();
  }));
  $$('.note-card').forEach((card) => {
    const open = () => openNote(card.dataset.noteId);
    card.addEventListener('click', open);
    card.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); } });
  });
}

function openNote(id) {
  const note = SITE_DATA.notes.find((item) => String(item.id) === String(id));
  if (!note) return;
  if (note.slug) {
    window.location.href = `./post.html?slug=${encodeURIComponent(note.slug)}`;
    return;
  }
  $('#dialogContent').innerHTML = `
    <div class="dialog-meta">${note.date} · ${note.tag} · ${note.minutes}</div>
    <h2>${note.title}</h2>
    <p class="dialog-lead">${note.excerpt}</p>
    <blockquote>${note.lead}</blockquote>
    <h3>正文节选</h3>
    ${note.body.map((paragraph) => `<p>${paragraph}</p>`).join('')}`;
  $('#noteDialog').showModal();
}

function initTheme() {
  const saved = localStorage.getItem('research-site-theme');
  if (saved) document.documentElement.dataset.theme = saved;
  $('#themeToggle').addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('research-site-theme', next);
  });
}

function initNavigation() {
  const menuButton = $('#menuButton');
  const sidebar = $('#sidebar');
  menuButton.addEventListener('click', () => {
    const open = sidebar.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
  });
  $$('.nav a').forEach((link) => link.addEventListener('click', () => {
    sidebar.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  }));
  const navLinks = $$('.nav a');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
      }
    });
  }, { rootMargin: '-25% 0px -65% 0px' });
  $$('.section').forEach((section) => observer.observe(section));
}

function initActions() {
  $('#noteSearch').addEventListener('input', renderNotes);
  $('#dialogClose').addEventListener('click', () => $('#noteDialog').close());
  $('#noteDialog').addEventListener('click', (event) => { if (event.target === $('#noteDialog')) $('#noteDialog').close(); });
  $('#copyEmail').addEventListener('click', async (event) => {
    try {
      await navigator.clipboard.writeText(event.currentTarget.dataset.email);
      showToast('邮箱已复制');
    } catch { showToast(event.currentTarget.dataset.email); }
  });
}

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 1800);
}

renderProfile();
renderResearch();
renderPublications();
renderProjects();
renderNotes();
initTheme();
initNavigation();
initActions();
$('#year').textContent = new Date().getFullYear();

// 提供给公开数据层，在连接数据库后用真实内容覆盖安全空状态。
window.SITE_DATA = SITE_DATA;
window.siteRender = {
  profile: renderProfile,
  settings: applySiteSettings,
  research: renderResearch,
  publications: renderPublications,
  projects: renderProjects,
  notes: renderNotes
};
