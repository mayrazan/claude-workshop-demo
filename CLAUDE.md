# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

Workshop demo project showcasing Claude Code integration with Linear, Figma MCP, GitHub, and other tools. The goal is to demonstrate a complete development workflow: from design (Untitled UI Figma) to code to PR.

## Development Commands

```bash
npm run dev      # Start development server (Vite)
npm run build    # Type-check with tsc, then build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Tech Stack

- React 19 with TypeScript
- Vite 7 for bundling
- lucide-react for icons
- ESLint with TypeScript and React hooks rules

## Architecture

Standard Vite React setup:
- `src/main.tsx` - App entry point with StrictMode
- `src/App.tsx` - Main application component
- `src/index.css` - Global styles
- `src/App.css` - Component styles

## Workshop Resources

- Design reference: Untitled UI Figma (`node-id=1639-343791`)
- Slides: `slides.html` (navigate with arrow keys)
- Preparation checklist: `WORKSHOP-PREP.md`
