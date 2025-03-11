'use client';

import React from 'react';

interface ErrorBoundaryProps {
  fallback: React.ReactNode;
  children: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      const isDev = process.env.NODE_ENV === 'development';

      // In development mode, show detailed error information
      if (isDev && React.isValidElement(this.props.fallback)) {
        return (
          <div>
            {this.props.fallback}
            <div className="mt-4 p-4 bg-red-50 rounded-md overflow-auto max-h-60">
              <h3 className="text-sm font-medium text-red-800">
                Error Details (Development Only)
              </h3>
              <p className="mt-2 text-sm text-red-700">
                {this.state.error?.message}
              </p>
              {this.state.error?.stack && (
                <pre className="mt-2 text-xs text-red-700 whitespace-pre-wrap">
                  {this.state.error.stack}
                </pre>
              )}
            </div>
          </div>
        );
      }

      return this.props.fallback;
    }

    return this.props.children;
  }
}
