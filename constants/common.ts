// https://utils.skyhelper.xyz/api#EventKey
export const EventCategory = {
  Wax: ["geyser", "grandma", "turtle", "passage-quests", "dream-skater"],
  Resets: ["daily-reset", "eden"],
  "Activity/Concerts": [
    "aurora",
    "fireworks-festival",
    "nest-sunset",
    "fairy-ring",
    "brook-rainbow",
  ],
};

export const CATEGORY_ORDER = ["Wax", "Resets", "Activity/Concerts"] as const;

export const SKYHELPER_API_URL = process.env.EXPO_SKYHELPER_API_URL;

export const SKY_ZONE = "America/Los_Angeles";
