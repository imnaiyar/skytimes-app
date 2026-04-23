import { useThemeColor } from "@/constants/Colors";
import { useCategoryOrder, useReorderMode } from "@/utils/hooks";
import {
  Column,
  ElevatedButton,
  HorizontalDivider,
  Host,
  Icon,
  IconButton,
  ModalBottomSheet,
  ModalBottomSheetRef,
  RNHostView,
  Row,
  Spacer,
  Text,
} from "@expo/ui/jetpack-compose";
import {
  align,
  fillMaxHeight,
  fillMaxWidth,
  height,
  paddingAll,
  rotate,
} from "@expo/ui/jetpack-compose/modifiers";
import { useCallback, useRef } from "react";
import { Callout } from "../ui/Callout";

export function CategoryReorderDrawer() {
  const { reorder, setReorder } = useReorderMode();
  const { categoryOrder, setCategoryOrder } = useCategoryOrder();

  const themeColors = useThemeColor();
  const sheetRef = useRef<ModalBottomSheetRef>(null);

  const hideSheet = async () => {
    await sheetRef.current?.hide();
    setReorder(false);
  };

  const moveCategory = useCallback(
    (fromIndex: number, direction: -1 | 1) => {
      const targetIndex = fromIndex + direction;
      if (targetIndex < 0 || targetIndex >= categoryOrder.length) return;

      const next = [...categoryOrder];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(targetIndex, 0, moved);
      setCategoryOrder(next);
    },
    [categoryOrder, setCategoryOrder],
  );

  if (!reorder) return null;
  return (
    <Host matchContents>
      <ModalBottomSheet
        ref={sheetRef}
        onDismissRequest={() => setReorder(false)}
        sheetGesturesEnabled={false}
        showDragHandle={false}
        skipPartiallyExpanded
        modifiers={[fillMaxHeight()]}
      >
        <Column
          verticalArrangement={{ spacedBy: 10 }}
          modifiers={[paddingAll(10)]}
        >
          <Row
            horizontalArrangement="spaceBetween"
            verticalAlignment="center"
            modifiers={[fillMaxWidth()]}
          >
            <Text style={{ typography: "titleMedium" }}>
              Reorder Event Categories
            </Text>
            <ElevatedButton
              colors={{
                containerColor: themeColors.success,
              }}
              onClick={() => void hideSheet()}
            >
              <Icon
                source={require("@/assets/icons/check_24px.xml")}
                tint={themeColors.successSurface}
              />
            </ElevatedButton>
          </Row>
          <RNHostView matchContents>
            <Callout style={{ marginBottom: 10 }}>
              Use move controls to reorder categories. Pinned/active stays fixed
              at the top.
            </Callout>
          </RNHostView>
          <Column verticalArrangement={{ spacedBy: 10 }}>
            <Spacer modifiers={[height(10)]} />
            <Text
              color={themeColors.mutedText}
              style={{ typography: "bodyLarge" }}
            >
              Pinned & Active
            </Text>

            <HorizontalDivider color={themeColors.divider} />
          </Column>

          {categoryOrder.map((c, i) => {
            const isFirst = i === 0;
            const isLast = i === categoryOrder.length - 1;
            const activeControlColor = themeColors.text;
            const disabledControlColor = themeColors.iconMuted;

            return (
              <Column verticalArrangement={{ spacedBy: 2 }} key={i}>
                <Row
                  horizontalArrangement={"spaceBetween"}
                  verticalAlignment="center"
                  modifiers={[fillMaxWidth(), align("center")]}
                >
                  <Text
                    color={themeColors.text}
                    style={{ typography: "bodyLarge" }}
                  >
                    {c}
                  </Text>
                  <Row>
                    <IconButton
                      onClick={() => moveCategory(i, -1)}
                      enabled={!isFirst}
                    >
                      <Icon
                        source={require("@/assets/icons/expand_more_24px.xml")}
                        modifiers={[rotate(180)]}
                        tint={
                          isFirst ? disabledControlColor : activeControlColor
                        }
                      />
                    </IconButton>
                    <IconButton
                      onClick={() => moveCategory(i, 1)}
                      enabled={!isLast}
                    >
                      <Icon
                        source={require("@/assets/icons/expand_more_24px.xml")}
                        tint={
                          isLast ? disabledControlColor : activeControlColor
                        }
                      />
                    </IconButton>
                  </Row>
                </Row>
                <HorizontalDivider color={themeColors.divider} />
              </Column>
            );
          })}
        </Column>
      </ModalBottomSheet>
    </Host>
  );
}
