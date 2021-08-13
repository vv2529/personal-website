import { IoMdRefresh } from 'react-icons/io'
import css from '../css/PageContainer.module.css'

const PageContainer = ({ children }) => {
	return (
		<div className={css['page-container']}>
			<button className={css['btn-reload']}>
				<IoMdRefresh />
			</button>
			{children}
		</div>
	);
};

export default PageContainer
