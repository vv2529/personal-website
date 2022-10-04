import PageContainer from '../PageContainer'
import css from './style.module.scss'

const ResponsiveFramework = ({ children, title, status, background }) => {
	return (
		<PageContainer title={title} className={css['page-container']}>
			{background || ''}
			<div className={css['inner-container']}>
				{children}
				<div
					className={`${css['status']} ${
						css[
							status === 'loading'
								? 'status-loading'
								: status === 'error'
								? 'status-error'
								: 'hidden'
						]
					}`}
				></div>
			</div>
		</PageContainer>
	)
}

const PageTitle = ({ title = '' }) => {
	return <h1 className={css['page-title']}>{title}</h1>
}

export { ResponsiveFramework, PageTitle }
