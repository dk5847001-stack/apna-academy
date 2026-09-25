import AppShell from './components/layout/AppShell'
import AppRoutes from './routes/AppRoutes'
import { RouterProvider } from './routes/Router'
import { InterviewFlowProvider } from './context/InterviewFlowContext'
import AppErrorBoundary from './components/system/AppErrorBoundary'

export default function App() {
  return (
    <AppErrorBoundary>
      <RouterProvider>
        <InterviewFlowProvider>
          <AppShell>
            <AppRoutes />
          </AppShell>
        </InterviewFlowProvider>
      </RouterProvider>
    </AppErrorBoundary>
  )
}
