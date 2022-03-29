import { useState } from 'react'
import { useRouter } from 'next/router'
import css from './style.module.scss'
import Nav from '../Nav'

const Layout = ({ children }) => {
	const router = useRouter()
	const [profileAreaOpen, setProfileAreaOpen] = useState(false)

	return router.pathname.startsWith('/project/') ? (
		<div className={css['container']}>{children}</div>
	) : (
		<div
			className={css['container']}
			onClick={() => {
				if (profileAreaOpen) setProfileAreaOpen(false)
			}}
		>
			<Nav profileAreaOpen={profileAreaOpen} setProfileAreaOpen={setProfileAreaOpen} />
			<main className={css['main']}>{children}</main>
		</div>
	)
}

export default Layout
