# AI Meeting Notes & Action Tracker – MVP

## What This Is

Sistema interno que transforma notas ou transcrições de reuniões em resumos estruturados e action items acionáveis. O usuário cola o texto da reunião, a IA (GPT-4o) extrai automaticamente tarefas com responsáveis e prioridades, e um dashboard permite acompanhar o status de cada item. Construído sobre a base React 19 + TypeScript + Vite do projeto existente.

## Core Value

O usuário cola o texto de uma reunião e em segundos tem uma lista de action items editável — eliminando perda de contexto pós-reunião e documentação manual.

## Requirements

### Validated

- ✓ Setup React 19 + TypeScript + Vite — existing codebase
- ✓ ESLint + build pipeline configurados — existing codebase
- ✓ lucide-react disponível para ícones — existing codebase

### Active

- [ ] Usuário pode colar texto de reunião em um campo de entrada
- [ ] IA (GPT-4o) gera resumo estruturado da reunião automaticamente
- [ ] IA extrai action items com responsável, prioridade e prazo
- [ ] Usuário pode editar, deletar e alterar status de cada action item
- [ ] Dashboard exibe todos os action items organizados por status/responsável
- [ ] Filtros por responsável e status no dashboard
- [ ] Dados persistidos localmente (SQLite ou JSON)
- [ ] Layout responsivo

### Out of Scope

- Integração com Linear, Slack ou ferramentas externas — MVP standalone first
- Multi-usuário / autenticação — sistema interno, usuário único
- Upload de arquivos de áudio/vídeo — apenas texto no MVP
- App mobile nativo — web responsivo é suficiente

## Context

- Codebase existente: React 19 + TypeScript + Vite 7, com lucide-react
- Processamento de IA: OpenAI GPT-4o via API
- Persistência: SQLite (via better-sqlite3) ou JSON local
- Problema central: equipe perde contexto de reuniões, accountability baixa, documentação manual consome tempo
- Usuários: time interno da Winnin

## Constraints

- **Tech Stack**: React 19 + TypeScript + Vite — herança do projeto base
- **IA API**: OpenAI GPT-4o — escolha do usuário
- **Persistência**: Local (SQLite/JSON) — sem servidor de banco externo no MVP
- **Scope**: Standalone — sem integrações externas no MVP

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| OpenAI GPT-4o para processamento | Familiaridade do time, boa performance em extração estruturada | — Pending |
| Persistência local (SQLite/JSON) | Simplicidade para MVP, sem dependência de banco externo | — Pending |
| Standalone sem integrações | Reduz escopo do MVP, foco no core value | — Pending |

---
*Last updated: 2026-02-20 after initialization*
