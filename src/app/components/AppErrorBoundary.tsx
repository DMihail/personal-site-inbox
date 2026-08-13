import type { ReactNode } from "react";
import { Component } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";

interface AppErrorBoundaryProps {
  children: ReactNode;
  /** Optional title shown above the recovery actions. */
  title?: string;
}

interface AppErrorBoundaryState {
  error: Error | null;
}

/** Catches render errors so a single throw doesn’t blank the entire PWA. */
export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div
        className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 bg-background p-6 text-center text-foreground"
        role="alert"
      >
        <div
          className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-glass-border glass-elevated"
          aria-hidden="true"
        >
          <AlertTriangle className="h-8 w-8 text-text-muted" />
        </div>
        <div className="max-w-md space-y-2">
          <h1 className="text-heading text-text-primary">{this.props.title ?? "Something went wrong"}</h1>
          <p className="text-body-sm text-text-secondary">
            {error.message || "An unexpected error stopped this screen."}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button type="button" variant="outline" onClick={this.handleReset} className="glass ui-hover-glass border-glass-border">
            Try again
          </Button>
          <Button type="button" onClick={this.handleReload} className="ui-hover-cyan bg-cyan text-background">
            Reload app
          </Button>
        </div>
      </div>
    );
  }
}
