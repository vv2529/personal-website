import css from '../css/PageContainer.module.css'

const PageContainer = ({ children }) => {
	return <div className={css['page-container']}>{children}</div>
}

export default PageContainer
