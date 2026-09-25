import { useEffect, useRef } from 'react'

export default function CanvasGlow() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const ctx = canvas.getContext('2d')
    let frame = 0
    let raf = 0
    let width = 0
    let height = 0
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const points = Array.from({ length: 42 }, (_, index) => ({
      x: Math.random(),
      y: Math.random(),
      r: 1 + Math.random() * 1.8,
      p: index * 0.13,
    }))

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5)
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = Math.floor(width * ratio)
      canvas.height = Math.floor(height * ratio)
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      const time = frame * 0.005

      points.forEach((point, index) => {
        const x = point.x * width + Math.sin(time + point.p) * 18
        const y = point.y * height + Math.cos(time * 0.8 + point.p) * 12
        const glow = ctx.createRadialGradient(x, y, 0, x, y, 38)
        glow.addColorStop(0, index % 3 === 0 ? 'rgba(101,73,255,.22)' : 'rgba(24,144,255,.16)')
        glow.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = glow
        ctx.fillRect(x - 38, y - 38, 76, 76)
        ctx.beginPath()
        ctx.arc(x, y, point.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(83,70,229,.24)'
        ctx.fill()
      })

      if (!reduced) frame += 1
      raf = requestAnimationFrame(draw)
    }

    resize()
    draw()
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="canvas-glow" aria-hidden="true" />
}
