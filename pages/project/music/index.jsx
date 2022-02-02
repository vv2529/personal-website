import { useState, useRef } from 'react'
import {
	AiFillCaretLeft,
	AiFillCaretRight,
	AiOutlineHeart,
	AiFillHeart,
	AiFillEdit,
} from 'react-icons/ai'
import { FaSearch, FaExternalLinkAlt, FaPlay, FaPause, FaEllipsisH } from 'react-icons/fa'
import { ImCheckmark, ImCheckmark2 } from 'react-icons/im'
import { ResponsiveFramework, PageTitle } from '../../../components/ResponsiveFramework'
import css from './style.module.scss'
import { transformSong } from '../../../scripts/music'

const SSR = !('window' in globalThis)
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
const optionItems = [
	{
		caption: 'Play sound by URL',
		onClick: () => {
			setOverlayOpen(true)
		},
	},
	{
		caption: 'Show speed slider',
		optionName: 'showSpeedSlider',
	},
	{
		caption: 'Preserve pitch',
		onClick: () => {
			audio.preservesPitch = audio.mozPreservesPitch = options.preservePitch
		},
		optionName: 'preservePitch',
	},
	{
		caption: 'Loop',
		onClick: () => {
			audio.loop = options.loop
		},
		optionName: 'loop',
	},
	{
		caption: 'Favorite',
		onClick: () => {},
	},
	{
		caption: 'Original',
		onClick: () => {
			if (songPlaying.original) window.open(songPlaying.original)
		},
	},
	{
		caption: 'Show in the list',
		onClick: () => {
			setHighlightIndex(songs.findIndex((song) => song.id === songPlaying.id))
			if (highlightIndex === -1) return
			setPage(Math.floor(highlightIndex / songsPerPage) + 1)
			setTimeout(() => {
				setHighlightIndex(-1)
			}, 1000)
		},
	},
	{
		caption: 'Download',
		onClick: () => {
			window.open(songPlaying.link)
		},
	},
]

let setupComplete = false
let userClicked = false
const songsPerPage = 50
let audio = {}
let isSeeking = false
let justLoaded = true

let status,
	setStatus = (value) => setStatus2((status = value)),
	setStatus2 = () => {}
let songPlaying,
	setSongPlaying = (value) => setSongPlaying2((songPlaying = value)),
	setSongPlaying2 = () => {}
let songs,
	setSongs = (value) => setSongs2((songs = value)),
	setSongs2 = () => {}
let tab,
	setTab = (value) => setTab2((tab = value)),
	setTab2 = () => {}
let filters,
	setFilters = (value) => setFilters2((filters = value)),
	setFilters2 = () => {}
let volume,
	setVolume = (value) => setVolume2((volume = value)),
	setVolume2 = () => {}
let currentTime,
	setCurrentTime = (value) => setCurrentTime2((currentTime = value)),
	setCurrentTime2 = () => {}
let page,
	setPage = (value) => setPage2((page = value)),
	setPage2 = () => {}
let optionsOpen,
	setOptionsOpen = (value) => setOptionsOpen2((optionsOpen = value)),
	setOptionsOpen2 = () => {}
let options,
	setOptions = (value) => setOptions2((options = value)),
	setOptions2 = () => {}
let speed,
	setSpeed = (value) => setSpeed2((speed = value)),
	setSpeed2 = () => {}
let overlayOpen,
	setOverlayOpen = (value) => setOverlayOpen2((overlayOpen = value)),
	setOverlayOpen2 = () => {}
let customURL,
	setCustomURL = (value) => setCustomURL2((customURL = value)),
	setCustomURL2 = () => {}
let highlightIndex,
	setHighlightIndex = (value) => setHighlightIndex2((highlightIndex = value)),
	setHighlightIndex2 = () => {}

const TabNav = () => {
	return (
		<nav className={css['nav']}>
			<ul className={css['nav-ul']}>
				{['Music', 'Filters', 'Add new song', 'Edit radio stations'].map((caption, i) => {
					return (
						<div key={caption} className={css['nav-block']}>
							<input
								className={`visually-hidden ${css['nav-radio']}`}
								type="radio"
								name="nav"
								id={`nav-radio-${i}`}
								checked={i === tab}
								onChange={() => setTab(i)}
							/>
							<li className={css['nav-li']}>
								<label className={css['nav-label']} htmlFor={`nav-radio-${i}`}>
									{caption}
								</label>
							</li>
						</div>
					)
				})}
			</ul>
		</nav>
	)
}

