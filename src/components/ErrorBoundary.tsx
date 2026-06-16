import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught app error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleRetry = () => {
    // Clear state and force page reload to attempt recovery
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-slate-950 text-white flex flex-col items-center justify-center p-6 font-sans">
          {/* Ambient matrix glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(244,63,94,0.1),transparent_60%)] pointer-events-none" />
          <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-rose-500/5 blur-[100px] pointer-events-none" />

          {/* Grid lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

          <div className="relative text-center max-w-xl z-10 space-y-6 px-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-400 font-mono text-xs uppercase tracking-widest">
              <AlertTriangle className="h-4 w-4 animate-bounce" />
              SYSTEM SHIELD FAULTGUARD
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
              Application Error Detected
            </h1>

            <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
              A rendering exception occurred in the frontend view hierarchy. We have caught the error safely below:
            </p>

            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-5 text-left space-y-3 backdrop-blur-md">
              <div className="text-xs font-mono font-bold text-rose-400 select-all border-b border-white/5 pb-2">
                {this.state.error?.name || "Error"}: {this.state.error?.message || "An unexpected error occurred."}
              </div>

              {this.state.error?.stack && (
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Stack Trace</span>
                  <pre className="p-3 bg-slate-950 border border-white/5 rounded-lg text-[10px] font-mono text-slate-400 overflow-auto max-h-40 leading-normal select-all">
                    {this.state.error.stack}
                  </pre>
                </div>
              )}
            </div>

            <button
              onClick={this.handleRetry}
              className="rounded-full bg-white hover:bg-slate-100 text-slate-950 font-bold px-8 py-3.5 text-sm tracking-wide shadow-2xl transition-all hover:scale-105 duration-200 cursor-pointer flex items-center justify-center gap-2 mx-auto"
            >
              <RefreshCw className="h-4 w-4" />
              Reset & Retry Session
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
