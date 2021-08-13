import Meta from './Meta'
import Nav from './Nav'
import css from '../css/Layout.module.css'

const Layout = ({ children }) => {
	return (
		<>
			<Meta title="Next" />
			<div className={css['container']}>
				<Nav />
				<main className={css['main']}>{children}</main>
			</div>
		</>
	)
}

export default Layout
