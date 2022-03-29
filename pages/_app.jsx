import { SessionProvider } from 'next-auth/react'
import Layout from '../components/Layout'
import '../scss/globals.scss'

function App({ Component, pageProps }) {
	return (
		<SessionProvider session={pageProps.session}>
			<Layout>
				<Component {...pageProps} />
			</Layout>
		</SessionProvider>
	)
}

export default App
