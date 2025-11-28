/**
 * ErrorBoundary Component
 * Catches JavaScript errors anywhere in the child component tree
 * Displays fallback UI instead of crashing the entire app
 * Used to wrap components/pages for error handling
 */

import { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Button from '../ui/Button';
import { ROUTES_FLAT } from '../../constants/routes';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      shouldNavigate: false,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    this.setState({ shouldNavigate: true });
  };

  render() {
    // Navigate to login if shouldNavigate is true
    if (this.state.shouldNavigate) {
      return <Navigate to={ROUTES_FLAT.LOGIN} replace />;
    }

    if (this.state.hasError) {
      const { fallback, showDetails = false, t } = this.props;

      // Custom fallback UI
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            {/* Error Icon */}
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 text-accent">
                <AlertTriangle className="w-full h-full" strokeWidth={1.5} />
              </div>
            </div>

            {/* Error Title */}
            <h2 className="text-2xl font-bold text-primary mb-2">
              {t('errorBoundary.title', { defaultValue: 'Something went wrong' })}
            </h2>

            {/* Error Message */}
            <p className="text-secondary mb-6">
              {t('errorBoundary.message', { 
                defaultValue: "We're sorry, but something unexpected happened. Please try again or contact support if the problem persists." 
              })}
            </p>

            {/* Error Details (Development only) */}
            {showDetails && this.state.error && (
              <div className="mb-6 p-4 bg-gray-100 rounded-lg text-left">
                <p className="text-xs font-mono text-red-600 break-words">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="text-xs text-secondary cursor-pointer">
                      {t('errorBoundary.stackTrace', { defaultValue: 'Stack Trace' })}
                    </summary>
                    <pre className="text-xs text-gray-600 mt-2 overflow-auto max-h-40">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="primary"
                size="md"
                onClick={this.handleReset}
                leftIcon={<RefreshCw className="w-4 h-4 text-accent" strokeWidth={3} />}
              >
                {t('errorBoundary.tryAgain', { defaultValue: 'Try Again' })}
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={this.handleGoHome}
                leftIcon={<Home className="w-5 h-5 text-accent" strokeWidth={3} />}
              >
                {t('errorBoundary.goHome', { defaultValue: 'Go Home' })}
              </Button>
            </div>

            {/* Development Mode Indicator */}
            {process.env.NODE_ENV === 'development' && (
              <p className="mt-4 text-xs text-gray-400">
                {t('errorBoundary.developmentMode', { 
                  defaultValue: 'Error details are shown above (development mode)' 
                })}
              </p>
            )}
          </div>
        </div>
      );
    }

    // Render children normally if no error
    return this.props.children;
  }
}

export default withTranslation('common')(ErrorBoundary);
