import Link from 'next/link'
import css from './style.module.scss'

const Nav = () => {
	return (
		<nav className={css['nav']}>
			<ul className={css['nav-ul']}>
				<li className={`${css['nav-li']} ${css['nav-li-primary']}`}>
					<Link href="/">
						<a className={`${css['nav-link']} ${css['nav-link-primary']}`}>vv2529</a>
					</Link>
				</li>
				<li className={css['nav-li']}>
					<Link href="/music">
						<a className={css['nav-link']}>Music</a>
					</Link>
				</li>
				<li className={css['nav-li']}>
					<Link href="/radio">
						<a className={css['nav-link']}>Radio</a>
					</Link>
				</li>
			</ul>
		</nav>
	)
}

export default Nav
