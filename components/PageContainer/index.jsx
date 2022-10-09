import css from './style.module.scss'
import Meta from '../Meta'

const PageContainer = ({ children, title, classNames = [], verticalScroll = true }) => {
	if (!verticalScroll) classNames.push(css['no-overflow-y'])
	return (
		<>
			<Meta title={title} />
			<div className={[...classNames, css['page-container']].join(' ')}>{children}</div>
		</>
	)
}

export default PageContainer
