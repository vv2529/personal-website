import useMusicModel from '../../models/music/useMusicModel'
import { ResponsiveFramework, PageTitle } from '../../components/ResponsiveFramework'
import MusicBackground from '../../components/background/MusicBackground'
import TabNav from '../../components/music/TabNav'
import SongContainer from '../../components/music/SongContainer'
import Filters from '../../components/music/Filters'
import SongControls from '../../components/music/SongControls'
import EnterURLOverlay from '../../components/music/EnterURLOverlay'
import { useEffect } from 'react'

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
		'background',
		'title',
		'controlsShown',
	])

	useEffect(() => {
		if (!music.setupComplete) {
			music.setup()
		}
	})

	return (
		<>
			<ResponsiveFramework
				title={music.title}
				status={music.status}
				background={<MusicBackground data={music.background} />}
				verticalScroll={false}
			>
				<PageTitle title="Music" />
				<TabNav />
				{music.tab === 0 ? <SongContainer /> : ''}
				{music.tab === 1 ? <Filters /> : ''}
				<SongControls />
			</ResponsiveFramework>
			{music.overlayOpen ? <EnterURLOverlay /> : ''}
		</>
	)
}
