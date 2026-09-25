import { useCallback, useEffect, useMemo, useState } from 'react'

export function useInterviewTimer(totalSeconds, autoStart = true) {
  const [remaining, setRemaining] = useState(Math.max(0, Number(totalSeconds) || 0))
  const [running, setRunning] = useState(autoStart)

  useEffect(() => {
    setRemaining(Math.max(0, Number(totalSeconds) || 0))
    setRunning(autoStart)
  }, [totalSeconds, autoStart])

  useEffect(() => {
    if (!running || remaining <= 0) return undefined
    const id = window.setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          setRunning(false)
          return 0
        }
        return value - 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [running, remaining])

  const pause = useCallback(() => setRunning(false), [])
  const resume = useCallback(() => setRunning(true), [])
  const formatted = useMemo(() => {
    const minutes = Math.floor(remaining / 60).toString().padStart(2, '0')
    const seconds = (remaining % 60).toString().padStart(2, '0')
    return minutes + ':' + seconds
  }, [remaining])

  return { remaining, formatted, running, pause, resume }
}
