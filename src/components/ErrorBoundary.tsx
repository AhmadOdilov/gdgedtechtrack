import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
  message?: string;
}

/** Top-level error boundary so a render crash shows a friendly screen, not a blank page. */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(err: unknown): State {
    return { hasError: true, message: err instanceof Error ? err.message : String(err) };
  }

  componentDidCatch(err: unknown) {
    console.error("[EduCheck AI] render error:", err);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 dark:bg-slate-900 p-6 text-center">
        <div className="max-w-md">
          <div className="text-6xl mb-3">🛠️🦊</div>
          <h1 className="font-display font-bold text-2xl text-ink dark:text-slate-100">
            Oops, a gremlin appeared
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400 font-semibold">
            Something broke in the quest engine. Let's reload and try again.
          </p>
          {this.state.message && (
            <pre className="mt-3 text-[11px] text-left text-red-500 bg-red-50 dark:bg-red-950/40 rounded-xl p-3 overflow-x-auto">
              {this.state.message}
            </pre>
          )}
          <button
            onClick={() => window.location.reload()}
            className="mt-5 rounded-2xl bg-grape px-6 py-3 font-extrabold text-white brick-shadow-sm"
          >
            Reload app
          </button>
        </div>
      </div>
    );
  }
}
