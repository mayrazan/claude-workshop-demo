# Codebase Structure

## Directory Layout

```
claude-workshop-demo/
├── .claude/                    # Claude Code configuration
│   ├── commands/               # Custom slash commands (speckit.*)
│   └── settings.json           # Claude Code permissions
├── .specify/                   # Speckit feature workflow tool
│   ├── memory/
│   │   └── constitution.md     # Project constitution / principles
│   ├── scripts/bash/           # Speckit automation scripts
│   └── templates/              # Spec, plan, tasks, checklist templates
├── public/
│   └── vite.svg                # Static public assets
├── src/
│   ├── assets/
│   │   └── react.svg           # React logo asset
│   ├── App.css                 # Component-level styles
│   ├── App.tsx                 # Main application component
│   ├── index.css               # Global CSS reset and base styles
│   └── main.tsx                # Application entry point
├── .gitignore
├── CLAUDE.md                   # Claude Code project instructions
├── README.md                   # Project documentation
├── eslint.config.js            # ESLint flat config
├── index.html                  # HTML shell (Vite entry)
├── package.json
├── tsconfig.json               # Root TypeScript config (references)
├── tsconfig.app.json           # App TypeScript config (strict mode)
├── tsconfig.node.json          # Node/Vite TypeScript config
└── vite.config.ts              # Vite build configuration
```

## Key Locations

| Purpose | Path |
|---------|------|
| Application root component | `src/App.tsx` |
| React DOM mount point | `src/main.tsx` |
| Global styles | `src/index.css` |
| Component styles | `src/App.css` |
| HTML entry | `index.html` |
| Build config | `vite.config.ts` |
| Lint config | `eslint.config.js` |
| Type config | `tsconfig.app.json` |
| Custom commands | `.claude/commands/` |

## Naming Conventions

- **Components**: PascalCase files matching component name (`App.tsx`)
- **Styles**: Co-located CSS files matching component (`App.css`)
- **Assets**: Lowercase with extension (`react.svg`, `vite.svg`)
- **Config files**: Lowercase with dots (`vite.config.ts`, `eslint.config.js`)
- **TypeScript**: `.tsx` for React components, `.ts` for plain TypeScript

## Source Organization

Currently minimal — single `App.tsx` component. As the app grows, expected expansion:

```
src/
├── components/     # Reusable UI components
├── pages/          # Route-level page components
├── hooks/          # Custom React hooks
├── types/          # Shared TypeScript types
├── utils/          # Pure utility functions
└── assets/         # Static assets
```

## Configuration Files

- **`tsconfig.json`**: Root config with project references
- **`tsconfig.app.json`**: Strict TypeScript for `src/` (target: ES2020, bundler module resolution)
- **`tsconfig.node.json`**: Vite config TypeScript (target: ES2022)
- **`eslint.config.js`**: Flat config with TypeScript + React hooks rules
- **`vite.config.ts`**: React plugin, minimal configuration

## Special Directories

- **`.claude/commands/`**: Speckit custom slash commands for structured feature development workflow
- **`.specify/`**: Speckit tool configuration — constitution, templates, and automation scripts for spec-driven development
