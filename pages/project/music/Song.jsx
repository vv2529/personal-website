import { AiOutlineHeart, AiFillHeart, AiFillEdit } from 'react-icons/ai'
import { FaExternalLinkAlt, FaPlay, FaPause } from 'react-icons/fa'
import css from './style.module.scss'

const Song = ({ song = {} }) => {
	return (
		<div className={css['song-item']}>
			<button className={css['song-play-btn']}>{true ? <FaPlay /> : <FaPause />}</button>
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

export default Song
