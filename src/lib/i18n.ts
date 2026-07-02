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
  timeline: string;
  timelineEmpty: string;
  quoteLabel: string;
  // Search
  search: string;
  searchPlaceholder: string;
  searchNoMatch: string;
  searchEmpty: string;
  searchCount: (n: number) => string;
  searchAllMoods: string;
  // Life Lens
  lens: string;
  lensIntro: string;
  factWeekends: string;
  factSeasons: string;
  factBirthdays: string;
  factFullMoons: string;
  factLeft: string;
  lensCalcTitle: string;
  lensActivityPh: string;
  lensTimesPre: string;
  lensTimesUnit: string;
  lensOtherAgePh: string;
  lensOtherAgeHint: string;
  lensResultPre: string;
  lensResultUnit: string;
  lensYearsHint: (y: number) => string;
  lensPresets: readonly { readonly label: string; readonly freq: number }[];
  // Quick actions & mood check-in
  quickMoodTitle: string;
  quickMoodHint: string;
  jumpNow: string;
  randomMemory: string;
  lifeRingLabel: string;
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
    timeline: "回看",
    timelineEmpty: "还没有任何记录。点一个格子,写下你的第一个时刻。",
    quoteLabel: "今日一念",
    search: "搜索",
    searchPlaceholder: "搜索文字、标签或心情…",
    searchNoMatch: "没有匹配的记录。",
    searchEmpty: "还没有记录可供搜索。先去格子里写点什么吧。",
    searchCount: (n) => `${n} 条结果`,
    searchAllMoods: "全部",
    lens: "余生透镜",
    lensIntro: "把剩下的时间,换成你看得见的东西。",
    factWeekends: "个周末",
    factSeasons: "个季节",
    factBirthdays: "个生日",
    factFullMoons: "次满月",
    factLeft: "还剩",
    lensCalcTitle: "如果我每年——",
    lensActivityPh: "做一件事(如:旅行、读书、回家)",
    lensTimesPre: "每年",
    lensTimesUnit: "次",
    lensOtherAgePh: "对方年龄(可选)",
    lensOtherAgeHint: "填了对方年龄,就按 TA 的余生来算(比如「还能见父母几次」)。",
    lensResultPre: "这辈子,你大约还能这样做",
    lensResultUnit: "次",
    lensYearsHint: (y) => `按还剩约 ${y} 年计算`,
    lensPresets: [
      { label: "旅行", freq: 2 },
      { label: "读一本书", freq: 15 },
      { label: "见老朋友", freq: 4 },
      { label: "陪父母吃饭", freq: 6 },
      { label: "看一次海", freq: 1 },
      { label: "回家过年", freq: 1 },
    ],
    quickMoodTitle: "此刻的心情",
    quickMoodHint: "点一下,记进当下这个月",
    jumpNow: "回到当下",
    randomMemory: "随机回忆",
    lifeRingLabel: "已流逝",
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
    timeline: "Look back",
    timelineEmpty: "Nothing recorded yet. Tap a square and write your first moment.",
    quoteLabel: "Today's thought",
    search: "Search",
    searchPlaceholder: "Search text, tags or mood…",
    searchNoMatch: "No matching records.",
    searchEmpty: "Nothing to search yet. Record something in a square first.",
    searchCount: (n) => `${n} result${n === 1 ? "" : "s"}`,
    searchAllMoods: "All",
    lens: "Life Lens",
    lensIntro: "Turn the time you have left into things you can picture.",
    factWeekends: "weekends",
    factSeasons: "seasons",
    factBirthdays: "birthdays",
    factFullMoons: "full moons",
    factLeft: "left",
    lensCalcTitle: "If, each year, I…",
    lensActivityPh: "do something (e.g. travel, read, go home)",
    lensTimesPre: "times a year",
    lensTimesUnit: "×",
    lensOtherAgePh: "their age (optional)",
    lensOtherAgeHint: "Enter someone's age to count against their life instead — e.g. \"how many times will I see my parents\".",
    lensResultPre: "In the rest of your life, about",
    lensResultUnit: "more times",
    lensYearsHint: (y) => `based on ~${y} years left`,
    lensPresets: [
      { label: "Travel", freq: 2 },
      { label: "Read a book", freq: 15 },
      { label: "See old friends", freq: 4 },
      { label: "Dinner with parents", freq: 6 },
      { label: "See the ocean", freq: 1 },
      { label: "Go home for holidays", freq: 1 },
    ],
    quickMoodTitle: "How do you feel?",
    quickMoodHint: "One tap records it into this month",
    jumpNow: "Back to now",
    randomMemory: "Random memory",
    lifeRingLabel: "elapsed",
  },
};

export function detectInitialLang(): Lang {
  const saved = localStorage.getItem("memento900.lang");
  if (saved === "zh" || saved === "en") return saved;
  return typeof navigator !== "undefined" && navigator.language?.startsWith("zh")
    ? "zh"
    : "en";
}
