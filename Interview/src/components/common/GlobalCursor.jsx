import { useEffect, useRef, useState } from 'react'

const INTERACTIVE_SELECTOR = [
  'a',
  'button',
  '[role="button"]',
  'summary',
  'label',
  'select',
  'input:not([type="hidden"])',
  'textarea',
  '[data-cursor="interactive"]',
].join(',')

export default function GlobalCursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const rafRef = useRef(0)
  const pointerRef = useRef({ x: -100, y: -100 })
  const targetRef = useRef({ x: -100, y: -100 })
  const [enabled, setEnabled] = useState(false)
  const [interactive, setInteractive] = useState(false)
  const [pressed, setPressed] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(pointer: fine)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    const sync = () => setEnabled(media.matches && !reducedMotion.matches)
    sync()

    const onMediaChange = () => sync()
    media.addEventListener?.('change', onMediaChange)
    reducedMotion.addEventListener?.('change', onMediaChange)

    return () => {
      media.removeEventListener?.('change', onMediaChange)
      reducedMotion.removeEventListener?.('change', onMediaChange)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return undefined

    const onMove = (event) => {
      targetRef.current = { x: event.clientX, y: event.clientY }

      const target = event.target instanceof Element
        ? event.target.closest(INTERACTIVE_SELECTOR)
        : null

      setInteractive(Boolean(target))
    }

    const onDown = () => setPressed(true)
    const onUp = () => setPressed(false)

    const render = () => {
      const current = pointerRef.current
      const target = targetRef.current
      current.x += (target.x - current.x) * 0.22
      current.y += (target.y - current.y) * 0.22

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`
      }

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) translate(-50%, -50%)`
      }

      rafRef.current = requestAnimationFrame(render)
    }

    const onLeave = () => {
      setInteractive(false)
      targetRef.current = { x: -100, y: -100 }
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    document.addEventListener('mouseleave', onLeave)
    rafRef.current = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.removeEventListener('mouseleave', onLeave)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div className={`global-cursor-layer${interactive ? ' is-interactive' : ''}${pressed ? ' is-pressed' : ''}`} aria-hidden="true">
      <span ref={ringRef} className="global-cursor-ring" />
      <span ref={dotRef} className="global-cursor-dot" />
    </div>
  )
}
