import { isPublicConfigured, selectRows } from "./public-client.js";

const root = document.querySelector("#article");
const slug = new URLSearchParams(location.search).get("slug");

async function waitForRenderLibraries() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (window.marked && window.DOMPurify) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

function renderMarkdown(source = "") {
  if (!window.marked || !window.DOMPurify) {
    const fallback = document.createElement("div");
    fallback.className = "article-body";
    fallback.textContent = source;
    return fallback;
  }
  const formulas = [];
  const tokenPrefix = `ZHFORMULA${Math.random().toString(36).slice(2)}`;
  const stash = (formula, displayMode) => {
    const token = `${tokenPrefix}${formulas.length}TOKEN`;
    formulas.push(window.katex ? window.katex.renderToString(formula.trim(), { displayMode, throwOnError: false, strict: false, trust: false }) : formula);
    return token;
  };
  const prepared = source
    .replace(/\$\$([\s\S]+?)\$\$/g, (_, formula) => stash(formula, true))
    .replace(/\\\[([\s\S]+?)\\\]/g, (_, formula) => stash(formula, true))
    .replace(/\\\((.+?)\\\)/g, (_, formula) => stash(formula, false))
    .replace(/(^|[^\\])\$([^$\n]+?)\$/g, (_, prefix, formula) => `${prefix}${stash(formula, false)}`);
  let html = window.DOMPurify.sanitize(window.marked.parse(prepared, { gfm: true }));
  formulas.forEach((formula, index) => { html = html.replaceAll(`${tokenPrefix}${index}TOKEN`, formula); });
  const body = document.createElement("div");
  body.className = "article-body";
  body.innerHTML = html;
  body.querySelectorAll("a").forEach((link) => {
    if (link.origin !== location.origin) { link.target = "_blank"; link.rel = "noreferrer noopener"; }
  });
  body.querySelectorAll("pre code").forEach((block) => window.hljs?.highlightElement(block));
  return body;
}

if (!isPublicConfigured || !slug) {
  root.innerHTML = '<div class="article-state">文章地址无效或内容服务尚未启用。</div>';
} else {
  let data = null;
  try {
    const rows = await selectRows("posts", `select=title,excerpt,body,tags,visibility,published_at,reading_minutes&slug=eq.${encodeURIComponent(slug)}&status=eq.published&limit=1`);
    data = rows[0] || null;
  } catch {}
  if (!data) {
    root.innerHTML = '<div class="article-state"><h2>无法查看这篇文章</h2><p>文章不存在，或当前 GitHub 账号没有阅读权限。</p></div>';
  } else {
    await waitForRenderLibraries();
    document.title = `${data.title} · ZH-Ther`;
    const h1 = document.createElement("h1"); h1.textContent = data.title;
    const meta = document.createElement("div"); meta.className = "article-meta"; meta.textContent = `${data.published_at ? new Date(data.published_at).toLocaleDateString("zh-CN") : "未定日期"} · ${(data.tags || []).join(" / ")} · ${data.reading_minutes || 5} min`;
    const excerpt = document.createElement("p"); excerpt.className = "article-excerpt"; excerpt.textContent = data.excerpt || "";
    const body = renderMarkdown(data.body || "");
    root.replaceChildren(h1, meta, excerpt, body);
  }
}
