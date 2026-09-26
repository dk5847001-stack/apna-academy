import { useCallback, useEffect, useRef, useState } from 'react'

const getRecognition = () => {
  if (typeof window === 'undefined') return null
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
  return Recognition ? new Recognition() : null
}

export function useInterviewVoice({ onTranscript } = {}) {
  const recognitionRef = useRef(null)
  const speechIdRef = useRef(0)
  const onTranscriptRef = useRef(onTranscript)
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState('')
  const [voiceError, setVoiceError] = useState('')

  useEffect(() => { onTranscriptRef.current = onTranscript }, [onTranscript])

  useEffect(() => {
    const recognition = getRecognition()
    if (!recognition) return
    setSupported(true)
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-IN'
    recognition.onstart = () => { setListening(true); setVoiceError('') }
    recognition.onend = () => setListening(false)
    recognition.onerror = (event) => {
      setListening(false)
      if (event.error !== 'aborted') setVoiceError(event.error === 'not-allowed' ? 'Microphone permission is required for voice answers.' : 'Voice recognition stopped. You can continue typing.')
    }
    recognition.onresult = (event) => {
      let finalText = ''
      let interim = ''
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const text = event.results[index][0]?.transcript || ''
        if (event.results[index].isFinal) finalText += text + ' '
        else interim += text
      }
      setInterimTranscript(interim)
      if (finalText.trim()) onTranscriptRef.current?.(finalText.trim())
    }
    recognitionRef.current = recognition
    return () => {
      recognition.onresult = null
      recognition.onend = null
      recognition.onerror = null
      try { recognition.stop() } catch {}
      recognitionRef.current = null
      if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    }
  }, [])

  const startListening = useCallback(() => {
    if (!recognitionRef.current || listening) return
    setVoiceError('')
    try { recognitionRef.current.start() } catch {}
  }, [listening])

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return
    try { recognitionRef.current.stop() } catch {}
    setListening(false)
    setInterimTranscript('')
  }, [])

  const toggleListening = useCallback(() => {
    if (listening) stopListening()
    else startListening()
  }, [listening, startListening, stopListening])

  const speak = useCallback((text, { onStart, onEnd, onError } = {}) => {
    if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return false
    const speechId = speechIdRef.current + 1
    speechIdRef.current = speechId
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.96
    utterance.pitch = 1
    utterance.volume = 1
    utterance.onstart = () => {
      if (speechId !== speechIdRef.current) return
      setSpeaking(true)
      onStart?.()
    }
    utterance.onend = () => {
      if (speechId !== speechIdRef.current) return
      setSpeaking(false)
      onEnd?.()
    }
    utterance.onerror = () => {
      if (speechId !== speechIdRef.current) return
      setSpeaking(false)
      onError?.()
    }
    window.speechSynthesis.speak(utterance)
    return true
  }, [])

  const stopSpeaking = useCallback(() => {
    speechIdRef.current += 1
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [])

  return { supported, listening, speaking, interimTranscript, voiceError, startListening, stopListening, toggleListening, speak, stopSpeaking }
}
