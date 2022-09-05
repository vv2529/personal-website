import useMusicModel from './useMusicModel'
import { ResponsiveFramework, PageTitle } from '../../../components/ResponsiveFramework'
import TabNav from './components/TabNav'
import SongContainer from './components/SongContainer'
import Filters from './components/Filters'
import SongControls from './components/SongControls'
import EnterURLOverlay from './components/EnterURLOverlay'

export default function MusicProject() {
	const music = useMusicModel([
		'status',
		'songPlaying',
		'songs',
		'tab',
		'filters',
		'volume',
		'currentTime',
		'page',
		'optionsOpen',
		'options',
		'speed',
		'overlayOpen',
		'customURL',
		'highlightIndex',
	])

	if (!music.setupComplete) {
		music.setup()
	}

	return (
		<>
			<ResponsiveFramework title="Music" status={music.status}>
				<PageTitle title="Music" />
				<TabNav />
				{music.tab === 0 ? <SongContainer /> : ''}
				{music.tab === 1 ? <Filters /> : ''}
				{music.songPlaying?.id ? <SongControls /> : ''}
			</ResponsiveFramework>
			{music.overlayOpen ? <EnterURLOverlay /> : ''}
		</>
	)
}
