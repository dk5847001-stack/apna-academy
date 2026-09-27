import { useEffect, useRef } from 'react'

export default function CosmicField({ density = 'hero' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return undefined

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const coarsePointer = window.matchMedia('(pointer: coarse)')
    const compactViewport = window.matchMedia('(max-width: 767px)')
    const isNav = density === 'nav'
    const isRoom = density === 'room'

    const getCounts = () => {
      const mobileFactor = compactViewport.matches ? 0.52 : 1
      const navFactor = isNav ? 0.42 : 1
      const baseStars = isRoom ? 125 : 165
      const baseFibers = isRoom ? 8 : 11
      return {
        stars: Math.max(24, Math.round(baseStars * mobileFactor * navFactor)),
        fibers: Math.max(3, Math.round(baseFibers * mobileFactor * navFactor)),
        shootingStars: Math.max(1, Math.round((isRoom ? 5 : 7) * mobileFactor * navFactor)),
      }
    }

    let counts = getCounts()
    let stars = []
    let shootingStars = []
    let galaxyStars = []
    let asteroids = []
    let pointerX = 0
    let pointerY = 0

    const createParticles = () => {
      counts = getCounts()
      stars = Array.from({ length: counts.stars }, (_, index) => ({
        x: Math.random(),
        y: Math.random(),
        r: 0.45 + Math.random() * (isNav ? 1.1 : 1.55),
        phase: Math.random() * Math.PI * 2,
        speed: 0.9 + Math.random() * 2.4,
        twinkle: 0.25 + Math.random() * 0.7,
        blue: index % 3 !== 0,
      }))
      shootingStars = Array.from({ length: counts.shootingStars }, () => ({
        x: Math.random(),
        y: Math.random() * 0.75,
        speed: 0.55 + Math.random() * 0.9,
        length: 35 + Math.random() * 85,
        delay: Math.random() * 5000,
        phase: Math.random() * 10000,
      }))

      if (isRoom) {
        galaxyStars = Array.from({ length: compactViewport.matches ? 70 : 135 }, () => ({
          radius: Math.pow(Math.random(), 0.72),
          angle: Math.random() * Math.PI * 2,
          size: 0.35 + Math.random() * 1.15,
          arm: Math.random() < 0.72 ? 0 : 1,
          phase: Math.random() * Math.PI * 2,
          brightness: 0.25 + Math.random() * 0.75,
        }))
        asteroids = Array.from({ length: compactViewport.matches ? 18 : 34 }, () => ({
          x: Math.random(),
          y: 0.46 + Math.random() * 0.5,
          size: 2 + Math.random() * 7,
          rotation: Math.random() * Math.PI * 2,
          drift: 0.12 + Math.random() * 0.32,
          phase: Math.random() * Math.PI * 2,
        }))
      }
    }

    let width = 0
    let height = 0
    let frame = 0
    let raf = 0
    let lastTime = 0
    let active = true

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, compactViewport.matches ? 1.15 : 1.5)
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = Math.max(1, Math.floor(width * ratio))
      canvas.height = Math.max(1, Math.floor(height * ratio))
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
      createParticles()
    }

    const drawFibers = (time) => {
      ctx.save()
      ctx.globalCompositeOperation = 'screen'

      for (let band = 0; band < counts.fibers; band += 1) {
        const base = height * (0.2 + band * 0.12)
        ctx.beginPath()

        for (let x = -30; x <= width + 30; x += compactViewport.matches ? 18 : 12) {
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
        ctx.lineWidth = band === Math.floor(counts.fibers / 2) ? 1.35 : 0.65
        ctx.stroke()
      }

      ctx.restore()
    }

    const drawPlanet = (cx, cy, radius, hue, rotation = 0, ring = false) => {
      ctx.save()
      ctx.translate(cx, cy)

      const atmosphere = ctx.createRadialGradient(
        -radius * 0.2, -radius * 0.28, radius * 0.15,
        0, 0, radius * 1.35,
      )
      atmosphere.addColorStop(0, hue === 'cyan' ? 'rgba(118, 239, 255, .48)' : 'rgba(170, 112, 255, .42)')
      atmosphere.addColorStop(.48, hue === 'cyan' ? 'rgba(0, 174, 255, .16)' : 'rgba(93, 63, 255, .16)')
      atmosphere.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = atmosphere
      ctx.beginPath()
      ctx.arc(0, 0, radius * 1.42, 0, Math.PI * 2)
      ctx.fill()

      if (ring) {
        ctx.save()
        ctx.rotate(rotation)
        const ringGradient = ctx.createLinearGradient(-radius * 1.9, 0, radius * 1.9, 0)
        ringGradient.addColorStop(0, 'rgba(0, 210, 255, 0)')
        ringGradient.addColorStop(.22, 'rgba(65, 202, 255, .18)')
        ringGradient.addColorStop(.45, 'rgba(214, 133, 255, .82)')
        ringGradient.addColorStop(.56, 'rgba(75, 223, 255, .48)')
        ringGradient.addColorStop(.8, 'rgba(89, 105, 255, .18)')
        ringGradient.addColorStop(1, 'rgba(0, 210, 255, 0)')
        ctx.strokeStyle = ringGradient
        ctx.lineWidth = Math.max(2, radius * .075)
        ctx.beginPath()
        ctx.ellipse(0, radius * .08, radius * 1.82, radius * .48, 0, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()
      }

      const sphere = ctx.createRadialGradient(
        -radius * .35, -radius * .42, radius * .08,
        radius * .1, radius * .12, radius * 1.08,
      )
      if (hue === 'cyan') {
        sphere.addColorStop(0, '#baf9ff')
        sphere.addColorStop(.18, '#38d9ff')
        sphere.addColorStop(.52, '#1262c7')
        sphere.addColorStop(.82, '#071b4f')
        sphere.addColorStop(1, '#01040d')
      } else {
        sphere.addColorStop(0, '#ead5ff')
        sphere.addColorStop(.2, '#8d5cff')
        sphere.addColorStop(.5, '#3c247f')
        sphere.addColorStop(.82, '#110b2c')
        sphere.addColorStop(1, '#01030a')
      }
      ctx.fillStyle = sphere
      ctx.shadowBlur = radius * .7
      ctx.shadowColor = hue === 'cyan' ? 'rgba(0, 204, 255, .28)' : 'rgba(130, 71, 255, .30)'
      ctx.beginPath()
      ctx.arc(0, 0, radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0

      ctx.globalCompositeOperation = 'screen'
      ctx.fillStyle = 'rgba(255,255,255,.16)'
      ctx.beginPath()
      ctx.ellipse(-radius * .36, -radius * .43, radius * .2, radius * .12, -.55, 0, Math.PI * 2)
      ctx.fill()

      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = 'rgba(164, 237, 255, .18)'
      ctx.lineWidth = Math.max(.6, radius * .018)
      ctx.beginPath()
      ctx.arc(0, 0, radius * .97, -2.3, -.35)
      ctx.stroke()

      if (ring) {
        ctx.save()
        ctx.rotate(rotation)
        ctx.strokeStyle = 'rgba(8, 14, 43, .68)'
        ctx.lineWidth = Math.max(2, radius * .05)
        ctx.beginPath()
        ctx.ellipse(0, radius * .08, radius * 1.82, radius * .48, 0, Math.PI * .05, Math.PI * .95)
        ctx.stroke()
        ctx.restore()
      }

      ctx.restore()
    }

    const drawRainbow = (time) => {
      const cx = width * .87 + pointerX * 22
      const cy = height * .93 + pointerY * 14
      const radius = Math.min(width, height) * .56
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(-.23 + Math.sin(time * .00008) * .015)
      ctx.globalCompositeOperation = 'screen'
      const colors = ['#ff4d9d', '#ff9f43', '#ffe66d', '#52f2a6', '#45d9ff', '#5b72ff', '#b56bff']
      colors.forEach((color, index) => {
        ctx.strokeStyle = color
        ctx.globalAlpha = .12
        ctx.lineWidth = 3.5
        ctx.shadowBlur = 18
        ctx.shadowColor = color
        ctx.beginPath()
        ctx.arc(0, 0, radius + index * 7, Math.PI * 1.05, Math.PI * 1.72)
        ctx.stroke()
      })
      ctx.restore()
      ctx.globalAlpha = 1
      ctx.shadowBlur = 0
    }

    const drawGalaxy = (time) => {
      const gx = width * .54 + pointerX * 30
      const gy = height * .17 + pointerY * 18
      const scale = Math.min(width, height) * .27
      ctx.save()
      ctx.translate(gx, gy)
      ctx.rotate(-.25 + time * .000012)

      const core = ctx.createRadialGradient(0, 0, 0, 0, 0, scale * .5)
      core.addColorStop(0, 'rgba(255, 246, 207, .92)')
      core.addColorStop(.08, 'rgba(255, 186, 133, .58)')
      core.addColorStop(.28, 'rgba(87, 180, 255, .18)')
      core.addColorStop(1, 'rgba(37, 85, 255, 0)')
      ctx.fillStyle = core
      ctx.beginPath()
      ctx.ellipse(0, 0, scale * .55, scale * .2, 0, 0, Math.PI * 2)
      ctx.fill()

      galaxyStars.forEach((star) => {
        const armWave = Math.sin(star.radius * 7 + star.phase + time * .00045) * .34
        const arm = star.arm ? -1 : 1
        const angle = star.angle + arm * star.radius * 4.2 + armWave
        const x = Math.cos(angle) * star.radius * scale
        const y = Math.sin(angle) * star.radius * scale * .33
        const pulse = .55 + Math.sin(time * .002 + star.phase) * .25
        ctx.globalAlpha = star.brightness * pulse
        ctx.fillStyle = star.arm ? 'rgba(83, 202, 255, 1)' : 'rgba(184, 119, 255, 1)'
        ctx.shadowBlur = star.size > 1 ? 8 : 3
        ctx.shadowColor = ctx.fillStyle
        ctx.beginPath()
        ctx.arc(x, y, star.size, 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.restore()
      ctx.globalAlpha = 1
      ctx.shadowBlur = 0
    }

    const drawAsteroids = (time) => {
      ctx.save()
      ctx.globalCompositeOperation = 'screen'
      asteroids.forEach((rock, index) => {
        const x = rock.x * width + Math.sin(time * .00025 * rock.drift + rock.phase) * 18
        const y = rock.y * height + Math.cos(time * .00018 * rock.drift + rock.phase) * 10
        const size = rock.size * (compactViewport.matches ? .72 : 1)
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(rock.rotation + time * .00012 * rock.drift)
        const rockGradient = ctx.createLinearGradient(-size, -size, size, size)
        rockGradient.addColorStop(0, 'rgba(185, 207, 230, .78)')
        rockGradient.addColorStop(.45, 'rgba(64, 83, 112, .72)')
        rockGradient.addColorStop(1, 'rgba(5, 8, 18, .95)')
        ctx.fillStyle = rockGradient
        ctx.beginPath()
        for (let point = 0; point < 7; point += 1) {
          const a = (point / 7) * Math.PI * 2
          const r = size * (.68 + Math.sin(point * 12.7 + rock.phase) * .22)
          const px = Math.cos(a) * r
          const py = Math.sin(a) * r
          if (point === 0) ctx.moveTo(px, py)
          else ctx.lineTo(px, py)
        }
        ctx.closePath()
        ctx.fill()
        ctx.strokeStyle = index % 3 === 0 ? 'rgba(72, 210, 255, .24)' : 'rgba(168, 117, 255, .18)'
        ctx.lineWidth = .7
        ctx.stroke()
        ctx.restore()
      })
      ctx.restore()
    }

    const drawDeepSpace = (time) => {
      if (!isRoom) return
      drawGalaxy(time)
      drawRainbow(time)
      drawAsteroids(time)

      const parallaxX = pointerX * 24
      const parallaxY = pointerY * 16
      drawPlanet(width * .11 + parallaxX, height * .30 + parallaxY, Math.min(width, height) * .115, 'cyan', time * .00008, false)
      drawPlanet(width * .88 + parallaxX * .55, height * .25 + parallaxY * .45, Math.min(width, height) * .13, 'violet', -time * .00006, true)
      drawPlanet(width * .48 - parallaxX * .3, height * .78 - parallaxY * .2, Math.min(width, height) * .065, 'violet', time * .0001, false)

      const horizon = ctx.createLinearGradient(0, height * .72, width, height)
      horizon.addColorStop(0, 'rgba(26, 104, 255, 0)')
      horizon.addColorStop(.45, 'rgba(53, 198, 255, .10)')
      horizon.addColorStop(.56, 'rgba(174, 94, 255, .13)')
      horizon.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.globalCompositeOperation = 'screen'
      ctx.fillStyle = horizon
      ctx.fillRect(0, height * .68, width, height * .32)
      ctx.globalCompositeOperation = 'source-over'
    }

    const schedule = () => {
      if (active && !reducedMotion.matches && !document.hidden) {
        raf = requestAnimationFrame(draw)
      }
    }

    const draw = (timestamp) => {
      const delta = Math.min(timestamp - lastTime || 16, 50)
      lastTime = timestamp
      if (!reducedMotion.matches) frame += delta

      ctx.clearRect(0, 0, width, height)

      const glow = ctx.createRadialGradient(
        width * 0.52, height * 0.45, 0,
        width * 0.52, height * 0.45, Math.max(width, height) * 0.7,
      )
      glow.addColorStop(0, isNav ? 'rgba(44, 97, 230, .10)' : 'rgba(50, 84, 255, .13)')
      glow.addColorStop(0.48, isRoom ? 'rgba(32, 46, 120, .09)' : 'rgba(77, 50, 180, .06)')
      glow.addColorStop(1, 'rgba(3, 8, 25, 0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, width, height)

      drawFibers(frame)
      drawDeepSpace(frame)

      stars.forEach((star) => {
        const x = (star.x * width + frame * 0.018 * star.speed) % (width + 20) - 10
        const y = star.y * height + Math.sin(frame * 0.0012 * star.speed + star.phase) * 7
        const pulse = reducedMotion.matches
          ? 1
          : 0.62 + Math.sin(frame * 0.006 * star.speed + star.phase) * star.twinkle * 0.38
        const alpha = Math.max(0.16, pulse * (isNav ? 0.58 : 0.78))

        ctx.beginPath()
        ctx.arc(x, y, star.r * (pulse > 0.75 ? 1.2 : 1), 0, Math.PI * 2)
        ctx.fillStyle = star.blue ? `rgba(91, 177, 255, ${alpha})` : `rgba(174, 113, 255, ${alpha})`
        ctx.shadowBlur = pulse > 0.78 ? 13 : 5
        ctx.shadowColor = ctx.fillStyle
        ctx.fill()
        ctx.shadowBlur = 0
      })

      if (!reducedMotion.matches) {
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

      schedule()
    }

    const onPointerMove = (event) => {
      if (!isRoom || compactViewport.matches) return
      pointerX = ((event.clientX / Math.max(window.innerWidth, 1)) - .5) * 2
      pointerY = ((event.clientY / Math.max(window.innerHeight, 1)) - .5) * 2
    }

    const onPointerLeave = () => {
      pointerX *= .82
      pointerY *= .82
    }

    const onVisibility = () => {
      cancelAnimationFrame(raf)
      if (!document.hidden) {
        lastTime = performance.now()
        schedule()
      }
    }

    const observer = new IntersectionObserver(([entry]) => {
      active = entry.isIntersecting
      cancelAnimationFrame(raf)
      if (active && !document.hidden) {
        lastTime = performance.now()
        schedule()
      }
    }, { threshold: 0.01 })

    createParticles()
    resize()
    observer.observe(canvas)
    draw(0)
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', onVisibility)
    if (isRoom) {
      window.addEventListener('pointermove', onPointerMove, { passive: true })
      window.addEventListener('pointerleave', onPointerLeave, { passive: true })
    }

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
      if (isRoom) {
        window.removeEventListener('pointermove', onPointerMove)
        window.removeEventListener('pointerleave', onPointerLeave)
      }
    }
  }, [density])

  return <canvas ref={canvasRef} className={`cosmic-field cosmic-field-${density}`} aria-hidden="true" />
}
