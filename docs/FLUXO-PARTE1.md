# Fluxo da Parte 1 - Workshop Claude Code

## Visao Geral

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   LINEAR    │───▶│   PLANEJAR  │───▶│   FIGMA     │───▶│ IMPLEMENTAR │───▶│     PR      │
│ Criar Issue │    │  Ver Plano  │    │  → Codigo   │    │   Ajustes   │    │   Review    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
     3 min              3 min              7 min              7 min              4 min
```

---

## Parte 2: Criar Issues no Linear (3 min)

### Prompt:
```
Preciso implementar uma pagina de contato para o site:
- Header com logo e navegacao
- Formulario de contato com nome, email e mensagem
- Design baseado no Untitled UI (Figma)

Crie issues no Linear no projeto "Pagina de Contato".
```

### Output esperado:
- Issues criadas no Linear com descricoes detalhadas
- Cada issue com escopo claro

---

## Parte 3: Planejar a Issue (3 min) ⭐ PLANEJAMENTO ESTRUTURADO

### Prompt:
```
Pegue a issue do Header no projeto "Pagina de Contato" no Linear e me mostre:
1. O que precisa ser feito
2. Quais arquivos vou criar/modificar
3. Como vai ficar a estrutura de componentes

Depois que eu aprovar, implementa usando o design do Figma.
```

### O que a audiencia ve:

| Etapa | Acao do Claude | Valor demonstrado |
|-------|----------------|-------------------|
| 1 | Busca issue no Linear | Integracao MCP funcionando |
| 2 | Le estrutura do projeto | Entende contexto existente |
| 3 | Apresenta plano claro | Transparencia antes de codar |
| 4 | Aguarda aprovacao | Controle humano no fluxo |

### Output esperado (exemplo):
```
## Plano de Implementacao: Header

### O que precisa ser feito:
- Criar componente Header com logo e navegacao
- Seguir design do Untitled UI (node 1639:343792)
- Responsivo para mobile/desktop

### Arquivos a criar/modificar:
- src/components/Header/Header.tsx (novo)
- src/components/Header/Header.css (novo)
- src/App.tsx (importar Header)

### Estrutura de componentes:
Header/
├── Header.tsx      # Componente principal
├── Header.css      # Estilos
├── Logo.tsx        # Sub-componente logo
└── NavLinks.tsx    # Links de navegacao

Aprovar para implementar?
```

### Fala sugerida:
> "Reparem: ele nao comeca a escrever codigo direto. Primeiro mostra O QUE vai fazer, ONDE vai mexer, e COMO vai organizar. So implementa depois que eu aprovo."

---

## Parte 4: Figma para Codigo (7 min)

### Prompt (apos aprovar o plano):
```
/figma:implement-design https://www.figma.com/design/ngs2869sPLSWW8UaEvzSMN/Untitled-UI?node-id=1639-343792
```

### O que acontece:
- Claude le o design do Figma
- Extrai cores, espacamentos, tipografia
- Gera componentes React seguindo o plano aprovado

---

## Parte 5: Implementacao e Ajustes (7 min)

### Prompt:
```
Revise os componentes seguindo react-best-practices.
Verifique performance, acessibilidade e boas praticas.
```

### Rodar o projeto:
```bash
npm run dev
```

---

## Parte 6: PR + Review (4 min)

### Commits:
```
/commit
```

### Criar PR:
```
Crie um PR para main com as mudancas
```

### Code Review:
```
/pr-review-toolkit:review-pr
```

---

## Resumo do Fluxo

```
ISSUE (Linear)
    │
    ▼
PLANEJAR ◀── "Me mostre o plano antes de implementar"
    │
    ▼
APROVAR ◀── Controle humano
    │
    ▼
FIGMA → CODIGO
    │
    ▼
REVISAR + AJUSTAR
    │
    ▼
PR + CODE REVIEW
```

**Diferencial:** O planejamento explicito mostra que o Claude nao e uma "caixa preta" - ele mostra o que vai fazer e espera aprovacao.
