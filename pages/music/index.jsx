import useMusicModel from '../../models/music/useMusicModel'
import { ResponsiveFramework, PageTitle } from '../../components/ResponsiveFramework'
import MusicBackground from '../../components/background/MusicBackground'
import TabNav from '../../components/music/TabNav'
import SongContainer from '../../components/music/SongContainer'
import Filters from '../../components/music/Filters'
import SongControls from '../../components/music/SongControls'
import { useEffect } from 'react'

export default function MusicProject() {
	const music = useMusicModel([
		'status',
		'background',
		'title',
		'songPlaying',
		'tab',
		'filters',
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
				<SongContainer />
				<Filters />
				<SongControls />
			</ResponsiveFramework>
		</>
	)
}
