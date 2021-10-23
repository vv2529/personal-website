import { useState } from 'react'
import { FaExternalLinkAlt } from 'react-icons/fa'
import PageContainer from '../../../components/PageContainer'
import css from './style.module.scss'

const defaultSong = { id: 0, name: '—' }

let currentStation, setCurrentStation
let songOfTheDay, setSongOfTheDay
let songPlaying, setSongPlaying
let songNext, setSongNext
let volume, setVolume

let songAfterNext

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
	let signedIn = false
	return signedIn ? <optgroup label="Official stations">{official}</optgroup> : <>{official}</>
}

export default function RadioProject({ stations }) {
	;[currentStation, setCurrentStation] = useState(0)
	;[songOfTheDay, setSongOfTheDay] = useState(defaultSong)
	;[songPlaying, setSongPlaying] = useState(defaultSong)
	;[songNext, setSongNext] = useState(defaultSong)
	;[volume, setVolume] = useState(1)

	return (
		<PageContainer title="Radio" className={css['page-container']}>
			<div className={css['inner-container']}>
				<div className={css['main-block']}>
					<h1 className={css['main-title']}>Radio</h1>
					<div className={css['main-section']}>
						<div className={css['section-caption']}>Select station:</div>
						<select
							className={css['station-select']}
							value={currentStation}
							onChange={(e) =>
								changeCurrentStation(+e.target.children[e.target.selectedIndex].value)
							}
						>
							<StationOptions stations={stations} />
						</select>
					</div>
					<div className={css['main-section']}>
						<div className={css['section-caption']}>Now playing:</div>
						<div className={css['section-content']}>
							<div className={css['section-name']}>{songPlaying.name}</div>
							<div className={css['section-extra']}>
								{songPlaying.original ? (
									<a href={songPlaying.original} target="_blank">
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
							<div className={css['section-name']}>{songNext.name}</div>
						</div>
					</div>
					<div className={css['main-section']}>
						<div className={css['section-caption']}>Song of the day:</div>
						<div className={css['section-content']}>
							<div
								className={`${css['section-name']} ${
									isSongOfTheDayPlaying() ? css['name-highlight'] : ''
								}`}
							>
								{songOfTheDay.name}
							</div>
						</div>
					</div>
				</div>
				<div className={css['options-block']}>
					<div className={css['main-section']}>
						<div>Volume: {Math.floor(volume * 100)}%</div>
						<input
							className={css['slider']}
							type="range"
							min="0"
							max="1"
							step="any"
							value={volume}
							onChange={(e) => changeVolume(e.target.value)}
						/>
					</div>
				</div>
				<div hidden className={css['loading-spinner']}></div>
			</div>
		</PageContainer>
	)
}

const isSongOfTheDayPlaying = () => songPlaying.id === songOfTheDay.id && songPlaying.id > 0

const changeCurrentStation = async (id) => {
	let songs = []
	if (id) {
		const startTime = Date.now()
		songs = (await (await fetch(`/api/radio/current_songs?station=${id}`)).json()).map((song) => {
			return {
				id: song[0],
				name: song[1],
				link: song[2].includes('/')
					? song[2]
					: `https://drive.google.com/uc?export=download&id=${song[2]}`,
				original:
					song[4] == 'NG'
						? `https://newgrounds.com/audio/listen/${song[3]}`
						: song[4] == 'YT'
						? `https://youtube.com/watch?v=${song[3]}`
						: song[3],
				duration: song[5],
				elapsed: song[6],
			}
		})

		const endTime = Date.now()
		const approxOffset = (endTime - startTime) / 2000
		// console.log('Client:', endTime / 1000, '-', startTime / 1000, '=', approxOffset * 2)

		if (songs[0]) {
			songs[0].elapsed += approxOffset
		}
		// if (songs[0].elapsed >= songs[0].duration)
	}

	for (let i = 0; i < 3; i++) if (!songs[i]) songs[i] = defaultSong

	setCurrentStation(id)
	setSongPlaying(songs[0])
	setSongNext(songs[1])
	songAfterNext = songs[2]
}

const changeSongOfTheDay = async () => {
	const timeOffset = new Date().getTimezoneOffset()
	const song = await (await fetch(`/api/radio/song_of_the_day?time_offset=${timeOffset}`)).json()
	setSongOfTheDay(song)
}

const changeVolume = (newVolume) => {
	setVolume(newVolume)
}

const getStations = async () => {
	return [
		{ id: 1, name: 'Main' },
		{ id: 2, name: 'Songs' },
	]
}

export async function getServerSideProps() {
	return {
		props: {
			stations: await getStations(),
		},
	}
}

changeSongOfTheDay()
