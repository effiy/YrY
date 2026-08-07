export interface StoryScenarioStep {
  action: string;
  description: string;
}

export interface StoryPresetScenario {
  name: string;
  description: string;
  priority: "p0" | "p1" | "p2" | "p3";
  steps: StoryScenarioStep[];
  tags: string[];
}

export const petSettingsPreset: StoryPresetScenario[] = [
  {
    name: "Toggle pet visibility",
    description: "Users can show or hide the pet on any web page via the popup toggle",
    priority: "p1",
    steps: [
      { action: "Given", description: "The pet is visible on the current tab" },
      { action: "When", description: "The user opens the popup and clicks the show-pet toggle" },
      { action: "Then", description: "The pet should hide from the page" },
      { action: "And", description: "Clicking the toggle again should show the pet again" }
    ],
    tags: ["ui", "toggle", "visibility"]
  },
  {
    name: "Adjust pet display size",
    description: "Users can change the pet size (in pixels) via the settings panel",
    priority: "p1",
    steps: [
      { action: "Given", description: "The popup settings panel is open" },
      { action: "When", description: "The user adjusts the size slider/input" },
      { action: "Then", description: "The pet on the active tab should resize in real time" },
      { action: "And", description: "The new size value should persist across page reloads" }
    ],
    tags: ["ui", "size", "persistence"]
  },
  {
    name: "Switch pet profession",
    description: "Users can change the pet's professional role (teacher, doctor, pastry chef, police officer)",
    priority: "p2",
    steps: [
      { action: "Given", description: "The popup settings panel is open" },
      { action: "When", description: "The user selects a different role from the role dropdown" },
      { action: "Then", description: "The pet's appearance should update to match the selected role" },
      { action: "And", description: "A role-change notification should be shown" }
    ],
    tags: ["ui", "role", "appearance"]
  },
  {
    name: "Switch color theme",
    description: "Users can customize the color theme of the pet and UI",
    priority: "p2",
    steps: [
      { action: "Given", description: "The popup settings panel is open" },
      { action: "When", description: "The user selects a color theme option" },
      { action: "Then", description: "The pet and control panel colors should update immediately" },
      { action: "And", description: "The selected theme should be saved to Chrome Storage" }
    ],
    tags: ["ui", "theme", "color"]
  },
  {
    name: "Toggle the pet with a keyboard shortcut",
    description:
      "As a user who wants to stay focused on work, I want to use a keyboard shortcut (Mac: Command+Shift+P / Windows/Linux: Ctrl+Shift+P) to toggle the pet display, so I can hide the pet when I need focus and bring it back when I want company.",
    priority: "p1",
    steps: [
      { action: "Given", description: "The pet is currently visible (or hidden) on the active tab" },
      { action: "When", description: "The user presses Command+Shift+P (Mac) or Ctrl+Shift+P (Windows/Linux)" },
      { action: "Then", description: "The pet's visibility should toggle immediately — hide if visible, show if hidden" },
      { action: "And", description: "The toggle state should persist to chrome.storage" }
    ],
    tags: ["keyboard", "shortcut", "toggle", "visibility", "accessibility"]
  },
  {
    name: "Switch display language",
    description: "Users can switch between English and Simplified Chinese in the extension UI",
    priority: "p3",
    steps: [
      { action: "Given", description: "The popup is open, showing the current language" },
      { action: "When", description: "The user selects a different language from the language switcher" },
      { action: "Then", description: "All UI text in the popup should update to the selected language" },
      { action: "And", description: "The language preference should persist across sessions" }
    ],
    tags: ["i18n", "language", "persistence"]
  }
];
