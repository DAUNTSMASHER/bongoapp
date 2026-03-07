"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  copied: boolean;
}

export default class AdminErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, copied: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  copyError = () => {
    const { error } = this.state;
    if (!error) return;
    const text = `Error: ${error.message}\n\nStack:\n${error.stack || "No stack trace"}`;
    navigator.clipboard.writeText(text).then(() => {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const { error } = this.state;
      const fullText = `Error: ${error.message}\n\nStack:\n${error.stack || "No stack trace"}`;
      return (
        <div className="min-h-screen bg-[#141414] p-6">
          <div className="mx-auto max-w-2xl">
            <h1 className="mb-4 text-xl font-bold text-red-400">Something went wrong</h1>
            <p className="mb-4 text-white/80">
              Copy the error below and paste it when reporting the issue:
            </p>
            <pre className="mb-4 max-h-64 overflow-auto rounded-lg border border-white/20 bg-black/50 p-4 text-sm text-white/90 whitespace-pre-wrap break-words">
              {fullText}
            </pre>
            <button
              type="button"
              onClick={this.copyError}
              className="rounded-lg bg-[var(--primary)] px-4 py-2 font-semibold text-white hover:bg-[var(--primary-hover)]"
            >
              {this.state.copied ? "Copied!" : "Copy error to clipboard"}
            </button>
            <p className="mt-4 text-xs text-white/50">
              After copying, you can paste the error into a message to get help.
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
