import { StyleSheet, Switch } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useNotifiedEvents, useNotificationSettings, useNow } from '@/utils/hooks';
import { resyncAllNotifications } from '@/utils/notifications';
import { useMemo } from 'react';
import { SkytimesUtils } from '@skyhelperbot/utils';

export default function TabOneScreen() {
  const now = useNow();
  const { settings, updateSettings } = useNotificationSettings();
  const { notificationOffsetsById } = useNotifiedEvents();
  const events = useMemo(() => SkytimesUtils.allEventDetails(), [now]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>Enable notifications</Text>
          <Switch
            value={settings.enabled}
            onValueChange={value => {
              const nextSettings = { ...settings, enabled: value };
              updateSettings({ enabled: value });
              resyncAllNotifications(events, nextSettings, notificationOffsetsById).catch(() => undefined);
            }}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Play sound</Text>
          <Switch
            value={settings.soundEnabled}
            onValueChange={value => {
              const nextSettings = { ...settings, soundEnabled: value };
              updateSettings({ soundEnabled: value });
              resyncAllNotifications(events, nextSettings, notificationOffsetsById).catch(() => undefined);
            }}
          />
        </View>
      </View>
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
    fontWeight: 'bold',
    marginBottom: 16,
  },
  section: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
});
