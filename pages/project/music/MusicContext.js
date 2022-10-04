import { createContext } from 'react'
import Context from '../../../scripts/Context'

const defaultSong = { id: 0, name: '—' }
const defaultFilters = {
	hard: false,
	lyrics: [true, true, true],
	original: [true, true, true, true],
	duration: {
		min: 0,
		max: 9999,
		totalMin: 0,
		totalMax: 9999,
	},
	search: '',
}
const defaultOptions = {
	showSpeedSlider: false,
	preservePitch: false,
	loop: false,
}

const musicContext = createContext(
	new Context({
		lets: {
			status: '',
			songPlaying: defaultSong,
			songs: [],
			tab: 0,
			filters: defaultFilters,
			volume: 1,
			currentTime: 0,
			page: 1,
			optionsOpen: false,
			options: defaultOptions,
			speed: 1,
			overlayOpen: false,
			customURL: '',
			highlightIndex: -1,
			background: {},
		},
		internalLets: {
			setupComplete: false,
			userClicked: false,
			audio: {},
			isSeeking: false,
			justLoaded: true,
			hadError: false,
			waitingTimeout: 0,
		},
		consts: {
			SSR: !('window' in globalThis),
			songsPerPage: 50,
			defaultSong,
		},
	})
)

export default musicContext
