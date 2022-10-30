import Link from 'next/link'
import { useRouter } from 'next/router'
import css from './style.module.scss'

const nav = [
	{
		href: '/music/about',
		caption: 'Music',
	},
	{
		href: '/radio/about',
		caption: 'Radio',
	},
]

const Nav = () => {
	const router = useRouter()

	return (
		<nav className={css['nav']}>
			<ul className={css['nav-ul']}>
				<li className={css['nav-li']}>
					<Link href="/">
						<a className={`${css['nav-link']} ${css['nav-link-primary']}`}>vv2529</a>
					</Link>
				</li>
				{nav.map((link) => (
					<li key={link.caption} className={css['nav-li']}>
						<Link href={link.href}>
							<a
								className={`${css['nav-link']} ${
									router.pathname === link.href ? css['nav-link-current'] : ''
								}`}
							>
								{link.caption}
							</a>
						</Link>
					</li>
				))}
			</ul>
		</nav>
	)
}

export default Nav
