import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "../context/AppContext";
import { useToast } from "../context/ToastContext";
import { useSound } from "../hooks/useSound";
import { useCountUp } from "../hooks/useCountUp";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import ProgressBar from "../components/ui/ProgressBar";
import { LineChart, BarChart, DonutChart } from "../components/charts/Charts";
import { Check, Pencil, Plus, Clock, Chart, Users, Star, Upload } from "../components/icons";
import { fadeUp, staggerContainer } from "../animations/variants";
import { cn } from "../utils/cn";
import type { Lang } from "../types";

type TaskStatus = "active" | "grading" | "done";
interface ClassTask {
  id: string;
  titleKey: string;
  due: string;
  total: number;
  submitted: number;
  status: TaskStatus;
  emoji: string;
}

const TASKS: ClassTask[] = [
  { id: "t1", titleKey: "task.addition", due: "Today, 16:00", total: 30, submitted: 26, status: "grading", emoji: "➕" },
  { id: "t2", titleKey: "task.subtraction", due: "Tomorrow", total: 30, submitted: 12, status: "active", emoji: "➖" },
  { id: "t3", titleKey: "task.shapes", due: "Fri", total: 30, submitted: 30, status: "done", emoji: "🔷" },
  { id: "t4", titleKey: "task.multiplication", due: "Next week", total: 30, submitted: 4, status: "active", emoji: "✖️" },
];

interface ReviewStep {
  step: string;
  correct: boolean;
  noteKey?: Record<Lang, string>;
}
const REVIEW_STEPS: ReviewStep[] = [
  { step: "2 + 3 = 5", correct: true },
  { step: "4 + 4 = 8", correct: true },
  { step: "6 + 1 = 7", correct: true },
  { step: "5 + 2 = 8", correct: false, noteKey: { en: "should be 7", ru: "должно быть 7", uz: "7 bo'lishi kerak" } },
  { step: "3 + 3 = 6", correct: true },
];

export default function TeacherDashboard() {
  const { t } = useApp();
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      <motion.div variants={fadeUp}>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-ink dark:text-slate-100">{t("teacher.title")}</h1>
        <p className="text-slate-500 dark:text-slate-400 font-semibold">{t("teacher.subtitle")}</p>
      </motion.div>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard tone="violet" icon={<Check width={22} height={22} />} label={t("teacher.checkedToday")} target={26} suffix="/30" progress={26 / 30} />
        <MetricCard tone="green" icon={<Clock width={22} height={22} />} label={t("teacher.timeSaved")} target={2.5} decimals={1} suffix={` ${t("teacher.hours")}`} progress={0.62} />
        <MetricCard tone="orange" icon={<Chart width={22} height={22} />} label={t("teacher.classAvg")} target={85} suffix="%" progress={0.85} />
      </section>

      <ClassTasks />
      <AIVerification steps={REVIEW_STEPS} />
      <Analytics />
    </motion.div>
  );
}

/* ---------------- metric card ---------------- */
function MetricCard({
  tone, icon, label, target, suffix = "", decimals = 0, progress,
}: {
  tone: "violet" | "green" | "orange";
  icon: React.ReactNode;
  label: string;
  target: number;
  suffix?: string;
  decimals?: number;
  progress: number;
}) {
  const count = useCountUp(target, 1200, decimals);
  const tones = {
    violet: { bg: "bg-violet-50 dark:bg-grape/15", fg: "text-grape dark:text-grape-light", bar: "bg-grape" },
    green: { bg: "bg-green-50 dark:bg-neon/15", fg: "text-green-600 dark:text-neon-light", bar: "bg-neon" },
    orange: { bg: "bg-orange-50 dark:bg-tangerine/15", fg: "text-tangerine-dark", bar: "bg-tangerine" },
  }[tone];
  return (
    <motion.div variants={fadeUp} whileHover={{ y: -4 }}>
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <span className={cn("grid place-items-center h-12 w-12 rounded-2xl", tones.bg, tones.fg)}>{icon}</span>
          <span className={cn("font-display font-bold text-3xl tabular-nums", tones.fg)}>{count}{suffix}</span>
        </div>
        <p className="mt-3 text-sm font-bold text-slate-500 dark:text-slate-400">{label}</p>
        <ProgressBar value={progress} barClassName={tones.bar} className="mt-2" delay={0.2} />
      </Card>
    </motion.div>
  );
}

