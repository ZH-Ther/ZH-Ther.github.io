import { isConfigured, supabase, getCurrentMembership, signInWithGitHub, signOut } from "./data-service.js";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const moduleIds = ["about", "research", "publications", "projects", "notes"];
const defaultSettings = {
  id: "main", site_title: "ZH-Ther · 个人科研主页", site_description: "个人科研主页，汇集研究方向、论文成果、科研项目与学术笔记。",
  hero_kicker: "Academic portfolio · 2026", hero_prefix: "探索智能系统中", hero_emphasis: "可解释、可靠且高效", hero_suffix: "的计算方法。",
  status_text: "开放学术交流与合作", scholar_url: "https://scholar.google.com", github_url: "https://github.com/ZH-Ther", orcid_url: "https://orcid.org", avatar_url: "",
  footer_motto: "保持好奇，持续记录。", research_description: "围绕“可信智能”这条主线，从方法、系统到科学应用展开研究。",
  publications_description: "代表性论文与正在推进的工作。姓名下划线表示本人。", projects_description: "把研究问题落实为数据、模型与可复现的工具。",
  notes_description: "记录论文阅读、研究方法与工程实践。", metric_1_value: "08", metric_1_label: "论文 / 预印本", metric_2_value: "04", metric_2_label: "研究项目",
  metric_3_value: "03", metric_3_label: "开源工具", metric_4_value: "12", metric_4_label: "学术笔记", module_order: moduleIds, hidden_modules: []
};
const state = { membership: null, user: null, settings: { ...defaultSettings }, research: [], publications: [], projects: [], posts: [], members: [] };
const visibilityText = { public: "公开", unlisted: "不公开链接", members: "成员可见", private: "仅所有者" };
const roleText = { owner: "所有者", editor: "编辑者", viewer: "只读访客" };

function showOnly(id) {
  ["setupGate", "loginGate", "accessGate", "studio"].forEach((key) => { $(`#${key}`).hidden = key !== id; });
}

function notify(message, isError = false) {
  const flash = $("#flash");
  flash.textContent = message;
  flash.style.background = isError ? "#9e3232" : "#102a43";
  flash.classList.add("show");
  setTimeout(() => flash.classList.remove("show"), 2200);
}

