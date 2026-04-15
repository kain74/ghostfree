import { useEffect, useRef } from 'react'
import './MouseTrail.scss'

const TRAIL_COUNT = 20

export default function MouseTrail() {
    const trailRef = useRef([])
    const mouse = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
    const coords = useRef(
        Array.from({ length: TRAIL_COUNT }, () => ({ x: mouse.current.x, y: mouse.current.y }))
    )

    useEffect(() => {
        const handleMove = (e) => {
            mouse.current.x = e.clientX
            mouse.current.y = e.clientY
        }
        window.addEventListener('mousemove', handleMove)
        let animId
        function animate() {
            coords.current[0].x += (mouse.current.x - coords.current[0].x) * 0.9
            coords.current[0].y += (mouse.current.y - coords.current[0].y) * 0.9
            for (let i = 1; i < TRAIL_COUNT; i++) {
                coords.current[i].x +=
                    (coords.current[i - 1].x - coords.current[i].x) * (0.18 + i * 0.05)
                coords.current[i].y +=
                    (coords.current[i - 1].y - coords.current[i].y) * (0.18 + i * 0.05)
            }
            for (let i = 0; i < TRAIL_COUNT; i++) {
                const el = trailRef.current[i]
                if (el) {
                    // 유기적 모양과 모션을 위한 파라미터
                    const baseScale = 1.38 - i * 0.045
                    const t = i / (TRAIL_COUNT - 1)
                    const time = performance.now() / 1900 + i * 0.13
                    // 타원형 + 약간의 왜곡
                    const sx = baseScale * (0.98 + Math.sin(time + i) * 0.13 + t * 0.08)
                    const sy = baseScale * (0.98 + Math.cos(time + i * 0.7) * 0.13 + t * 0.08)
                    const rot = Math.sin(time + i * 0.3) * 18 * (1 - t)
                    const size = 38 * baseScale
                    el.style.transform = `translate3d(${coords.current[i].x - size / 2}px, ${coords.current[i].y - size / 2}px, 0) scale(${sx},${sy}) rotate(${rot}deg)`
                    el.style.opacity = `${0.16 + (1 - i / TRAIL_COUNT) * 0.42}`
                }
            }
            animId = requestAnimationFrame(animate)
        }
        animate()
        return () => {
            window.removeEventListener('mousemove', handleMove)
            cancelAnimationFrame(animId)
        }
    }, [])

    return (
        <div className="mouse-trail-root" aria-hidden>
            {Array.from({ length: TRAIL_COUNT }).map((_, i) => {
                // 앞쪽은 붉은색, 뒤로 갈수록 노란색으로 보간
                const t = i / (TRAIL_COUNT - 1)
                // 빨강~노랑 그라데이션 (hue: 18~52, sat: 92~92, light: 54~62)
                const color = `radial-gradient(circle, hsla(${18 + t * 34},92%,${54 + t * 8}%,0.22) 0%, hsla(${18 + t * 34},92%,${54 + t * 8}%,0.13) 60%, transparent 100%)`
                const boxShadow = `0 0 48px 18px hsla(${18 + t * 34},92%,${54 + t * 8}%,0.13), 0 0 32px 10px hsla(${18 + t * 34},92%,${54 + t * 8}%,0.09)`
                return (
                    <div
                        key={i}
                        ref={(el) => (trailRef.current[i] = el)}
                        className="mouse-trail-dot"
                        style={{ background: color, boxShadow }}
                    />
                )
            })}
        </div>
    )
}
