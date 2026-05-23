import type { Achievement, AIResult, LeaderboardEntry } from "../types";

export const XP_PER_LEVEL = 100;
export const REWARD_XP = 50;
export const REWARD_CRYSTALS = 2;

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "math-explorer",
    icon: "🧭",
    name: { en: "Math Explorer", ru: "Исследователь", uz: "Kashfiyotchi" },
    desc: {
      en: "Complete your first quest",
      ru: "Пройди первый квест",
      uz: "Birinchi kvestni yakunla",
    },
  },
  {
    id: "homework-hero",
    icon: "🦸",
    name: { en: "Homework Hero", ru: "Герой ДЗ", uz: "Vazifa qahramoni" },
    desc: {
      en: "Score 90 or higher",
      ru: "Набери 90 баллов и выше",
      uz: "90 va undan yuqori ball ol",
    },
  },
  {
    id: "speed-solver",
    icon: "⚡",
    name: { en: "Speed Solver", ru: "Скоростной", uz: "Tezkor yechuvchi" },
    desc: {
      en: "Finish a quest in one go",
      ru: "Заверши квест с одного раза",
      uz: "Kvestni bir urinishda tugat",
    },
  },
  {
    id: "flawless",
    icon: "💎",
    name: { en: "Flawless Run", ru: "Без ошибок", uz: "Mukammal" },
    desc: {
      en: "Finish with zero mistakes",
      ru: "Заверши без ошибок",
      uz: "Xatosiz yakunla",
    },
  },
  {
    id: "crystal-collector",
    icon: "🔮",
    name: { en: "Crystal Collector", ru: "Коллекционер", uz: "Kollektsioner" },
    desc: {
      en: "Gather 10 Knowledge Crystals",
      ru: "Собери 10 кристаллов знаний",
      uz: "10 ta bilim kristalini yig'",
    },
  },
];

/** Returns the achievement ids newly unlocked by this result + new totals. */
export function evaluateAchievements(
  result: AIResult,
  crystalsAfter: number,
  alreadyUnlocked: string[]
): string[] {
  const have = new Set(alreadyUnlocked);
  const out: string[] = [];
  const add = (id: string) => {
    if (!have.has(id)) out.push(id);
  };

  add("math-explorer"); // any completion
  add("speed-solver"); // single-shot completion in this MVP
  if (result.score >= 90) add("homework-hero");
  if (result.errors.length === 0) add("flawless");
  if (crystalsAfter >= 10) add("crystal-collector");

  return out;
}

/** Seed classmates for the leaderboard; "You" is injected at runtime by XP. */
export const CLASSMATES: Omit<LeaderboardEntry, "isYou">[] = [
  { id: "c1", name: "Malika", avatar: "🦊", xp: 980, weekly: 220 },
  { id: "c2", name: "Jasur", avatar: "🐯", xp: 870, weekly: 180 },
  { id: "c3", name: "Dilnoza", avatar: "🦉", xp: 760, weekly: 160 },
  { id: "c4", name: "Sardor", avatar: "🐼", xp: 540, weekly: 90 },
  { id: "c5", name: "Madina", avatar: "🐨", xp: 430, weekly: 70 },
  { id: "c6", name: "Bek", avatar: "🦁", xp: 300, weekly: 60 },
  { id: "c7", name: "Nigora", avatar: "🐰", xp: 210, weekly: 40 },
];

export function buildLeaderboard(youName: string, youXp: number): LeaderboardEntry[] {
  const you: LeaderboardEntry = {
    id: "you",
    name: youName,
    avatar: "🧒",
    xp: youXp,
    weekly: Math.min(youXp, 250),
    isYou: true,
  };
  return [...CLASSMATES, you].sort((a, b) => b.xp - a.xp);
}
