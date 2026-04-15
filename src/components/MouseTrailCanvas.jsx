import { useEffect, useRef, useState } from 'react'

const TRAIL_COUNT = 30
const DOT_BASE_SIZE = 30

function isMobile() {
    // Simple mobile detection
    return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export default function MouseTrailCanvas() {
    const [isMobileDevice, setIsMobileDevice] = useState(false);
    const canvasRef = useRef(null)
    const mouse = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
    const coords = useRef(
        Array.from({ length: TRAIL_COUNT }, () => ({ x: mouse.current.x, y: mouse.current.y }))
    )

    useEffect(() => {
        setIsMobileDevice(isMobile());
    }, []);

    useEffect(() => {
        if (isMobileDevice) return;
        const handleMove = (e) => {
            mouse.current.x = e.clientX
            mouse.current.y = e.clientY
        }
        window.addEventListener('mousemove', handleMove)
        let animId
        function animate() {
            // Update trail positions
            coords.current[0].x += (mouse.current.x - coords.current[0].x) * 0.22
            coords.current[0].y += (mouse.current.y - coords.current[0].y) * 0.22
            for (let i = 1; i < TRAIL_COUNT; i++) {
                // Smoother interpolation for the middle dots
                let interp = 0.13 + i * 0.022
                // Make the middle dots even smoother
                if (i > 7 && i < TRAIL_COUNT - 7) interp *= 0.7
                coords.current[i].x += (coords.current[i - 1].x - coords.current[i].x) * interp
                coords.current[i].y += (coords.current[i - 1].y - coords.current[i].y) * interp
            }
            // Draw
            const canvas = canvasRef.current
            const ctx = canvas.getContext('2d')
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            // Calculate mouse speed for motion blur
            const dx = coords.current[0].x - coords.current[1].x
            const dy = coords.current[0].y - coords.current[1].y
            const speed = Math.sqrt(dx * dx + dy * dy)

            // Draw a single smooth ribbon
            ctx.save()
            ctx.globalAlpha = 0.38 + Math.min(speed * 0.03, 0.22)
            ctx.shadowColor = 'rgba(255,180,80,0.18)'
            ctx.shadowBlur = 48 + Math.min(speed * 2.5, 80)
            ctx.beginPath()
            const now = performance.now()
            // 하나로 연결된 리본: 단일 경로, 두께는 앞이 두껍고 뒤가 가늘게
            ctx.save()
            ctx.beginPath()
            for (let i = 0; i < TRAIL_COUNT; i++) {
                const t = i / (TRAIL_COUNT - 1)
                const x = coords.current[i].x
                const y = coords.current[i].y
                if (i === 0) {
                    ctx.moveTo(x, y)
                } else {
                    ctx.lineTo(x, y)
                }
            }
            // 그라데이션 컬러
            const ribbonGrad = ctx.createLinearGradient(
                coords.current[0].x,
                coords.current[0].y,
                coords.current[TRAIL_COUNT - 1].x,
                coords.current[TRAIL_COUNT - 1].y
            )
            ribbonGrad.addColorStop(0, 'hsla(18,92%,62%,0.38)')
            ribbonGrad.addColorStop(0.5, 'hsla(32,92%,60%,0.22)')
            ribbonGrad.addColorStop(1, 'hsla(52,92%,54%,0.13)')
            ctx.strokeStyle = ribbonGrad
            ctx.lineCap = 'round'
            ctx.lineJoin = 'round'
            // 앞이 두껍고 뒤가 가늘게
            ctx.lineWidth = DOT_BASE_SIZE * 1.25
            ctx.stroke()
            ctx.restore()
            // Color gradient along the path (approximate by overlay)
            const grad = ctx.createLinearGradient(
                coords.current[0].x,
                coords.current[0].y,
                coords.current[TRAIL_COUNT - 1].x,
                coords.current[TRAIL_COUNT - 1].y
            )
            grad.addColorStop(0, 'hsla(18,92%,62%,0.38)')
            grad.addColorStop(0.5, 'hsla(32,92%,60%,0.22)')
            grad.addColorStop(1, 'hsla(52,92%,54%,0.13)')
            ctx.strokeStyle = grad
            ctx.lineWidth = DOT_BASE_SIZE * 1.2
            ctx.lineCap = 'round'
            ctx.lineJoin = 'round'
            ctx.stroke()
            ctx.restore()

            // Optionally, overlay faint ellipses for extra glow
            for (let i = TRAIL_COUNT - 1; i >= 0; i -= 3) {
                const t = i / (TRAIL_COUNT - 1)
                const x = coords.current[i].x
                const y = coords.current[i].y
                const hue = 18 + t * 34
                const light = 54 + t * 8
                const alpha = 0.08 + (1 - t) * 0.13
                // 뒤로 갈수록 더 작게
                const size =
                    DOT_BASE_SIZE *
                    (1.0 - t * 0.85) *
                    (0.98 + Math.sin(now / 900 + i * 0.13) * 0.13 + t * 0.08)
                ctx.save()
                ctx.globalAlpha = alpha
                const squiggle = 0.18 + Math.sin(performance.now() / 700 + i * 0.7) * 0.13
                ctx.ellipse(
                    x,
                    y,
                    size * (1 + squiggle),
                    size * (1 - squiggle),
                    Math.sin(performance.now() / 1000 + i) * 0.7,
                    0,
                    Math.PI * 2
                )
                const grad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.6)
                grad.addColorStop(0, `hsla(${hue},92%,${light}%,0.22)`)
                grad.addColorStop(0.6, `hsla(${hue},92%,${light}%,0.13)`)
                grad.addColorStop(1, 'transparent')
                ctx.fillStyle = grad
                ctx.shadowColor = `hsla(${hue},92%,${light}%,0.13)`
                ctx.shadowBlur = 24 + 18 * (1 - t)
                ctx.fill()
                ctx.restore()
            }
            animId = requestAnimationFrame(animate)
        }
        // Resize canvas
        function resize() {
            const dpr = window.devicePixelRatio || 1
            canvasRef.current.width = window.innerWidth * dpr
            canvasRef.current.height = window.innerHeight * dpr
            canvasRef.current.style.width = window.innerWidth + 'px'
            canvasRef.current.style.height = window.innerHeight + 'px'
            canvasRef.current.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0)
        }
        resize()
        window.addEventListener('resize', resize)
        animate()
        return () => {
            window.removeEventListener('mousemove', handleMove)
            window.removeEventListener('resize', resize)
            cancelAnimationFrame(animId)
        }
    }, [isMobileDevice])

    if (isMobileDevice) return null;
    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 99999,
                mixBlendMode: 'lighten',
                background: 'none',
            }}
            width={window.innerWidth}
            height={window.innerHeight}
            aria-hidden
        />
    )
}
