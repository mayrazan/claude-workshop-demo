# Testing

## Current State

**No tests exist.** The project has no test infrastructure, no test files, and no testing dependencies.

## Recommended Setup

For a Vite + React 19 + TypeScript project, the standard stack is:

| Tool | Purpose |
|------|---------|
| **Vitest** | Unit/integration test runner (Vite-native, fast) |
| **@testing-library/react** | Component testing utilities |
| **@testing-library/user-event** | User interaction simulation |
| **happy-dom** or **jsdom** | DOM environment for tests |

### Installation

```bash
npm install -D vitest @testing-library/react @testing-library/user-event happy-dom
```

### Vite Config Update

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
})
```

## Recommended Test Structure

```
src/
├── __tests__/          # Integration tests
├── components/
│   └── Button/
│       ├── Button.tsx
│       └── Button.test.tsx   # Co-located unit tests
└── test/
    └── setup.ts              # Global test setup
```

## Test Patterns

### Component Test

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App', () => {
  it('increments counter on button click', async () => {
    render(<App />)
    const button = screen.getByRole('button', { name: /count is/i })
    await userEvent.click(button)
    expect(button).toHaveTextContent('count is 1')
  })
})
```

### Hook Test

```ts
import { renderHook, act } from '@testing-library/react'
import { useCounter } from './useCounter'

it('increments count', () => {
  const { result } = renderHook(() => useCounter())
  act(() => result.current.increment())
  expect(result.current.count).toBe(1)
})
```

## Coverage Configuration

```ts
// vite.config.ts (test section)
coverage: {
  provider: 'v8',
  reporter: ['text', 'html'],
  exclude: ['node_modules/', 'src/test/'],
}
```

## Scripts to Add

```json
{
  "test": "vitest",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest run --coverage"
}
```

## Priority Areas to Test

1. **App.tsx** — counter interaction (existing demo logic)
2. Any new components added during development
3. Custom hooks (business logic isolation)
4. Utility functions (pure functions, easy to test)
