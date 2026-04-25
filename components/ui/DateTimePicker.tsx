import { useThemeColor } from "@/constants/Colors";
import {
  DatePickerDialog,
  DatePickerDialogProps,
} from "@expo/ui/jetpack-compose";

export function DateDialog(props: DatePickerDialogProps) {
  const themeColor = useThemeColor();
  return (
    <DatePickerDialog
      {...props}
      variant="picker"
      color={themeColor.tint}
      elementColors={{
        containerColor: themeColor.card,
        dayContentColor: themeColor.text,
        todayContentColor: themeColor.tint,
        selectedDayContentColor: themeColor.tabIconSelected,
        weekdayContentColor: themeColor.tint,
        dividerColor: themeColor.divider,
        navigationContentColor: themeColor.icon,

        yearContentColor: themeColor.text,
        currentYearContentColor: themeColor.tint,
        selectedYearContainerColor: themeColor.tint,
        selectedYearContentColor: themeColor.tabIconSelected,
      }}
      showVariantToggle={false}
    />
  );
}