/* ---------------- class tasks + drag/drop ---------------- */
function ClassTasks() {
  const { t } = useApp();
  const { push } = useToast();
  const play = useSound();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const active = TASKS.filter((x) => x.status !== "done").length;

  const upload = () => {
    play("success");
    push("success", t("toast.taskUploaded"));
  };

  return (
    <motion.section variants={fadeUp}>
      <div className="flex items-end justify-between mb-3 flex-wrap gap-3">
        <div>
          <h2 className="font-display font-bold text-xl text-ink dark:text-slate-100 flex items-center gap-2">
            <Users width={20} height={20} className="text-grape dark:text-grape-light" />
            {t("teacher.classTasks")}
          </h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 font-semibold">{active} {t("teacher.activeAssignments")}</p>
        </div>
        <Button variant="grape" brick onClick={() => fileRef.current?.click()}>
          <Plus width={18} height={18} />
          {t("teacher.uploadNewTask")}
        </Button>
      </div>

      <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={() => upload()} />

      {/* drag & drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); upload(); }}
        onClick={() => fileRef.current?.click()}
        className={cn(
          "mb-4 cursor-pointer rounded-3xl border-2 border-dashed px-4 py-6 flex items-center justify-center gap-3 text-center transition-all",
          dragging
            ? "border-grape bg-violet-50 dark:bg-grape/15 scale-[1.01]"
            : "border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/40 hover:border-grape-light"
        )}
      >
        <Upload width={22} height={22} className={dragging ? "text-grape" : "text-slate-400"} />
        <span className="font-bold text-sm text-slate-500 dark:text-slate-400">
          {dragging ? t("teacher.dropActive") : t("teacher.dropHint")}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TASKS.map((task, i) => <TaskRow key={task.id} task={task} index={i} />)}
      </div>
    </motion.section>
  );
}

function TaskRow({ task, index }: { task: ClassTask; index: number }) {
  const { t } = useApp();
  const statusStyle: Record<TaskStatus, string> = {
    active: "bg-violet-50 dark:bg-grape/20 text-grape dark:text-grape-light",
    grading: "bg-orange-50 dark:bg-tangerine/15 text-tangerine-dark",
    done: "bg-green-50 dark:bg-neon/15 text-green-600 dark:text-neon-light",
  };
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }} whileHover={{ y: -3 }}>
      <Card className="p-4 flex items-center gap-4" hover>
        <span className="grid place-items-center h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-700 text-2xl shrink-0">{task.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-ink dark:text-slate-100 truncate">{t(task.titleKey)}</h3>
            <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-extrabold", statusStyle[task.status])}>{t(`teacher.status.${task.status}`)}</span>
          </div>
          <p className="text-[12px] text-slate-400 dark:text-slate-500 font-semibold">{t("teacher.due")}: {task.due}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <ProgressBar value={task.submitted / task.total} className="flex-1" height="h-1.5" delay={0.1 + index * 0.05} />
            <span className="text-[12px] font-extrabold text-slate-500 dark:text-slate-400 shrink-0">{task.submitted}/{task.total} {t("teacher.submitted")}</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

/* ---------------- AI verification ---------------- */
function AIVerification({ steps }: { steps: ReviewStep[] }) {
  const { t, lang } = useApp();
  const { push } = useToast();
  const play = useSound();
  const [decision, setDecision] = useState<"none" | "confirmed" | "override">("none");
  const [grade, setGrade] = useState(80);
  const [comment, setComment] = useState("");
  const [savedOverride, setSavedOverride] = useState(false);
  const aiScore = 80;

  const confirm = () => { setDecision("confirmed"); play("success"); push("success", t("toast.gradeConfirmed")); };
  const saveOverride = () => { setSavedOverride(true); play("pop"); push("info", t("toast.gradeOverridden", { grade })); };

  return (
    <motion.section variants={fadeUp}>
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-violet-50 to-white dark:from-grape/15 dark:to-transparent p-5 border-b border-slate-100 dark:border-slate-700">
          <h2 className="font-display font-bold text-xl text-ink dark:text-slate-100 flex items-center gap-2">
            <Star width={20} height={20} className="text-grape dark:text-grape-light" />
            {t("teacher.aiVerification")}
          </h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 font-semibold">{t("teacher.aiVerificationSub")}</p>
        </div>

        <div className="p-5 grid lg:grid-cols-2 gap-5">
          {/* left */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="grid place-items-center h-11 w-11 rounded-full bg-grape text-white font-display font-bold">A</span>
              <div>
                <p className="text-[12px] font-bold text-slate-400 dark:text-slate-500">{t("teacher.student")}</p>
                <p className="font-extrabold text-ink dark:text-slate-100">Aziz Karimov · 1-B</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-[12px] font-bold text-slate-400 dark:text-slate-500">{t("teacher.task")}</p>
                <p className="font-bold text-ink dark:text-slate-100 text-sm">{t("task.addition")}</p>
              </div>
            </div>

            <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/40 p-4">
              <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">{t("teacher.flaggedSteps")}</p>
              <ul className="space-y-2">
                {steps.map((s, i) => (
                  <li key={i} className={cn("flex items-center gap-2.5 rounded-xl px-3 py-2 font-mono font-bold", s.correct ? "bg-white dark:bg-slate-800 text-ink dark:text-slate-100" : "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 ring-1 ring-red-200 dark:ring-red-900")}>
                    <span className={cn("grid place-items-center h-6 w-6 rounded-lg shrink-0", s.correct ? "bg-green-100 dark:bg-neon/20 text-green-600 dark:text-neon-light" : "bg-red-100 dark:bg-red-900/40 text-red-500")}>
                      {s.correct ? <Check width={14} height={14} /> : "✕"}
                    </span>
                    <span>{s.step}</span>
                    {!s.correct && s.noteKey && <span className="ml-auto text-[12px] font-bold text-red-400">{s.noteKey[lang]}</span>}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* right */}
          <div className="flex flex-col">
            <div className="rounded-2xl bg-ink dark:bg-slate-900 text-white p-5 text-center">
              <p className="text-[12px] font-bold text-violet-200 uppercase tracking-wide">{t("teacher.aiScore")}</p>
              <p className="font-display font-bold text-6xl my-1">{aiScore}</p>
              <div className="mx-auto max-w-[200px]"><ProgressBar value={0.8} barClassName="bg-neon" /></div>
            </div>

            {/* teacher comments */}
            <div className="mt-4">
              <label className="block text-[13px] font-extrabold text-slate-600 dark:text-slate-300 mb-1.5">{t("teacher.comments")}</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t("teacher.commentsPlaceholder")}
                rows={2}
                className="w-full rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3.5 py-2.5 text-sm font-semibold text-ink dark:text-slate-100 outline-none focus:border-grape resize-none"
              />
            </div>

            <div className="mt-4 flex-1 flex flex-col justify-end gap-3">
              {decision !== "override" && (
                <div className="grid grid-cols-2 gap-3">
                  <Button variant={decision === "confirmed" ? "neon" : "soft"} size="lg" brick onClick={confirm} className={decision === "confirmed" ? "" : "!bg-green-50 dark:!bg-neon/15 !text-green-700 dark:!text-neon-light"}>
                    <Check width={18} height={18} />{t("teacher.confirmGrade")}
                  </Button>
                  <Button size="lg" brick onClick={() => { setDecision("override"); setSavedOverride(false); play("click"); }} className="!bg-orange-50 dark:!bg-tangerine/15 !text-tangerine-dark">
                    <Pencil width={18} height={18} />{t("teacher.overrideSystem")}
                  </Button>
                </div>
              )}

              {decision === "override" && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border-2 border-tangerine/40 bg-orange-50 dark:bg-tangerine/10 p-4">
                  <label className="block text-[13px] font-extrabold text-tangerine-dark mb-2">{t("teacher.newGrade")}: <span className="font-display text-lg">{grade}</span></label>
                  <input type="range" min={1} max={100} value={grade} onChange={(e) => { setGrade(Number(e.target.value)); setSavedOverride(false); }} className="w-full accent-tangerine-dark" />
                  <div className="mt-3 flex gap-2">
                    <Button variant="ghost" className="flex-1" onClick={() => setDecision("none")}>{t("settings.cancel")}</Button>
                    <Button variant="orange" className="flex-1" brick onClick={saveOverride}>{t("teacher.save")}</Button>
                  </div>
                </motion.div>
              )}

              {decision === "confirmed" && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 rounded-2xl bg-green-50 dark:bg-neon/15 px-4 py-3 text-sm font-extrabold text-green-700 dark:text-neon-light">
                  <Check width={18} height={18} />{t("teacher.confirmed")}
                </motion.div>
              )}
              {savedOverride && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 rounded-2xl bg-orange-100 dark:bg-tangerine/15 px-4 py-3 text-sm font-extrabold text-tangerine-dark">
                  <Pencil width={16} height={16} />{t("teacher.overridden")} ({grade})
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.section>
  );
}

/* ---------------- analytics ---------------- */
function Analytics() {
  const { t } = useApp();
  const days = t("teacher.weekdays").split(",");
  const weekly = [62, 70, 68, 78, 82, 88, 85];
  const progress = [
    { label: "A", value: 92, color: "#22c55e" },
    { label: "B", value: 78, color: "#7c3aed" },
    { label: "C", value: 64, color: "#fb923c" },
    { label: "D", value: 88, color: "#22c55e" },
    { label: "E", value: 54, color: "#fb923c" },
    { label: "F", value: 73, color: "#7c3aed" },
  ];
  return (
    <motion.section variants={fadeUp}>
      <h2 className="font-display font-bold text-xl text-ink dark:text-slate-100 flex items-center gap-2 mb-3">
        <Chart width={20} height={20} className="text-grape dark:text-grape-light" />
        {t("teacher.analytics")}
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-1">
          <p className="font-bold text-slate-600 dark:text-slate-300 mb-2">{t("teacher.weeklyPerformance")}</p>
          <LineChart data={weekly} labels={days} />
        </Card>
        <Card className="p-5 lg:col-span-1">
          <p className="font-bold text-slate-600 dark:text-slate-300 mb-4">{t("teacher.studentProgress")}</p>
          <BarChart data={progress} />
        </Card>
        <Card className="p-5 lg:col-span-1 flex flex-col items-center justify-center">
          <p className="font-bold text-slate-600 dark:text-slate-300 mb-3 self-start">{t("teacher.aiAccuracy")}</p>
          <DonutChart value={94} label={t("teacher.aiAccuracy")} />
        </Card>
      </div>
    </motion.section>
  );
}
