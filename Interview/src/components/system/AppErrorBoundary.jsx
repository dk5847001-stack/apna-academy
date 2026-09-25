import { Component } from 'react'
import { ErrorOutlineRounded, RefreshRounded } from '@mui/icons-material'

export default class AppErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    if (import.meta.env.DEV) {
      console.error('Interview app error:', error)
    }
  }

  handleReset = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 p-6">
        <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
          <ErrorOutlineRounded className="text-violet-600" sx={{ fontSize: 42 }} />
          <h1 className="mt-4 text-2xl font-extrabold text-slate-950">Something went wrong</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            The interview interface could not render this screen. Your interview data is kept separate from the UI layer.
          </p>
          <button className="gradient-btn mt-6" onClick={this.handleReset}>
            Try Again <RefreshRounded />
          </button>
        </section>
      </main>
    )
  }
}
