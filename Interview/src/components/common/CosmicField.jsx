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
    const starCount = isNav ? 58 : isRoom ? 125 : 165
    const fiberCount = isNav ? 5 : isRoom ? 8 : 11
    const stars = Array.from({ length: starCount }, (_, index) => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.45 + Math.random() * (isNav ? 1.1 : 1.55),
      phase: Math.random() * Math.PI * 2,
      speed: 0.9 + Math.random() * 2.4,
      twinkle: 0.25 + Math.random() * 0.7,
      blue: index % 3 !== 0,
    }))

    let width = 0
    let height = 0
    let frame = 0
    let raf = 0
    let lastTime = 0
    const shootingStars = Array.from({ length: isNav ? 2 : isRoom ? 5 : 7 }, () => ({
      x: Math.random(),
      y: Math.random() * 0.75,
      speed: 0.55 + Math.random() * 0.9,
      length: 35 + Math.random() * 85,
      delay: Math.random() * 5000,
      phase: Math.random() * 10000,
    }))

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
          const wave = Math.sin(x * 0.005 + time * (0.00075 + band * 0.00007) + band) * height * 0.055
          const secondary = Math.sin(x * 0.011 - time * 0.0005 + band * 1.7) * height * 0.022
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
        const x = (star.x * width + frame * 0.018 * star.speed) % (width + 20) - 10
        const y = star.y * height + Math.sin(frame * 0.0012 * star.speed + star.phase) * 7
        const pulse = reduced ? 1 : 0.62 + Math.sin(frame * 0.006 * star.speed + star.phase) * star.twinkle * 0.38
        const alpha = Math.max(0.16, pulse * (isNav ? 0.58 : 0.78))

        ctx.beginPath()
        ctx.arc(x, y, star.r * (pulse > 0.75 ? 1.2 : 1), 0, Math.PI * 2)
        ctx.fillStyle = star.blue ? `rgba(91, 177, 255, ${alpha})` : `rgba(174, 113, 255, ${alpha})`
        ctx.shadowBlur = pulse > 0.78 ? 13 : 5
        ctx.shadowColor = ctx.fillStyle
        ctx.fill()
        ctx.shadowBlur = 0
      })

      if (!reduced) {
        shootingStars.forEach((meteor) => {
          const cycle = (frame * 0.001 * meteor.speed + meteor.phase + meteor.delay * 0.001) % 7
          if (cycle < 1.15) {
            const progress = cycle / 1.15
            const x = meteor.x * width + progress * (width * 0.42)
            const y = meteor.y * height + progress * (height * 0.22)
            const tail = meteor.length * (0.45 + progress * 0.7)
            const gradient = ctx.createLinearGradient(x - tail, y - tail * 0.28, x, y)
            gradient.addColorStop(0, 'rgba(93, 169, 255, 0)')
            gradient.addColorStop(0.72, 'rgba(105, 191, 255, .16)')
            gradient.addColorStop(1, 'rgba(207, 229, 255, .95)')
            ctx.beginPath()
            ctx.moveTo(x - tail, y - tail * 0.28)
            ctx.lineTo(x, y)
            ctx.strokeStyle = gradient
            ctx.lineWidth = isNav ? 0.8 : 1.15
            ctx.shadowBlur = 14
            ctx.shadowColor = 'rgba(91, 180, 255, .8)'
            ctx.stroke()
            ctx.shadowBlur = 0
          }
        })
      }

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
