import { useState } from 'react'
import { FaExternalLinkAlt } from 'react-icons/fa'
import PageContainer from '../../../components/PageContainer'
import css from './style.module.scss'

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

let savedSongs = {}
let savedAudio = {}
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

export default function RadioProject({ stations }) {
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
		<PageContainer title="Radio" className={css['page-container']}>
			<div className={css['inner-container']}>
				<div className={css['main-block']}>
					<h1 className={css['main-title']}>Radio</h1>
					<div className={css['main-section']}>
						<div className={css['section-caption']}>Select station:</div>
						<select
							className={css['station-select']}
							disabled={selectForbidden}
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
				<div
					className={`${css['status-sign']} ${css['loading-spinner']} ${
						status === 'loading' ? '' : 'hidden'
					}`}
				></div>
				<div
					className={`${css['status-sign']} ${css['error-sign']} ${
						status === 'error' ? '' : 'hidden'
					}`}
				></div>
			</div>
		</PageContainer>
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

const createStationAudio = (id) => {
	savedAudio[id] = [createSingleAudio(), createSingleAudio()]
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
				const obj = {
					id: song[0],
					name: song[1],
					link: song[2].includes('/') ? song[2] : `https://sharedby.blomp.com/${song[2]}`,
					original:
						song[4] == 'NG'
							? `https://newgrounds.com/audio/listen/${song[3]}`
							: song[4] == 'YT'
							? `https://youtube.com/watch?v=${song[3]}`
							: song[3],
					duration: song[5],
					startTime: time,
				}
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
	if (savedAudio[currentStation]) savedAudio[currentStation][0].pause()
	if (id !== currentStation) {
		setStatus('')
		setCurrentStation(id)
		setCurrentSongs([defaultSong, defaultSong, defaultSong])
		setSelectForbidden(true)
		clearTimeout(timeoutID)
		clearTimeout(errorTimeout)
		if (id) {
			if (!savedAudio[id]) createStationAudio(id)
		}
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

	const timeout = (time) => {
		clearTimeout(timeoutID)

		timeoutID = setTimeout(() => {
			if (id !== currentStation) return
			if (savedSongs[id].length === 3) savedSongs[id].shift()
			changeSongs(id)
			setTimeout(getSongs, 1000, id)
		}, time * 1000)
	}

	const audio = savedAudio[id]

	const untilNext = savedSongs[id][1].startTime - currentTime()
	timeout(untilNext)
	if (untilNext <= songInterval + 1) {
		setStatus('')
		setSelectForbidden(false)
		if (audio[audio.length - 1].src !== savedSongs[id][1].link)
			audio[audio.length - 1].src = savedSongs[id][1].link
		return
	}

	if (!audio[1]) {
		audio.unshift(createSingleAudio())
	}
	if (audio[1].src === savedSongs[id][0].link) {
		audio.shift()
		audio.push(createSingleAudio())
	} else if (audio[0].src !== savedSongs[id][0].link) {
		audio[0].src = savedSongs[id][0].link
	}

	let cb = () => {
		audio[0].currentTime = Math.max(currentTime() - savedSongs[id][0].startTime, 0)
		if (audio[0].currentTime < 1) audio[0].currentTime = 0
	}
	audio[0].readyState > 0 ? cb() : (audio[0].onloadedmetadata = cb)

	cb = () => {
		if (audio[0].currentTime < savedSongs[id][0].duration && id === currentStation && userClicked)
			audio[0].play()
		if (audio[1].src !== savedSongs[id][1].link) audio[1].src = savedSongs[id][1].link
	}
	audio[0].readyState > 3 ? cb() : (audio[0].oncanplaythrough = cb)

	audio[0].onplaying = () => {
		setStatus('')
		if (audio[0].currentTime >= savedSongs[id][0].duration) {
			audio[0].pause()
			return
		}
		const ideal = currentTime() - savedSongs[id][0].startTime
		// console.log('Ideal:', ideal, 'Real:', audio[0].currentTime)
		const diff = ideal - audio[0].currentTime
		if (diff > 1) audio[0].currentTime = ideal
	}

	audio[0].onerror = () => {
		if (id === currentStation) {
			setStatus('error')
			clearTimeout(errorTimeout)
			audio[0].pause()
			errorTimeout = setTimeout(() => {
				if (audio[0].readyState > 2) audio[0].play()
			}, 1000)
			// console.log('Error:', audio[0].currentTime)
		}
	}

	const checkStatus = () => {
		if (id === currentStation) {
			if (audio[0].currentTime > 1 && audio[0].readyState < 3 && status !== 'loading')
				setStatus('loading')
			if (audio[0].readyState > 2 && status !== '') setStatus('')
		}
	}

	checkStatus()

	audio.onwaiting = () => {
		checkStatus()
	}

	audio[0].ontimeupdate = () => {
		checkStatus()

		const diff = audio[0].currentTime - savedSongs[id][0].duration
		if (diff >= 0) {
			audio[0].pause()
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
	Object.values(savedAudio).forEach((audio) => {
		for (let i = 0; i < 2; i++) {
			audio[i].volume = newVolume
		}
	})
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
	changeStations()
	changeSongOfTheDay()
	changeVolume(+localStorage.radio_volume)
	const click = () => {
		userClicked = true
		window.removeEventListener('click', click)
	}
	window.addEventListener('click', click)
}
