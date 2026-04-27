---
name: project-maintenance
description: "Maintain the SkyHelper Expo app with consistent architecture, Android-first Expo UI patterns, and safe feature updates. Use for implementing changes, refactors, and bug fixes while preserving existing behavior."
argument-hint: "What change should be implemented while preserving project patterns?"
---

# SkyHelper Project Maintenance

## Purpose

Use this skill to keep the SkyHelper app consistent as it evolves.

This project is an Android-first Expo Router app for Sky: Children of the Light event tracking. It focuses on:
- event visibility (current/upcoming)
- reminders with configurable offsets
- persistent user preferences (pins, reorder, reminders)
- a configurable Android home widget

The maintenance goal is to add or change behavior without breaking event timing logic, notification behavior, data persistence contracts, or established UI patterns.

## When To Use

Use this skill when:
- adding features to events, quests, shards, settings, or widget flows
- changing storage schemas in `utils/storage.ts`
- modifying reminders/notifications in `utils/notifications.ts`
- adjusting event computation logic in `utils/event.ts`
- updating route structure under `app/`
- introducing or replacing Android UI with `@expo/ui/jetpack-compose`

Do not use this skill for one-off content edits with no code impact.

## Project Patterns To Preserve

- Keep routing and screen composition aligned with Expo Router structure in `app/`.
- Keep business logic in `utils/` and UI composition in `components/` and route screens.
- Preserve local-first persistence design (AsyncStorage-backed state) and backward compatibility when keys or shapes evolve.
- Treat notifications and widget data as user-facing contracts; avoid silent behavioral changes.
- Maintain Android-first assumptions where relevant, especially for `@expo/ui/jetpack-compose` usage.
- Prefer small, focused changes over broad rewrites.

## Workflow

1. Identify scope and user-facing behavior.
2. Trace affected modules before editing.
3. Choose minimal-change implementation path.
4. Apply changes with project conventions.
5. Validate behavior and edge cases.
6. Summarize impact and risks.

## Step-by-Step Procedure

### 1) Identify Scope

Define the exact behavior change and where it is visible:
- UI-only
- business logic
- persistence contract
- notification scheduling
- widget rendering

Expected output:
- explicit before/after behavior statement
- list of impacted files

### 2) Trace Dependencies Before Editing

Map upstream and downstream effects:
- routes: `app/**`
- shared UI: `components/**`
- logic: `utils/event.ts`, `utils/quests.ts`, `utils/notifications.ts`
- persistence: `utils/storage.ts`
- widget: `widgets/**`

Look for:
- storage key coupling
- notification payload assumptions
- ordering/pinning dependencies
- theme and icon dependencies

### 3) Decision Points

Choose strategy based on impact:

- If storage shape changes:
  - add migration-safe reads (defaults, guards)
  - write in backward-compatible shape when possible
  - avoid destructive key renames without migration

- If notification logic changes:
  - preserve user toggles and offsets
  - verify schedule/cancel paths together
  - avoid duplicate scheduling regressions

- If route/screen structure changes:
  - keep file-based routing predictable
  - avoid cross-screen state coupling without shared utility/state layer

- If using `@expo/ui/jetpack-compose`:
  - follow the dedicated expo-ui skill
  - verify component/modifier API via `.d.ts` before usage
  - ensure every Compose tree is wrapped in `Host`

### 4) Implement With Best Practices

- Keep functions cohesive and names intention-revealing.
- Preserve existing TypeScript strictness and narrow types where possible.
- Add concise comments only where logic is non-obvious.
- Avoid introducing unrelated formatting churn.
- Keep public contracts stable unless change is intentional and documented.

### 5) Validate

Run targeted checks relevant to the change.

Minimum checks:
- TypeScript/lint baseline still passes for touched code.
- Modified flows compile and run in Android context.
- Persistence reads old data safely (when storage touched).
- Notifications still reflect user offsets/toggles (when touched).
- Widget data remains coherent (when widget/event data touched).

### 6) Completion Criteria

A change is complete when:
- behavior matches requested outcome
- no known regression in related flows
- persistence compatibility risk is addressed
- changes remain localized and understandable
- summary includes what changed, why, and residual risk

## Quality Checklist

- Project purpose remains intact: event tracking + reminders + widget utility.
- Existing patterns are followed (router, utils separation, Android-first constraints).
- State persistence and notification behavior remain predictable.
- Edge cases have explicit handling (missing data, defaults, empty lists, stale settings).
- Any unavoidable tradeoff is documented.

## Suggested Prompt Examples

- "Use project-maintenance: add a new event source while preserving notification behavior."
- "Use project-maintenance: refactor storage reads in utils/storage.ts without breaking existing users."
- "Use project-maintenance: update settings UI and keep widget configuration compatibility."

## Related Skills

- For Compose-specific implementation details, use the existing `expo-ui` skill in `.github/skills/expo-ui/SKILL.md`.
