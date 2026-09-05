import { useEffect, useRef } from 'react'

// 화면 전체에 깔리는 우주 배경: 성운(CSS 그라디언트)은 index.css에서, 반짝이는 별은 여기서 캔버스로 그림
function SpaceBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let stars = []
    let frameId = null

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      const count = Math.floor((canvas.width * canvas.height) / 6000)
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.6 + 0.4,
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 1.5,
        tint: Math.random() < 0.15 ? '#ffe9a8' : '#ffffff',
      }))
    }

    function draw(t) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const s of stars) {
        const twinkle = 0.55 + 0.45 * Math.sin(t * 0.001 * s.speed + s.phase)
        ctx.globalAlpha = twinkle
        ctx.fillStyle = s.tint
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      frameId = requestAnimationFrame(draw)
    }

    resize()
    draw(0)
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="space-stars" aria-hidden="true" />
}

export default SpaceBackground
