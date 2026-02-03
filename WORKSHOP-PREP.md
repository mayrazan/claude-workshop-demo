# Workshop Claude Code - Preparação

## Objetivo do Workshop

Apresentar em **30 minutos** para o time de tech da Winnin como o Claude Code pode acelerar o desenvolvimento no dia a dia, demonstrando um fluxo completo de desenvolvimento integrado com as ferramentas que usamos:

**Ferramentas demonstradas:**
- **Linear** - Criação automática de issues/tarefas
- **Figma MCP** - Design para código
- **GitHub** - Commits e PRs
- **PR Review Toolkit** - Code review automático
- **Chrome DevTools** - Debug no browser
- **Skills** - Best practices (react-best-practices, etc.)

**Projeto exemplo:** Implementar uma página de contato (Header + Formulário) usando o design do Untitled UI

**Mensagem principal:** De ideia → código → PR em minutos, com qualidade e boas práticas

---

## Status: Quase Pronto

**Data da preparação:** 2026-02-02

---

## O que já está pronto

### Projeto
- [x] Repositório: https://github.com/mayrazan/claude-workshop-demo
- [x] React + TypeScript + Vite configurado
- [x] lucide-react instalado (ícones)

### Design
- [x] Usando Untitled UI (não precisa criar nada)
- [x] Link: https://www.figma.com/design/ngs2869sPLSWW8UaEvzSMN/Untitled-UI?node-id=1639-343791
- [x] Escopo definido: Header + Formulário de contato

### Slides
- [x] `slides.html` - 6 slides prontos
- [x] Navegação: setas ← → ou clique
- [x] Para abrir: `open slides.html` ou acessar no browser

### Integrações Testadas
- [x] Figma MCP - funcionando (conseguimos pegar screenshot)
- [x] Linear - conexão OK (listou os times)
- [x] GitHub - repo criado e push funcionando

---

## O que falta fazer

### Antes do workshop
- [x] ~~Criar time no Linear só para o teste~~ (usando time "Claude teste")
- [x] Criar projeto no Linear para a demo (projeto "Pagina de Contato")
- [ ] Fazer dry-run completo do workshop
- [ ] Testar Chrome DevTools MCP

### Projeto Linear criado
- **Nome:** Pagina de Contato
- **Time:** Claude teste
- **URL:** https://linear.app/winnin/project/pagina-de-contato-6a6fbc2bd3ca
- **Status:** Vazio (issues serao criadas ao vivo)

---

## Informações importantes

### Node IDs do Figma (para usar na demo)
- Desktop completo: `1639:343791`
- Header: `1639:343792`
- Contact form: `1639:377930`

### Comandos da demo (em ordem)
```
1. Descrever a feature e pedir plano + issues no Linear
2. /figma:implement-design [URL do Header]
3. /figma:implement-design [URL do Form]
4. "Revise seguindo react-best-practices"
5. Testar com Chrome DevTools
6. /commit
7. Criar PR
8. /pr-review-toolkit:review-pr
```

### Passo bônus: Diagrama Mermaid (opcional, +2 min)
Após criar o PR, demonstrar documentação automática:
```
9. "Gere um diagrama Mermaid do fluxo de submit do formulário de contato"
```

**Resultado esperado:** Diagrama de sequência mostrando:
- Usuário preenche form → Validação → API call → Feedback

**Como mostrar:**
- Copiar o código Mermaid gerado
- Colar no PR description (GitHub renderiza nativamente)
- Mostrar que a documentação visual já está no PR

**Frase de efeito:** "Em 30 segundos você tem documentação visual que normalmente levaria 15 minutos no draw.io"

### Estrutura do workshop (30 min)
1. Intro + Slides (3 min)
2. Planejamento com Linear (5 min)
3. Figma → Código (8 min)
4. Implementação (8 min)
5. Code Review + PR (4 min)
6. Q&A (2 min)

---

## Arquivos de referência

- **Plano completo:** `~/.claude/plans/smooth-shimmying-whisper.md`
- **Slides:** `slides.html`
- **Este resumo:** `WORKSHOP-PREP.md`

---

## Parte 2: Spec-Driven Development (Bônus)

Uma extensão opcional de 15-20 min demonstrando **Spec-kit** (GitHub) para features complexas.

- **Preparação:** `WORKSHOP-PREP-PART2.md`
- **Slides:** `slides-part2.html`
- **Spec backup:** `specs/notification-system.spec.md`
- **Código base:** `src/types/notification.types.ts`, `src/services/NotificationChannel.ts`

**Ferramenta:** [Spec-kit](https://github.com/github/spec-kit) - Workflow: Specify → Plan → Tasks → Implement

**Cenário:** Sistema de notificações multi-canal com rate limiting, agregação e horário silencioso.

---

## Para retomar

Abra o Claude Code no projeto e diga:
> "Vamos continuar a preparação do workshop. Leia o WORKSHOP-PREP.md para contexto."
