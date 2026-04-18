import { Component } from 'react'
import { Link } from 'react-router-dom'
import { triggerHaptic, HapticStyle } from '../lib/haptics'

class RouteErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('RouteErrorBoundary caught an error:', error, errorInfo)
    triggerHaptic(HapticStyle.ERROR)
    this.setState({ error })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    triggerHaptic(HapticStyle.LIGHT)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4">
          <div className="bg-[var(--accent-error)]/10 border border-[var(--accent-error)]/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{'⚠️'}</span>
              <div>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">
                  Failed to load this page
                </h2>
                <p className="text-sm text-[var(--accent-error)]">
                  An error occurred while loading this content
                </p>
              </div>
            </div>
            {import.meta.env.DEV && this.state.error && (
              <div className="bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-lg p-3 mb-4 overflow-auto max-h-32">
                <p className="text-xs text-[var(--accent-error)] font-mono">
                  {this.state.error.toString()}
                </p>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 bg-[var(--accent-secondary)] text-white font-bold py-2 rounded-lg text-sm active:scale-95"
              >
                Try Again
              </button>
              <Link
                to="/"
                className="flex-1 bg-[var(--bg-surface)] text-[var(--text-primary)] font-bold py-2 rounded-lg border border-[var(--border-primary)] text-sm text-center active:scale-95"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default RouteErrorBoundary
