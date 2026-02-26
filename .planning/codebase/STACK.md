# Technology Stack

**Analysis Date:** 2026-02-20

## Languages

**Primary:**
- TypeScript 5.9 - Application and configuration code

**Secondary:**
- JavaScript - Package configuration (eslint.config.js)

## Runtime

**Environment:**
- Node.js (version specified via package.json type: "module" for ES modules)

**Package Manager:**
- npm - Package management
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- React 19.2.0 - UI framework
- Vite 7.2.4 - Build tool and development server

**Utilities:**
- lucide-react 0.563.0 - Icon library

**Build/Dev:**
- @vitejs/plugin-react 5.1.1 - React integration for Vite
- Vite - Fast module replacement (HMR) during development

## Key Dependencies

**Critical:**
- react 19.2.0 - Core UI library
- react-dom 19.2.0 - React DOM rendering
- lucide-react 0.563.0 - Lucide icon set for React

**Development:**
- typescript ~5.9.3 - TypeScript compiler
- @types/react 19.2.5 - React type definitions
- @types/react-dom 19.2.3 - React DOM type definitions
- @types/node 24.10.1 - Node.js type definitions

## Linting & Code Quality

**Framework:**
- ESLint 9.39.1 - JavaScript/TypeScript linter

**Plugins:**
- @eslint/js 9.39.1 - ESLint base rules
- typescript-eslint 8.46.4 - TypeScript-specific linting rules
- eslint-plugin-react-hooks 7.0.1 - React hooks best practices
- eslint-plugin-react-refresh 0.4.24 - Vite React refresh validation

**Dependencies:**
- globals 16.5.0 - Global variable definitions for different environments

## Configuration

**Environment:**
- No `.env` files required - Project is a client-side React application

**Build:**
- `vite.config.ts` - Vite configuration with React plugin
- `tsconfig.json` - TypeScript root configuration that references app and node configs
- `tsconfig.app.json` - Application TypeScript configuration
  - Target: ES2022
  - Module: ESNext
  - JSX: react-jsx
  - Strict mode enabled
- `tsconfig.node.json` - Build tools TypeScript configuration
  - Target: ES2023
  - Module: ESNext
- `eslint.config.js` - ESLint configuration using flat config format
- `index.html` - Entry HTML file with module script source

## Platform Requirements

**Development:**
- Node.js (modern version supporting ES modules)
- npm for dependency management
- Modern browser with ES2022 support for development

**Production:**
- Modern browser with ES2022 support
- Static hosting capable of serving Single Page Application

## Build & Development Scripts

```bash
npm run dev      # Start Vite development server with HMR
npm run build    # Type-check with TypeScript, then build with Vite
npm run lint     # Run ESLint on TypeScript/JavaScript files
npm run preview  # Preview production build locally
```

## Key Architectural Patterns

**Module System:**
- ES modules (type: "module" in package.json)
- ESNext module output for dynamic imports and tree-shaking

**Type Safety:**
- Strict TypeScript with all strict flags enabled
- No unused locals/parameters allowed
- Bundler module resolution for optimal bundling

**Development Experience:**
- Hot Module Replacement (HMR) via Vite for instant feedback
- React Refresh for stateful component updates during development

---

*Stack analysis: 2026-02-20*
