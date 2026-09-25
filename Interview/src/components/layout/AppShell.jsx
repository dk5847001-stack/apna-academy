import InterviewHeader from './InterviewHeader'
import Footer from './Footer'

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen w-full bg-white text-slate-900">
      <InterviewHeader />
      {children}
      <Footer />
    </div>
  )
}
