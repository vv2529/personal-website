import { memo } from 'react'
import { FaExternalLinkAlt } from 'react-icons/fa'
import { ResponsiveFramework, PageTitle } from '../../components/ResponsiveFramework'
import MusicBackground from '../../components/background/MusicBackground'
import useRadioModel from '../../models/radio/useRadioModel'
import css from '../../scss/radio.module.scss'
import { useEffect } from 'react'

const PageContent = memo(() => {
	return (
		<>
			<div className={css['main-block']}>
				<PageTitle title="Radio" />
				<div className={css['main-section']}>
					<div className={css['section-caption']}>Select station:</div>
					<StationSelect />
				</div>
				<div className={css['main-section']}>
					<div className={css['section-caption']}>Now playing:</div>
					<CurrentSong />
				</div>
				<div className={css['main-section']}>
					<div className={css['section-caption']}>Next:</div>
					<NextSong />
				</div>
				<div className={css['main-section']}>
					<div className={css['section-caption']}>Song of the day:</div>
					<SongOfTheDay />
				</div>
			</div>
			<div className={css['options-block']}>
				<Volume />
			</div>
		</>
	)
})

const StationSelect = () => {
	const radio = useRadioModel(['stations', 'currentStation', 'selectForbidden'])

	return (
		<select
			className={css['station-select']}
			disabled={radio.selectForbidden}
			value={radio.currentStation}
			onChange={(e) => radio.changeCurrentStation(+e.target.children[e.target.selectedIndex].value)}
		>
			<option value="0" className={css['station-option']}>
				&#8212;
			</option>
			{radio.stations.map((station) => (
				<option key={station.id} value={station.id} className={css['station-option']}>
					{station.name}
				</option>
			))}
		</select>
	)
}

const CurrentSong = () => {
	const radio = useRadioModel(['currentSong'])

	return (
		<div className={css['section-content']}>
			<div className={css['section-name']}>{radio.currentSong.name}</div>
			<div className={css['section-extra']}>
				{radio.currentSong.original && (
					<a href={radio.currentSong.original} target="_blank">
						Original <FaExternalLinkAlt className={css['section-extra-icon']} />
					</a>
				)}
			</div>
		</div>
	)
}

const NextSong = () => {
	const radio = useRadioModel(['nextSong'])

	return (
		<div className={css['section-content']}>
			<div className={css['section-name']}>{radio.nextSong.name}</div>
		</div>
	)
}

const SongOfTheDay = () => {
	const radio = useRadioModel(['songOfTheDay', 'songOfTheDayPlaying'])

	return (
		<div className={css['section-content']}>
			<div
				className={`${css['section-name']} ${
					radio.songOfTheDayPlaying ? css['name-highlight'] : ''
				}`}
			>
				{radio.songOfTheDay.name}
			</div>
		</div>
	)
}

const Volume = () => {
	const radio = useRadioModel(['volume'])

	return (
		<div className={css['main-section']}>
			<div>Volume: {Math.floor(radio.volume * 100)}%</div>
			<input
				type="range"
				min="0"
				max="1"
				step="0.01"
				defaultValue={radio.volume}
				onChange={(e) => radio.changeVolume(e.target.value)}
			/>
		</div>
	)
}

export default function RadioProject() {
	const radio = useRadioModel(['status', 'background', 'title'])

	useEffect(() => {
		if (!radio.setupComplete) {
			radio.setup()
		}
	})

	return (
		<ResponsiveFramework
			title={radio.title}
			status={radio.status}
			background={<MusicBackground data={radio.background} />}
		>
			<PageContent />
		</ResponsiveFramework>
	)
}
