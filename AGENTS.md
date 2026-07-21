# AGENTS.md

## 1. Project Overview

Project: LYDINC TaskHub

Architecture: Next.js modular monolith.

Technology:

- Next.js App Router
- TypeScript
- PostgreSQL
- Prisma ORM
- Zod
- Auth.js
- Tailwind CSS

## 2. Required Reading

Before modifying code, read:

1. `docs/PRODUCT.md`
2. `docs/REQUIREMENTS.md`
3. `docs/ARCHITECTURE.md`
4. `docs/DATABASE.md`
5. `docs/API.md`

## 3. Planning Rules

Before writing code:

1. Inspect the existing implementation.
2. Summarize how the relevant module currently works.
3. Propose a small implementation plan.
4. List files that will be created or changed.
5. Identify possible risks.

Do not start implementation until the requested scope is clear.

## 4. Architecture Rules

- Read `docs/ARCHITECTURE.md` before changing code.
- Use Next.js modular monolith.
- Do not introduce Express or a custom server.
- Client Components must not access Prisma.
- Route Handlers must remain thin.
- Business logic belongs in services.
- Database access belongs in repositories or server-side services.
- Authorization must be checked on the server.
- Input validation must use Zod.
- Use transactions for multi-step database operations.
- Do not install dependencies without approval.
- Do not refactor unrelated code.

Expected request flow:

Browser
→ Route Handler or Server Action
→ Authentication
→ Validation
→ Authorization
→ Service
→ Repository or Prisma
→ PostgreSQL

## 5. Module Structure

A business module should follow this structure when applicable:

src/modules/<module>/
├── <module>.types.ts
├── <module>.schema.ts
├── <module>.policy.ts
├── <module>.repository.ts
├── <module>.service.ts
├── <module>.mapper.ts
└── <module>.test.ts

Do not create files without a clear responsibility.

## 6. Database Rules

- Do not edit an existing migration after it has been applied.
- Create a new migration for every schema change.
- Do not run destructive database operations without approval.
- Do not use production data for development or testing.
- Do not commit `.env`.
- Never store plain-text passwords.
- Do not return `passwordHash` from services or APIs.
- Use transactions for operations that update multiple related records.
- Seed data must be idempotent.
- Do not run development seed data in production.

## 7. Authentication and Authorization Rules

- Authentication must be checked on the server.
- Authorization must be checked on the server.
- Hiding a button in the UI is not authorization.
- The current actor must be obtained from the session.
- Do not accept `actorId` or `createdById` from request bodies.
- Inactive or locked accounts must be denied access.
- ADMIN has system-wide access.
- MANAGER access is limited by managed or joined projects.
- MEMBER access is limited by project membership and assigned tasks.

## 8. Business Logic Rules

- MEMBER cannot move a task directly from TODO to COMPLETED.
- MEMBER cannot confirm a task as COMPLETED.
- Only ADMIN or the project MANAGER can complete a task in REVIEW.
- Task progress must be an integer from 0 to 100.
- A COMPLETED task must have progress equal to 100.
- The task assignee must be a project member.
- Project end date cannot be earlier than its start date.
- Task due date cannot be earlier than its start date.
- Important changes must create an ActivityLog entry.

The full business requirements are defined in:

`docs/REQUIREMENTS.md`

## 9. API Rules

- APIs must return JSON consistently.
- Use the response structure defined in `docs/API.md`.
- Do not expose database errors or stack traces to clients.
- Do not return sensitive fields.
- Validate request body, path parameters, and query parameters.
- Use appropriate HTTP status codes.
- Lists must support pagination when the dataset may grow.

## 10. Dependency Rules

Do not install a new package unless:

1. The requirement cannot reasonably be implemented with the current stack.
2. The package is actively maintained.
3. The package has a clear purpose.
4. The impact on security and build size has been considered.

Before installing a package, explain:

- Why it is required.
- Which alternatives were considered.
- Which files will use it.

## 11. Scope Control

- Make the smallest change that satisfies the requirement.
- Do not refactor unrelated code.
- Do not rename unrelated files.
- Do not change authentication without explicit approval.
- Do not change database relationships without updating documentation.
- Do not implement future features that are outside the current task.

## 12. Testing Requirements

After implementation, run:

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm test
pnpm build
```
