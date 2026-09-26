import InterviewHeader from './InterviewHeader'
import Footer from './Footer'
import CosmicField from '../common/CosmicField'

export default function AppShell({ children }) {
  return (
    <div className="app-shell min-h-screen w-full text-slate-900">
      <div className="app-cosmic-backdrop" aria-hidden="true">
        <CosmicField density="hero" />
      </div>
      <div className="app-shell-content">
        <InterviewHeader />
        {children}
        <Footer />
      </div>
    </div>
  )
}
