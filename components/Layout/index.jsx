import { useRouter } from 'next/router'
import css from './style.module.scss'
import Nav from '../Nav'

const Layout = ({ children }) => {
	const router = useRouter()

	return ['/', '/404'].includes(router.pathname) ? (
		<div className={css['container']}>
			<Nav />
			<main className={css['main']}>{children}</main>
		</div>
	) : (
		<div className={css['container']}>{children}</div>
	)
}

export default Layout
