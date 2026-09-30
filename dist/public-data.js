import { isConfigured, supabase, getCurrentMembership } from "./data-service.js";

const loginLink = document.querySelector("#adminLink");

if (!isConfigured) {
  loginLink?.classList.add("setup-needed");
} else {
  const { user, membership } = await getCurrentMembership();
  if (loginLink) loginLink.textContent = membership ? `管理后台 · ${membership.role}` : (user ? "等待授权" : "GitHub 登录");

  const [profileResult, researchResult, publicationResult, projectResult, postResult, settingsResult] = await Promise.all([
    supabase.from("site_profile").select("*").eq("id", "main").maybeSingle(),
    supabase.from("research_items").select("*").order("order_index"),
    supabase.from("publications").select("*").order("year", { ascending: false }).order("order_index"),
    supabase.from("projects").select("*").order("order_index"),
    supabase.from("posts").select("id,slug,title,excerpt,body,tags,visibility,published_at,reading_minutes").eq("status", "published").neq("visibility", "unlisted").order("published_at", { ascending: false }),
    supabase.from("site_settings").select("*").eq("id", "main").maybeSingle()
  ]);

  const data = window.SITE_DATA;
  const render = window.siteRender;
  if (settingsResult.data) render.settings(settingsResult.data);
  if (profileResult.data) {
    Object.assign(data.profile, {
      name: profileResult.data.name,
      nameEn: profileResult.data.name_en,
      role: profileResult.data.role,
      affiliation: profileResult.data.affiliation,
      email: profileResult.data.email,
      bio: profileResult.data.bio
    });
    render.profile();
  }
  if (researchResult.data?.length) {
    data.research = researchResult.data.map((row) => ({ title: row.title, description: row.description, tags: row.tags || [] }));
    render.research();
  }
  if (publicationResult.data?.length) {
    data.publications = publicationResult.data.map((row) => ({
      year: String(row.year), type: row.type, title: row.title, authors: row.authors,
      venue: row.venue, links: row.links || []
    }));
    render.publications();
  }
  if (projectResult.data?.length) {
    data.projects = projectResult.data.map((row) => ({ time: row.time_label, title: row.title, description: row.description, meta: row.meta || [] }));
    render.projects();
  }
  if (postResult.data?.length) {
    data.notes = postResult.data.map((row) => ({
      id: row.id, date: new Date(row.published_at).toLocaleDateString("zh-CN").replaceAll("/", "."),
      tag: row.tags?.[0] || "科研笔记", minutes: `${row.reading_minutes || 5} min`, title: row.title,
      excerpt: row.excerpt, lead: row.excerpt, body: (row.body || "").split(/\n\n+/).filter(Boolean), slug: row.slug,
      visibility: row.visibility
    }));
    render.notes();
  }
}
