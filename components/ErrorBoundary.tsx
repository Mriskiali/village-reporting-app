import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error | null }> },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error | null }> }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} />;
      }

      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md w-full">
            <div className="text-red-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Terjadi Kesalahan</h3>
            <p className="text-gray-600 mb-4">
              Maaf, terjadi kesalahan tak terduga pada aplikasi. Silakan coba muat ulang halaman.
            </p>
            <button
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              onClick={() => window.location.reload()}
            >
              Muat Ulang Halaman
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-4 p-3 bg-gray-100 rounded text-left text-xs text-gray-700">
                <pre>{this.state.error.stack}</pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;