const EnterURLOverlay = () => {
	return (
		<div className={css['overlay']}>
			<div className={css['overlay-center']}>
				<div className={css['overlay-caption']}>Enter sound URL:</div>
				<input
					className={css['overlay-input']}
					type="text"
					placeholder="http://..."
					value={customURL}
					onChange={(e) => setCustomURL(e.target.value)}
				/>
				<button
					className={`${css['btn-done']} ${css['overlay-btn']}`}
					onClick={() => {
						playCustomURL()
						setOverlayOpen(false)
					}}
				>
					Play
				</button>
				<button
					className={`${css['btn-done']} ${css['overlay-btn']}`}
					onClick={() => {
						setOverlayOpen(false)
					}}
				>
					Cancel
				</button>
			</div>
		</div>
	)
}

const OptionItem = ({ caption = '', onClick = () => {}, optionName, index }) => {
	return (
		<li className={css['song-options-item']}>
			{optionName ? (
				<>
					<button className={css['song-options-item-inner']}>
						<label
							className={css['song-options-item-inner-label']}
							htmlFor={`song-option-${index}`}
						>
							<div className={css['song-options-item-caption']}>{caption}</div>
							<input
								className={`visually-hidden ${css['song-options-item-checkbox']}`}
								type="checkbox"
								id={`song-option-${index}`}
								checked={options[optionName]}
								onChange={(e) => {
									changeOptions({ ...options, [optionName]: e.target.checked })
									onClick()
								}}
							/>
							<ImCheckmark className={css['song-options-checkmark']} />
						</label>
					</button>
				</>
			) : (
				<button className={css['song-options-item-inner']} onClick={onClick}>
					{caption}
				</button>
			)}
		</li>
	)
}

const SongControls = () => {
	const duration = isFinite(audio?.duration)
		? Math.max(audio?.duration, songPlaying.duration)
		: songPlaying.duration

	return (
		<div className={css['song-controls']}>
			<div className={css['song-play-control']}>
				<button className={css['rounded-button']} onClick={playPause}>
					{songPlaying.paused ? <FaPlay /> : <FaPause />}
				</button>
			</div>
			<div
				className={css['song-timeline']}
				style={{
					'--bg-break': `${(100 * currentTime) / duration}%`,
				}}
			>
				<div className={css['song-timeline-caption']}>{songPlaying.name}</div>
				<input
					className={css['song-timeline-slider']}
					type="range"
					min="0"
					max={Math.ceil(duration * 4) / 4}
					step="0.25"
					value={currentTime}
					onChange={(e) => {
						if (isSeeking) setCurrentTime(e.target.value)
					}}
					onMouseDown={() => {
						isSeeking = true
					}}
					onMouseUp={() => {
						audio.currentTime = currentTime
						isSeeking = false
					}}
				/>
			</div>
			<div className={css['song-time']}>
				<div>{numberToTime(currentTime)}</div>
				<div>{numberToTime(duration)}</div>
			</div>
			<div className={css['song-volume']}>
				<div className={css['song-volume-caption']}>Volume: {Math.floor(volume * 100)}%</div>
				<input
					className={css['song-volume-slider']}
					type="range"
					min="0"
					max="1"
					step="0.01"
					value={volume}
					onChange={(e) => changeVolume(e.target.value)}
				/>
			</div>
			{options.showSpeedSlider ? (
				<div className={css['song-speed']}>
					<div className={css['song-speed-caption']}>Speed: x{Math.floor(speed * 100) / 100}</div>
					<input
						className={css['song-speed-slider']}
						type="range"
						min="0.5"
						max="2"
						step="0.01"
						value={speed}
						onChange={(e) => changeSpeed(e.target.value)}
					/>
				</div>
			) : (
				''
			)}
			<div className={css['song-options']}>
				<button className={`${css['song-options-inner']} ${css['rounded-button']}`}>
					<input
						className={`visually-hidden ${css['song-options-checkbox']}`}
						type="checkbox"
						id="song-options"
						checked={optionsOpen}
						onChange={(e) => setOptionsOpen(e.target.checked)}
					/>
					<label className={css['song-options-label']} htmlFor="song-options">
						<FaEllipsisH />
					</label>
				</button>
			</div>
			{optionsOpen ? (
				<ul className={css['song-options-list']}>
					{optionItems.map((item, i) => (
						<OptionItem key={item.caption} {...item} index={i} />
					))}
				</ul>
			) : (
				''
			)}
		</div>
	)
}

