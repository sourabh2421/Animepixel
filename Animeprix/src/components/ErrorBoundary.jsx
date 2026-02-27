import React from 'react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
    this.resetError = this.resetError.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  resetError() {
    this.setState({ hasError: false, error: null, errorInfo: null });
  }

  componentDidUpdate(prevProps) {
    // Reset error if route changes
    if (this.state.hasError && prevProps.children !== this.props.children) {
      this.resetError();
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-cr-dark flex items-center justify-center px-6">
          <div className="max-w-2xl w-full bg-red-900/50 border border-red-700 rounded-lg p-8">
            <h1 className="text-3xl font-bold text-red-200 mb-4">Something went wrong</h1>
            <p className="text-red-300 mb-6">
              The page encountered an error. Please try refreshing or go back to the home page.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <details className="mb-6">
                <summary className="text-red-400 cursor-pointer mb-2">Error Details (Development Only)</summary>
                <pre className="bg-black/50 p-4 rounded text-red-300 text-xs overflow-auto max-h-64">
                  {this.state.error.toString()}
                  {this.state.errorInfo && (
                    <>
                      <br />
                      <br />
                      {this.state.errorInfo.componentStack}
                    </>
                  )}
                </pre>
              </details>
            )}
            <div className="flex gap-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-cr-orange hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                Refresh Page
              </button>
              <Link
                to="/"
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition inline-block text-center"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

