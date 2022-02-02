import { useState } from 'react'
import { FaExternalLinkAlt } from 'react-icons/fa'
import { ResponsiveFramework, PageTitle } from '../../../components/ResponsiveFramework'
import css from './style.module.scss'
import { transformSong } from '../../../scripts/music'

const SSR = !('window' in globalThis)
const songInterval = 4
const defaultSong = { id: 0, name: '—' }

let setupComplete = false
let userClicked = false

let stations,
	setStations = (value) => setStations2((stations = value)),
	setStations2 = () => {}
let currentStation,
	setCurrentStation = (value) => setCurrentStation2((currentStation = value)),
	setCurrentStation2 = () => {}
let currentSongs,
	setCurrentSongs = (value) => setCurrentSongs2((currentSongs = value)),
	setCurrentSongs2 = () => {}
let songOfTheDay,
	setSongOfTheDay = (value) => setSongOfTheDay2((songOfTheDay = value)),
	setSongOfTheDay2 = () => {}
let volume,
	setVolume = (value) => setVolume2((volume = value)),
	setVolume2 = () => {}
let status,
	setStatus = (value) => setStatus2((status = value)),
	setStatus2 = () => {}
let selectForbidden,
	setSelectForbidden = (value) => setSelectForbidden2((selectForbidden = value)),
	setSelectForbidden2 = () => {}

const savedSongs = {}
let audio
let timeoutID, errorTimeout

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

