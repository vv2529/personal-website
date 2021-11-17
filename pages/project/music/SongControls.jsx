import { FaPlay, FaPause } from 'react-icons/fa'
import css from './style.module.scss'

const SongControls = () => {
	return (
		<div className={css['song-controls']}>
			<div className={css['song-play-control']}>
				<button className={css['song-play-btn-border']}>{true ? <FaPlay /> : <FaPause />}</button>
			</div>
			<div
				className={css['song-timeline']}
				style={{
					'--bg-break': `50%`,
				}}
			>
				<div className={css['song-timeline-caption']}>Author - Song</div>
				<input className={css['song-timeline-slider']} type="range" min="0" max="60" step="0.25" />
			</div>
			<div className={css['song-time']}>
				<div>0:00</div>
				<div>1:00</div>
			</div>
			<div className={css['song-volume']}>
				<div className={css['song-volume-caption']}>Volume: 100%</div>
				<input className={css['song-volume-slider']} type="range" min="0" max="1" step="0.01" />
			</div>
		</div>
	)
}

export default SongControls