const SongContainer = ({ songs = [] }) => {
	const changePage = (value) => setPage(Math.min(Math.max(value, 1), pages))
	const setSearch = (e) => setFilters({ ...filters, search: e.target.value })
	const pages = Math.ceil(songs.length / songsPerPage) || 1

	const hi = highlightIndex - (page - 1) * songsPerPage,
		height = 50,
		padding = 30,
		body = useRef(null)
	if (highlightIndex !== -1 && body.current) body.current.scrollTop = height * hi - padding

	return (
		<div className={css['page-section']}>
			<div className={css['song-search']}>
				<div className={css['song-search-icon']}>
					<FaSearch />
				</div>
				<input
					className={css['song-search-input']}
					type="search"
					placeholder="Search for songs..."
					value={filters.search}
					onChange={setSearch}
					onInput={setSearch}
				/>
			</div>
			<div className={css['song-container-body']} ref={body}>
				{songs.slice((page - 1) * songsPerPage, page * songsPerPage).map((song, i) => (
					<Song key={song.id} song={song} highlighted={i === hi} />
				))}
			</div>
			<div className={css['song-container-footer']}>
				<button
					className={css['btn-arrow']}
					onClick={() => changePage(page - 1)}
					disabled={page === 1}
				>
					<AiFillCaretLeft />
				</button>
				<div className={css['song-container-footer-body']}>
					Page{' '}
					<input
						className={css['song-container-page-input']}
						type="number"
						min="1"
						max={pages}
						value={page}
						onChange={(e) => changePage(e.target.value)}
					/>{' '}
					of {pages}, songs {(page - 1) * songsPerPage + 1} to{' '}
					{Math.min(page * songsPerPage, songs.length)} of {songs.length}.
				</div>
				<button
					className={css['btn-arrow']}
					onClick={() => changePage(page + 1)}
					disabled={page === pages}
				>
					<AiFillCaretRight />
				</button>
			</div>
		</div>
	)
}

const Song = ({ song = {}, highlighted }) => {
	return (
		<div className={`${css['song-item']} ${highlighted ? css['flash'] : ''}`}>
			<button
				className={css['song-play-btn']}
				onClick={() => {
					song.id !== songPlaying.id ? changeSongPlaying(song) : playPause()
				}}
			>
				{song.id !== songPlaying.id || songPlaying.paused ? <FaPlay /> : <FaPause />}
			</button>
			<div className={css['song-name']}>{song.name}</div>
			<button className={css['song-heart-btn']}>
				{false ? <AiFillEdit /> : true ? <AiOutlineHeart /> : <AiFillHeart />}
			</button>
			<div className={css['song-original']}>
				{song.original ? (
					<a href={song.original} target="_blank">
						Original <FaExternalLinkAlt className={css['song-original-icon']} />
					</a>
				) : (
					''
				)}
			</div>
		</div>
	)
}

const Fieldset = ({ legend, labels = [], name, ...rest }) => {
	return (
		<fieldset className={css['spaced-fieldset']}>
			{legend ? <legend>{legend}</legend> : ''}
			{labels.map((label, i) => (
				<label key={label} className={css['block-label']}>
					<input
						className={css['spaced-input']}
						{...rest}
						checked={filters[name][i]}
						onChange={(e) => {
							filters[name][i] = e.target.checked
							changeFilters({ ...filters })
						}}
					/>
					{label}
				</label>
			))}
		</fieldset>
	)
}

