import Colors from "@/constants/Colors";
import {
  AnimatedVisibility,
  Box,
  DockedSearchBar,
  EnterTransition,
  ExitTransition,
  Host,
  Icon,
  IconButton,
  Shape,
  Surface,
  Text,
} from "@expo/ui/jetpack-compose";
import {
  align,
  fillMaxSize,
  fillMaxWidth,
  imePadding,
  paddingAll,
  size,
} from "@expo/ui/jetpack-compose/modifiers";
import { useEffect, useMemo, useState } from "react";
import { Keyboard, StyleSheet, View } from "react-native";
import { useColorScheme } from "../useColorScheme";

type DockedSearchFabProps = {
  onQueryChange?: (query: string) => void;
  placeholder?: string;
};

export default function FAB({
  onQueryChange,
  placeholder = "Search",
}: DockedSearchFabProps) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme];
  const [expanded, setExpanded] = useState(false);

  const enterTransition = useMemo(
    () =>
      EnterTransition.fadeIn({ initialAlpha: 0.4 }).plus(
        EnterTransition.expandHorizontally(),
      ),
    [],
  );

  const exitTransition = useMemo(
    () => ExitTransition.fadeOut().plus(ExitTransition.shrinkHorizontally()),
    [],
  );

  useEffect(() => {
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setExpanded(false);
    });

    return () => {
      hideSubscription.remove();
    };
  }, []);

  return (
    <View pointerEvents="box-none" style={styles.wrapper}>
      <Host useViewportSizeMeasurement style={styles.host}>
        <Box
          contentAlignment="bottomEnd"
          modifiers={[fillMaxSize(), imePadding(), paddingAll(16)]}
        >
          <AnimatedVisibility
            visible={!expanded}
            enterTransition={EnterTransition.scaleIn({ initialScale: 0.8 })}
            exitTransition={ExitTransition.scaleOut({ targetScale: 0.9 })}
            modifiers={[align("bottomEnd"), size(60, 60)]}
          >
            <Surface
              color={themeColors.card}
              border={{ width: 1, color: themeColors.border }}
              shape={Shape.Circle({ radius: 1 })}
              modifiers={[fillMaxSize()]}
            >
              <Box contentAlignment="center" modifiers={[fillMaxSize()]}>
                <IconButton onClick={() => setExpanded(true)}>
                  <Icon
                    size={22}
                    source={require("@/assets/icons/search_24px.xml")}
                    contentDescription="Open search"
                    tint={themeColors.icon}
                  />
                </IconButton>
              </Box>
            </Surface>
          </AnimatedVisibility>

          <AnimatedVisibility
            visible={expanded}
            enterTransition={enterTransition}
            exitTransition={exitTransition}
            modifiers={[align("bottomEnd")]}
          >
            <DockedSearchBar
              onQueryChange={(value) => {
                onQueryChange?.(value);
              }}
              modifiers={[fillMaxWidth()]}
            >
              <DockedSearchBar.LeadingIcon>
                <Icon
                  size={20}
                  source={require("@/assets/icons/search_24px.xml")}
                  tint={themeColors.iconMuted}
                  contentDescription="Search"
                />
              </DockedSearchBar.LeadingIcon>
              <DockedSearchBar.Placeholder>
                <Text color={themeColors.mutedText}>{placeholder}</Text>
              </DockedSearchBar.Placeholder>
            </DockedSearchBar>
          </AnimatedVisibility>
        </Box>
      </Host>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    right: 0,
    bottom: 0,
  },
  host: {
    flex: 1,
  },
});
