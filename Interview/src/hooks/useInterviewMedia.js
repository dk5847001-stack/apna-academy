import { useCallback, useEffect, useRef, useState } from 'react'

export function useInterviewMedia() {
  const streamRef = useRef(null)
  const [camera, setCamera] = useState('idle')
  const [microphone, setMicrophone] = useState('idle')
  const [error, setError] = useState('')

  const requestMedia = useCallback(async ({ video = true, audio = true } = {}) => {
    setError('')
    if (!navigator.mediaDevices?.getUserMedia) {
      setCamera(video ? 'unsupported' : 'idle')
      setMicrophone(audio ? 'unsupported' : 'idle')
      setError('Camera and microphone access is not supported in this browser.')
      return null
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video, audio })
      if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = stream
      setCamera(video ? 'granted' : 'off')
      setMicrophone(audio ? 'granted' : 'off')
      return stream
    } catch (mediaError) {
      setCamera(video ? 'denied' : 'off')
      setMicrophone(audio ? 'denied' : 'off')
      setError(mediaError?.name === 'NotAllowedError'
        ? 'Camera or microphone permission was blocked. Allow access in browser settings to use the live interview.'
        : 'We could not start your camera or microphone.')
      return null
    }
  }, [])

  const toggleCamera = useCallback(() => {
    const track = streamRef.current?.getVideoTracks?.()[0]
    if (!track) return false
    track.enabled = !track.enabled
    setCamera(track.enabled ? 'granted' : 'off')
    return track.enabled
  }, [])

  const toggleMicrophone = useCallback(() => {
    const track = streamRef.current?.getAudioTracks?.()[0]
    if (!track) return false
    track.enabled = !track.enabled
    setMicrophone(track.enabled ? 'granted' : 'off')
    return track.enabled
  }, [])

  useEffect(() => () => {
    if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop())
  }, [])

  return { streamRef, camera, microphone, error, requestMedia, toggleCamera, toggleMicrophone }
}
