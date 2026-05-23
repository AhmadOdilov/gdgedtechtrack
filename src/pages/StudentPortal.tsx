import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "../context/AppContext";
import { useToast } from "../context/ToastContext";
import { useSound } from "../hooks/useSound";
import { gradeHomework } from "../services/aiService";
import { fileToDataUrl } from "../utils/image";
import { ACHIEVEMENTS, evaluateAchievements, REWARD_CRYSTALS, REWARD_XP } from "../utils/gameData";
import type { Lang } from "../types";
import Mascot from "../components/Mascot";
import Particles from "../components/Particles";
import Button from "../components/ui/Button";
import { QR, Camera, Crystal, Star, Bolt, Check, Sparkle } from "../components/icons";
import { cn } from "../utils/cn";

interface Sample {
  id: string;
  emoji: string;
  title: Record<Lang, string>;
  description: string;
}
const SAMPLES: Sample[] = [
  { id: "s1", emoji: "➕", title: { en: "Addition (1 slip)", ru: "Сложение (1 ошибка)", uz: "Qo'shish (1 xato)" }, description: "A Grade 1 pupil's single-digit addition worksheet: 2 + 3 = 5, 4 + 4 = 8, 6 + 1 = 7, 5 + 2 = 8, 3 + 3 = 6." },
  { id: "s2", emoji: "🌟", title: { en: "Addition (perfect)", ru: "Сложение (без ошибок)", uz: "Qo'shish (xatosiz)" }, description: "A neat single-digit addition worksheet: 2 + 6 = 8, 3 + 4 = 7, 1 + 1 = 2, 5 + 5 = 10, 7 + 2 = 9." },
  { id: "s3", emoji: "➖", title: { en: "Subtraction (1 slip)", ru: "Вычитание (1 ошибка)", uz: "Ayirish (1 xato)" }, description: "A subtraction worksheet up to 20: 9 - 4 = 5, 8 - 3 = 5, 10 - 6 = 3, 7 - 2 = 5." },
];

export default function StudentPortal() {
  const { studentUnlocked, setStudentUnlocked } = useApp();
  if (!studentUnlocked) return <QrLogin onUnlock={() => setStudentUnlocked(true)} />;
  return <Quest />;
}

/* ---------------- QR login ---------------- */
function QrLogin({ onUnlock }: { onUnlock: () => void }) {
  const { t } = useApp();
  const play = useSound();
  const [scanning, setScanning] = useState(false);

  const scan = () => {
    setScanning(true);
    play("scan");
    setTimeout(() => { play("success"); onUnlock(); }, 1700);
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] grid place-items-center overflow-hidden bg-gradient-to-b from-violet-100 via-violet-50 to-orange-50 dark:from-grape/30 dark:via-slate-900 dark:to-slate-900 px-4 py-10">
      <Particles count={16} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md text-center">
        <div className="anim-float inline-block"><Mascot size={140} mood="happy" /></div>
        <h1 className="font-display font-bold text-3xl text-grape dark:text-grape-light mt-2">{t("student.welcome")}</h1>
        <p className="text-slate-600 dark:text-slate-300 font-bold mb-7">{t("student.subtitle")}</p>

        <div className="relative mx-auto w-56 h-56 rounded-3xl bg-white dark:bg-slate-800 p-4 brick-shadow grid place-items-center overflow-hidden">
          <FakeQR />
          {scanning && (
            <>
              <div className="absolute inset-x-3 h-0.5 bg-neon shadow-[0_0_12px_2px_#22c55e] scan-line rounded-full" />
              <div className="absolute inset-0 bg-grape/5" />
            </>
          )}
        </div>

        <Button variant="neon" size="lg" brick onClick={scan} disabled={scanning} className="mt-7 w-full glow-ring">
          {scanning ? (
            <><span className="h-5 w-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />{t("student.scanning")}</>
          ) : (
            <><QR width={22} height={22} />{t("student.scanQr")}</>
          )}
        </Button>
      </motion.div>
    </div>
  );
}

function FakeQR() {
  const cells = Array.from({ length: 49 }, (_, i) => {
    const r = Math.floor(i / 7), c = i % 7;
    const corner = (r < 2 && c < 2) || (r < 2 && c > 4) || (r > 4 && c < 2);
    return corner || (i * 7 + 3) % 5 < 2;
  });
  return (
    <div className="grid grid-cols-7 gap-1 w-40 h-40">
      {cells.map((on, i) => <div key={i} className={cn("rounded-[3px]", on ? "bg-ink dark:bg-slate-200" : "bg-transparent")} />)}
    </div>
  );
}

