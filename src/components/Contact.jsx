import { useLayoutEffect, useRef } from 'react'
import { animateSection } from '../lib/gsapAnimations'
import styles from './Contact.module.scss'

const links = [
    { label: 'Email', value: 'kain7402@naver.com', href: 'mailto:kain7402@naver.com' },
    { label: 'GitHub', value: 'github.com/kain74', href: 'https://github.com/kain74' },
    { label: 'Phone', value: '010-5023-0083', href: 'tel:010-5023-0083' },
]

export default function Contact() {
    const ref = useRef(null)

    useLayoutEffect(() => {
        return animateSection(
            ref.current,
            [
                `.${styles['contact__label']}`,
                `.${styles['contact__heading']}`,
                `.${styles['contact__sub']}`,
                `.${styles['contact__link']}`,
            ],
            {
                start: 'top 86%',
                end: 'top 42%',
                stagger: 0.08,
                scrub: true,
                y: 40,
                followSelector: '[data-section-inner]',
                followY: 6,
            }
        )
    }, [])

    return (
        <section id="contact" className={styles.contact}>
            <div className={styles['contact__inner']} ref={ref} data-section-inner>
                <div className={styles['contact__label']}>
                    <span className={styles['contact__num']}>04</span>
                    <span>contact</span>
                </div>

                <div className={styles['contact__content']}>
                    <div>
                        <h2 className={styles['contact__heading']}>
                            <span className={styles['contact__heading-accent']}>새로운 팀</span>에서
                            <br />
                            함께{' '}
                            <span className={styles['contact__heading-accent']}>성장할 기회</span>를
                            찾고 있습니다.
                        </h2>
                        <p className={styles['contact__sub']}>
                            프론트엔드 개발 포지션에 적합한 인재를 찾고 계시다면, 언제든 편하게 연락
                            부탁드립니다.
                        </p>
                    </div>

                    <div className={styles['contact__links']}>
                        {links.map((l) => (
                            <a
                                key={l.label}
                                href={l.href}
                                className={styles['contact__link']}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <span className={styles['contact__link-label']}>{l.label}</span>
                                <span className={styles['contact__link-value']}>{l.value}</span>
                                <span className={styles['contact__arrow']}>↗</span>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
