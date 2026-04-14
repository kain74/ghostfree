import { useLayoutEffect, useRef } from 'react'
import { animateSection } from '../lib/gsapAnimations'
import styles from './About.module.scss'

export default function About() {
    const ref = useRef(null)

    useLayoutEffect(() => {
        return animateSection(
            ref.current,
            [
                `.${styles['about__label']}`,
                `.${styles['about__heading']}`,
                `.${styles['about__bio']}`,
                `.${styles['about__fact']}`,
            ],
            {
                start: 'top 86%',
                end: 'top 42%',
                scrub: true,
                y: 42,
                followSelector: '[data-section-inner]',
                followY: 6,
            }
        )
    }, [])

    return (
        <section id="about" className={styles.about}>
            <div className={styles['about__inner']} ref={ref} data-section-inner>
                <div className={styles['about__label']}>
                    <span className={styles['about__num']}>01</span>
                    <span>about</span>
                </div>

                <div className={styles['about__content']}>
                    <div className={`${styles['about__column']} ${styles['about__column--left']}`}>
                        <h2 className={styles['about__heading']}>
                            <span className={styles['about__heading-accent']}>실전 경험</span>과{' '}
                            <span className={styles['about__heading-accent']}>설계</span>로 완성도
                            높은 UI를 만듭니다.
                        </h2>
                    </div>

                    <div className={`${styles['about__column']} ${styles['about__column--right']}`}>
                        <p className={styles['about__bio']}>
                            체계적인 구조 설계와 경험을 바탕으로, 더 나은 사용자 화면을 구현합니다.
                        </p>
                        <p className={styles['about__bio']}>
                            프론트엔드는 브랜드와 제품의 의도를 가장 먼저 전달하는 접점이라고
                            생각합니다. 그래서 화면을 만들기 전에 사용자 흐름과 우선순위를 먼저
                            정리하고, 목적이 분명한 인터랙션을 설계합니다.
                        </p>
                        <p className={styles['about__bio']}>
                            React 기반 컴포넌트 설계, 접근성, 성능 최적화를 바탕으로 유지보수 가능한
                            UI를 구현합니다. 빠르게 바뀌는 요구사항에도 흔들리지 않는 화면 구조를
                            만드는 데 집중하고 있습니다.
                        </p>

                        <div className={styles['about__facts']}>
                            {[
                                { label: '위치', value: '충남 천안, 대한민국' },
                                {
                                    label: '전문분야',
                                    value: 'Frontend Engineering(React, Vue)',
                                },
                                {
                                    label: '서브분야',
                                    value: 'Design UI/UX',
                                },
                                {
                                    label: '협업',
                                    value: '금융권 웹/웹앱 애플리케이션',
                                },
                            ].map((f) => (
                                <div key={f.label} className={styles['about__fact']}>
                                    <span className={styles['about__fact-label']}>{f.label}</span>
                                    <span className={styles['about__fact-value']}>{f.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
