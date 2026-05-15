# AGENTS.md — plugin-on-fetch

Envelop/GraphQL Mesh plugin (`@adobe/plugin-on-fetch`) that runs a custom JavaScript handler per configured source immediately before the mesh makes an HTTP fetch request. Published publicly to NPM via GitHub Actions on merge to `main`.

---

## Domain Concepts

### onFetch hook
Implements the GraphQL Mesh `onFetch` hook. The plugin fires once per HTTP fetch per configured source. The handler receives `url`, `options` (RequestInit), `context`, and `info` (GraphQLResolveInfo) — but never `fetchFn` or `setFetchFn` (see Gotcha #2).

### Config format
Each source is configured as a numbered entry in the `onFetch` plugin array, with `source` (name matching the mesh source) and `handler` (path to the JS file relative to `baseDir`).

---

## Project Structure

Core logic in `src/index.js`. TypeScript types for consumers in `src/types.ts`. Entry point `index.js` re-exports from `src/`. No build step — source is shipped directly.

---

## Critical Gotchas

### 1. Handler files are loaded with dynamic `import()` — not `require()`
Handler modules are loaded via `await import(handlerFilePath)` rather than `require()`. This is intentional for Cloudflare Workers / edge compatibility. Handler files must be ES modules or compatible with dynamic import. CommonJS-only modules may not load correctly in edge environments.

### 2. `fetchFn` and `setFetchFn` are explicitly excluded from the handler payload
The plugin destructures these out of the `onFetch` execution context before passing anything to the user handler. A handler cannot intercept or replace the fetch function — by design.

### 3. All errors are swallowed silently — nothing throws
Four distinct silent failure modes exist in `src/index.js`:
- Handler module fails to load → logged, execution skipped
- Handler function not found in module → logged, execution skipped  
- Handler execution throws → logged, continues
- Plugin initialisation fails → returns empty object, disabling the plugin entirely

Tests and callers will not see exceptions from any of these. Debugging requires checking logs.

### 4. Memoized handler loading — handler files are not reloaded between requests
Once a handler module is successfully imported for a source, it is cached in memory. Changes to handler files on disk are not picked up without restarting the mesh process.
