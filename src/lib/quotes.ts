import type { Lang } from "./i18n";

/**
 * A small, curated set of memento-mori / impermanence quotes.
 * Bilingual. Rotated deterministically by day so the same calendar day always
 * shows the same quote — a quiet "today's thought", not a random shuffle.
 */
export interface Quote {
  zh: string;
  en: string;
  author: string;
}

export const QUOTES: Quote[] = [
  { zh: "你可能明天就会离开人世——让这个念头塑造你此刻的所作所为、所思所言。", en: "You could leave life right now. Let that determine what you do and say and think.", author: "Marcus Aurelius" },
  { zh: "记住你终将死去。", en: "Remember that you will die.", author: "Memento mori" },
  { zh: "重要的不是活得长,而是活得好。", en: "It is not that we have a short time to live, but that we waste a lot of it.", author: "Seneca" },
  { zh: "向死而生。", en: "Being-toward-death.", author: "Heidegger" },
  { zh: "我们都是将死之人,却假装自己会永远活着。", en: "We all die. The goal isn't to live forever, the goal is to create something that will.", author: "Chuck Palahniuk" },
  { zh: "时间是你拥有的最宝贵、也最易逝的东西。", en: "Time is the most valuable thing a man can spend.", author: "Theophrastus" },
  { zh: "别再空谈一个好人应该是什么样子——直接去做一个。", en: "Waste no more time arguing about what a good person should be. Be one.", author: "Marcus Aurelius" },
  { zh: "黄昏将至,才知白昼的价值。", en: "The day is what you make it, so why not make it a great one?", author: "Steve Schulte" },
  { zh: "我们拥有的从来不是时间本身,而是当下。", en: "The whole future lies in uncertainty: live immediately.", author: "Seneca" },
  { zh: "一个人若日日畏惧死亡,便日日都活在死亡里。", en: "He who fears death will never do anything worthy of a living man.", author: "Seneca" },
  { zh: "你今天拖延的,正是你生命的一部分。", en: "While we are postponing, life speeds by.", author: "Seneca" },
  { zh: "黎明时分,告诉自己:我将遇见的人或许多管闲事——但我今天仍要善待他们。", en: "When you arise in the morning, think of what a precious privilege it is to be alive.", author: "Marcus Aurelius" },
  { zh: "生命的长度不由年岁决定,而由你如何度过它。", en: "It is not the years in your life but the life in your years that counts.", author: "Adlai Stevenson" },
  { zh: "尘归尘,土归土——但在此之前,好好燃烧。", en: "Do not act as if you had ten thousand years to live.", author: "Marcus Aurelius" },
  { zh: "人生苦短,别留给悔恨。", en: "Life is long if you know how to use it.", author: "Seneca" },
  { zh: "你无法延长生命的长度,但可以拓展它的深度。", en: "You cannot lengthen your life, but you can deepen it.", author: "Anonymous" },
  { zh: "每一个清晨,都是命运额外的馈赠。", en: "Begin at once to live, and count each separate day as a separate life.", author: "Seneca" },
  { zh: "落叶知秋,人当知时。", en: "Autumn leaves know their season; may we know ours.", author: "Anonymous" },
  { zh: "你的时间有限,不要浪费它去活在别人的生活里。", en: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs" },
  { zh: "死亡是生命最好的发明——它清除旧的,让位给新的。", en: "Death is very likely the single best invention of life.", author: "Steve Jobs" },
  { zh: "我们害怕的不是死亡,而是从未真正活过。", en: "The fear of death follows from the fear of life. A man who lives fully is prepared to die at any time.", author: "Mark Twain" },
  { zh: "活着的每一天,都在向终点靠近——所以请认真地活。", en: "Let us prepare our minds as if we'd come to the very end of life.", author: "Seneca" },
  { zh: "不要数你活了多少年,而要数你真正活过的瞬间。", en: "Count not the years, but the moments truly lived.", author: "Anonymous" },
  { zh: "今天,是你余生最年轻的一天。", en: "Today is the youngest you will ever be again.", author: "Anonymous" },
  { zh: "繁花终将凋零,正因如此才值得凝望。", en: "The flower that blooms in adversity is the most rare and beautiful of all.", author: "Anonymous" },
  { zh: "把每一天都当作一生来过。", en: "Live each day as if it were your whole life.", author: "Anonymous" },
  { zh: "时间不会等待任何人,但它会奖励珍惜它的人。", en: "Lost time is never found again.", author: "Benjamin Franklin" },
  { zh: "生命的意义不在于停留,而在于流动中留下的痕迹。", en: "What we do in life echoes in eternity.", author: "Marcus Aurelius" },
  { zh: "当你凝视这 900 个格子,你凝视的是有限本身。", en: "To look at all 900 squares is to look at finitude itself.", author: "Memento 900" },
  { zh: "珍惜这一格,因为它再也不会回来。", en: "Cherish this square, for it will never return.", author: "Memento 900" },
  { zh: "你不会永远拥有时间,但你永远拥有当下。", en: "You will not always have time, but you always have now.", author: "Memento 900" },
];

/** Days since the Unix epoch (UTC), used to pick today's quote deterministically. */
function dayIndex(d = new Date()): number {
  return Math.floor(
    Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000,
  );
}

/** The quote for a given day (defaults to today). Stable per calendar day. */
export function quoteOfTheDay(lang: Lang, d = new Date()): { text: string; author: string } {
  const q = QUOTES[dayIndex(d) % QUOTES.length]!;
  return { text: lang === "zh" ? q.zh : q.en, author: q.author };
}
