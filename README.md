# ZH-Ther Research Site

Personal research website for `https://zh-ther.github.io`, with a public academic profile and an authenticated content studio.

## Included

- Academic profile, research topics, publications, projects, and notes
- GitHub sign-in through Supabase Auth
- Owner, editor, and viewer roles
- Public, unlisted, member-only, private, and draft content states
- Browser-based profile, module, blog, and member management
- GitHub Actions deployment to GitHub Pages
- Supabase Row Level Security policies

## First-time setup

1. Create a Supabase project and run `supabase/schema.sql`.
2. Enable the GitHub provider in Supabase Authentication.
3. Configure the OAuth callback URL in a GitHub OAuth App.
4. Add `SUPABASE_URL` and `SUPABASE_ANON_KEY` as GitHub Actions repository variables.
5. Enable GitHub Pages with GitHub Actions as its source.

The owner account is assigned automatically when the GitHub username is `ZH-Ther`.

## Local preview

Serve the `dist` directory with any static file server. Without Supabase configuration, the public site uses built-in example content and the admin page displays setup guidance.
