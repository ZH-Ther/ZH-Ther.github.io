import { isPublicConfigured, selectRows, currentPublicMembership } from "./public-client.js";

const loginLink = document.querySelector("#adminLink");
const data = window.SITE_DATA;
const render = window.siteRender;

if (!isPublicConfigured) {
  loginLink?.classList.add("setup-needed");
} else {
  // 各模块独立更新，避免一个慢请求阻塞整页资料显示。
  currentPublicMembership().then(({ user, membership }) => {
    if (loginLink) loginLink.textContent = membership ? `管理后台 · ${membership.role}` : (user ? "等待授权" : "GitHub 登录");
  });

  selectRows("site_settings", "select=*&id=eq.main&limit=1")
    .then((rows) => { if (rows[0]) render.settings(rows[0]); })
    .catch(() => {});

  selectRows("site_profile", "select=*&id=eq.main&limit=1")
    .then((rows) => {
      const profile = rows[0];
      if (!profile) return;
      Object.assign(data.profile, {
        name: profile.name, nameEn: profile.name_en, role: profile.role,
        affiliation: profile.affiliation, email: profile.email, bio: profile.bio
      });
      render.profile();
    })
    .catch(() => {});

  selectRows("research_items", "select=*&order=order_index.asc")
    .then((rows) => {
      data.research = rows.map((row) => ({ title: row.title, description: row.description, tags: row.tags || [] }));
      render.research();
    })
    .catch(() => {});

  selectRows("publications", "select=*&order=year.desc,order_index.asc")
    .then((rows) => {
      data.publications = rows.map((row) => ({
        year: String(row.year), type: row.type, title: row.title, authors: row.authors,
        venue: row.venue, links: row.links || []
      }));
      render.publications();
    })
    .catch(() => {});

  selectRows("projects", "select=*&order=order_index.asc")
    .then((rows) => {
      data.projects = rows.map((row) => ({ time: row.time_label, title: row.title, description: row.description, meta: row.meta || [] }));
      render.projects();
    })
    .catch(() => {});

  selectRows("posts", "select=id,slug,title,excerpt,body,tags,visibility,published_at,reading_minutes&status=eq.published&visibility=neq.unlisted&order=published_at.desc")
    .then((rows) => {
      data.notes = rows.map((row) => ({
        id: row.id, date: row.published_at ? new Date(row.published_at).toLocaleDateString("zh-CN").replaceAll("/", ".") : "",
        tag: row.tags?.[0] || "科研笔记", minutes: `${row.reading_minutes || 5} min`, title: row.title,
        excerpt: row.excerpt, lead: row.excerpt, body: (row.body || "").split(/\n\n+/).filter(Boolean), slug: row.slug,
        visibility: row.visibility
      }));
      render.notes();
    })
    .catch(() => {});
}
