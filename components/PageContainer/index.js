import css from './style.module.scss'
import Meta from '../Meta'

const PageContainer = ({ children, title }) => {
	return (
		<>
			<Meta title={title} />
			<div className={css['page-container']}>{children}</div>
		</>
	)
}

export default PageContainer
