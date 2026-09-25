import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { DEFAULT_INTERVIEW_SETUP } from '../data/interviewConfig'
import { readSession, writeSession } from '../utils/storage'

const InterviewFlowContext = createContext(null)

export function InterviewFlowProvider({ children }) {
  const [setup, setSetupState] = useState(() => readSession('setup', DEFAULT_INTERVIEW_SETUP))
  const [session, setSessionState] = useState(() => readSession('session', null))

  const setSetup = useCallback((next) => {
    setSetupState((current) => {
      const value = typeof next === 'function' ? next(current) : { ...current, ...next }
      writeSession('setup', value)
      return value
    })
  }, [])

  const setSession = useCallback((next) => {
    setSessionState((current) => {
      const value = typeof next === 'function' ? next(current) : next
      writeSession('session', value)
      return value
    })
  }, [])

  const resetInterview = useCallback(() => {
    setSessionState(null)
    writeSession('session', null)
  }, [])

  const value = useMemo(
    () => ({ setup, setSetup, session, setSession, resetInterview }),
    [setup, session, setSetup, setSession, resetInterview],
  )

  return <InterviewFlowContext.Provider value={value}>{children}</InterviewFlowContext.Provider>
}

export function useInterviewFlow() {
  const value = useContext(InterviewFlowContext)
  if (!value) throw new Error('useInterviewFlow must be used inside InterviewFlowProvider')
  return value
}
