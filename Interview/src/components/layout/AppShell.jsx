import InterviewHeader from './InterviewHeader'
import Footer from './Footer'
import CosmicField from '../common/CosmicField'
import { useRouter } from '../../routes/Router'
import { ROUTES } from '../../routes/routes'

export default function AppShell({ children }) {
  const { path } = useRouter()
  const isCleanInterviewShell = false

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
        {!isCleanInterviewShell ? <Footer /> : null}
      </div>
    </div>
  )
}
