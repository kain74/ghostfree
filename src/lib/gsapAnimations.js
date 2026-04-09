import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function resolveTargets(root, selectors) {
    return selectors.flatMap((selector) => gsap.utils.toArray(selector, root))
}

export function animateHero(root) {
    if (!root || prefersReducedMotion()) return () => {}

    const ctx = gsap.context(() => {
        const eyebrow = root.querySelector('[data-hero-eyebrow]')
        const headline = root.querySelector('[data-hero-headline]')
        const sub = root.querySelector('[data-hero-sub]')
        const cta = root.querySelector('[data-hero-cta]')
        const scrollHint = root.querySelector('[data-hero-scroll]')
        const introTargets = [eyebrow, headline, sub, cta, scrollHint].filter(Boolean)
        const gridLines = gsap.utils.toArray('[data-hero-grid-line]', root)
        const headlineChars = gsap.utils.toArray('[data-hero-headline-char]', root)
        const video = root.querySelector('[data-hero-video]')
        const overlay = root.querySelector('[data-hero-overlay]')
        const inner = root.querySelector('[data-hero-inner]')

        gsap.set(introTargets, { autoAlpha: 0, y: 32 })
        gsap.set(gridLines, { autoAlpha: 0, scaleY: 0, transformOrigin: 'top center' })
        gsap.set(headlineChars, { autoAlpha: 0, y: 54 })

        if (video) {
            gsap.set(video, { scale: 1.12 })
        }

        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

        if (video) {
            tl.to(video, { scale: 1, duration: 1.8, ease: 'power2.out' }, 0)
        }

        if (overlay) {
            tl.fromTo(overlay, { autoAlpha: 0.45 }, { autoAlpha: 1, duration: 1.2 }, 0)
        }

        if (gridLines.length) {
            tl.to(
                gridLines,
                {
                    autoAlpha: 1,
                    scaleY: 1,
                    duration: 0.9,
                    stagger: 0.06,
                    clearProps: 'transform,opacity,visibility',
                },
                0.15
            )
        }

        if (eyebrow) {
            tl.to(
                eyebrow,
                {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.85,
                    clearProps: 'transform,opacity,visibility',
                },
                0.26
            )
        }

        if (headline) {
            tl.to(
                headline,
                {
                    autoAlpha: 1,
                    y: 0,
                    duration: 1,
                    clearProps: 'transform,opacity,visibility',
                },
                0.42
            )
        }

        if (headlineChars.length) {
            tl.to(
                headlineChars,
                {
                    autoAlpha: 1,
                    y: 0,
                    duration: 1.8,
                    ease: 'power3.out',
                    stagger: {
                        each: 0.05,
                        from: 'random',
                    },
                    clearProps: 'transform,opacity,visibility',
                },
                0.58
            )
        }

        if (sub) {
            tl.to(
                sub,
                {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.9,
                    clearProps: 'transform,opacity,visibility',
                },
                0.98
            )
        }

        if (cta) {
            tl.to(
                cta,
                {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.85,
                    clearProps: 'transform,opacity,visibility',
                },
                1.14
            )
        }

        if (scrollHint) {
            tl.to(
                scrollHint,
                {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.8,
                    clearProps: 'transform,opacity,visibility',
                },
                1.34
            )
        }

        if (video) {
            gsap.to(video, {
                yPercent: 10,
                ease: 'none',
                scrollTrigger: {
                    trigger: root,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 1.2,
                },
            })
        }

        if (inner) {
            gsap.to(inner, {
                yPercent: -8,
                ease: 'none',
                scrollTrigger: {
                    trigger: root,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 1,
                },
            })
        }
    }, root)

    return () => ctx.revert()
}

export function animateSection(root, selectors, options = {}) {
    if (!root || prefersReducedMotion()) return () => {}

    const {
        start = 'top 78%',
        end = 'top 40%',
        stagger = 0.12,
        y = 32,
        scrub = false,
        followSelector,
        followY = 8,
    } = options

    const ctx = gsap.context(() => {
        const targets = resolveTargets(root, selectors)

        if (!targets.length) return

        if (scrub) {
            gsap.set(targets, { autoAlpha: 0.15, y })

            const followTarget = followSelector ? root.querySelector(followSelector) : null

            if (followTarget) {
                gsap.to(followTarget, {
                    yPercent: -followY,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: root,
                        start,
                        end,
                        scrub: 0.9,
                    },
                })
            }

            gsap.timeline({
                defaults: { ease: 'none' },
                scrollTrigger: {
                    trigger: root,
                    start,
                    end,
                    scrub: 0.9,
                },
            }).to(targets, {
                autoAlpha: 1,
                y: 0,
                duration: 1,
                stagger,
            })

            return
        }

        gsap.set(targets, { autoAlpha: 0, y })

        gsap.timeline({
            defaults: { ease: 'power3.out' },
            scrollTrigger: {
                trigger: root,
                start,
                once: true,
            },
        }).to(targets, {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            stagger,
            clearProps: 'transform,opacity,visibility',
        })
    }, root)

    return () => ctx.revert()
}
