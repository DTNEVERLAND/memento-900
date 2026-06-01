import type { MoodKey } from "./types";

export type Lang = "zh" | "en";

const EN_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

export interface Dict {
  htmlLang: string;
  subtitle: string;
  epigraph: string;
  dobLabel: string;
  lived: string;
  left: string;
  pct: string;
  rec: string;
  lgSpent: string;
  lgNow: string;
  lgFuture: string;
  lgFilled: string;
  note: string;
  addMoment: string;
  emptyHint: string;
  phText: string;
  phTags: string;
  photoRemove: string;
  close: string;
  moods: Record<MoodKey, string>;
  monthOf: (i: number) => string;
  calLabel: (y: number, m: number) => string;
  ageLabel: (ay: number, am: number) => string;
  tagSpent: string;
  tagNow: string;
  tagFuture: string;
}

export const I18N: Record<Lang, Dict> = {
  zh: {
    htmlLang: "zh",
    subtitle: "你的一生 · 900 个月",
    epigraph: "每一格,是一个再也回不来的月份。",
    dobLabel: "出生日期",
    lived: "已度过",
    left: "剩余",
    pct: "已流逝",
    rec: "已记录",
    lgSpent: "已度过",
    lgNow: "当下",
    lgFuture: "未到来",
    lgFilled: "有记录",
    note: "点击任意格子记录这个月 · 数据存在本机 · 刷新不丢",
    addMoment: "添加一个时刻",
    emptyHint: "这个月还没有记录。点下方「添加一个时刻」开始。",
    phText: "这一刻发生了什么?它对你意味着什么?",
    phTags: "标签,用逗号分隔(如:旅行, 家人)",
    photoRemove: "移除",
    close: "关闭",
    moods: { joy: "喜悦", calm: "平静", love: "爱", growth: "成长", hard: "艰难", grief: "失去" },
    monthOf: (i) => `第 ${i + 1} 个月 / 900`,
    calLabel: (y, m) => `${y} 年 ${m} 月`,
    ageLabel: (ay, am) => `约 ${ay} 岁 ${am} 个月`,
    tagSpent: "已度过",
    tagNow: "← 你在这里",
    tagFuture: "尚未到来",
  },
  en: {
    htmlLang: "en",
    subtitle: "Your Life · 900 Months",
    epigraph: "Each square is a month you will never get back.",
    dobLabel: "Date of Birth",
    lived: "Lived",
    left: "Remaining",
    pct: "Elapsed",
    rec: "Recorded",
    lgSpent: "Lived",
    lgNow: "Now",
    lgFuture: "Future",
    lgFilled: "Recorded",
    note: "Click any square to record that month · Stored on this device · Survives refresh",
    addMoment: "Add a moment",
    emptyHint: "Nothing recorded for this month yet. Tap “Add a moment” below to start.",
    phText: "What happened in this moment? What did it mean to you?",
    phTags: "Tags, comma-separated (e.g. travel, family)",
    photoRemove: "Remove",
    close: "Close",
    moods: { joy: "Joy", calm: "Calm", love: "Love", growth: "Growth", hard: "Hard", grief: "Grief" },
    monthOf: (i) => `Month ${i + 1} / 900`,
    calLabel: (y, m) => `${EN_MONTHS[m - 1]} ${y}`,
    ageLabel: (ay, am) => `~${ay}y ${am}m old`,
    tagSpent: "Lived",
    tagNow: "← you are here",
    tagFuture: "not yet",
  },
};

export function detectInitialLang(): Lang {
  const saved = localStorage.getItem("memento900.lang");
  if (saved === "zh" || saved === "en") return saved;
  return typeof navigator !== "undefined" && navigator.language?.startsWith("zh")
    ? "zh"
    : "en";
}
