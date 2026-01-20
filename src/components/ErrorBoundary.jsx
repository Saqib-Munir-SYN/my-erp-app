import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-red-50 to-red-100 p-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full border border-red-200">
            <div className="text-red-600 text-4xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Oops! Something went wrong</h2>
            <p className="text-slate-600 mb-4 text-sm">
              {this.state.error?.message || 'An unexpected error occurred. Please try again.'}
            </p>
            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="mb-4 p-3 bg-slate-50 rounded text-xs text-slate-700 overflow-auto max-h-32">
                <summary className="cursor-pointer font-semibold">Error Details</summary>
                <pre className="mt-2 whitespace-pre-wrap wrap-break-word">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            <div className="flex gap-2">
              <button
                onClick={this.handleReset}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-semibold"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}