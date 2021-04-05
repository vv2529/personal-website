import Meta from './Meta';
import styles from '../styles/Layout.module.css';

const Layout = ({ children }) => {
	return (
		<>
			<Meta title="Next" />
			<div className={styles.container}>{children}</div>
		</>
	);
};

export default Layout;
