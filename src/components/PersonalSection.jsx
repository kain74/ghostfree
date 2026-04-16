import { useLayoutEffect, useRef } from 'react'
import { animateSection } from '../lib/gsapAnimations'
import styles from './PersonalSection.module.scss'

export default function PersonalSection() {
    const ref = useRef(null)

    useLayoutEffect(() => {
        return animateSection(
            ref.current,
            [
                `.${styles['personal__label']}`,
                `.${styles['personal__heading']}`,
                `.${styles['personal__desc']}`,
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
        <section id="personal" className={styles.personal}>
            <div className={styles['personal__inner']} ref={ref} data-section-inner>
                {/* <div className={styles['personal__label']}>
                    <span className={styles['personal__num']}>06</span>
                    <span>personal</span>
                </div>
                <div className={styles['personal__hero']}>
                        <div className={styles.tab}>
                            <button type="button" className={styles['tab__item']}>디자인</button>
                            <button type="button" className={styles['tab__item']}>이벤트페이지</button>
                            <button type="button" className={styles['tab__item']}>Blender 3D</button>
                        </div>
                </div>
                <div className={styles['personal__panel']}>추가 예정</div> */}
                진행중
            </div>
        </section>
    )
}
