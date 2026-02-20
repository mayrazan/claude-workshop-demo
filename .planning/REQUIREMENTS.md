# Requirements: AI Meeting Notes & Action Tracker – MVP

**Defined:** 2026-02-20
**Core Value:** Usuário cola texto de reunião e obtém action items editáveis — eliminando perda de contexto e documentação manual

## v1 Requirements

### AI Processing

- [ ] **AI-01**: Usuário pode colar ou digitar texto de reunião em um campo de entrada
- [ ] **AI-02**: Sistema gera resumo estruturado da reunião via GPT-4o automaticamente após submissão
- [ ] **AI-03**: Sistema extrai action items automaticamente com descrição, responsável e prioridade detectados do texto

### Action Items

- [ ] **ITEM-01**: Usuário pode editar inline a descrição, responsável e prioridade de cada action item
- [ ] **ITEM-02**: Usuário pode alterar o status de cada action item (todo / in-progress / done)
- [ ] **ITEM-03**: Usuário pode deletar action items incorretos ou irrelevantes
- [ ] **ITEM-04**: Dados de action items são persistidos localmente e sobrevivem ao page refresh

### Dashboard

- [ ] **DASH-01**: Usuário pode visualizar todos os action items em uma lista centralizada
- [ ] **DASH-02**: Usuário pode filtrar action items por status (todo / in-progress / done)

## v2 Requirements

### Dashboard

- **DASH-03**: Usuário pode filtrar action items por responsável
- **DASH-04**: Usuário pode visualizar histórico de reuniões anteriores processadas

### Export

- **EXP-01**: Usuário pode exportar resumo + action items como markdown para copiar/colar

## Out of Scope

| Feature | Reason |
|---------|--------|
| Autenticação / login | Sistema interno, usuário único — auth é escopo próprio |
| Multi-usuário | Sem necessidade para MVP interno |
| Upload de áudio/vídeo | Problema diferente (transcrição); aceitar apenas texto no MVP |
| Integração com Linear/Slack | Alta complexidade, valor incerto até core ser validado |
| Due date automática do texto | Parsing de NLP complexo; defer para v2+ |
| App mobile nativo | Web responsivo é suficiente |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AI-01 | Phase 1 | Pending |
| AI-02 | Phase 1 | Pending |
| AI-03 | Phase 1 | Pending |
| ITEM-04 | Phase 2 | Pending |
| ITEM-01 | Phase 3 | Pending |
| ITEM-02 | Phase 3 | Pending |
| ITEM-03 | Phase 3 | Pending |
| DASH-01 | Phase 3 | Pending |
| DASH-02 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 9 total
- Mapped to phases: 9
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-20*
*Last updated: 2026-02-20 after initial definition*
