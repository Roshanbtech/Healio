import React, { ErrorInfo } from "react";
import Error from "../../components/common/userCommon/Error";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught in ErrorBoundary:", error, errorInfo);
    // Optionally send error info to an external service
  }

  render() {
    if (this.state.hasError) {
      return <Error error={this.state.error || undefined} />;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