const Checkbox = ({ label, ...rest }) => {
	return (
		<label className={css['block-label']}>
			<input type="checkbox" className={css['spaced-input']} {...rest} />
			{label}
		</label>
	)
}

const Filters = () => {
	return (
		<div className={css['page-section']}>
			<div className={css['offset-group']}>
				<Checkbox label="Favorite" />
				<Checkbox
					label="Hard"
					checked={filters.hard}
					onChange={(e) => changeFilters({ ...filters, hard: e.target.checked })}
				/>
			</div>
			<Fieldset
				legend="Lyrics"
				name="lyrics"
				labels={['Has lyrics', 'Has words', 'Has none']}
				type="checkbox"
			/>
			<Fieldset
				legend="Original source"
				name="original"
				labels={['Newgrounds', 'Youtube', 'No source', 'Other']}
				type="checkbox"
			/>
			<fieldset className={css['spaced-fieldset']}>
				<legend>Approximate duration range</legend>
				<label className={css['block-label']}>
					<div>From {numberToTime(filters.duration.min)}</div>
					<input
						type="range"
						step="1"
						min={filters.duration.totalMin}
						max={filters.duration.totalMax}
						value={filters.duration.min}
						onChange={(e) => {
							filters.duration.min = Math.min(e.target.value, filters.duration.max)
							changeFilters({ ...filters })
						}}
					/>
				</label>
				<label className={css['block-label']}>
					<div>To {numberToTime(filters.duration.max)}</div>
					<input
						type="range"
						min={filters.duration.totalMin}
						max={filters.duration.totalMax}
						value={filters.duration.max}
						onChange={(e) => {
							filters.duration.max = Math.max(e.target.value, filters.duration.min)
							changeFilters({ ...filters })
						}}
					/>
				</label>
			</fieldset>
		</div>
	)
}

const AddSong = () => {
	return (
		<div className={css['page-section']}>
			<div className={`${css['offset-group']} ${css['inline-group']}`}>
				<div>Song title:</div>
				<input type="text" placeholder="Author - Song" className={css['stretch']} />
			</div>
			<fieldset className={css['spaced-fieldset']}>
				<legend>Link to the audio file</legend>
				<div className={css['inline-group']}>
					<div>Select file source:</div>
					<select className={css['stretch']}>
						<option>Blomp</option>
						<option>Google Drive</option>
						<option>Other</option>
					</select>
				</div>
				<input
					type="text"
					placeholder={true ? 'ID on Blomp' : true ? 'ID on Google Drive' : 'Full link'}
					className={css['single-stretch']}
				/>
			</fieldset>
			<fieldset className={css['spaced-fieldset']}>
				<legend>Link to original</legend>
				<div className={css['inline-group']}>
					<div>Select source:</div>
					<select className={css['stretch']}>
						<option>Newgrounds</option>
						<option>Youtube</option>
						<option>Other</option>
					</select>
				</div>
				<input
					type="text"
					placeholder={true ? 'Audio ID on Newgrounds' : true ? 'Video ID on Youtube' : 'Full link'}
					className={css['single-stretch']}
				/>
			</fieldset>
			<div className={`${css['offset-group']} ${css['inline-group']}`}>
				Duration:
				<div className={css['stretch']}>
					<input type="number" min="0" />:
					<input type="number" min="0" />
				</div>
			</div>
			<button className={css['btn-done']}>Done</button>
		</div>
	)
}

const EditStations = ({ stations = [] }) => {
	return (
		<div className={css['page-section']}>
			<div className={`${css['offset-group']} ${css['inline-group']}`}>
				<div>Select station to edit:</div>
				<select className={css['stretch']}>
					<option>—</option>
					<option className={css['italic-option']}>Create new</option>
					{stations.map((station) => (
						<option key={station.name}>{station.name}</option>
					))}
				</select>
			</div>
			{true ? (
				<>
					<input
						type="text"
						placeholder="Enter station name"
						disabled={false}
						className={css['single-stretch']}
					/>
					<div className={css['single-stretch']}>
						<p>Go to the music tab and check the songs you choose for this radio station.</p>
					</div>
					<button className={css['btn-done']}>Done</button>
				</>
			) : (
				''
			)}
		</div>
	)
}

