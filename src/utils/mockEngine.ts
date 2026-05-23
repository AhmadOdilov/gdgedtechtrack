import type { AIResult, Lang } from "../types";

/* ============================================================
 *  MOCK ENGINE — genuinely checks arithmetic in the sample text
 *  so the demo is correct even with no API key.
 * ============================================================ */
export function mockGrade(lang: Lang, description?: string): AIResult {
  const checks = description ? extractEquations(description) : [];

  let steps: AIResult["steps"] = [];
  let errors: string[] = [];

  if (checks.length) {
    steps = checks.map((c) => ({
      step: c.text,
      correct: c.correct,
      note: c.correct ? "" : gentleNote(lang, c.expected),
    }));
    errors = steps
      .filter((s) => !s.correct)
      .map((s) => `${s.step.replace(/=\s*-?\d+/, "= ?")}  →  ${s.note}`);
  } else {
    steps = canned(lang);
    errors = steps.filter((s) => !s.correct).map((s) => `${s.step}  →  ${s.note}`);
  }

  const correct = steps.filter((s) => s.correct).length;
  const total = steps.length || 1;
  const score = Math.max(20, Math.round((correct / total) * 100));
  const feedback = mockFeedback(lang, correct, total, steps.find((s) => !s.correct)?.step);

  return { score, errors, feedback, steps, source: "mock" };
}

interface Eq {
  text: string;
  correct: boolean;
  expected: number;
}

/** Find arithmetic like "5 + 2 = 8", "7-3=4", "3 x 4 = 12". */
function extractEquations(text: string): Eq[] {
  const re = /(\d+)\s*([+\-x×*])\s*(\d+)\s*=\s*(\d+)/g;
  const out: Eq[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const a = Number(m[1]);
    const op = m[2];
    const b = Number(m[3]);
    const given = Number(m[4]);
    let expected = a + b;
    if (op === "-") expected = a - b;
    else if (op === "x" || op === "×" || op === "*") expected = a * b;
    out.push({ text: `${a} ${normOp(op)} ${b} = ${given}`, correct: expected === given, expected });
  }
  return out;
}

function normOp(op: string): string {
  if (op === "x" || op === "*" || op === "×") return "×";
  return op;
}

function gentleNote(lang: Lang, expected: number): string {
  const t: Record<Lang, string> = {
    en: `try again — the answer is ${expected}`,
    ru: `попробуй ещё — должно быть ${expected}`,
    uz: `yana urin — javob ${expected} bo'lishi kerak`,
  };
  return t[lang];
}

function canned(lang: Lang): AIResult["steps"] {
  const note: Record<Lang, string> = {
    en: "a sneaky number slipped in here",
    ru: "сюда закралось хитрое число",
    uz: "bu yerga ayyor son yashiringan",
  };
  return [
    { step: "2 + 3 = 5", correct: true, note: "" },
    { step: "4 + 4 = 8", correct: true, note: "" },
    { step: "6 + 1 = 7", correct: true, note: "" },
    { step: "5 + 2 = 8", correct: false, note: note[lang] },
    { step: "3 + 3 = 6", correct: true, note: "" },
  ];
}

function mockFeedback(lang: Lang, correct: number, total: number, wrongStep?: string): string {
  const allRight = correct === total;
  if (lang === "uz") {
    return allRight
      ? `Zo'r ish, kosmik sayohatchi! 🚀 Barcha ${total} ta jumboqni yechding — birorta ham xato yo'q! Sen haqiqiy matematika qahramonisan! ⭐`
      : `Ajoyib ish, kosmik sayohatchi! 🚀 ${total} ta jumboqdan ${correct} tasini yechding. Ayyor tulki ${wrongStep ? `"${wrongStep}"` : "bitta misol"} ichiga bitta sonni yashirib qo'yibdi — uni topa olasanmi? 🦊 Sen deyarli yetib kelding!`;
  }
  if (lang === "ru") {
    return allRight
      ? `Отличная работа, космический путешественник! 🚀 Ты решил все ${total} загадки — без единой ошибки! Ты настоящий герой математики! ⭐`
      : `Молодец, космический путешественник! 🚀 Ты решил ${correct} из ${total} загадок. Хитрая лиса спрятала одно число в ${wrongStep ? `«${wrongStep}»` : "одном примере"} — сможешь его найти? 🦊 Ты почти у цели!`;
  }
  return allRight
    ? `Amazing work, space traveler! 🚀 You solved all ${total} riddles with zero mistakes — you're a true math hero! ⭐`
    : `Great job, space traveler! 🚀 You solved ${correct} of ${total} riddles. A sneaky fox hid one number in ${wrongStep ? `"${wrongStep}"` : "one task"} — can you find it? 🦊 You're almost there!`;
}
