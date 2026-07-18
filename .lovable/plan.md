## Problem

The GitHub Actions build fails at `npm ci` because `package-lock.json` is out of sync with `package.json`. When the MCP + portal work was added, new deps (`@supabase/supabase-js`, `@lovable.dev/mcp-js`, plus transitive changes) were installed via Bun, which only updated `bun.lock`. `npm ci` requires an exact match between `package.json` and `package-lock.json` and hard-fails otherwise — that's the `Process completed with exit code 1` in the annotation.

The Node.js 20 warning in the same screenshot is unrelated to the failure but worth fixing at the same time (setup-node still targets Node 18, which GitHub is deprecating).

Local `npm run build` succeeds, confirming the code itself is fine.

## Fix

1. **Regenerate `package-lock.json`** so it matches `package.json` (adds entries for `@supabase/supabase-js`, `@lovable.dev/mcp-js`, and any other drift).
   - Run: `npm install --package-lock-only`
   - Commit the updated lockfile. Do not touch `bun.lock`.

2. **Bump the workflow to Node 20** in `.github/workflows/pages.yml` to clear the deprecation warning and keep the runner on a supported LTS.
   - `node-version: '18'` → `node-version: '20'`

No source, router, or portal changes. `.env` is already committed, so Vite build sees the Supabase URL/key.

## Files

- `package-lock.json` — regenerated
- `.github/workflows/pages.yml` — bump Node to 20

## Verification

After push, watch the `build-and-deploy` job on GitHub Actions:
- `npm ci` completes without lockfile errors
- `npm run build` finishes
- `gh-pages` branch updates and the site (including `/portal/login` via the SPA fallback added last turn) loads.
