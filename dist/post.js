import { isConfigured, supabase } from "./data-service.js";

const root = document.querySelector("#article");
const slug = new URLSearchParams(location.search).get("slug");

if (!isConfigured || !slug) {
  root.innerHTML = '<div class="article-state">文章地址无效或内容服务尚未启用。</div>';
} else {
  const { data, error } = await supabase.from("posts").select("title,excerpt,body,tags,visibility,published_at,reading_minutes").eq("slug", slug).eq("status", "published").maybeSingle();
  if (error || !data) {
    root.innerHTML = '<div class="article-state"><h2>无法查看这篇文章</h2><p>文章不存在，或当前 GitHub 账号没有阅读权限。</p></div>';
  } else {
    document.title = `${data.title} · ZH-Ther`;
    const h1 = document.createElement("h1"); h1.textContent = data.title;
    const meta = document.createElement("div"); meta.className = "article-meta"; meta.textContent = `${new Date(data.published_at).toLocaleDateString("zh-CN")} · ${(data.tags || []).join(" / ")} · ${data.reading_minutes || 5} min`;
    const excerpt = document.createElement("p"); excerpt.className = "article-excerpt"; excerpt.textContent = data.excerpt || "";
    const body = document.createElement("div"); body.className = "article-body"; body.textContent = data.body || "";
    root.replaceChildren(h1, meta, excerpt, body);
  }
}
