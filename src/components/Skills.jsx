import { useLayoutEffect, useRef } from 'react'
import { animateSection } from '../lib/gsapAnimations'
import styles from './Skills.module.scss'

const skillGroups = [
    {
        category: 'Core Stack',
        skills: ['React', 'TypeScript', 'JavaScript (ESNext)', 'Vite', 'Next.js'],
    },
    {
        category: 'UI Engineering',
        skills: ['SCSS Modules', 'Design System', 'Accessibility', 'Responsive UI', 'GSAP'],
    },
    {
        category: 'Collaboration',
        skills: ['Git', 'GitHub', 'Figma', 'Storybook', 'Jira'],
    },
    {
        category: 'Exploring',
        skills: ['React Native', 'Playwright', 'Web Performance', 'CI/CD'],
    },
]

export default function Skills() {
    const ref = useRef(null)

    useLayoutEffect(() => {
        return animateSection(
            ref.current,
            [
                `.${styles['skills__label']}`,
                `.${styles['skills__heading']}`,
                `.${styles['skills__grid']}`,
                `.${styles['skills__group']}`,
            ],
            {
                start: 'top 86%',
                end: 'top 42%',
                stagger: 0.1,
                scrub: true,
                y: 44,
                followSelector: '[data-skills-grid]',
                followY: 5,
            }
        )
    }, [])

    return (
        <section id="skills" className={styles.skills}>
            <div className={styles['skills__inner']} ref={ref} data-section-inner>
                <div className={styles['skills__label']}>
                    <span className={styles['skills__num']}>03</span>
                    <span>skills</span>
                </div>

                <h2 className={styles['skills__heading']}>기술 역량</h2>

                <div className={styles['skills__grid']} data-skills-grid>
                    {skillGroups.map((group) => (
                        <div key={group.category} className={styles['skills__group']}>
                            <h3 className={styles['skills__category']}>{group.category}</h3>
                            <ul className={styles['skills__list']}>
                                {group.skills.map((skill) => (
                                    <li key={skill} className={styles['skills__item']}>
                                        <span className={styles['skills__bullet']}>·</span>
                                        {skill}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
