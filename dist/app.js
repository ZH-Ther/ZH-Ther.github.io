// ─────────────────────────────────────────────────────────────
// 网站内容配置区：替换下面的数据即可更新主页，无需修改页面结构。
// ─────────────────────────────────────────────────────────────
const SITE_DATA = {
  profile: {
    name: "ZH-Ther",
    nameEn: "Research Portfolio",
    role: "科研工作者",
    affiliation: "个人科研主页",
    email: "hello@example.edu",
    bio: "你好，我是 ZH-Ther。这里用于整理个人研究方向、科研成果、项目经历与学习笔记；正式资料可在管理后台中持续更新。"
  },
  research: [
    { title: "可信机器学习", description: "研究模型不确定性、鲁棒性与可解释性，让智能系统的预测更可验证、更值得信任。", tags: ["Uncertainty", "Robustness", "XAI"] },
    { title: "AI for Science", description: "将深度学习与领域知识结合，用于复杂系统建模、科学数据分析与规律发现。", tags: ["Scientific ML", "Neural PDE", "Discovery"] },
    { title: "高效智能系统", description: "关注从算法到系统的协同优化，让大模型在资源受限环境中保持高质量与低延迟。", tags: ["Efficient AI", "Edge", "Systems"] }
  ],
  publications: [
    { year: "2026", type: "期刊", title: "Uncertainty-aware Neural Operators for Reliable Scientific Forecasting", authors: "<u>Zhiyuan Lin</u>, Ming Chen, Yue Wang", venue: "Journal of Machine Learning Research · Under Review", links: [["PDF", "#"], ["Code", "#"]] },
    { year: "2025", type: "会议", title: "Structure-guided Representation Learning for Complex Physical Systems", authors: "Yue Wang, <u>Zhiyuan Lin</u>, Han Liu", venue: "NeurIPS 2025 · Poster", links: [["PDF", "#"], ["Project", "#"]] },
    { year: "2025", type: "预印本", title: "When Can We Trust a Scientific Foundation Model?", authors: "<u>Zhiyuan Lin</u>, Jia Xu", venue: "arXiv preprint", links: [["arXiv", "#"]] },
    { year: "2024", type: "会议", title: "Lightweight Adaptation of Large Models on Edge Devices", authors: "Ming Chen, <u>Zhiyuan Lin</u>, Rui Zhao", venue: "AAAI 2024", links: [["PDF", "#"], ["Code", "#"]] },
    { year: "2024", type: "期刊", title: "Interpretable Deep Learning for Multimodal Scientific Data", authors: "<u>Zhiyuan Lin</u>, Yue Wang", venue: "Pattern Recognition", links: [["DOI", "#"]] }
  ],
  projects: [
    { time: "2025—至今", title: "面向科学计算的可信基础模型", description: "构建带有物理约束与不确定性估计的通用建模框架，支持多类时空预测任务。", meta: ["项目负责人", "国家级课题"] },
    { time: "2024—2025", title: "资源受限场景下的大模型压缩", description: "探索参数高效微调、混合精度量化与端侧推理优化，并形成开源工具链。", meta: ["核心成员", "校企合作"] },
    { time: "2023—2024", title: "多模态科研数据智能分析平台", description: "融合文本、图像与传感器数据，为实验流程提供检索、分析与可视化能力。", meta: ["算法开发", "实验室项目"] }
  ],
  notes: [
    { id: 1, date: "2026.08.16", tag: "论文阅读", minutes: "8 min", title: "从校准误差理解模型的“不确定”", excerpt: "为什么高准确率模型仍可能过度自信？从可靠性图、ECE 到温度缩放的实践梳理。", lead: "不确定性不是一个附加分数，而是模型在真实决策链条中应承担的诚实表达。", body: ["一个模型给出 90% 的置信度时，我们期待它在类似样本上大约有 90% 的正确率。这种可解释的一致性，就是校准。", "实际研究中，准确率和校准往往需要分别观察。尤其在分布偏移、类别不均衡和小样本场景下，单一指标会掩盖风险。"] },
    { id: 2, date: "2026.07.02", tag: "研究方法", minutes: "6 min", title: "如何组织一次可复现的机器学习实验", excerpt: "从数据版本、配置管理到结果表格，整理一套可持续复用的实验目录。", lead: "可复现不是论文提交前的清扫，而是从第一个实验开始就该具备的研究习惯。", body: ["我习惯把实验分成数据、配置、运行记录与产物四个层级。每次运行只改变配置，同时自动记录代码版本和随机种子。", "结果汇总脚本应该和训练代码一样被维护。这样做的价值，不只是减少错误，更重要的是让新的想法可以低成本地与旧实验比较。"] },
    { id: 3, date: "2026.05.21", tag: "工程实践", minutes: "10 min", title: "神经算子的最小实现与常见陷阱", excerpt: "用一个简单算例理解频域层、网格分辨率迁移，以及边界条件的处理方式。", lead: "实现神经算子时，真正困难的部分通常不在网络层，而在数据离散方式与评价协议。", body: ["频域层为长距离依赖提供了紧凑表达，但截断模态数、归一化方式和网格采样会显著影响结果。", "验证模型时，建议显式测试跨分辨率泛化，并把边界区域的误差单独报告。全局平均误差很容易隐藏局部失效。"] },
    { id: 4, date: "2026.03.09", tag: "科研随想", minutes: "5 min", title: "选研究问题：从“新”到“重要”", excerpt: "一个可发表的问题和一个值得长期投入的问题，有时并不是同一个问题。", lead: "新颖性让工作被注意，重要性决定它是否会留下来。两者的交集值得耐心寻找。", body: ["判断问题是否重要，可以观察它是否反复出现在不同应用里，以及现有方法的限制是否来自同一个根因。", "好的研究问题通常也能被清楚地说出来：对象是什么、约束是什么、为什么已有方案不够，以及解决后会改变什么。"] }
  ]
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function renderProfile() {
  $$('[data-profile]').forEach((el) => {
    const value = SITE_DATA.profile[el.dataset.profile];
    if (value) el.textContent = value;
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
  $('#researchGrid').innerHTML = SITE_DATA.research.map((item, index) => `
    <article class="research-card">
      <span class="research-number">0${index + 1}</span>
      <h3>${item.title}</h3>
      <p>${item.description}</p>
      <ul>${item.tags.map((tag) => `<li>${tag}</li>`).join('')}</ul>
    </article>`).join('');
}

let publicationFilter = '全部';
function renderPublications() {
  const types = ['全部', ...new Set(SITE_DATA.publications.map((item) => item.type))];
  $('#publicationFilters').innerHTML = types.map((type) => `<button type="button" class="filter-button ${type === publicationFilter ? 'active' : ''}" data-filter="${type}">${type}</button>`).join('');
  const rows = SITE_DATA.publications.filter((item) => publicationFilter === '全部' || item.type === publicationFilter);
  $('#publicationList').innerHTML = rows.map((item) => `
    <article class="publication">
      <span class="pub-year">${item.year}</span>
      <div class="pub-content"><h3>${item.title}</h3><p class="pub-authors">${item.authors}</p><p class="pub-venue">${item.venue}</p></div>
      <div class="pub-links">${item.links.map(([label, href]) => `<a href="${href}" ${href !== '#' ? 'target="_blank" rel="noreferrer"' : ''}>${label}</a>`).join('')}</div>
    </article>`).join('');
  $$('.filter-button', $('#publicationFilters')).forEach((button) => button.addEventListener('click', () => {
    publicationFilter = button.dataset.filter;
    renderPublications();
  }));
}

function renderProjects() {
  $('#projectList').innerHTML = SITE_DATA.projects.map((item) => `
    <article class="project">
      <time class="project-time">${item.time}</time>
      <div><h3>${item.title}</h3><p>${item.description}</p><div class="project-meta">${item.meta.map((meta) => `<span>${meta}</span>`).join('')}</div></div>
    </article>`).join('');
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

// 提供给 Supabase 数据层，在连接数据库后用真实内容覆盖示例内容。
window.SITE_DATA = SITE_DATA;
window.siteRender = {
  profile: renderProfile,
  settings: applySiteSettings,
  research: renderResearch,
  publications: renderPublications,
  projects: renderProjects,
  notes: renderNotes
};
