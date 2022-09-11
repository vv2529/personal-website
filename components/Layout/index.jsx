import { useRouter } from 'next/router'
import css from './style.module.scss'
import Nav from '../Nav'

const Layout = ({ children }) => {
	const router = useRouter()

	return router.pathname.startsWith('/project/') ? (
		<div className={css['container']}>{children}</div>
	) : (
		<div className={css['container']}>
			<Nav />
			<main className={css['main']}>{children}</main>
		</div>
	)
}

export default Layout
