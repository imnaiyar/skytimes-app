import { StatusBar } from 'expo-status-bar';
import { Platform, ScrollView, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { APP_INSTRUCTIONS } from '@/constants/instructions';

export default function ModalScreen() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? "light"];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.subtitle}>
            Quick guide to the app.
          </Text>
        </View>

        <View style={styles.list}>
          {APP_INSTRUCTIONS.map((instruction, index) => (
            <View
              key={instruction.id}
              style={[styles.card, { borderColor: themeColors.border }]}
              lightColor={Colors.light.card}
              darkColor={Colors.dark.card}
            >
              <View
                style={styles.cardHeader}
                lightColor={Colors.light.card}
                darkColor={Colors.dark.card}
              >
                <View
                  style={[styles.badge, { backgroundColor: themeColors.surfaceMuted }]}
                  lightColor={Colors.light.surfaceMuted}
                  darkColor={Colors.dark.surfaceMuted}
                >
                  <Text style={styles.badgeText}>{index + 1}</Text>
                </View>
                <Text style={styles.cardTitle}>{instruction.title}</Text>
              </View>
              <Text style={styles.cardDescription}>{instruction.description}</Text>
            </View>
          ))}
        </View>

        <View
          style={[styles.footer, { borderColor: themeColors.border }]}
          lightColor={Colors.light.card}
          darkColor={Colors.dark.card}
        >
          <Text style={styles.footerText}>
            Tip: Keep global notifications enabled in Settings so your per-event reminders can fire.
          </Text>
        </View>
      </ScrollView>

      <StatusBar
        style={Platform.OS === "ios" ? (colorScheme === "dark" ? "light" : "dark") : "auto"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 30,
  },
  hero: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.85,
  },
  list: {
    gap: 10,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 21,
    opacity: 0.9,
  },
  footer: {
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  footerText: {
    fontSize: 13,
    lineHeight: 20,
    opacity: 0.85,
  },
});
