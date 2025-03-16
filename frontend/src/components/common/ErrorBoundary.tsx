import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
  previousPath: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryClass extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    // Optionally log to an external service here.
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
          <div className="bg-red-600 p-4 rounded-lg flex items-center">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              ></path>
            </svg>
            <h2 className="ml-3 text-xl font-bold text-white">Something went wrong</h2>
          </div>
          <div className="bg-green-100 p-6 mt-4 rounded-lg max-w-md w-full">
            <p className="text-gray-800 mb-4">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <p className="text-sm text-gray-600 mb-6">
              Please try again or contact support if the problem persists.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  // Navigate back to the previous path
                  window.location.href = this.props.previousPath || window.location.origin;
                }}
                className="mr-2 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition duration-150"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Wrapper component that grabs the current path from window.location
const ErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => {
  const previousPath = window.location.pathname;
  return <ErrorBoundaryClass previousPath={previousPath}>{children}</ErrorBoundaryClass>;
};

export default ErrorBoundary;
