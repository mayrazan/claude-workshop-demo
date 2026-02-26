# Codebase Concerns

## Summary

This is a minimal Vite scaffold — virtually no production code exists yet. Most concerns are about what's missing rather than what's broken.

---

## Critical Gaps

### No Test Infrastructure
- **Severity:** High
- **Details:** Zero test files, zero testing dependencies. No Vitest, no @testing-library/react.
- **Impact:** Any new code ships without automated validation
- **Fix:** Add Vitest + @testing-library/react before building features

### No Error Boundary
- **Severity:** Medium
- **Details:** `src/main.tsx` mounts App with no error boundary wrapping. Any unhandled render error crashes the entire app.
- **Fix:** Add a top-level `<ErrorBoundary>` in `main.tsx`

### Hardcoded Demo Content
- **Severity:** Low (for now)
- **Details:** `src/App.tsx` is the Vite default template — logo links, counter demo, instructional text. This is placeholder content, not real app logic.
- **Impact:** Everything in App.tsx needs to be replaced before this becomes a real product

---

## Security

### ReDoS Vulnerabilities in Dev Dependencies
- **Severity:** Low (dev-only, not in production bundle)
- **Details:** `ajv` and `minimatch` in the ESLint dependency chain have known ReDoS patterns
- **Impact:** Only affects local development tooling, not deployed app
- **Fix:** `npm audit fix` — or accept risk as dev-only

### External Links Without `rel="noopener noreferrer"`
- **Severity:** Low
- **Details:** `App.tsx` has `<a href="..." target="_blank">` links without `rel="noopener noreferrer"`
- **Impact:** Opens tab-napping vulnerability on demo links
- **Fix:** Add `rel="noopener noreferrer"` to all `target="_blank"` anchors

---

## Performance

### React StrictMode Always Active
- **Severity:** Low
- **Details:** `StrictMode` in `main.tsx` double-invokes effects and renders in development. This is intentional and correct, but worth being aware of if debugging.
- **Impact:** No production impact — StrictMode is automatically disabled in production builds

### No Image Optimization
- **Severity:** Low
- **Details:** SVG assets loaded directly with no optimization pipeline
- **Impact:** Minimal at current scale; revisit when adding real media

---

## Technical Debt

### No Path Aliases
- **Severity:** Low
- **Details:** No `@/` or `~/` path aliases configured in `tsconfig.app.json` or `vite.config.ts`
- **Impact:** As src/ grows, relative imports become unwieldy (`../../../components/Button`)
- **Fix:** Add `paths` in tsconfig + `resolve.alias` in vite.config

### No Environment Variable Support
- **Severity:** Low
- **Details:** No `.env` files, no `VITE_*` variables, no env validation
- **Impact:** Limits configuration for different environments (dev/staging/prod)
- **Fix:** Add `.env.example` and document required env vars as they emerge

### Pinned TypeScript Version
- **Severity:** Low
- **Details:** `typescript: "~5.9.3"` — tilde range only allows patch updates
- **Impact:** Minor version updates require manual intervention
- **Note:** Intentional for stability; revisit when upgrading major versions

---

## Missing Infrastructure

| Item | Priority | Notes |
|------|----------|-------|
| Test framework | High | Required before shipping features |
| Error boundary | Medium | Required for production resilience |
| Path aliases | Low | Add when src/ grows beyond 5 components |
| CI/CD pipeline | Low | Add before team collaboration |
| Lint-staged / Husky | Low | Add for consistent commit quality |
| Accessibility audit | Medium | Run axe-core when UI is built |

---

## Fragile Areas

- **`src/main.tsx`**: Non-null assertion (`document.getElementById('root')!`) — crashes silently if HTML shell lacks `#root` div
- **`App.tsx`**: Entire file is temporary scaffold — high change velocity expected
