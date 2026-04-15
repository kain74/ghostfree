import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { animateSection } from '../lib/gsapAnimations'
import styles from './Projects.module.scss'

const PROJECTS_PER_PAGE = 3

// 무지개 색상 순서
const RAINBOW_COLORS = ['red', 'orange', 'yellow', 'green', 'blue', 'purple']

function getTagColorByIndex(index) {
    return RAINBOW_COLORS[index % RAINBOW_COLORS.length]
}

const projects = [
    {
        num: '01',
        title: 'BC WiseBiz Renewal(OPEN 예정)',
        desc: 'Nunjucks 구조를 정리하고 화면 컴포넌트를 재설계해 유지보수성과 확장성을 높인 구축 프로젝트입니다.',
        tags: ['Nunjucks', 'Gulp', 'Sass', 'JavaScript', 'Web Accessibility Mark(Web Watch)'],
        link: 'https://wisebiz.bccard.com/app/corp/Intro.corp',
        year: '2026.01 ~ 2026.03',
    },
    {
        num: '02',
        title: '롯데월드 운영',
        desc: 'React 기반의 주요 서비스 운영 및 유지보수, 신규 기능 개발과 UI/UX 개선을 담당하였습니다.',
        tags: ['React', 'scss'],
        link: 'https://www.lotteworld.com/',
        year: '2025.11 ~ 2026.12',
    },
    {
        num: '03',
        title: '경남은행',
        desc: '고도화 작업으로 기존 시스템의 UI/UX를 개선하고, 다양한 브라우저와 디바이스에서의 호환성을 높였으며, 유지보수성과 접근성을 강화한 프로젝트입니다.',
        tags: ['html', 'css', 'Jquery'],
        link: 'https://play.google.com/store/apps/details?id=com.knb.psb&hl=ko&pli=1',
        year: '2025.05 ~ 2026.10',
    },
    {
        num: '04',
        title: '신한투자증권 커뮤니티',
        desc: 'Vuew3.0 기존 시스템의 UI/UX를 개선작업',
        tags: ['Vuew3.0', 'scss'],
        link: 'https://play.google.com/store/apps/details?id=com.shinhaninvest.nsmts&hl=ko',
        year: '2025.01 ~ 2026.04',
    },
]

export default function Projects() {
    const ref = useRef(null)
    const listRef = useRef(null)
    const [currentPage, setCurrentPage] = useState(0)
    const showControls = projects.length > PROJECTS_PER_PAGE
    const totalPages = Math.ceil(projects.length / PROJECTS_PER_PAGE)
    const visibleProjects = showControls
        ? projects.slice(
              currentPage * PROJECTS_PER_PAGE,
              currentPage * PROJECTS_PER_PAGE + PROJECTS_PER_PAGE
          )
        : projects

    useLayoutEffect(() => {
        return animateSection(
            ref.current,
            [
                `.${styles['projects__label']}`,
                `.${styles['projects__heading']}`,
                `.${styles['projects__list']}`,
            ],
            {
                start: 'top 88%',
                end: 'top 40%',
                stagger: 0.08,
                scrub: true,
                y: 48,
                followSelector: '[data-section-inner]',
                followY: 7,
            }
        )
    }, [])

    useLayoutEffect(() => {
        if (!listRef.current) return

        const cards = gsap.utils.toArray(`.${styles['projects__card']}`, listRef.current)

        if (!cards.length) return

        gsap.fromTo(
            cards,
            { autoAlpha: 0, y: 26 },
            {
                autoAlpha: 1,
                y: 0,
                duration: 1,
                ease: 'power3.out',
                stagger: 0.14,
            }
        )
    }, [currentPage])

    const handlePrevPage = () => {
        setCurrentPage((page) => Math.max(page - 1, 0))
    }

    const handleNextPage = () => {
        setCurrentPage((page) => Math.min(page + 1, totalPages - 1))
    }

    return (
        <section id="projects" className={styles.projects}>
            <div className={styles['projects__inner']} ref={ref} data-section-inner>
                <div className={styles['projects__label']}>
                    <span className={styles['projects__num']}>02</span>
                    <span>projects</span>
                </div>

                <div className={styles['projects__header']}>
                    <h2 className={styles['projects__heading']}>주요 프로젝트</h2>

                    {showControls ? (
                        <div className={styles['projects__controls']}>
                            <span className={styles['projects__page-status']}>
                                {currentPage + 1} / {totalPages}
                            </span>
                            <div className={styles['projects__buttons']}>
                                <button
                                    type="button"
                                    className={styles['projects__control']}
                                    onClick={handlePrevPage}
                                    disabled={currentPage === 0}
                                    aria-label="이전 프로젝트 보기"
                                >
                                    ←
                                </button>
                                <button
                                    type="button"
                                    className={styles['projects__control']}
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages - 1}
                                    aria-label="다음 프로젝트 보기"
                                >
                                    →
                                </button>
                            </div>
                        </div>
                    ) : null}
                </div>

                <div className={styles['projects__list']} ref={listRef}>
                    {visibleProjects.map((p, index) => {
                        const isDisabledLink = p.link === '#' || p.link === '#none'
                        return (
                            <a
                                key={`${currentPage}-${index}-${p.num}-${p.title}`}
                                href={isDisabledLink ? undefined : p.link}
                                className={styles['projects__card']}
                                onClick={(e) => isDisabledLink && e.preventDefault()}
                                target={isDisabledLink ? undefined : '_blank'}
                                rel={isDisabledLink ? undefined : 'noopener noreferrer'}
                            >
                                <div className={styles['projects__card-main']}>
                                    <div>
                                        <span
                                            className={styles['projects__year']}
                                            style={{ display: 'block', marginBottom: '0.25em' }}
                                        >
                                            {p.year}
                                        </span>
                                        <h3 className={styles['projects__card-title']}>
                                            {p.title}
                                        </h3>
                                        <p className={styles['projects__card-desc']}>{p.desc}</p>
                                        <div className={styles['projects__tags']}>
                                            {p.tags.map((t, idx) => (
                                                <span
                                                    key={t}
                                                    className={`${styles['projects__tag']} ${styles[`projects__tag--${getTagColorByIndex(idx)}`]}`}
                                                >
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className={styles['projects__card-side']}>
                                    <span className={styles['projects__arrow']}>↗</span>
                                </div>
                            </a>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
