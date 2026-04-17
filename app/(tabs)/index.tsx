import { StyleSheet } from 'react-native';
import { useEffect, useMemo } from "react";
import { SkytimesUtils } from "@skyhelperbot/utils";

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { CategoryList } from "@/components/EventList";
import { useNotifiedEvents, useNotificationSettings, useNow } from '@/utils/hooks';
import { syncNotifications } from '@/utils/notifications';


export default function TabTwoScreen() {
  const now = useNow();
  const events = useMemo(() => SkytimesUtils.allEventDetails(), [now]);
  const { settings } = useNotificationSettings();
  const {
    notificationOffsetsById,
    setEventNotificationOffset,
    disableEventNotification,
  } = useNotifiedEvents();
  const eventsSyncSignature = useMemo(
    () =>
      events
        .map(([key, event]) => `${String(key)}:${event.nextOccurence.toMillis()}`)
        .join("|"),
    [events],
  );
  const notificationOffsetsSignature = useMemo(
    () =>
      Object.entries(notificationOffsetsById)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([eventId, minutes]) => `${eventId}:${minutes}`)
        .join("|"),
    [notificationOffsetsById],
  );
  const notificationSyncInput = useMemo(
    () => ({
      events,
      notificationOffsetsById,
    }),
    [eventsSyncSignature, notificationOffsetsSignature],
  );

  useEffect(() => {
    syncNotifications(
      notificationSyncInput.events,
      notificationSyncInput.notificationOffsetsById,
      settings,
    ).catch(() => undefined);
  }, [notificationSyncInput, settings]);
  
  return (
    <GestureHandlerRootView>
    
      <CategoryList
        events={events}
        notificationOffsetsById={notificationOffsetsById}
        onSetNotificationOffset={setEventNotificationOffset}
        onDisableNotification={disableEventNotification}
        notificationsEnabled={settings.enabled}
      />
    </GestureHandlerRootView>


  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: "row",
    padding: 4,
    paddingBottom: 10
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
