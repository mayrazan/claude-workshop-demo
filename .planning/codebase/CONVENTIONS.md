# Coding Conventions

**Analysis Date:** 2026-02-20

## Naming Patterns

**Files:**
- React components: PascalCase with `.tsx` extension (e.g., `App.tsx`)
- Utilities/helpers: camelCase with `.ts` extension
- CSS files: match component name in kebab-case or same as component (e.g., `App.css`)
- Entry points: `main.tsx` for app initialization, `index.css` for globals

**Functions:**
- React components: PascalCase (e.g., `function App()`)
- Regular functions: camelCase (e.g., `createRoot`, `setCount`)
- Event handlers: camelCase prefixed with `on` for native events (e.g., `onClick={() => setCount(...)}`)

**Variables:**
- State: camelCase with descriptive names (e.g., `count`, `setCount`)
- Constants: camelCase (not CONSTANT_CASE) as seen in `src/App.tsx`
- Unused variables: must be declared (enforced by TypeScript `noUnusedLocals`)

**Types:**
- Interfaces/Types: PascalCase (TypeScript strict mode enforced)
- Props interfaces: Named as `{ComponentName}Props` pattern (convention from React ecosystem)

## Code Style

**Formatting:**
- No explicit prettier config detected; ESLint handles style recommendations
- 2-space indentation (inferred from source files and common Vite defaults)
- Semicolons required (ESLint recommended configs enforce this)
- Single quotes preferred (no explicit config, but ESLint defaults apply)

**Linting:**
- Tool: ESLint v9.39.1 with flat config
- Config file: `eslint.config.js`
- Key plugins: `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`
- Key rules:
  - `js.configs.recommended`: JavaScript best practices
  - `tseslint.configs.recommended`: TypeScript strict rules
  - `reactHooks.configs.flat.recommended`: React Hooks rules (avoid missing dependencies, rules of hooks)
  - `reactRefresh.configs.vite`: Fast Refresh support for Vite
- Target: ECMAScript 2020, browser globals only
- Ignore: `dist/` directory

## Import Organization

**Order:**
1. React and React ecosystem imports (e.g., `import { useState } from 'react'`)
2. Local imports from src/ (e.g., `import './App.css'`, `import App from './App.tsx'`)
3. Asset imports (e.g., `import viteLogo from '/vite.svg'`)

**Path Aliases:**
- No path aliases configured in `tsconfig.app.json`
- Relative imports used (e.g., `'./App.tsx'`, `'./index.css'`)
- Absolute imports for assets (e.g., `'/vite.svg'`)

## Error Handling

**Patterns:**
- React errors: Handled implicitly by React.StrictMode in development (detects side effects, deprecated APIs)
- DOM errors: Non-null assertion operator used in production code: `document.getElementById('root')!`
- TypeScript strict mode enabled: `strict: true` prevents null/undefined errors at compile time

## Logging

**Framework:** `console` (no logging library)

**Patterns:**
- Not explicitly used in current codebase
- Would follow standard browser `console.log()`, `console.error()` patterns if needed

## Comments

**When to Comment:**
- Code is self-documenting via clear naming; minimal comments observed
- JSDoc/TSDoc not currently in use for this demo project
- Comments used for configuration notes (e.g., `// https://vite.dev/config/`)

**JSDoc/TSDoc:**
- Not applied in current codebase
- Could be added for exported functions and components following TypeScript best practices

## Function Design

**Size:**
- Small, focused functions (e.g., `App()` component is ~25 lines)
- Event handlers defined inline for simplicity in simple components

**Parameters:**
- Minimal parameters (state managed via `useState`)
- Props would be typed as interfaces in larger components

**Return Values:**
- React components return JSX.Element implicitly
- State setters follow React convention: `setCount`

## Module Design

**Exports:**
- Default exports for React components (e.g., `export default App`)
- Named exports could be used for utilities (none currently)

**Barrel Files:**
- No barrel files (`index.tsx`) in current structure
- Direct imports from component files (e.g., `import App from './App.tsx'`)

## TypeScript Configuration

**Strict Mode:** Enabled
- `strict: true` - All strict type-checking options
- `noUnusedLocals: true` - Error on unused variables
- `noUnusedParameters: true` - Error on unused parameters
- `noFallthroughCasesInSwitch: true` - Error on missing switch cases
- `noUncheckedSideEffectImports: true` - Prevent unsafe side effects in imports
- `jsx: "react-jsx"` - React 17+ automatic JSX transformation
- `module: "ESNext"` - Modern ES modules

**Module Resolution:**
- `moduleResolution: "bundler"` - For Vite bundler compatibility
- `verbatimModuleSyntax: true` - Preserve import/export syntax (no auto-removal)

---

*Convention analysis: 2026-02-20*