export default function MusicProject() {
	;[status, setStatus2] = useState('')
	;[songs, setSongs2] = useState([])
	;[songPlaying, setSongPlaying2] = useState(defaultSong)
	;[tab, setTab2] = useState(0)
	;[filters, setFilters2] = useState(defaultFilters)
	;[volume, setVolume2] = useState(1)
	;[currentTime, setCurrentTime2] = useState(0)
	;[page, setPage2] = useState(1)
	;[optionsOpen, setOptionsOpen2] = useState(false)
	;[options, setOptions2] = useState(defaultOptions)
	;[speed, setSpeed2] = useState(1)
	;[overlayOpen, setOverlayOpen2] = useState(false)
	;[customURL, setCustomURL2] = useState('')
	;[highlightIndex, setHighlightIndex2] = useState(-1)

	if (!setupComplete) {
		setup()
		setupComplete = true
	}

	const filtered = songs.filter((song) => {
		if (filters.hard) if (!song.isHard) return false
		if (!filters.lyrics[0]) if (song.isSong === 2) return false
		if (!filters.lyrics[1]) if (song.isSong === 1) return false
		if (!filters.lyrics[2]) if (song.isSong === 0) return false
		if (!filters.original[0]) if (song.originalSource === 'NG') return false
		if (!filters.original[1]) if (song.originalSource === 'YT') return false
		if (!filters.original[2]) if (song.originalSource === '-') return false
		if (!filters.original[3]) if (!song.originalSource) return false
		if (song.duration < filters.duration.min || song.duration > filters.duration.max) return false
		if (filters.search)
			if (!song.name.toLowerCase().includes(filters.search.toLowerCase())) return false
		return true
	})

	return (
		<>
			<ResponsiveFramework title="Music" status={status}>
				<PageTitle title="Music" />
				<TabNav />
				{tab === 0 ? <SongContainer songs={filtered} /> : ''}
				{tab === 1 ? <Filters /> : ''}
				{tab === 2 ? <AddSong /> : ''}
				{tab === 3 ? <EditStations /> : ''}
				{songPlaying?.id ? <SongControls /> : ''}
			</ResponsiveFramework>
			{overlayOpen ? <EnterURLOverlay /> : ''}
		</>
	)
}

const numberToTime = (time) => {
	time = Math.floor(time)
	const s = time % 60
	const m = (time - s) / 60
	return `${m}:${s < 10 ? 0 : ''}${s}`
}

const createAudio = () => {
	audio = new Audio()
	audio.preload = true
	audio.preservesPitch = audio.mozPreservesPitch = options.preservePitch
	audio.loop = options.loop

	if ('music_volume' in localStorage && isFinite(+localStorage.music_volume)) {
		setVolume(Math.min(Math.max(+localStorage.music_volume, 0), 1))
	}
	audio.volume = volume

	if ('music_speed' in localStorage && isFinite(+localStorage.music_speed)) {
		setSpeed(Math.min(Math.max(+localStorage.music_speed, 0.5), 2))
	}
	audio.defaultPlaybackRate = audio.playbackRate = speed

	audio.oncanplay = () => {
		if (justLoaded) {
			justLoaded = false
			audio.play()
		}
		setStatus('')
	}
	audio.onwaiting = () => {
		setStatus('loading')
	}
	audio.onerror = (e) => {
		setStatus('error')
		audio.pause()
	}
	audio.onplaying = () => {
		if (songPlaying.paused) setSongPlaying({ ...songPlaying, paused: false })
	}
	audio.onpause = () => {
		if (!songPlaying.paused) setSongPlaying({ ...songPlaying, paused: true })
	}
	audio.ontimeupdate = () => {
		if (!isSeeking) setCurrentTime(audio.currentTime)
	}
}

const changeVolume = (newVolume) => {
	newVolume = Math.min(Math.max(newVolume, 0), 1)
	localStorage.music_volume = newVolume
	audio.volume = newVolume
	setVolume(newVolume)
}

