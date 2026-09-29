import { writeFileSync } from "node:fs";

const config = {
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabasePublishableKey: process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || "",
  siteUrl: "https://zh-ther.github.io"
};

writeFileSync("dist/config.js", `window.ZH_THER_CONFIG = ${JSON.stringify(config, null, 2)};\n`);
