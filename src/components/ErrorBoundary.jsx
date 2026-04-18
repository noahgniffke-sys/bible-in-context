import { Component } from 'react'
import { triggerHaptic, HapticStyle } from '../lib/haptics'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    triggerHaptic(HapticStyle.ERROR)
    this.setState({ error, errorInfo })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    triggerHaptic(HapticStyle.LIGHT)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4">
          <div className="bg-[var(--bg-elevated)] border border-[var(--accent-error)]/50 rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-[var(--accent-error)]/20 flex items-center justify-center text-4xl">
                ⚠️
              </div>
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] text-center mb-2">
              Something went wrong
            </h1>
            <p className="text-[var(--text-secondary)] text-center mb-6">
              The app encountered an unexpected error. Your data is safe.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <div className="bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-lg p-4 mb-4 overflow-auto max-h-48">
                <p className="text-xs text-[var(--accent-error)] font-mono mb-2">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <pre className="text-xs text-[var(--text-muted)] overflow-x-auto">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}
            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full bg-[var(--accent-secondary)] text-white font-bold py-3 rounded-xl active:scale-95"
              >
                Try Again
              </button>
              <button
                onClick={() => { window.location.href = '/' }}
                className="w-full bg-[var(--bg-surface)] text-[var(--text-primary)] font-bold py-3 rounded-xl border border-[var(--border-primary)] active:scale-95"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
