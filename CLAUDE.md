@AGENTS.md

We are building only the frontend/UX prototype for a product that's part of QuestionPro's Suite.

Do not build backend APIs, database schema, auth, sync engine, or production integrations.

## Core Concepts

**Product:** User_Experience (QuestionPro **satellite** product)
**What it does:** It is a product to manage qualitative research.
**Primary users:** Researchers
**Key entities:** Let's start with a simple side bar with the following things : Usability tests, Interviews, Focus groups and Studies. each has a list of studies/tests
**Studies:** Studies **is Digsite**. Digsite patterns apply there. The rest of this product stays satellite.
**Primary actions:** Currently, view the studies/tests


## Workflow

When given a task:

1. Read `PRD.md` first — it is the source of truth for all screens, flows, and terminology
2. Identify which screens and flows the task covers
3. Build in this order: main list/index view → detail view → modals and side panels
4. Use mock data from the start — never wait for or build a real API
5. Make every button and link do something, even if it just navigates to a placeholder page or shows a toast


## File & Folder Conventions

```
src/
├── app/
│   └── (dashboard)/
│       └── [feature]/
│           ├── page.tsx              ← list or index view
│           └── [id]/
│               └── page.tsx          ← detail view
├── components/
│   └── [feature]/                    ← feature-specific components
│       └── [ComponentName].tsx
└── data/
    └── mock-[feature].ts             ← all mock data lives here, never inline it
```

- Add new nav items in `src/components/SideNav.tsx` — follow the existing pattern
- One route per major feature under `(dashboard)/`
- Keep all mock data in `src/data/` — never hardcode it inside components


## Mock Data

- All mock data goes in `src/data/mock-[feature].ts` as exported typed arrays or objects
- Use realistic values — proper names, real-looking dates, meaningful numbers; never "foo", "bar", "test"
- Include 8–15 records so lists look real and pagination/filtering is demonstrable
- Always include edge cases: one item with a very long name, one with missing optional fields
- Use `date-fns` (already installed) for any date formatting


## UX Principles

- Use terminology exactly as written in `PRD.md` — never paraphrase labels or headings
- Every button must do something: navigate, open a modal, or show a WuToast
- Show an empty state (illustration or message + CTA) when a list has no items
- Use WuToast (already mounted in the layout) for success and error feedback on actions
- Use modals for confirmations ("Are you sure?") and inline forms
- Keep interactions self-contained — a prototype user should never hit a dead end


## UI Library

This is a QuestionPro **satellite product**. Use QuestionPro Wick UI exclusively (`@npm-questionpro/wick-ui-lib`).

- React library document (adoption for satellite products): https://docs.google.com/document/d/1ws0CAVHZjEg26Lz6zrn5q3N0T8ANM_VrCp_LLYcK5PU/edit
- Storybook (latest components and props): https://main.wick-ui-lib.pages.dev/?path=/docs/components-button--docs
- Product Switcher Figma (app header layout and switcher): https://www.figma.com/design/wWgwoKbU7GdleUAtISNBEG/Product-Switcher-Consolidation?node-id=900-31510
- Do not use shadcn/ui or any other component library
- Tailwind is for layout, spacing, and minor styling only — not for building things Wick UI already provides
- Before using a Wick UI component, check its props in Storybook
- Shell chrome is `WuAppHeader` + `WuSidebar`. Configure the product switcher from the Figma file; do not rebuild it


## Scaffold & Reusable Patterns

The following are already built — use them instead of building from scratch:

| Pattern | File | Use for |
|---|---|---|
| Page header | `src/components/ui/PageHeader.tsx` | Every page — title, description, action button |
| Empty state | `src/components/ui/EmptyState.tsx` | Empty lists, no results, not-found pages |
| Confirm modal | `src/components/ui/ConfirmModal.tsx` | Destructive actions (delete, archive, revoke) |
| Date formatting | `src/data/mock-utils.ts` | `formatDate()`, `formatRelativeDate()`, `truncate()` |

**Example feature to follow:** `src/app/(dashboard)/projects/` — demonstrates the full pattern:
- `page.tsx` — list view with search, filter, WuTable, row actions, create modal, toast
- `[id]/page.tsx` — detail view with WuTab, stat cards, settings form

Copy this pattern for new features. Replace `Project` with the new entity.


## Global Rules

- Frontend-only prototype — no backend, no auth, no database, no sync logic
- Use mock data for all screens
- Use QuestionPro WickUI components
- Do not use shadcn/ui
- If unsure, prioritize UX completeness over technical correctness


## Product Source of Truth

- Refer to `PRD.md` for all product definitions, flows, and requirements
- If there is any ambiguity in UX or behavior, prioritize what is defined in `PRD.md`
- Ensure all screens, flows, and terminology are consistent with `PRD.md`
- Do not invent new concepts, fields, or workflows unless explicitly asked
- If something seems missing or unclear, call it out instead of making assumptions
