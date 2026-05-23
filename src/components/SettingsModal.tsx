import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { useToast } from "../context/ToastContext";
import { DEFAULT_MODELS, PROVIDER_MODELS, SYSTEM_PROMPT } from "../api/prompt";
import { testConnection } from "../services/aiService";
import type { ConnectionResult, Provider } from "../types";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import { Gear, Lock, X, Check, Bolt, Plug, Eye, EyeOff } from "./icons";
import { cn } from "../utils/cn";

export default function SettingsModal() {
  const {
    t,
    settingsOpen,
    setSettingsOpen,
    provider,
    setProvider,
    openaiKey,
    setOpenaiKey,
    geminiKey,
    setGeminiKey,
    model,
    setModel,
    hasKey,
  } = useApp();
  const { push } = useToast();

  const [dProvider, setDProvider] = useState<Provider>(provider);
  const [dOpenai, setDOpenai] = useState(openaiKey);
  const [dGemini, setDGemini] = useState(geminiKey);
  const [dModel, setDModel] = useState(model);
  const [reveal, setReveal] = useState<{ openai: boolean; gemini: boolean }>({ openai: false, gemini: false });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<ConnectionResult | null>(null);

  useEffect(() => {
    if (settingsOpen) {
      setDProvider(provider);
      setDOpenai(openaiKey);
      setDGemini(geminiKey);
      setDModel(model);
      setTestResult(null);
      setReveal({ openai: false, gemini: false });
    }
  }, [settingsOpen, provider, openaiKey, geminiKey, model]);

  useEffect(() => {
    if (!PROVIDER_MODELS[dProvider].includes(dModel)) setDModel(DEFAULT_MODELS[dProvider]);
    setTestResult(null);
  }, [dProvider]); // eslint-disable-line react-hooks/exhaustive-deps

  const draftKey = dProvider === "openai" ? dOpenai : dGemini;

  const save = () => {
    setProvider(dProvider);
    setOpenaiKey(dOpenai.trim());
    setGeminiKey(dGemini.trim());
    setModel(dModel);
    setSettingsOpen(false);
    const live = draftKey.trim().length > 0;
    push(live ? "success" : "info", live ? t("toast.live") : t("toast.mock"));
  };

  const runTest = async () => {
    setTesting(true);
    setTestResult(null);
    const res = await testConnection(dProvider, draftKey, dModel);
    setTestResult(res);
    setTesting(false);
    push(res.ok ? "success" : "error", res.ok ? t("settings.statusLive") : "Test", res.message);
  };

  const close = () => setSettingsOpen(false);

  return (
    <Modal open={settingsOpen} onClose={close} labelledBy="settings-title">
      {/* header */}
      <div className="flex items-center gap-3 p-5 border-b border-slate-100 dark:border-slate-700">
        <span className="grid place-items-center h-11 w-11 rounded-2xl bg-grape/10 text-grape">
          <Gear width={22} height={22} />
        </span>
        <div className="flex-1">
          <h2 id="settings-title" className="font-display font-bold text-xl text-ink dark:text-slate-100">
            {t("settings.title")}
          </h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-snug">{t("settings.subtitle")}</p>
        </div>
        <button onClick={close} className="grid place-items-center h-9 w-9 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700" aria-label={t("common.close")}>
          <X width={18} height={18} />
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* status */}
        <div className={cn("flex items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-bold", hasKey ? "bg-neon/12 text-green-700 dark:text-neon-light" : "bg-orange-50 dark:bg-tangerine/10 text-tangerine-dark")}>
          <Bolt width={18} height={18} />
          {hasKey ? t("settings.statusLive") : t("settings.statusMock")}
        </div>

        {/* provider */}
        <Field label={t("settings.provider")}>
          <div className="grid grid-cols-2 gap-2">
            {(["openai", "gemini"] as Provider[]).map((p) => (
              <button
                key={p}
                onClick={() => setDProvider(p)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-2xl border-2 px-3 py-3 text-sm font-extrabold transition-all",
                  dProvider === p
                    ? "border-grape bg-violet-50 dark:bg-grape/20 text-grape dark:text-grape-light"
                    : "border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-slate-300"
                )}
              >
                {dProvider === p && <Check width={16} height={16} />}
                {p === "openai" ? "OpenAI" : "Google Gemini"}
              </button>
            ))}
          </div>
        </Field>

        {/* model */}
        <Field label={t("settings.model")}>
          <select
            value={dModel}
            onChange={(e) => setDModel(e.target.value)}
            className="w-full rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-sm font-bold text-ink dark:text-slate-100 focus:border-grape outline-none"
          >
            {PROVIDER_MODELS[dProvider].map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </Field>

        {/* keys */}
        <KeyInput
          label={t("settings.openaiKey")}
          value={dOpenai}
          onChange={setDOpenai}
          placeholder={t("settings.apiKeyPlaceholder")}
          reveal={reveal.openai}
          toggle={() => setReveal((r) => ({ ...r, openai: !r.openai }))}
          showLabel={t(reveal.openai ? "settings.hide" : "settings.show")}
        />
        <KeyInput
          label={t("settings.geminiKey")}
          value={dGemini}
          onChange={setDGemini}
          placeholder={t("settings.apiKeyPlaceholder")}
          reveal={reveal.gemini}
          toggle={() => setReveal((r) => ({ ...r, gemini: !r.gemini }))}
          showLabel={t(reveal.gemini ? "settings.hide" : "settings.show")}
        />
        <p className="-mt-2 text-[12px] text-slate-400 dark:text-slate-500">🔒 {t("settings.secured")}</p>

        {/* test connection */}
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="soft" size="md" onClick={runTest} disabled={testing || !draftKey.trim()}>
            <Plug width={17} height={17} />
            {testing ? t("settings.testing") : t("settings.test")}
          </Button>
          {testResult && (
            <span className={cn("text-[13px] font-bold", testResult.ok ? "text-green-600 dark:text-neon-light" : "text-red-500")}>
              {testResult.ok ? t("settings.testOk", { ms: testResult.latencyMs ?? 0 }) : t("settings.testFail", { msg: testResult.message })}
            </span>
          )}
        </div>

        {/* locked system prompt */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <Lock width={15} height={15} className="text-slate-500 dark:text-slate-400" />
            <span className="text-[13px] font-extrabold text-slate-700 dark:text-slate-200">{t("settings.systemPrompt")}</span>
          </div>
          <p className="text-[12px] text-slate-500 dark:text-slate-400 mb-2">{t("settings.systemPromptNote")}</p>
          <pre className="max-h-28 overflow-y-auto whitespace-pre-wrap rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300 font-mono">
            {SYSTEM_PROMPT}
          </pre>
          <p className="mt-2 text-[12px] text-slate-400 dark:text-slate-500 leading-snug">{t("settings.howItWorks")}</p>
        </div>
      </div>

      {/* footer */}
      <div className="flex items-center gap-3 p-5 border-t border-slate-100 dark:border-slate-700">
        <Button variant="ghost" size="lg" className="flex-1" onClick={close}>
          {t("settings.cancel")}
        </Button>
        <Button variant="grape" size="lg" className="flex-1" brick onClick={save}>
          {t("settings.save")}
        </Button>
      </div>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[13px] font-extrabold text-slate-600 dark:text-slate-300 mb-2">{label}</label>
      {children}
    </div>
  );
}

function KeyInput({
  label,
  value,
  onChange,
  placeholder,
  reveal,
  toggle,
  showLabel,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  reveal: boolean;
  toggle: () => void;
  showLabel: string;
}) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2 rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 focus-within:border-grape">
        <Lock width={17} height={17} className="text-slate-400 shrink-0" />
        <input
          type={reveal ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent py-3 text-sm font-semibold text-ink dark:text-slate-100 outline-none min-w-0"
          autoComplete="off"
          spellCheck={false}
        />
        <button onClick={toggle} className="flex items-center gap-1 text-[12px] font-extrabold text-grape dark:text-grape-light shrink-0 px-1">
          {reveal ? <EyeOff width={15} height={15} /> : <Eye width={15} height={15} />}
          <span className="hidden sm:inline">{showLabel}</span>
        </button>
      </div>
    </Field>
  );
}
