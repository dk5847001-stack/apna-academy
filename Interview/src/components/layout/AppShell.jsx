import InterviewHeader from './InterviewHeader'
import Footer from './Footer'
import { ROUTES } from '../../routes/routes'

export default function AppShell({ children }) {
  return (
    <div className="app-shell min-h-screen w-full text-slate-900">
      {!isCleanInterviewShell ? (
        <div className="app-cosmic-backdrop" aria-hidden="true">
          <CosmicField density="hero" />
        </div>
      ) : null}
      <div className="app-shell-content">
        <InterviewHeader />
        {children}
        <Footer />
      </div>
    </div>
  )
}
