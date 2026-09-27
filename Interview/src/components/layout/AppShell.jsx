import InterviewHeader from './InterviewHeader'
import Footer from './Footer'

export default function AppShell({ children }) {
  return (
    <div className="app-shell min-h-screen w-full text-slate-900">
      <div className="app-shell-content">
        <InterviewHeader />
        {children}
        <Footer />
      </div>
    </div>
  )
}
