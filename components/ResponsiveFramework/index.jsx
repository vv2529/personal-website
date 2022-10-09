import PageContainer from '../PageContainer'
import css from './style.module.scss'

const ResponsiveFramework = ({
	children,
	title,
	status,
	background,
	classNames = [],
	verticalScroll,
}) => {
	return (
		<PageContainer
			title={title}
			classNames={[...classNames, css['page-container']]}
			verticalScroll={verticalScroll}
		>
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
