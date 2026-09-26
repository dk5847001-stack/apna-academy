import AppShell from './components/layout/AppShell'
import AppRoutes from './routes/AppRoutes'
import { RouterProvider } from './routes/Router'
import { InterviewFlowProvider } from './context/InterviewFlowContext'
import AppErrorBoundary from './components/system/AppErrorBoundary'
import { AuthProvider } from './context/AuthContext'

export default function App() {
  return (
    <AppErrorBoundary>
      <RouterProvider>
        <AuthProvider>
          <InterviewFlowProvider>
          <AppShell>
            <AppRoutes />
          </AppShell>
        </InterviewFlowProvider>
        </AuthProvider>
      </RouterProvider>
    </AppErrorBoundary>
  )
}
