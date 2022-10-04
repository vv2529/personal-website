import { FaExternalLinkAlt } from 'react-icons/fa'
import { ResponsiveFramework, PageTitle } from '../../../components/ResponsiveFramework'
import MusicBackground from '../../../components/background/MusicBackground'
import useRadioModel from './useRadioModel'
import css from './style.module.scss'

const StationOptions = ({ stations }) => {
	let official = (
		<>
			<option value="0" className={css['station-option']}>
				&#8212;
			</option>
			{stations.map((station) => (
				<option key={station.id} value={station.id} className={css['station-option']}>
					{station.name}
				</option>
			))}
		</>
	)
	return official
}

export default function RadioProject() {
	const radio = useRadioModel([
		'stations',
		'currentStation',
		'currentSongs',
		'songOfTheDay',
		'volume',
		'status',
		'selectForbidden',
		'background',
	])

	if (!radio.setupComplete) {
		radio.setup()
	}

	return (
		<ResponsiveFramework
			title="Radio"
			status={radio.status}
			background={<MusicBackground data={radio.background} />}
		>
			<div className={css['main-block']}>
				<PageTitle title="Radio" />
				<div className={css['main-section']}>
					<div className={css['section-caption']}>Select station:</div>
					<select
						className={css['station-select']}
						disabled={radio.selectForbidden}
						value={radio.currentStation}
						onChange={(e) =>
							radio.changeCurrentStation(+e.target.children[e.target.selectedIndex].value)
						}
					>
						<StationOptions stations={radio.stations} />
					</select>
				</div>
				<div className={css['main-section']}>
					<div className={css['section-caption']}>Now playing:</div>
					<div className={css['section-content']}>
						<div className={css['section-name']}>{radio.currentSongs[0].name}</div>
						<div className={css['section-extra']}>
							{radio.currentSongs[0].original ? (
								<a href={radio.currentSongs[0].original} target="_blank">
									Original <FaExternalLinkAlt className={css['section-extra-icon']} />
								</a>
							) : (
								''
							)}
						</div>
					</div>
				</div>
				<div className={css['main-section']}>
					<div className={css['section-caption']}>Next:</div>
					<div className={css['section-content']}>
						<div className={css['section-name']}>{radio.currentSongs[1].name}</div>
					</div>
				</div>
				<div className={css['main-section']}>
					<div className={css['section-caption']}>Song of the day:</div>
					<div className={css['section-content']}>
						<div
							className={`${css['section-name']} ${
								radio.isSongOfTheDayPlaying() ? css['name-highlight'] : ''
							}`}
						>
							{radio.songOfTheDay.name}
						</div>
					</div>
				</div>
			</div>
			<div className={css['options-block']}>
				<div className={css['main-section']}>
					<div>Volume: {Math.floor(radio.volume * 100)}%</div>
					<input
						type="range"
						min="0"
						max="1"
						step="0.01"
						value={radio.volume}
						onChange={(e) => radio.changeVolume(e.target.value)}
					/>
				</div>
			</div>
		</ResponsiveFramework>
	)
}
