import useMusicModel from '../../models/music/useMusicModel'
import { FaPlay, FaPause, FaEllipsisH } from 'react-icons/fa'
import OptionItem from './OptionItem'
import EnterURLOverlay from './EnterURLOverlay'
import css from '../../scss/music.module.scss'

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
		caption: 'Original',
		onClick() {
			if (music.songPlaying.original) window.open(music.songPlaying.original)
		},
	},
	{
		caption: 'Show in the list',
		onClick() {
			music.showInList()
		},
	},
	{
		caption: 'Random',
		optionName: 'random',
	},
	{
		caption: 'Autoplay',
		optionName: 'autoplay',
	},
	{
		caption: 'Download',
		onClick() {
			window.open(music.songPlaying.link)
		},
	},
]

const Volume = () => {
	music = useMusicModel(['volume', 'currentTime'])

	const volumeText = `Volume: ${Math.round(music.volume * 100)}%`

	return (
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
	)
}

const Speed = () => {
	music = useMusicModel(['speed'])

	const speedText = `Speed: x${music.speed}`

	return (
		music.options.showSpeedSlider && (
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
		)
	)
}

const Options = () => {
	music = useMusicModel(['optionsOpen', 'overlayOpen'])

	return (
		<>
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
			{music.optionsOpen && (
				<ul className={css['song-options-list']}>
					{optionItems.map((item, i) => (
						<OptionItem key={item.caption} {...item} index={i} />
					))}
				</ul>
			)}
			{music.overlayOpen && <EnterURLOverlay />}
		</>
	)
}

const SongControls = () => {
	music = useMusicModel(['options'])

	const duration = isFinite(music.audio?.duration)
		? Math.max(music.audio?.duration, music.songPlaying.duration)
		: music.songPlaying.duration

	return (
		<div className={`${css['song-controls']} ${music.controlsShown ? css['shown'] : ''}`}>
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
			<Volume />
			<Speed />
			<Options />
		</div>
	)
}

export default SongControls