const changeSpeed = (newSpeed) => {
	newSpeed = Math.min(Math.max(newSpeed, 0.5), 2)
	localStorage.music_speed = newSpeed
	audio.defaultPlaybackRate = newSpeed
	audio.playbackRate = newSpeed
	setSpeed(newSpeed)
}

const changeSongPlaying = (song) => {
	if (songPlaying.id === song.id) return false
	setSongPlaying({ ...song, paused: true })
	setCurrentTime(0)
	setStatus('loading')
	justLoaded = true
	audio.currentTime = 0
	audio.src = song.link
}

const playCustomURL = () => {
	if (!customURL) return
	changeSongPlaying({
		id: customURL,
		name: customURL,
		link: customURL,
		duration: 0,
	})
}

const playPause = () => {
	if (!audio.error && audio.paused) audio.play()
	else audio.pause()
}

const getSongs = async () => {
	const response = await (await fetch('/api/music/songs')).json()
	songs = response.map(transformSong)
	return songs
}

const changeSongs = async () => {
	const songs = await getSongs()
	let min = 9999,
		max = 0
	songs.forEach(({ duration }) => {
		if (duration < min) min = duration
		if (duration > max) max = duration
	})
	let f = filters.duration
	f.totalMin = min
	f.totalMax = max
	if (f.min < min) f.min = min
	if (f.max > max) f.max = max
	setSongs(songs)
}

const changeFilters = (newFilters) => {
	const f = newFilters
	localStorage.music_filters = JSON.stringify([
		0,
		f.hard,
		f.lyrics,
		f.original,
		[
			f.duration.min === f.duration.totalMin ? 0 : f.duration.min,
			f.duration.max === f.duration.totalMax ? 9999 : f.duration.max,
		],
	])
		.slice(1, -1)
		.replace(/false/g, 0)
		.replace(/true/g, 1)
	setFilters(f)
}

const getLocalFilters = () => {
	if (!localStorage.music_filters) return

	const f = JSON.parse(`[${localStorage.music_filters}]`)
	const f2 = {
		hard: f[1],
		lyrics: f[2],
		original: f[3],
		duration: {
			min: f[4][0],
			max: f[4][1],
			totalMin: filters?.totalMin || 0,
			totalMax: filters?.totalMax || 9999,
		},
		search: '',
	}

	return f2
}

const changeOptions = (newOptions) => {
	const o = newOptions
	localStorage.music_options = JSON.stringify([
		+o.showSpeedSlider,
		+o.preservePitch,
		+o.loop,
	]).slice(1, -1)
	setOptions(o)
}

const getLocalOptions = () => {
	if (!localStorage.music_options) return

	const o = JSON.parse(`[${localStorage.music_options}]`)
	const o2 = {
		showSpeedSlider: !!o[0],
		preservePitch: !!o[1],
		loop: !!o[2],
	}

	return o2
}

const setup = () => {
	if (!SSR) {
		setFilters(getLocalFilters())
		setOptions(getLocalOptions())
		createAudio()

		const click = () => {
			userClicked = true
			window.removeEventListener('click', click)
		}
		window.addEventListener('click', click)

		window.onclick = (e) => {
			if (
				optionsOpen &&
				!e.target.closest(`.${css['song-options']}`) &&
				!e.target.closest(`.${css['song-options-list']}`)
			)
				setOptionsOpen(false)
		}

		window.onkeydown = (e) => {
			if (!songPlaying.id || tab !== 0 || ['search', 'text'].includes(e.target.type)) return
			e.preventDefault()

			if (e.key === ' ') {
				playPause()
			} else if (e.key === 'ArrowLeft') {
				audio.currentTime = currentTime - 10
				setCurrentTime(audio.currentTime)
			} else if (e.key === 'ArrowRight') {
				audio.currentTime = currentTime + 10
				setCurrentTime(audio.currentTime)
			} else if (e.key === 'ArrowDown') {
				if (e.ctrlKey) {
					changeSpeed(speed - 0.1)
				} else {
					changeVolume(volume - 0.1)
				}
			} else if (e.key === 'ArrowUp') {
				if (e.ctrlKey) {
					changeSpeed(speed + 0.1)
				} else {
					changeVolume(volume + 0.1)
				}
			}
		}
	}

	changeSongs()
}
