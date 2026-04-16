import { useState, useEffect } from 'react'
import styles from './Nav.module.scss'

const links = [
    { label: '소개', href: '#about' },
    { label: '프로젝트', href: '#projects' },
    { label: '기술', href: '#skills' },
    { label: '연락처', href: '#contact' },
    { label: '공지사항', href: '#board' },
    { label: '개인작업', href: '#personal' },
]

export default function Nav() {
    const [scrolled, setScrolled] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    useEffect(() => {
        if (!menuOpen) {
            document.body.style.overflow = ''
            return
        }

        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'

        return () => {
            document.body.style.overflow = previousOverflow
        }
    }, [menuOpen])

    return (
        <nav
            className={`${styles.nav} ${scrolled ? styles['nav--scrolled'] : ''} ${menuOpen ? styles['nav--menu-open'] : ''}`}
        >
            <a href="#hero" className={styles['nav__logo']}>
                <span
                    className={`material-symbols-outlined ${styles['nav__logo-mark']}`}
                    style={{
                        fontVariationSettings: '"wght" 100',
                        fontSize: '1.8rem',
                        verticalAlign: 'middle',
                    }}
                >
                    skull
                </span>
                <span>GhostFree</span>
            </a>

            <ul className={`${styles['nav__links']} ${menuOpen ? styles['nav__links--open'] : ''}`}>
                {links.map((l) => (
                    <li key={l.href}>
                        <a
                            href={l.href}
                            className={styles['nav__link']}
                            onClick={() => setMenuOpen(false)}
                        >
                            {l.label}
                        </a>
                    </li>
                ))}
            </ul>

            <button
                className={styles['nav__burger']}
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="메뉴"
                aria-expanded={menuOpen}
            >
                <span
                    className={
                        menuOpen ? styles['nav__burger-line--top'] : styles['nav__burger-line']
                    }
                />
                <span
                    className={
                        menuOpen
                            ? styles['nav__burger-line--middle-open']
                            : styles['nav__burger-line--middle']
                    }
                />
                <span
                    className={
                        menuOpen ? styles['nav__burger-line--bottom'] : styles['nav__burger-line']
                    }
                />
            </button>
        </nav>
    )
}
