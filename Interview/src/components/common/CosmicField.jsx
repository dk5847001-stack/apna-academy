import { useEffect, useRef } from 'react'

export default function CosmicField({ density = 'hero' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isNav = density === 'nav'
    const isRoom = density === 'room'
    const starCount = isNav ? 42 : isRoom ? 95 : 120
    const fiberCount = isNav ? 3 : isRoom ? 6 : 8
    const stars = Array.from({ length: starCount }, (_, index) => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.45 + Math.random() * (isNav ? 1.1 : 1.55),
      phase: Math.random() * Math.PI * 2,
      speed: 0.35 + Math.random() * 1.1,
      twinkle: 0.25 + Math.random() * 0.7,
      blue: index % 3 !== 0,
    }))

    let width = 0
    let height = 0
    let frame = 0
    let raf = 0
    let lastTime = 0

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5)
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = Math.floor(width * ratio)
      canvas.height = Math.floor(height * ratio)
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    const drawFibers = (time) => {
      ctx.save()
      ctx.globalCompositeOperation = 'screen'

      for (let band = 0; band < fiberCount; band += 1) {
        const base = height * (0.2 + band * 0.12)
        ctx.beginPath()

        for (let x = -30; x <= width + 30; x += 12) {
          const wave = Math.sin(x * 0.005 + time * (0.00018 + band * 0.000018) + band) * height * 0.045
          const secondary = Math.sin(x * 0.011 - time * 0.00011 + band * 1.7) * height * 0.018
          const y = base + wave + secondary

          if (x === -30) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }

        const gradient = ctx.createLinearGradient(0, 0, width, 0)
        gradient.addColorStop(0, 'rgba(42, 122, 255, 0)')
        gradient.addColorStop(0.25, isRoom ? 'rgba(54, 148, 255, .12)' : 'rgba(79, 91, 255, .10)')
        gradient.addColorStop(0.55, 'rgba(126, 82, 255, .24)')
        gradient.addColorStop(0.82, 'rgba(37, 174, 255, .14)')
        gradient.addColorStop(1, 'rgba(42, 122, 255, 0)')
        ctx.strokeStyle = gradient
        ctx.lineWidth = band === Math.floor(fiberCount / 2) ? 1.35 : 0.65
        ctx.stroke()
      }

      ctx.restore()
    }

    const draw = (timestamp) => {
      const delta = Math.min(timestamp - lastTime || 16, 50)
      lastTime = timestamp
      if (!reduced) frame += delta

      ctx.clearRect(0, 0, width, height)

      const glow = ctx.createRadialGradient(width * 0.52, height * 0.45, 0, width * 0.52, height * 0.45, Math.max(width, height) * 0.7)
      glow.addColorStop(0, isNav ? 'rgba(44, 97, 230, .10)' : 'rgba(50, 84, 255, .13)')
      glow.addColorStop(0.48, isRoom ? 'rgba(32, 46, 120, .09)' : 'rgba(77, 50, 180, .06)')
      glow.addColorStop(1, 'rgba(3, 8, 25, 0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, width, height)

      drawFibers(frame)

      stars.forEach((star) => {
        const x = star.x * width + Math.sin(frame * 0.00012 * star.speed + star.phase) * 5
        const y = star.y * height + Math.cos(frame * 0.0001 * star.speed + star.phase) * 4
        const pulse = reduced ? 1 : 0.58 + Math.sin(frame * 0.002 * star.speed + star.phase) * star.twinkle * 0.42
        const alpha = Math.max(0.16, pulse * (isNav ? 0.58 : 0.78))

        ctx.beginPath()
        ctx.arc(x, y, star.r * (pulse > 0.75 ? 1.2 : 1), 0, Math.PI * 2)
        ctx.fillStyle = star.blue ? `rgba(91, 177, 255, ${alpha})` : `rgba(174, 113, 255, ${alpha})`
        ctx.shadowBlur = pulse > 0.78 ? 10 : 4
        ctx.shadowColor = ctx.fillStyle
        ctx.fill()
        ctx.shadowBlur = 0
      })

      raf = requestAnimationFrame(draw)
    }

    resize()
    raf = requestAnimationFrame(draw)
    window.addEventListener('resize', resize)

    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(raf)
      else raf = requestAnimationFrame(draw)
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [density])

  return <canvas ref={canvasRef} className={`cosmic-field cosmic-field-${density}`} aria-hidden="true" />
}
