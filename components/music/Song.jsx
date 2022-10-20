import useMusicModel from '../../models/music/useMusicModel'
import { FaExternalLinkAlt, FaPlay, FaPause } from 'react-icons/fa'
import css from '../../scss/music.module.scss'

const Song = ({ song = {}, highlighted }) => {
	const music = useMusicModel()

	return (
		<div className={`${css['song-item']} ${highlighted ? css['flash'] : ''}`}>
			<button
				className={css['song-play-btn']}
				onClick={() => {
					song.id !== music.songPlaying.id ? music.changeSongPlaying(song) : music.playPause()
				}}
			>
				{song.id !== music.songPlaying.id || music.songPlaying.paused ? <FaPlay /> : <FaPause />}
			</button>
			<div className={css['song-name']}>{song.name}</div>
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

export default Song
