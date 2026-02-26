# Project Research Summary

**Project:** AI Meeting Notes & Action Tracker – MVP
**Domain:** AI-powered productivity tool / task management
**Researched:** 2026-02-20
**Confidence:** HIGH

## Executive Summary

Este é um app de produtividade interno que processa texto de reuniões via GPT-4o e produz resumos estruturados + action items editáveis. O padrão estabelecido para esse tipo de app é uma arquitetura frontend + backend leve: React para a UI, Express.js como proxy seguro para chamadas à OpenAI API, e SQLite para persistência local. A chave da viabilidade é o uso de **structured outputs** do GPT-4o — que garante JSON válido e tipado sem parsing frágil.

O principal risco do projeto não é técnico, mas de segurança: a API key da OpenAI nunca pode estar no bundle do Vite (VITE_* vars são públicas). Isso é não-negociável e define a necessidade de um backend desde a Fase 1. O segundo risco é a qualidade do prompt — testar com dados reais de reuniões (não demos limpos) deve acontecer antes de qualquer release.

A sequência de build recomendada é: backend + IA primeiro (core value), depois persistência, depois dashboard/filtros. Cada fase pode ser usada independentemente, validando valor antes de construir complexidade.

## Key Findings

### Recommended Stack

O projeto já tem React 19 + TypeScript + Vite 7 — a base está pronta. O que precisa ser adicionado: **Express.js** como backend (para chamadas seguras à OpenAI), **better-sqlite3** para persistência local sem servidor externo, **openai SDK ^4.x** com structured outputs, e **zod** para validação do output da IA.

**Core technologies:**
- Express ^5.x: backend proxy para OpenAI + API CRUD — único ponto de acesso à API key
- openai ^4.96.x: SDK oficial com suporte a structured outputs (JSON schema garantido)
- better-sqlite3 ^11.x: SQLite síncrono para Node.js — zero config, zero servidor externo
- zod ^3.x: validação de schema do output da IA — previne crashes por resposta malformada
- zustand ^5.x: state management no frontend — leve, React 19 compatível

### Expected Features

**Must have (table stakes):**
- Textarea para colar texto de reunião — interação central
- AI summary + action item extraction — core value
- Assignee, priority, status por action item — o "tracker" da ferramenta
- Inline edit e delete de action items — IA é imperfeita, correção manual é essencial
- Dashboard com filtro por status e assignee — visibilidade do trabalho
- Persistência local — sobreviver ao page refresh

**Should have (competitive):**
- Histórico de reuniões processadas — "onde está aquela reunião de semana passada?"
- Export para markdown — compartilhar resultado sem integrações

**Defer (v2+):**
- Due date extraction automática do texto
- Integrações com Linear, Slack
- Autenticação / multi-usuário
- Transcrição de áudio

### Architecture Approach

Arquitetura de dois processos no desenvolvimento: Vite (porta 5173) + Express (porta 3001), com proxy configurado no vite.config.ts (`/api` → backend). Em produção, Express serve tanto a API quanto o build estático do Vite. O SQLite roda dentro do processo Express (better-sqlite3 é síncrono). GPT-4o é chamado com `response_format: json_schema` — output garantido e validado via zod antes de persistir.

**Major components:**
1. MeetingInput (React) — textarea + submit, dispara POST /api/process
2. Express API — routes para /api/process (OpenAI) + CRUD /api/meetings + /api/action-items
3. OpenAI Service (backend) — prompt engineering + structured output parsing
4. SQLite DB (backend) — persist meetings e action items
5. Dashboard (React) — list view com filtros client-side, state via zustand

### Critical Pitfalls

1. **API key no frontend** — VITE_OPENAI_API_KEY expõe a key no bundle; usar backend proxy + .env server-only
2. **Output de IA não validado** — JSON.parse sem schema causa crashes; usar structured outputs + zod
3. **Sem estado de loading** — chamadas à IA levam 10-30s; sem spinner o usuário clica múltiplas vezes
4. **Sem persistência** — action items em useState são perdidos no refresh; persistir no SQLite é obrigatório para o MVP
5. **Prompt testado só com dados limpos** — testar com ao menos 5 reuniões reais antes de considerar pronto

## Implications for Roadmap

### Phase 1: Backend + AI Core

**Rationale:** O core value do produto é a extração de IA — tudo mais depende disso. O backend é necessário desde o início por segurança (API key). Não pode ser deferido.
**Delivers:** Express server rodando, endpoint POST /api/process funcionando, GPT-4o retornando summary + action items validados
**Addresses:** Text input, AI summary, action item extraction
**Avoids:** API key exposure, unvalidated AI output

### Phase 2: Persistence + CRUD

**Rationale:** Sem persistência o app é um brinquedo. Action items devem sobreviver ao page refresh para ser um "tracker".
**Delivers:** SQLite schema, meetings e action items persistidos, endpoints CRUD, dados carregados no startup
**Uses:** better-sqlite3, express routes
**Implements:** Storage layer

### Phase 3: Dashboard + Filters + Polish

**Rationale:** Com IA + persistência funcionando, a camada de visualização completa o produto.
**Delivers:** Dashboard com todos os action items, filtros por status e assignee, inline edit, UX polish
**Uses:** zustand, UI components
**Implements:** Frontend completo

### Phase Ordering Rationale

- Phase 1 antes de Phase 2: não faz sentido persistir dados que ainda não existem
- Phase 2 antes de Phase 3: o dashboard precisa de dados reais para ser testado
- Backend primeiro: a segurança da API key é não-negociável e define a arquitetura

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** Prompt engineering para GPT-4o structured outputs — testar com dados reais, iterar

Phases with standard patterns (skip research-phase):
- **Phase 2:** CRUD + SQLite — padrão estabelecido, sem surpresas esperadas
- **Phase 3:** React dashboard com filtros — padrão bem documentado

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | React 19 + Express + better-sqlite3 + openai SDK são escolhas estabelecidas |
| Features | HIGH | Baseado em análise de produtos similares (Otter.ai, Fireflies, etc.) |
| Architecture | HIGH | Padrão Vite + Express proxy é amplamente documentado |
| Pitfalls | HIGH | API key exposure e AI output validation são problemas conhecidos e documentados |

**Overall confidence:** HIGH

### Gaps to Address

- **Qualidade do prompt**: Só pode ser validada com dados reais de reunião. Reservar tempo em Phase 1 para iteração.
- **Performance do SQLite com reuniões longas**: Baixo risco para MVP (uso interno), mas monitorar.

## Sources

### Primary (HIGH confidence)
- OpenAI docs — structured outputs / json_schema response format
- Vite docs — server.proxy configuration
- better-sqlite3 README — Node.js compat

### Secondary (MEDIUM confidence)
- Análise de feature sets: Otter.ai, Fireflies.ai (product pages públicas)
- React 19 + Zustand 5 compatibility (useSyncExternalStore)

---
*Research completed: 2026-02-20*
*Ready for roadmap: yes*
