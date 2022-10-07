import useMusicModel from '../useMusicModel'
import { FaPlay, FaPause, FaEllipsisH } from 'react-icons/fa'
import OptionItem from './OptionItem'
import css from '../style.module.scss'

let music = {}
const optionItems = [
	{
		caption: 'Play sound by URL',
		onClick() {
			music.overlayOpen = true
		},
	},
	{
		caption: 'Show speed slider',
		optionName: 'showSpeedSlider',
	},
	{
		caption: 'Preserve pitch',
		onClick() {
			music.audio.preservesPitch = music.audio.mozPreservesPitch = music.options.preservePitch
		},
		optionName: 'preservePitch',
	},
	{
		caption: 'Loop',
		onClick() {
			music.audio.loop = music.options.loop
		},
		optionName: 'loop',
	},
	{
		caption: 'Favorite',
		onClick() {},
	},
	{
		caption: 'Original',
		onClick() {
			if (music.songPlaying.original) window.open(music.songPlaying.original)
		},
	},
	{
		caption: 'Show in the list',
		onClick() {
			music.highlightIndex = music.songs.findIndex((song) => song.id === music.songPlaying.id)
			if (music.highlightIndex === -1) return
			music.page = Math.floor(music.highlightIndex / music.songsPerPage) + 1
			setTimeout(() => {
				music.highlightIndex = -1
			}, 1000)
		},
	},
	{
		caption: 'Download',
		onClick() {
			window.open(music.songPlaying.link)
		},
	},
]

const SongControls = () => {
	music = useMusicModel()

	const duration = isFinite(music.audio?.duration)
		? Math.max(music.audio?.duration, music.songPlaying.duration)
		: music.songPlaying.duration
	const volumeText = `Volume: ${Math.round(music.volume * 100)}%`
	const speedText = `Speed: x${music.speed}`

	return (
		<div className={css['song-controls']}>
			<div className={css['song-play-control']}>
				<button className={css['rounded-button']} onClick={() => music.playPause()}>
					{music.songPlaying.paused ? <FaPlay /> : <FaPause />}
				</button>
			</div>
			<div
				className={css['song-timeline']}
				style={{
					'--bg-break': `${(100 * music.currentTime) / duration}%`,
				}}
			>
				<div className={css['song-timeline-caption']} title={music.songPlaying.name}>
					{music.songPlaying.name}
				</div>
				<input
					className={css['song-timeline-slider']}
					type="range"
					min="0"
					max={Math.ceil(duration * 4) / 4}
					step="0.25"
					value={music.currentTime}
					onChange={(e) => {
						if (music.isSeeking) music.currentTime = e.target.value
					}}
					onMouseDown={() => {
						music.isSeeking = true
					}}
					onMouseUp={() => {
						music.audio.currentTime = music.currentTime
						music.isSeeking = false
					}}
				/>
			</div>
			<div className={css['song-time']}>
				<div>{music.numberToTime(music.currentTime)}</div>
				<div>{music.numberToTime(duration)}</div>
			</div>
			<div className={css['song-volume']}>
				<div className={css['song-volume-caption']} title={volumeText}>
					{volumeText}
				</div>
				<input
					className={css['song-volume-slider']}
					type="range"
					min="0"
					max="1"
					step="0.01"
					value={music.volume}
					onChange={(e) => music.changeVolume(e.target.value)}
				/>
			</div>
			{music.options.showSpeedSlider ? (
				<div className={css['song-speed']}>
					<div className={css['song-speed-caption']} title={speedText}>
						{speedText}
					</div>
					<input
						className={css['song-speed-slider']}
						type="range"
						min="0.5"
						max="2"
						step="0.01"
						value={music.speed}
						onChange={(e) => music.changeSpeed(e.target.value)}
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
						checked={music.optionsOpen}
						onChange={(e) => (music.optionsOpen = e.target.checked)}
					/>
					<label className={css['song-options-label']} htmlFor="song-options">
						<FaEllipsisH />
					</label>
				</button>
			</div>
			{music.optionsOpen ? (
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

export default SongControls
