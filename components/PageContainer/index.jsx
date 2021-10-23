import css from './style.module.scss'
import Meta from '../Meta'

const PageContainer = ({ children, title, className = [] }) => {
	return (
		<>
			<Meta title={title} />
			<div className={[css['page-container']].concat(className).join(' ')}>{children}</div>
		</>
	)
}

export default PageContainer
