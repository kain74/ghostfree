import { useLayoutEffect, useRef } from 'react'
import { animateHero } from '../lib/gsapAnimations'
import videoBg from '../assets/video/vidio.mp4'
import styles from './Hero.module.scss'

const headlinePrimary = '사용자 흐름을 설계하고'
const headlineAccentLead = '인터페이스'
const headlineAccentTail = '를 완성합니다'

function renderHeadlineChars(text) {
    return Array.from(text).map((char, index) => (
        <span
            key={`${text}-${index}`}
            className={styles['hero__headline-char']}
            data-hero-headline-char
            aria-hidden="true"
        >
            {char === ' ' ? '\u00A0' : char}
        </span>
    ))
}

export default function Hero() {
    const sectionRef = useRef(null)

    useLayoutEffect(() => {
        return animateHero(sectionRef.current)
    }, [])

    return (
        <section id="hero" className={styles.hero} ref={sectionRef}>
            {/* background video */}
            <video
                className={styles['hero__video']}
                data-hero-video
                src={videoBg}
                autoPlay
                muted
                loop
                playsInline
                aria-hidden="true"
            />
            <div className={styles['hero__video-overlay']} data-hero-overlay aria-hidden="true" />

            {/* background grid lines */}
            <div className={styles['hero__grid']} aria-hidden="true">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className={styles['hero__grid-line']} data-hero-grid-line />
                ))}
            </div>

            <div className={styles['hero__inner']} data-hero-inner>
                <p className={styles['hero__eyebrow']} data-hero-eyebrow>
                    <span className={styles['hero__dot']} />
                    Frontend Engineer
                </p>

                <h1 className={styles['hero__headline']} data-hero-headline>
                    <span className={styles['hero__headline-line']} aria-label={headlinePrimary}>
                        {renderHeadlineChars(headlinePrimary)}
                    </span>
                    <br />
                    <span
                        className={`${styles['hero__headline-line']} ${styles['hero__headline-accent']}`}
                        aria-label={`${headlineAccentLead}${headlineAccentTail}`}
                    >
                        <span className={styles['hero__headline-emphasis']}>
                            {renderHeadlineChars(headlineAccentLead)}
                        </span>
                        <span className={styles['hero__headline-neutral']}>
                            {renderHeadlineChars(headlineAccentTail)}
                        </span>
                    </span>
                </h1>

                <p className={styles['hero__sub']} data-hero-sub>
                    기획 의도를 화면으로 번역하고,
                    <br />
                    반응형 UI와 세밀한 인터랙션으로 완성도 높은 경험을 구현합니다.
                </p>

                <div className={styles['hero__cta']} data-hero-cta>
                    <a
                        href="#projects"
                        className={`${styles['hero__button']} ${styles['hero__button--primary']}`}
                    >
                        프로젝트 보기
                    </a>
                    <a
                        href="#contact"
                        className={`${styles['hero__button']} ${styles['hero__button--ghost']}`}
                    >
                        협업 문의
                    </a>
                </div>
            </div>

            <div className={styles['hero__scroll-hint']} data-hero-scroll>
                <div className={styles['hero__scroll-line']} />
                <span>scroll</span>
            </div>
        </section>
    )
}
