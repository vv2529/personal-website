import css from './style.module.scss'
import Meta from '../Meta'

const Main = ({ children }) => <main className={css['main']}>{children}</main>
const Hollow = ({ children }) => <>{children}</>

let setupComplete = false

const resize = () => {
	let vh = window.innerHeight * 0.01
	document.documentElement.style.setProperty('--vh', `${vh}px`)
}

const setup = () => {
	if (!setupComplete) {
		setupComplete = true

		if ('window' in globalThis && 'ontouchstart' in globalThis) {
			resize()
			window.addEventListener('resize', resize)
		}
	}
}

const Layout = ({ children, title, classNames = [], verticalScroll = true, Nav, wrap = false }) => {
	if (!verticalScroll) classNames.push(css['no-overflow-y'])

	const Wrapper = wrap ? Main : Hollow

	setup()

	return (
		<div className={css['container']}>
			<Meta title={title} />
			{Nav ? <Nav /> : ''}
			<Wrapper>
				<div className={[...classNames, css['page-container']].join(' ')}>{children}</div>
			</Wrapper>
		</div>
	)
}

export default Layout
