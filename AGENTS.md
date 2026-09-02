<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->


# WickUI: Required Import Pattern

WickUI **components** must always be dynamically imported with `ssr: false`. Never use static imports for components — they will break server rendering.

**Exception — hooks and types:** Hooks (`useWuShowToast`, `useWuSidebar`, etc.) and TypeScript types (`IWuTableColumnDef`, `IWuTabItem`, etc.) must be imported statically. Hooks cannot be dynamically imported. Use `import type` for type-only imports.

```typescript
// ✅ Correct — component
const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);

// ✅ Correct — hook (static import is required)
import { useWuShowToast } from '@npm-questionpro/wick-ui-lib';

// ✅ Correct — type (static import, erased at compile time)
import type { IWuTableColumnDef } from '@npm-questionpro/wick-ui-lib';

// ❌ Never — component as static import
import { WuButton } from '@npm-questionpro/wick-ui-lib';
```

```typescript
// ✅ Always do this
const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);

// ❌ Never do this — breaks SSR
import { WuButton } from '@npm-questionpro/wick-ui-lib';
```

This is a QuestionPro **satellite** product. Wick UI (`@npm-questionpro/wick-ui-lib`) is the required React library. Studies is Digsite.

Before using any WickUI component, verify its exact prop names in Storybook (latest):
https://main.wick-ui-lib.pages.dev/?path=/docs/components-button--docs

Getting started: https://main.wick-ui-lib.pages.dev/?path=/docs/docs-getting-started--docs
App header / product switcher: https://main.wick-ui-lib.pages.dev/?path=/docs/components-layouts-app-header--docs
React library document (satellite adoption): https://docs.google.com/document/d/1ws0CAVHZjEg26Lz6zrn5q3N0T8ANM_VrCp_LLYcK5PU/edit
Product Switcher Figma (header + switcher config): https://www.figma.com/design/wWgwoKbU7GdleUAtISNBEG/Product-Switcher-Consolidation?node-id=900-31510

**WuTable generic cast:** Dynamic import loses WuTable's generic type parameter. Always cast `data` and `columns` when passing them to the dynamically imported WuTable:

```typescript
<WuTable
  data={items as unknown[]}
  columns={columns as unknown as IWuTableColumnDef<unknown>[]}
  ...
/>
```

Define your `columns` array as `IWuTableColumnDef<YourType>[]` for proper cell renderer typing — the cast only happens at the JSX boundary.


# Client vs. Server Components

- Any file that uses WickUI or browser APIs must have `'use client'` at the top
- Dashboard pages and feature components are almost always client components
- When in doubt, use `'use client'`


# Routing

- All prototype screens live under `src/app/(dashboard)/`
- Route structure: `src/app/(dashboard)/[feature]/page.tsx`
- To add a nav item, edit `src/components/SideNav.tsx` and follow the existing pattern
- The root `/` page returns `null` — do not add content there


# State

- Use `useState` and `useReducer` for all local state — no Redux, Zustand, or Context
- Lift state to the nearest parent page when siblings need to share it
- No data-fetching libraries (React Query, SWR) — mock data is static imports


# TypeScript

- Define explicit types for all mock data shapes — no `any`
- Strict mode is on; the compiler will catch errors
