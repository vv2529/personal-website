import Meta from './Meta'
import Nav from './Nav'
import PageContainer from './PageContainer'
import css from '../css/Layout.module.css'

const Layout = ({ children }) => {
	return (
		<>
			<Meta title="Next" />
			<div className={css['container']}>
				<Nav />
				<main className={css['main']}>
					<PageContainer>{children}</PageContainer>
				</main>
			</div>
		</>
	);
};

export default Layout