function values(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function csv(value) {
  return String(value || "").split(/[,，]/).map((item) => item.trim()).filter(Boolean);
}

function fillForm(form, record = {}) {
  [...form.elements].forEach((field) => {
    if (!field.name) return;
    const value = record[field.name];
    field.value = Array.isArray(value) ? value.join(", ") : (value ?? "");
  });
  form.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function renderAvatarPreview(url = "") {
  const preview = $("#avatarPreview");
  preview.replaceChildren();
  if (url) {
    const image = document.createElement("img");
    image.src = url;
    image.alt = "当前头像";
    preview.appendChild(image);
  } else {
    const fallback = document.createElement("span");
    fallback.textContent = "ZT";
    preview.appendChild(fallback);
  }
}

function fillSettingsForm(settings) {
  const form = $("#settingsForm");
  fillForm(form, settings);
  const order = Array.isArray(settings.module_order) && settings.module_order.length ? settings.module_order : moduleIds;
  const hidden = new Set(settings.hidden_modules || []);
  moduleIds.forEach((id) => {
    form.elements[`module_${id}_enabled`].checked = !hidden.has(id);
    form.elements[`module_${id}_order`].value = Math.max(1, order.indexOf(id) + 1 || moduleIds.indexOf(id) + 1);
  });
  renderAvatarPreview(settings.avatar_url);
}

async function save(table, payload, id) {
  const query = id ? supabase.from(table).update(payload).eq("id", id) : supabase.from(table).insert(payload);
  const { error } = await query;
  if (error) throw error;
}

function setAccount() {
  $("#accountArea").innerHTML = `<span>${state.user.email || state.user.user_metadata?.user_name || "GitHub 用户"}</span><span class="role-pill">${roleText[state.membership.role]}</span><button class="mini-button" id="signOutButton" type="button">退出</button>`;
  $("#signOutButton").addEventListener("click", signOut);
}

function initNavigation() {
  $$(".nav-button").forEach((button) => button.addEventListener("click", () => {
    $$(".nav-button").forEach((item) => item.classList.toggle("active", item === button));
    $$(".panel").forEach((panel) => panel.classList.toggle("active", panel.dataset.panelId === button.dataset.panel));
  }));
  if (state.membership.role !== "owner") $$(".owner-only").forEach((item) => item.hidden = true);
}

function renderRecords(target, records, type) {
  $(target).innerHTML = records.length ? records.map((item) => `
    <div class="record-card">
      <div><strong>${item.title || item.email}</strong><small>${type === "publication" ? `${item.year} · ${item.type || "未分类"}` : (item.description || item.venue || item.time_label || "").slice(0, 48)} · ${visibilityText[item.visibility] || ""}</small></div>
      <div class="record-actions"><button type="button" class="mini-button" data-edit="${type}" data-id="${item.id}">编辑</button><button type="button" class="mini-button" data-remove="${type}" data-id="${item.id}">删除</button></div>
    </div>`).join("") : `<div class="record-card"><small>暂无内容</small></div>`;
}

function renderPosts() {
  $("#postList").innerHTML = state.posts.length ? state.posts.map((item) => `
    <button type="button" class="record-card" data-post-id="${item.id}">
      <div><strong>${item.title}</strong><small>${item.status === "draft" ? "草稿" : "已发布"} · ${visibilityText[item.visibility]}</small></div>
    </button>`).join("") : `<div class="record-card"><small>暂无文章，点击“新建文章”开始写作。</small></div>`;
  $$('[data-post-id]').forEach((button) => button.addEventListener("click", () => editPost(button.dataset.postId)));
}

function renderMembers() {
  $("#memberList").innerHTML = state.members.map((member) => `
    <div class="member-row"><div><strong>${member.email}</strong><small>${member.github_username ? `@${member.github_username}` : "等待首次登录"}</small></div><span>${roleText[member.role]}</span><span>${member.status === "active" ? "已启用" : "已邀请"}</span>${member.role === "owner" ? "<span></span>" : `<button class="mini-button" type="button" data-revoke="${member.id}">移除</button>`}</div>`).join("");
  $$('[data-revoke]').forEach((button) => button.addEventListener("click", async () => {
    if (!confirm("确定移除这位成员吗？")) return;
    const { error } = await supabase.from("members").update({ status: "revoked" }).eq("id", button.dataset.revoke);
    if (error) return notify(error.message, true);
    await loadMembers(); notify("成员权限已更新");
  }));
}

function editPost(id) {
  const post = state.posts.find((item) => item.id === id);
  if (!post) return;
  fillForm($("#postForm"), post);
  $("#deletePost").hidden = false;
}

async function loadMembers() {
  if (state.membership.role !== "owner") return;
  const { data, error } = await supabase.from("members").select("*").neq("status", "revoked").order("created_at");
  if (error) throw error;
  state.members = data || [];
  renderMembers();
}

async function loadData() {
  const [profile, research, publications, projects, posts, settings] = await Promise.all([
    supabase.from("site_profile").select("*").eq("id", "main").maybeSingle(),
    supabase.from("research_items").select("*").order("order_index"),
    supabase.from("publications").select("*").order("year", { ascending: false }),
    supabase.from("projects").select("*").order("order_index"),
    supabase.from("posts").select("*").order("updated_at", { ascending: false }),
    supabase.from("site_settings").select("*").eq("id", "main").maybeSingle()
  ]);
  [profile, research, publications, projects, posts].forEach((result) => { if (result.error) throw result.error; });
  state.research = research.data || [];
  state.publications = publications.data || [];
  state.projects = projects.data || [];
  state.posts = posts.data || [];
  state.settings = { ...defaultSettings, ...(settings.data || {}) };
  if (profile.data) fillForm($("#profileForm"), profile.data);
  fillSettingsForm(state.settings);
  renderRecords("#researchList", state.research, "research");
  renderRecords("#publicationListAdmin", state.publications, "publication");
  renderRecords("#projectListAdmin", state.projects, "project");
  renderPosts();
  await loadMembers();
}

function bindForms() {
  $("#settingsForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = values(event.currentTarget);
    const moduleOrder = moduleIds.slice().sort((a, b) => Number(data[`module_${a}_order`] || 99) - Number(data[`module_${b}_order`] || 99));
    const hiddenModules = moduleIds.filter((id) => !event.currentTarget.elements[`module_${id}_enabled`].checked);
    const keys = ["site_title", "site_description", "hero_kicker", "hero_prefix", "hero_emphasis", "hero_suffix", "status_text", "scholar_url", "github_url", "orcid_url", "avatar_url", "footer_motto", "research_description", "publications_description", "projects_description", "notes_description", "metric_1_value", "metric_1_label", "metric_2_value", "metric_2_label", "metric_3_value", "metric_3_label", "metric_4_value", "metric_4_label"];
    const payload = Object.fromEntries(keys.map((key) => [key, data[key] || ""]));
    Object.assign(payload, { id: "main", module_order: moduleOrder, hidden_modules: hiddenModules, updated_at: new Date().toISOString() });
    const { error } = await supabase.from("site_settings").upsert(payload);
    if (error) return notify(error.message, true);
    state.settings = { ...state.settings, ...payload };
    notify("网站设置已保存，刷新主页即可查看");
  });

  $("#profileForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = { id: "main", ...values(event.currentTarget), updated_at: new Date().toISOString() };
    const { error } = await supabase.from("site_profile").upsert(payload);
    error ? notify(error.message, true) : notify("个人资料已保存");
  });

  const moduleForms = {
    researchForm: { table: "research_items", key: "research", transform: (data) => ({ title: data.title, description: data.description, tags: csv(data.tags), visibility: data.visibility }) },
    publicationForm: { table: "publications", key: "publications", transform: (data) => ({ year: Number(data.year), type: data.type, title: data.title, authors: data.authors, venue: data.venue, visibility: data.visibility }) },
    projectForm: { table: "projects", key: "projects", transform: (data) => ({ time_label: data.time_label, title: data.title, description: data.description, meta: csv(data.meta), visibility: data.visibility }) }
  };
  Object.entries(moduleForms).forEach(([formId, config]) => {
    $(`#${formId}`).addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = values(event.currentTarget);
      try { await save(config.table, config.transform(data), data.id); event.currentTarget.reset(); await loadData(); notify("内容已保存"); }
      catch (error) { notify(error.message, true); }
    });
  });

  $("#postForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = values(event.currentTarget);
    const payload = {
      title: data.title, slug: data.slug.trim(), excerpt: data.excerpt, body: data.body, tags: csv(data.tags),
      visibility: data.visibility, status: data.status,
      reading_minutes: Math.max(1, Math.ceil((data.body || "").length / 500)),
      published_at: data.status === "published" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    };
    try { await save("posts", payload, data.id); event.currentTarget.reset(); $("#deletePost").hidden = true; await loadData(); notify("文章已保存"); }
    catch (error) { notify(error.message, true); }
  });

  $("#inviteForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = values(event.currentTarget);
    const { error } = await supabase.from("members").upsert({ email: data.email.toLowerCase(), role: data.role, status: "invited" }, { onConflict: "email" });
    if (error) return notify(error.message, true);
    event.currentTarget.reset(); await loadMembers(); notify("邀请已保存，对方可使用该邮箱对应的 GitHub 账号登录");
  });
}

