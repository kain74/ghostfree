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
            coords.current[0].x += (mouse.current.x - coords.current[0].x) * 0.28
            coords.current[0].y += (mouse.current.y - coords.current[0].y) * 0.28
            for (let i = 1; i < TRAIL_COUNT; i++) {
                coords.current[i].x +=
                    (coords.current[i - 1].x - coords.current[i].x) * (0.18 + i * 0.03)
                coords.current[i].y +=
                    (coords.current[i - 1].y - coords.current[i].y) * (0.18 + i * 0.03)
            }
            for (let i = 0; i < TRAIL_COUNT; i++) {
                const el = trailRef.current[i]
                if (el) {
                    el.style.transform = `translate3d(${coords.current[i].x}px, ${coords.current[i].y}px, 0) scale(${1.38 - i * 0.045})`
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
            {Array.from({ length: TRAIL_COUNT }).map((_, i) => (
                <div key={i} ref={(el) => (trailRef.current[i] = el)} className="mouse-trail-dot" />
            ))}
        </div>
    )
}
