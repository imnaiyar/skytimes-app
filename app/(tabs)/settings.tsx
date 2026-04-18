import { Text, View } from "@/components/Themed";
import {
  useNotificationSettings,
  useNotifiedEvents,
  useNow,
} from "@/utils/hooks";
import { resyncAllNotifications } from "@/utils/notifications";
import { SkytimesUtils } from "@skyhelperbot/utils";
import { useMemo } from "react";
import { ScrollView, StyleSheet, Switch } from "react-native";

export default function TabOneScreen() {
  const now = useNow();
  const { settings, updateSettings } = useNotificationSettings();
  const { notificationOffsetsById } = useNotifiedEvents();
  const events = useMemo(() => SkytimesUtils.allEventDetails(), [now]);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContent}>
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Enable notifications</Text>
            <Switch
              value={settings.enabled}
              onValueChange={(value) => {
                const nextSettings = { ...settings, enabled: value };
                updateSettings({ enabled: value });
                resyncAllNotifications(
                  events,
                  nextSettings,
                  notificationOffsetsById,
                ).catch(() => undefined);
              }}
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Play sound</Text>
            <Switch
              value={settings.soundEnabled}
              onValueChange={(value) => {
                const nextSettings = { ...settings, soundEnabled: value };
                updateSettings({ soundEnabled: value });
                resyncAllNotifications(
                  events,
                  nextSettings,
                  notificationOffsetsById,
                ).catch(() => undefined);
              }}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 30,
  },
  section: {
    gap: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
});
