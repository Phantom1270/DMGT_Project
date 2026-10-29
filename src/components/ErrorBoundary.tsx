import { Component, type ReactNode } from "react";
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <section className="error-panel" role="alert">
          <h1>This lab needs a restart</h1>
          <p>
            A rendering error interrupted this module. Your other labs are still
            available.
          </p>
          <button onClick={() => this.setState({ failed: false })}>
            Try this lab again
          </button>
          <button onClick={() => window.location.reload()}>
            Reload application
          </button>
        </section>
      );
    return this.props.children;
  }
}
