import Link from 'next/link'
import css from '../css/Nav.module.css'

const Nav = () => {
	return (
		<nav className={css['nav']}>
			<ul className={css['nav-ul']}>
				<li className={`${css['nav-li']} ${css['nav-li-primary']}`}>
					<Link href="/">vv2529</Link>
				</li>
				<li className={css['nav-li']}>
					<Link href="/radio">Radio</Link>
				</li>
				<li className={css['nav-li']}>
					<Link href="/music">Music</Link>
				</li>
			</ul>
		</nav>
	)
}

export default Nav
