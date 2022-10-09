import { createContext } from 'react'
import Context from '../../scripts/Context'

const defaultSong = { id: 0, name: '—' }

const radioContext = createContext(
	new Context({
		lets: {
			stations: [],
			currentStation: 0,
			currentSongs: [defaultSong, defaultSong, defaultSong],
			songOfTheDay: defaultSong,
			volume: 1,
			status: 'loading',
			selectForbidden: true,
			background: {},
			title: 'Radio',
		},
		internalLets: {
			setupComplete: false,
			userClicked: false,
			audio: {},
			timeoutID: 0,
			waitingTimeout: 0,
		},
		consts: {
			SSR: !('window' in globalThis),
			songInterval: 4,
			defaultSong,
			savedSongs: {},
		},
	})
)

export default radioContext
