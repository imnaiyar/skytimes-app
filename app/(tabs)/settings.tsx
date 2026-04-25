import { Header } from "@/components/ui/Header";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import {
  useDebugMode,
  useNotificationSettings,
  useNotifiedEvents,
} from "@/utils/hooks";
import { resyncAllNotifications } from "@/utils/notifications";
import {
  Box,
  Card,
  Column,
  HorizontalDivider,
  Host,
  Icon,
  LazyColumn,
  Row,
  Switch,
  Text,
} from "@expo/ui/jetpack-compose";
import {
  align,
  fillMaxSize,
  fillMaxWidth,
  padding,
  paddingAll,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import { SkytimesUtils } from "@skyhelperbot/utils";
import { Appearance, View } from "react-native";

/**
 * Settings screen using Jetpack Compose
 * Features Material Design 3 components with app theme consistency
 */
export default function SettingsScreen() {
  const { settings, updateSettings } = useNotificationSettings();
  const { notificationOffsetsById } = useNotifiedEvents();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? "light"];
  const events = SkytimesUtils.allEventDetails();

  const handleNotificationToggle = (value: boolean) => {
    const nextSettings = { ...settings, enabled: value };
    updateSettings({ enabled: value });
    resyncAllNotifications(events, nextSettings, notificationOffsetsById).catch(
      () => undefined,
    );
  };

  const handleSoundToggle = (value: boolean) => {
    const nextSettings = { ...settings, soundEnabled: value };
    updateSettings({ soundEnabled: value });
    resyncAllNotifications(events, nextSettings, notificationOffsetsById).catch(
      () => undefined,
    );
  };
  const switchStyle = {
    colors: {
      checkedTrackColor: themeColors.tint,
      checkedThumbColor: themeColors.border,
      uncheckedTrackColor: themeColors.overlay,
      uncheckedThumbColor: themeColors.divider,
      uncheckedBorderColor: themeColors.divider,
    },
  };

  const { DEBUG, setDebugMode } = useDebugMode();
  return (
    <View style={{ flex: 1, backgroundColor: themeColors.background }}>
      <Header title="Settings" />
      <Host style={{ flex: 1 }}>
        <LazyColumn modifiers={[padding(8, 4, 4, 8)]}>
          {/* Notifications Section */}
          <SettingsSectionHeader title="Notifications" />

          <SettingsCard>
            <SettingsItem
              title="Enable Notifications"
              description="Receive alerts for upcoming events"
              icon={require("@/assets/icons/notifications.xml")}
              trailing={
                <Switch
                  {...switchStyle}
                  value={settings.enabled}
                  onCheckedChange={handleNotificationToggle}
                />
              }
            />
            <HorizontalDivider color={themeColors.border} />
            <SettingsItem
              title="Play Sound"
              description="Notification sounds for events"
              icon={require("@/assets/icons/volume.xml")}
              trailing={
                <Switch
                  {...switchStyle}
                  value={settings.soundEnabled}
                  onCheckedChange={handleSoundToggle}
                />
              }
            />
          </SettingsCard>

          {/*region Display Section */}
          <SettingsSectionHeader title="Display" />

          <SettingsCard>
            <SettingsItem
              title="Dark Mode"
              description="Switch between light and dark"
              icon={
                colorScheme === "dark"
                  ? require("@/assets/icons/light_mode_24px.xml")
                  : require("@/assets/icons/dark_mode_24px.xml")
              }
              trailing={
                <Switch
                  {...switchStyle}
                  value={colorScheme === "dark"}
                  onCheckedChange={(v) =>
                    Appearance.setColorScheme(v ? "dark" : "light")
                  }
                />
              }
            />
          </SettingsCard>

          <SettingsSectionHeader title="Advanced" />
          <SettingsCard>
            <SettingsItem
              title="Debug Mode"
              description="Enable debug mode."
              icon={require("@/assets/icons/code.xml")}
              trailing={
                <Switch
                  {...switchStyle}
                  value={DEBUG}
                  onCheckedChange={(v) => setDebugMode(v)}
                />
              }
            />
          </SettingsCard>
          <Box modifiers={[fillMaxSize()]}>
            <Text
              modifiers={[align("bottomEnd"), paddingAll(5)]}
              color={themeColors.mutedText}
              style={{
                typography: "bodySmall",
              }}
            >
              App version 1.0.0
            </Text>
          </Box>
        </LazyColumn>
      </Host>
    </View>
  );
}

/**
 * Reusable section header component
 */
function SettingsSectionHeader({ title }: { title: string }) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? "light"];

  return (
    <Text
      color={themeColors.tint}
      style={{
        typography: "labelLarge",
      }}
      modifiers={[padding(8, 6, 6, 8)]}
    >
      {title}
    </Text>
  );
}

/**
 * Reusable settings card component for grouping settings
 */
function SettingsCard({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? "light"];

  return (
    <Card
      modifiers={[padding(8, 3, 3, 8), fillMaxWidth()]}
      border={{ color: themeColors.border, width: 1 }}
      colors={{ containerColor: themeColors.card }}
    >
      <Column verticalArrangement={{ spacedBy: 8 }}>{children}</Column>
    </Card>
  );
}

/**
 * Reusable settings item component
 * Displays an icon, title, description, and optional trailing element (like a toggle)
 */
function SettingsItem({
  title,
  description,
  icon,
  trailing,
}: {
  title: string;
  description: string;
  icon?: any;
  trailing: React.ReactNode;
}) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? "light"];

  return (
    <Row
      modifiers={[padding(8, 6, 6, 8), fillMaxWidth()]}
      verticalAlignment="center"
      horizontalArrangement={{ spacedBy: 8 }}
    >
      {/* Icon */}
      {icon && <Icon source={icon} size={24} tint={themeColors.tint} />}

      {/* Content */}
      <Column modifiers={[weight(1)]}>
        <Text
          color={themeColors.text}
          style={{
            typography: "bodyLarge",
          }}
        >
          {title}
        </Text>
        <Text
          color={themeColors.mutedText}
          style={{
            typography: "bodySmall",
          }}
        >
          {description}
        </Text>
      </Column>

      {/* Trailing */}
      {trailing}
    </Row>
  );
}
