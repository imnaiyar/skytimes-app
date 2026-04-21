import { Header } from "@/components/ui/Header";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useNotificationSettings, useNotifiedEvents } from "@/utils/hooks";
import { resyncAllNotifications } from "@/utils/notifications";
import {
  Card,
  Column,
  Host,
  Icon,
  LazyColumn,
  Row,
  Switch,
  Text,
} from "@expo/ui/jetpack-compose";
import { fillMaxWidth, padding } from "@expo/ui/jetpack-compose/modifiers";
import { SkytimesUtils } from "@skyhelperbot/utils";
import { View } from "react-native";

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
                  value={settings.enabled}
                  onCheckedChange={handleNotificationToggle}
                />
              }
            />
          </SettingsCard>

          <SettingsCard>
            <SettingsItem
              title="Play Sound"
              description="Notification sounds for events"
              icon={require("@/assets/icons/volume.xml")}
              trailing={
                <Switch
                  value={settings.soundEnabled}
                  onCheckedChange={handleSoundToggle}
                />
              }
            />
          </SettingsCard>

          {/* Future sections can be added here */}
          {/* Display Section */}
          <SettingsSectionHeader title="Display" />

          <SettingsCard>
            <SettingsItem
              title="Theme"
              description="Automatically switch between light and dark"
              icon={require("@/assets/icons/theme.xml")}
              trailing={null}
            />
          </SettingsCard>

          {/* About Section */}
          <SettingsSectionHeader title="About" />

          <SettingsCard>
            <SettingsItem
              title="Version"
              description="App version 1.0.0"
              icon={require("@/assets/icons/info.xml")}
              trailing={null}
            />
          </SettingsCard>
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
      {children}
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
    >
      {/* Icon */}
      {icon && <Icon source={icon} size={24} tint={themeColors.tint} />}

      {/* Content */}
      <Column modifiers={[fillMaxWidth()]}>
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
