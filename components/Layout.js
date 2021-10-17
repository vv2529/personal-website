import { useRouter } from 'next/router'
import Nav from './Nav'
import css from '../css/Layout.module.css'

const Layout = ({ children }) => {
	const router = useRouter()
	return router.pathname.startsWith('/project/') ? (
		<div className={css['container']}>{children}</div>
	) : (
		<>
			<div className={css['container']}>
				<Nav />
				<main className={css['main']}>{children}</main>
			</div>
		</>
	)
}

export default Layout
