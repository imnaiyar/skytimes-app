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

export const currencyIconMappings = {
  c: require("@/assets/icons/candle.svg"),
  h: require("@/assets/icons/heart.svg"),
  sc: require("@/assets/icons/candle.svg"),
  sh: require("@/assets/icons/heart.svg"),
  ec: require("@/assets/icons/event-ticket.svg"),
  ac: require("@/assets/icons/ac.svg"),
};

export const questionIconSource = require("@/assets/icons/question.svg");
