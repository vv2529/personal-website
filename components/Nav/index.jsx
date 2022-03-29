import { useSession } from 'next-auth/react'
import Link from 'next/link'
import ProfileArea from '../ProfileArea'
import css from './style.module.scss'

const Nav = ({ profileAreaOpen, setProfileAreaOpen }) => {
	const { data: session, status } = useSession()

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
			{status !== 'loading' && (
				<button
					className={css['nav-button']}
					onClick={(e) => {
						e.stopPropagation()
						setProfileAreaOpen(!profileAreaOpen)
					}}
				>
					{session ? 'Profile' : 'Sign in'}
				</button>
			)}
			{profileAreaOpen && <ProfileArea session={session} setProfileAreaOpen={setProfileAreaOpen} />}
		</nav>
	)
}

export default Nav