export default function RadioProject() {
	;[stations, setStations2] = useState([])
	;[currentStation, setCurrentStation2] = useState(0)
	;[currentSongs, setCurrentSongs2] = useState([defaultSong, defaultSong, defaultSong])
	;[songOfTheDay, setSongOfTheDay2] = useState(defaultSong)
	;[volume, setVolume2] = useState(1)
	;[status, setStatus2] = useState('loading')
	;[selectForbidden, setSelectForbidden2] = useState(true)

	if (!SSR && !setupComplete) {
		setup()
		setupComplete = true
	}

	return (
		<ResponsiveFramework title="Radio" status={status}>
			<div className={css['main-block']}>
				<PageTitle title="Radio" />
				<div className={css['main-section']}>
					<div className={css['section-caption']}>Select station:</div>
					<select
						className={css['station-select']}
						disabled={selectForbidden}
						value={currentStation}
						onChange={(e) => changeCurrentStation(+e.target.children[e.target.selectedIndex].value)}
					>
						<StationOptions stations={stations} />
					</select>
				</div>
				<div className={css['main-section']}>
					<div className={css['section-caption']}>Now playing:</div>
					<div className={css['section-content']}>
						<div className={css['section-name']}>{currentSongs[0].name}</div>
						<div className={css['section-extra']}>
							{currentSongs[0].original ? (
								<a href={currentSongs[0].original} target="_blank">
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
						<div className={css['section-name']}>{currentSongs[1].name}</div>
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
						type="range"
						min="0"
						max="1"
						step="0.01"
						value={volume}
						onChange={(e) => changeVolume(e.target.value)}
					/>
				</div>
			</div>
		</ResponsiveFramework>
	)
}

const currentTime = () => Date.now() / 1000

const isSongOfTheDayPlaying = () => currentSongs[0].id === songOfTheDay.id && songOfTheDay.id > 0

const createSingleAudio = () => {
	const audio = new Audio()
	audio.preload = true
	audio.volume = volume
	return audio
}

const getSongs = async (stationId, secondTry) => {
	let songs = savedSongs[stationId] || []
	const startTime = Date.now()
	if (
		songs.length < 3 ||
		startTime / 1000 >= songs[0].startTime + songs[0].duration + songInterval
	) {
		if (stationId) {
			let response
			try {
				response = await (await fetch(`/api/radio/current_songs?station=${stationId}`)).json()
			} catch (e) {
				if (secondTry) setStatus('error')
				else return await getSongs(stationId, true)
			}

			const endTime = Date.now()
			const approxOffset = Math.round((endTime - startTime) / 2000)

			response[0][6] += approxOffset
			if (response[0][6] >= response[0][5] + songInterval) return await getSongs(stationId)
			// console.log('Client:', endTime / 1000, '-', startTime / 1000, '=', (endTime - startTime) / 1000)

			let time = Math.floor(startTime / 1000)

			songs = response.map((song) => {
				const elapsed = song[6] || 0
				time -= elapsed
				const obj = transformSong(song)
				obj.startTime = time
				time += obj.duration + songInterval
				return obj
			})

			savedSongs[stationId] = songs
		}

		for (let i = 0; i < 3; i++) if (!songs[i]) songs[i] = defaultSong
	}

	return songs
}

const changeCurrentStation = async (id = currentStation) => {
	audio.pause()
	if (id !== currentStation) {
		setStatus('')
		setCurrentStation(id)
		setCurrentSongs([defaultSong, defaultSong, defaultSong])
		setSelectForbidden(true)
		clearTimeout(timeoutID)
		clearTimeout(errorTimeout)
	}

	const songs = await getSongs(id)

	setCurrentSongs(songs)
	if (selectForbidden) setTimeout(setSelectForbidden, 1000, false)

	if (id) {
		changeSongs(id)
	}
}

const changeSongs = (id) => {
	if (!id || id !== currentStation) return

	if (new Date().getDate() !== songOfTheDay.day) changeSongOfTheDay()
	setCurrentSongs([...savedSongs[id]])
	clearTimeout(errorTimeout)
	audio.pause()

	const timeout = (time) => {
		clearTimeout(timeoutID)

		timeoutID = setTimeout(() => {
			if (id !== currentStation) return
			if (savedSongs[id].length === 3) savedSongs[id].shift()
			changeSongs(id)
			setTimeout(getSongs, 1000, id)
		}, time * 1000)
	}

	const untilNext = savedSongs[id][1].startTime - currentTime()
	timeout(untilNext)
	if (untilNext <= songInterval + 1) {
		setStatus('')
		setSelectForbidden(false)
		if (audio.src !== savedSongs[id][1].link) audio.src = savedSongs[id][1].link
		return
	}
	if (audio.src !== savedSongs[id][0].link) {
		audio.src = savedSongs[id][0].link
	}

	let cb = () => {
		audio.currentTime = Math.max(currentTime() - savedSongs[id][0].startTime, 0)
		if (audio.currentTime < 1) audio.currentTime = 0
	}
	audio.readyState > 0 ? cb() : (audio.onloadedmetadata = cb)

	cb = () => {
		if (audio.currentTime < savedSongs[id][0].duration && id === currentStation && userClicked)
			audio.play()
	}
	audio.readyState > 2 ? cb() : (audio.oncanplay = cb)

	audio.onplaying = () => {
		if (audio.currentTime >= savedSongs[id][0].duration) {
			audio.pause()
			return
		}
		const ideal = currentTime() - savedSongs[id][0].startTime
		// console.log('Ideal:', ideal, 'Real:', audio.currentTime)
		const diff = ideal - audio.currentTime
		if (diff > 1) audio.currentTime = ideal
	}

	audio.onerror = () => {
		if (id === currentStation) {
			setStatus('error')
			// console.log('Error:', audio.currentTime, audio)
			audio.src += ''
		}
	}

	const checkStatus = () => {
		if (id === currentStation) {
			if (audio.currentTime > 1 && audio.readyState < 3 && status !== 'loading')
				setStatus('loading')
			if (audio.readyState > 2 && status !== '') setStatus('')
		}
	}

	checkStatus()

	audio.ontimeupdate = () => {
		checkStatus()
		const diff = audio.currentTime - savedSongs[id][0].duration
		if (diff >= 0) {
			audio.pause()
			if (audio.src !== savedSongs[id][1].link) audio.src = savedSongs[id][1].link
		}
	}
}

const changeSongOfTheDay = async () => {
	const date = new Date()
	const timeOffset = date.getTimezoneOffset()
	const day = date.getDate()
	const song = await (await fetch(`/api/radio/song_of_the_day?time_offset=${timeOffset}`)).json()
	song.day = day
	setSongOfTheDay(song)
	setStatus('')
}

const changeVolume = (newVolume) => {
	localStorage.radio_volume = newVolume
	audio.volume = newVolume
	setVolume(newVolume)
}

const getStations = async () => {
	const stations = await (await fetch('/api/radio/stations')).json()
	return stations.map(([id, name]) => ({ id, name }))
}

const changeStations = async () => {
	const stations = await getStations()
	setStations(stations)
	setSelectForbidden(false)
}

const setup = () => {
	audio = createSingleAudio()
	changeStations()
	changeSongOfTheDay()
	changeVolume(+localStorage.radio_volume)
	const click = () => {
		userClicked = true
		window.removeEventListener('click', click)
	}
	window.addEventListener('click', click)
}
