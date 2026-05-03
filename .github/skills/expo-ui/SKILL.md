---
name: expo-ui
description: "Build or refactor Android-native Expo UI with `@expo/ui/jetpack-compose` on Expo SDK 55. Use when Codex needs to add or edit Jetpack Compose components, modifiers, icons, theming, layout, or scrollable UI inside an Expo app, especially when React Native primitives should be replaced with Expo UI equivalents."
---

These instructions target Expo SDK 55. For any other SDK version, confirm the matching Expo UI docs before coding.

## Installation

```bash
npx expo install @expo/ui
```

A native rebuild is required after installation:

```bash
npx expo run:android
```

## Workflow

1. Confirm the project uses Expo SDK 55 and `@expo/ui`.
2. Locate the installed package before writing code:

```bash
node -e "const path=require('path'); console.log(path.dirname(require.resolve('@expo/ui/jetpack-compose')))"
```

3. Read the relevant `.d.ts` files in that package directory before using any component or modifier.
4. Check the SDK 55 docs for the exact component or modifier when the local types are not enough.
5. Wrap every Compose tree in `Host`.
6. Rebuild Android after any native Expo UI change.

## Use the Local Types as Source of Truth

- Import components from `@expo/ui/jetpack-compose`.
- Import modifiers from `@expo/ui/jetpack-compose/modifiers`.
- Treat the installed `.d.ts` files as the primary source of truth for props, child structure, and modifier signatures.
- Use Jetpack Compose and Material 3 knowledge to choose patterns, but validate them against the Expo UI package types before finalizing code.
- Reach for deeper Jetpack Compose or Material 3 guidance only when the local types and Expo docs leave a design decision unresolved.

## Host and Layout Rules

- Wrap every Jetpack Compose subtree in `Host`.
- Use `<Host matchContents>` for intrinsic sizing.
- Use `<Host style={{ flex: 1 }}>` when the Compose subtree must fill available space, including `LazyColumn` and other scroll containers.
- Prefer Expo UI layout primitives over mixing React Native layout wrappers around Compose content.

Example:

```jsx
import { Host, Column, Button, Text } from "@expo/ui/jetpack-compose";
import { fillMaxWidth, paddingAll } from "@expo/ui/jetpack-compose/modifiers";

<Host matchContents>
  <Column verticalArrangement={{ spacedBy: 8 }} modifiers={[fillMaxWidth(), paddingAll(16)]}>
    <Text style={{ typography: "titleLarge" }}>Hello</Text>
    <Button onPress={() => alert("Pressed!")}>Press me</Button>
  </Column>
</Host>;
```

## Common Patterns

- Use `LazyColumn` instead of React Native `ScrollView` or `FlatList` for Compose-native scrolling. Wrap it in `<Host style={{ flex: 1 }}>`.
- Use `Icon` with Android XML vector drawables:

```jsx
<Icon source={require("./assets/icons/wifi.xml")} size={24} />
```

- Download XML drawables from Material Symbols by choosing the Android export, then store them under `assets/` such as `assets/icons/wifi.xml`.
- Keep modifier arrays explicit and readable. Compose layout behavior is often clearer in modifiers than in React Native `style` objects.

## Docs

- Component docs: `https://docs.expo.dev/versions/v55.0.0/sdk/ui/jetpack-compose/{component-name}/index.md`
- Modifier docs: `https://docs.expo.dev/versions/v55.0.0/sdk/ui/jetpack-compose/modifiers/index.md`
