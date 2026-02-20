# Claude Code Workshop Demo

Projeto de demonstração do workshop de Claude Code - do design ao PR em minutos.

## Fluxo do Workshop

```mermaid
flowchart LR
    subgraph Design
        F[🎨 Figma]
    end

    subgraph Desenvolvimento
        C[🤖 Claude Code]
        R[⚛️ React Component]
    end

    subgraph Entrega
        G[🐙 GitHub PR]
        L[📋 Linear Issue]
    end

    F -->|"implement design"| C
    C -->|gera código| R
    R -->|/commit| G
    L -.->|tracked| G
```

## Tech Stack

- React 19 + TypeScript
- Vite 7
- lucide-react (ícones)

## Comandos

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build de produção
npm run lint     # Verificar código
npm run preview  # Preview do build
```

## Recursos

- [Figma Design](https://www.figma.com/design/...) - Untitled UI