import Layout from '../components/Layout'
import '../scss/globals.scss'

function App({ Component, pageProps }) {
	return (
		<Layout>
			<Component {...pageProps} />
		</Layout>
	)
}

export default App