function bindRecordActions() {
  document.addEventListener("click", async (event) => {
    const edit = event.target.closest("[data-edit]");
    if (edit) {
      const map = { research: [state.research, "#researchForm"], publication: [state.publications, "#publicationForm"], project: [state.projects, "#projectForm"] };
      const [rows, form] = map[edit.dataset.edit]; fillForm($(form), rows.find((item) => item.id === edit.dataset.id)); return;
    }
    const remove = event.target.closest("[data-remove]");
    if (remove && confirm("确定删除这条内容吗？")) {
      const table = { research: "research_items", publication: "publications", project: "projects" }[remove.dataset.remove];
      const { error } = await supabase.from(table).delete().eq("id", remove.dataset.id);
      error ? notify(error.message, true) : (await loadData(), notify("内容已删除"));
    }
  });
  $$('[data-reset]').forEach((button) => button.addEventListener("click", (event) => { event.preventDefault(); $(`#${button.dataset.reset}`).reset(); $(`#${button.dataset.reset} [name=id]`).value = ""; }));
  $("#newPost").addEventListener("click", () => { $("#postForm").reset(); $("#postForm [name=id]").value = ""; $("#deletePost").hidden = true; $("#postForm [name=title]").focus(); });
  $("#deletePost").addEventListener("click", async () => {
    const id = $("#postForm [name=id]").value;
    if (!id || !confirm("确定删除这篇文章吗？此操作无法撤销。")) return;
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) return notify(error.message, true);
    $("#postForm").reset(); $("#deletePost").hidden = true; await loadData(); notify("文章已删除");
  });

  $("#avatarFile").addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) return notify("请选择小于 5 MB 的 JPG、PNG、WebP 或 GIF 图片", true);
    const extension = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `avatars/profile-${state.user.id}.${extension}`;
    notify("正在上传头像…");
    const { error } = await supabase.storage.from("site-assets").upload(path, file, { upsert: true, cacheControl: "3600", contentType: file.type });
    if (error) return notify(error.message, true);
    const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
    const publicUrl = `${data.publicUrl}?v=${Date.now()}`;
    $("#settingsForm [name=avatar_url]").value = publicUrl;
    renderAvatarPreview(publicUrl);
    notify("头像已上传，请保存网站设置");
  });
  $("#removeAvatar").addEventListener("click", () => {
    $("#settingsForm [name=avatar_url]").value = "";
    $("#avatarFile").value = "";
    renderAvatarPreview();
  });
}

async function start() {
  if (!isConfigured) return showOnly("setupGate");
  const { user, membership } = await getCurrentMembership();
  state.user = user; state.membership = membership;
  if (!user) {
    showOnly("loginGate");
    $("#loginButton").addEventListener("click", async () => {
      const { error } = await signInWithGitHub();
      if (error) alert(error.message);
    });
    return;
  }
  if (!membership || membership.role === "viewer") {
    $("#accountArea").innerHTML = `<span>${user.email || user.user_metadata?.user_name}</span><button class="mini-button" id="gateSignOut" type="button">退出</button>`;
    $("#gateSignOut").addEventListener("click", signOut);
    return showOnly("accessGate");
  }
  showOnly("studio"); setAccount(); initNavigation(); bindForms(); bindRecordActions();
  try { await loadData(); } catch (error) { notify(error.message, true); }
}

start();
