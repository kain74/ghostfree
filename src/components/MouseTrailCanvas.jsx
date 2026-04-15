import { useEffect, useRef, useState } from 'react'

const TRAIL_COUNT = 15
const DOT_BASE_SIZE = 15

function isMobile() {
    // Simple mobile detection
    return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

export default function MouseTrailCanvas() {
    const [isMobileDevice, setIsMobileDevice] = useState(false)
    const [canvasSize, setCanvasSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    })
    const canvasRef = useRef(null)
    const mouse = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
    const coords = useRef(
        Array.from({ length: TRAIL_COUNT }, () => ({ x: mouse.current.x, y: mouse.current.y }))
    )

    useEffect(() => {
        setIsMobileDevice(isMobile())
    }, [])

    useEffect(() => {
        if (isMobileDevice) return
        let animId = null
        const handleMove = (e) => {
            mouse.current.x = e.clientX
            mouse.current.y = e.clientY
        }
        window.addEventListener('mousemove', handleMove)

        function animate() {
            coords.current[0].x += (mouse.current.x - coords.current[0].x) * 0.22
            coords.current[0].y += (mouse.current.y - coords.current[0].y) * 0.22
            for (let i = 1; i < TRAIL_COUNT; i++) {
                let interp = 0.13 + i * 0.022
                if (i > 7 && i < TRAIL_COUNT - 7) interp *= 0.7
                coords.current[i].x += (coords.current[i - 1].x - coords.current[i].x) * interp
                coords.current[i].y += (coords.current[i - 1].y - coords.current[i].y) * interp
            }
            const canvas = canvasRef.current
            if (!canvas) return
            const ctx = canvas.getContext('2d')
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            const dx = coords.current[0].x - coords.current[1].x
            const dy = coords.current[0].y - coords.current[1].y
            const speed = Math.sqrt(dx * dx + dy * dy)
            ctx.save()
            ctx.globalAlpha = 0.38 + Math.min(speed * 0.03, 0.22)
            ctx.shadowColor = 'rgba(255,180,80,0.18)'
            ctx.shadowBlur = 48 + Math.min(speed * 2.5, 80)
            ctx.beginPath()
            // ...existing code...
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
            // 더 물감 같은 느낌의 리본: 진한 색상과 두꺼운 라인, multiply 블렌드
            ctx.globalCompositeOperation = 'lighter'
            const paintGrad = ctx.createLinearGradient(
                coords.current[0].x,
                coords.current[0].y,
                coords.current[TRAIL_COUNT - 1].x,
                coords.current[TRAIL_COUNT - 1].y
            )
            paintGrad.addColorStop(0, 'rgba(255, 120, 60, 0.75)')
            paintGrad.addColorStop(0.5, 'rgba(255, 200, 80, 0.55)')
            paintGrad.addColorStop(1, 'rgba(80, 180, 255, 0.38)')
            ctx.strokeStyle = paintGrad
            ctx.lineCap = 'round'
            ctx.lineJoin = 'round'
            ctx.lineWidth = DOT_BASE_SIZE * 2.1
            ctx.shadowColor = 'rgba(255,180,80,0.18)'
            ctx.shadowBlur = 48 + Math.min(speed * 2.5, 80)
            ctx.stroke()
            ctx.globalCompositeOperation = 'source-over'
            ctx.restore()
            animId = requestAnimationFrame(animate)
        }
        // Resize handler
        function resize() {
            const dpr = window.devicePixelRatio || 1
            setCanvasSize({ width: window.innerWidth, height: window.innerHeight })
            // 캔버스 크기 변경 후 컨텍스트 스케일 재설정
            const canvas = canvasRef.current
            if (canvas) {
                canvas.width = window.innerWidth * dpr
                canvas.height = window.innerHeight * dpr
                canvas.style.width = window.innerWidth + 'px'
                canvas.style.height = window.innerHeight + 'px'
                const ctx = canvas.getContext('2d')
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
            }
        }
        window.addEventListener('resize', resize)
        resize()
        animate()
        return () => {
            window.removeEventListener('mousemove', handleMove)
            window.removeEventListener('resize', resize)
            if (animId) cancelAnimationFrame(animId)
        }
    }, [isMobileDevice])

    if (isMobileDevice) return null
    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 99999,
                mixBlendMode: 'lighter',
                background: 'rgba(255,255,255,0.01)',
            }}
            width={canvasSize.width}
            height={canvasSize.height}
            aria-hidden
        />
    )
}
