# Cloudflare Pages migration: ARROW

This guide covers the **Resonant-Arrow landing website** only. Other ARROW modules such as Orbit and Relay currently live in separate repositories/deployments; migrating this repository does not migrate them automatically.

## Status

- Source: `Link9060/Resonant-Arrow`, production branch `main`.
- Framework: React + Vite; `npm run build` creates the `dist/` directory.
- Existing GitHub Pages workflow: `.github/workflows/pages.yml`.
- **Do not remove the GitHub Pages deployment until Cloudflare Pages is validated.**
- The existing GitHub Pages workflow passes `--base=/Resonant-Arrow/` because GitHub serves from a repository subpath. **Do not reuse that flag for the new Cloudflare root-domain build.** Cloudflare should build with `npm run build` (default base `/`).

## Step 1: Create and test the Pages project

In the Cloudflare account that manages the `enterarrow.com` DNS zone:

1. Open **Workers & Pages** > **Create application** > **Pages** > **Import an existing Git repository**.
2. Authorize Cloudflare GitHub access to `Link9060/Resonant-Arrow` and select that repo.
3. Set:
   - Project name: `resonant-arrow` (if available; another name is fine)
   - Production branch: `main`
   - Framework preset: `React (Vite)` (or equivalent)
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: repository root
4. Deploy. First test the provided `*.pages.dev` address **before changing DNS**.
5. Check landing page rendering, fonts/images, the cinematic experience, mobile layout, and the "Explore ARROW" external Orbit link. If the repository eventually adds client-side deep routes, Cloudflare Pages normally provides SPA fallback when there is no top-level `404.html`.

## Step 2: Connect the existing domain

1. Within the new Pages project, go to **Custom domains** > **Set up a domain**.
2. Add `enterarrow.com`. Because the apex DNS zone is in Cloudflare, it should be on **the same Cloudflare account** as the Pages project. Cloudflare will guide and usually create the required DNS record.
3. Check current records for the apex (`@`) and `www`. Preserve unrelated DNS records, especially mail records (MX, TXT), and existing DNS for module subdomains.
4. Configure `www.enterarrow.com` separately if you use it, either attaching it as a custom domain or redirecting it to the apex.
5. Wait for Cloudflare to report the custom domain active, then test HTTPS and the live site.

Do **not** just manually add a CNAME and skip the Pages **Custom domains** association. Do not change nameservers if they are already pointing to the correct Cloudflare zone.

## Step 3: Verify before retiring the old site

- The site loads at `https://enterarrow.com/` and `*.pages.dev`.
- Assets load without 404s and do not reference `/Resonant-Arrow/assets` paths.
- Navigation to Orbit still works. Note that this landing repo links to `https://link9060.github.io/Resonant-Orbit/`; migrating Orbit is separate.
- Authentication callbacks, redirects, service URLs and other modules still work where applicable.
- Inspect DNS and verify that only intended hostnames were changed.
- Keep GitHub Pages enabled until the new site passes those checks, then optionally retire the old workflow.

## Rollback

If the custom domain fails, **restore the previous DNS record values** for `enterarrow.com` (make a record of them before the cutover). Leave the GitHub Pages deployment intact as a fallback. Allow time for DNS caches to expire.

## Notes

- The site is static: Cloudflare Pages **static asset requests do not consume Workers AI Neurons**.
- This does **not** migrate RAVIN's API, Grove, ARRAY, Orbit, Relay, or any Render web service.
- The ChatGPT GitHub integration can prepare repository content but cannot create the Cloudflare Pages project or change Cloudflare DNS without an authorized Cloudflare integration.

Official Cloudflare documentation:
- https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/
- https://developers.cloudflare.com/pages/configuration/custom-domains/
- https://developers.cloudflare.com/pages/configuration/serving-pages/