/* ---------------- quest ---------------- */
function Quest() {
  const { t, lang, provider, activeKey, model, hasKey, crystals, unlocked, addReward, unlockAchievements, setLastResult, setRole } = useApp();
  const { push } = useToast();
  const play = useSound();
  const fileRef = useRef<HTMLInputElement>(null);

  const [imageData, setImageData] = useState<string | null>(null);
  const [sample, setSample] = useState<Sample | null>(null);
  const [stage, setStage] = useState<"idle" | "analyzing">("idle");

  const pickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageData(await fileToDataUrl(file));
    setSample(null);
    play("pop");
  };
  const chooseSample = (s: Sample) => { setSample(s); setImageData(null); play("pop"); };
  const reset = () => { setImageData(null); setSample(null); if (fileRef.current) fileRef.current.value = ""; };
  const canSubmit = !!imageData || !!sample;

  const submit = async () => {
    if (!canSubmit) return;
    setStage("analyzing");
    play("scan");
    const startedAt = Date.now();
    const result = await gradeHomework({
      provider, apiKey: activeKey, model, lang,
      imageDataUrl: imageData ?? undefined,
      textDescription: sample?.description,
      timeoutMs: 30000, retries: 1,
    });
    const elapsed = Date.now() - startedAt;
    if (elapsed < 2200) await new Promise((r) => setTimeout(r, 2200 - elapsed));

    addReward(REWARD_XP, REWARD_CRYSTALS);
    const newly = evaluateAchievements(result, crystals + REWARD_CRYSTALS, unlocked);
    unlockAchievements(newly);
    setLastResult(result);

    play("reward");
    push("reward", t("toast.rewardTitle"), t("toast.rewardBody", { xp: REWARD_XP, crystals: REWARD_CRYSTALS }));
    if (result.fellBack) push("info", t("toast.fellBack"));
    newly.forEach((id) => {
      const a = ACHIEVEMENTS.find((x) => x.id === id);
      if (a) push("success", t("toast.badge", { name: a.name[lang] }));
    });

    setStage("idle");
    reset();
    setRole("review");
  };

  if (stage === "analyzing") return <Analyzing imageData={imageData} sample={sample} />;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-gradient-to-b from-violet-50 to-orange-50/40 dark:from-slate-900 dark:to-slate-900 px-4 py-6 sm:py-8">
      <Particles count={10} className="opacity-60" />
      <div className="relative mx-auto max-w-3xl space-y-6">
        <StudentHeader />

        {/* quest card */}
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl text-white p-6 brick-shadow studs relative overflow-hidden aurora">
          <div className="absolute -right-6 -top-6 opacity-20"><Sparkle width={120} height={120} /></div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[12px] font-extrabold uppercase tracking-wide"><Bolt width={14} height={14} /> {t("student.todaysQuestLabel")}</span>
          <h2 className="font-display font-bold text-2xl sm:text-3xl mt-2">{t("student.todaysQuest")}</h2>
          <p className="text-white/90 font-semibold mt-1 max-w-md">{t("student.questDesc")}</p>
        </motion.div>

        {/* uploader */}
        <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 sm:p-6 shadow-sm">
          <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={pickFile} className="hidden" />

          {!canSubmit ? (
            <button onClick={() => fileRef.current?.click()} className="w-full rounded-3xl border-[3px] border-dashed border-grape-light bg-violet-50/60 dark:bg-grape/10 px-4 py-10 text-center hover:bg-violet-50 dark:hover:bg-grape/15 transition-colors group">
              <span className="grid place-items-center mx-auto h-20 w-20 rounded-3xl bg-grape text-white brick-shadow-sm group-hover:scale-105 transition-transform"><Camera width={36} height={36} /></span>
              <p className="mt-4 font-display font-bold text-xl text-grape dark:text-grape-light">{t("student.takePhoto")}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold mt-1">{t("student.uploadHint")}</p>
            </button>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="relative rounded-3xl overflow-hidden border-2 border-grape-light bg-slate-50 dark:bg-slate-900">
                {imageData ? (
                  <img src={imageData} alt="notebook" className="w-full max-h-72 object-contain bg-white dark:bg-slate-900" />
                ) : (
                  <div className="grid place-items-center py-12">
                    <div className="text-7xl">{sample?.emoji}</div>
                    <p className="mt-3 font-mono text-sm font-bold text-slate-500 dark:text-slate-400 px-6 text-center">{sample?.title[lang]}</p>
                  </div>
                )}
                <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-neon px-3 py-1 text-[12px] font-extrabold text-white shadow"><Check width={14} height={14} />{imageData ? t("student.photoReady") : t("student.sampleReady")}</span>
              </div>
              <button onClick={reset} className="mt-3 text-sm font-extrabold text-slate-500 dark:text-slate-400 hover:text-grape underline underline-offset-2">{t("student.change")}</button>
            </motion.div>
          )}

          {/* samples */}
          <div className="mt-5">
            <p className="text-[13px] font-extrabold text-slate-500 dark:text-slate-400 mb-2">{t("student.orPickSample")}</p>
            <div className="grid grid-cols-3 gap-2.5">
              {SAMPLES.map((s) => (
                <button key={s.id} onClick={() => chooseSample(s)} className={cn("rounded-2xl border-2 p-3 text-center transition-all", sample?.id === s.id ? "border-grape bg-violet-50 dark:bg-grape/20 scale-[1.02]" : "border-slate-200 dark:border-slate-600 hover:border-grape-light bg-white dark:bg-slate-800")}>
                  <div className="text-3xl">{s.emoji}</div>
                  <p className="mt-1 text-[11px] font-extrabold leading-tight text-slate-600 dark:text-slate-300">{s.title[lang]}</p>
                </button>
              ))}
            </div>
          </div>

          <Button variant="orange" size="lg" brick onClick={submit} disabled={!canSubmit} className="mt-5 w-full">
            <Sparkle width={20} height={20} />{t("student.submit")}
          </Button>
          {!hasKey && <p className="mt-2 text-center text-[12px] text-slate-400 dark:text-slate-500 font-semibold">{t("settings.statusMock")}</p>}
        </div>
      </div>
    </div>
  );
}

