export type AppInstruction = {
  id: string;
  title: string;
  description: string;
};

export const APP_INSTRUCTIONS: AppInstruction[] = [
  {
    id: "reorder-categories",
    title: "Rearrange category order",
    description:
      "Use the reorder button on the SkyTimes header, then long press and drag a category to move it. The Pinned & Active section is fixed and cannot be sorted.",
  },
  {
    id: "pin-events",
    title: "Pin events you care about",
    description:
      "Tap the pin icon on any event to keep it near the top. Tap it again any time if you want to unpin.",
  },
  {
    id: "active-events-top",
    title: "Active events always float up",
    description:
      "When an event is live, it automatically appears in the Pinned & Active section so you can spot it quickly.",
  },
  {
    id: "enable-notifications",
    title: "Enable reminders per event",
    description:
      "Tap a muted bell to turn reminders on for that event. You can choose the offset with the slider or the plus/minus buttons, then save.",
  },
  {
    id: "disable-or-edit-notifications",
    title: "Disable or edit reminders",
    description:
      "Tap an enabled bell to disable reminders (with confirmation). Long press an enabled bell to edit the reminder offset without turning it off.",
  },
];
