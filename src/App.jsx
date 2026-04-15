import { useState, useEffect } from 'react'
import Nav from './components/Nav'
import Hero from './components/Hero'
import About from './components/About'
import Projects from './components/Projects'
import Board from './components/Board'
import Skills from './components/Skills'
import Contact from './components/Contact'
import MouseTrail from './components/MouseTrail'

export default function App() {
    const [loaded, setLoaded] = useState(false)
    const [progress, setProgress] = useState(0)
    const [canComplete, setCanComplete] = useState(false)

    useEffect(() => {
        document.body.classList.add('is-loading')

        if (document.readyState === 'complete') {
            setCanComplete(true)
            return () => document.body.classList.remove('is-loading')
        }

        const onLoaded = () => setCanComplete(true)
        window.addEventListener('load', onLoaded)

        return () => {
            document.body.classList.remove('is-loading')
            window.removeEventListener('load', onLoaded)
        }
    }, [])

    useEffect(() => {
        if (loaded) return

        const timer = window.setInterval(() => {
            setProgress((value) => {
                if (canComplete) {
                    return Math.min(100, value + 8)
                }

                return Math.min(92, value + Math.floor(Math.random() * 7) + 2)
            })
        }, 70)

        return () => window.clearInterval(timer)
    }, [canComplete, loaded])

    useEffect(() => {
        if (progress < 100 || loaded) return

        const timer = window.setTimeout(() => {
            setLoaded(true)
            document.body.classList.remove('is-loading')
        }, 420)

        return () => window.clearTimeout(timer)
    }, [progress, loaded])

    return (
        <div className="app-root">
            <MouseTrail />
            <div
                className={`app-loader ${loaded ? 'app-loader--hidden' : ''}`}
                aria-hidden={loaded}
            >
                <div className="app-loader__inner">
                    <p className="app-loader__label">로딩 중</p>
                    <div className="app-loader__track" role="progressbar" aria-valuenow={progress}>
                        <span className="app-loader__bar" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="app-loader__percent">{progress}%</p>
                </div>
            </div>

            <main className={`app-shell ${loaded ? 'app-shell--visible' : ''}`}>
                <Hero />
                <About />
                <Projects />
                <Skills />
                <Contact />
                <Board />
            </main>
            <footer
                style={{
                    textAlign: 'center',
                    padding: '3rem 2rem',
                    color: 'var(--text-light)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    borderTop: '1px solid var(--border)',
                }}
            >
                © 2026 GhostFree FrontDevelop. All rights reserved.
            </footer>
            <Nav />
        </div>
    )
}