function StudentHeader() {
  const { t, xp, crystals, level, setStudentUnlocked } = useApp();
  const play = useSound();
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 shadow-sm">
      <Mascot size={56} />
      <div className="min-w-0">
        <p className="text-[12px] font-bold text-slate-400 dark:text-slate-500">{t("student.loggedAs")}</p>
        <p className="font-extrabold text-ink dark:text-slate-100 truncate">{t("student.demoStudent")}</p>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Stat icon={<Star width={15} height={15} />} value={xp} cls="text-tangerine-dark bg-orange-50 dark:bg-tangerine/15" />
        <Stat icon={<Crystal width={15} height={15} />} value={crystals} cls="text-grape dark:text-grape-light bg-violet-50 dark:bg-grape/15" />
        <span className="hidden sm:grid place-items-center h-8 px-2.5 rounded-full bg-neon/15 text-[12px] font-extrabold text-green-700 dark:text-neon-light">{t("student.level")} {level}</span>
        <button onClick={() => { play("click"); setStudentUnlocked(false); }} className="text-[12px] font-extrabold text-slate-400 hover:text-red-500 ml-1">{t("student.logout")}</button>
      </div>
    </motion.div>
  );
}
function Stat({ icon, value, cls }: { icon: React.ReactNode; value: number; cls: string }) {
  return <span className={cn("flex items-center gap-1 h-8 px-2.5 rounded-full text-[13px] font-extrabold", cls)}>{icon}{value}</span>;
}

/* ---------------- analyzing ---------------- */
function Analyzing({ imageData, sample }: { imageData: string | null; sample: Sample | null }) {
  const { t } = useApp();
  return (
    <div className="relative min-h-[calc(100vh-4rem)] grid place-items-center overflow-hidden bg-gradient-to-b from-grape to-grape-dark dark:from-slate-900 dark:to-slate-950 px-4 py-10">
      <Particles count={20} />
      <div className="relative w-full max-w-md text-center text-white">
        <div className="anim-float inline-block mb-2"><Mascot size={120} mood="think" /></div>

        <div className="relative mx-auto w-64 h-48 rounded-3xl bg-white/10 border-2 border-white/30 overflow-hidden backdrop-blur">
          {imageData ? <img src={imageData} alt="" className="w-full h-full object-contain" /> : <div className="grid place-items-center h-full text-6xl">{sample?.emoji ?? "📒"}</div>}
          <div className="absolute inset-x-0 h-1 bg-neon shadow-[0_0_16px_4px_#22c55e] scan-line" />
        </div>

        <div className="mt-7 flex items-center justify-center gap-3">
          <span className="relative h-7 w-7">
            <span className="absolute inset-0 rounded-full border-[3px] border-white/30 border-t-white animate-spin" />
            <span className="absolute inset-1.5 rounded-full bg-white/30 animate-ping" />
          </span>
          <p className="font-display font-bold text-xl">{t("student.analyzing")}</p>
        </div>
        <p className="text-violet-100 text-sm font-semibold mt-2">{t("student.analyzingSub")}</p>

        <div className="mt-6 space-y-2.5">
          {[90, 70, 80].map((w, i) => <div key={i} className="h-3 rounded-full shimmer mx-auto" style={{ width: `${w}%`, animationDelay: `${i * 0.2}s` }} />)}
        </div>
      </div>
    </div>
  );
}
