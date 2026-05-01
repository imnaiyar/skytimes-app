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
  Row,
  Shape,
  Text,
} from "@expo/ui/jetpack-compose";
import {
  align,
  fillMaxWidth,
  imePadding,
  paddingAll,
  size,
  weight,
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
      <Host matchContents>
        <Box
          contentAlignment="bottomEnd"
          modifiers={[fillMaxWidth(), imePadding(), paddingAll(16)]}
        >
          <Row modifiers={[weight(1)]}>
            <AnimatedVisibility
              visible={!expanded}
              enterTransition={EnterTransition.scaleIn({ initialScale: 0.8 })}
              exitTransition={ExitTransition.scaleOut({ targetScale: 0.9 })}
              modifiers={[align("bottomEnd"), size(60, 60)]}
            >
              <IconButton
                onClick={() => setExpanded(true)}
                colors={{
                  containerColor: themeColors.card,
                  contentColor: themeColors.icon,
                }}
                shape={Shape.RoundedCorner({
                  cornerRadii: {
                    topEnd: 50,
                    topStart: 50,
                    bottomStart: 50,
                    bottomEnd: 50,
                  },
                })}
              >
                <Icon
                  size={22}
                  source={require("@/assets/icons/search_24px.xml")}
                  contentDescription="Open search"
                  tint={themeColors.icon}
                />
              </IconButton>
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
          </Row>
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
