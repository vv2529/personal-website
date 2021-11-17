import { useState } from 'react'
import { ResponsiveFramework, PageTitle } from '../../../components/ResponsiveFramework'
import TabNav from './TabNav'
import Song from './Song'
import SongContainer from './SongContainer'
import Filters from './Filters'
import AddSong from './AddSong'
import EditStations from './EditStations'
import SongControls from './SongControls'
import css from './style.module.scss'

const SSR = !('window' in globalThis)
const defaultSong = { id: 0, name: '—' }
const sampleSong = {
	id: 1,
	name: 'Underwaterbeats - Nightfall',
	linkId: '93UuaO',
	link: 'https://sharedby.blomp.com/93UuaO',
	original: 'https://youtube.com/watch?v=QKbCwuS0MUc',
	originalId: 'QKbCwuS0MUc',
	originalSource: 'YT',
	duration: 192,
	isHard: false,
	isSong: false,
}

let setupComplete = false
let userClicked = false

let status,
	setStatus = (value) => setStatus2((status = value)),
	setStatus2 = () => {}

export default function MusicProject() {
	;[status, setStatus] = useState('')

	if (!SSR && !setupComplete) {
		setup()
		setupComplete = true
	}

	return (
		<ResponsiveFramework title="Music" status={status}>
			<PageTitle title="Music" />
			<TabNav />
			<SongContainer>
				<Song song={sampleSong} />
			</SongContainer>
			<Filters className={css['hidden']} />
			<AddSong className={css['hidden']} />
			<EditStations className={css['hidden']} />
			<SongControls />
		</ResponsiveFramework>
	)
}

const setup = () => {
	const click = () => {
		userClicked = true
		window.removeEventListener('click', click)
	}
	window.addEventListener('click', click)
}
