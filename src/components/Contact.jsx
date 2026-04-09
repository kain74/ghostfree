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
                            다음 프로젝트의
                            <br />
                            <span className={styles['contact__heading-accent']}>
                                프론트엔드를 함께 만듭니다.
                            </span>
                        </h2>
                        <p className={styles['contact__sub']}>
                            브랜드 사이트부터 서비스 UI, 운영 화면까지 사용자 경험을 개선하는
                            작업이라면 편하게 연락해주세요.
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
