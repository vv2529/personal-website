import { AiFillCaretLeft, AiFillCaretRight } from 'react-icons/ai'
import { FaSearch } from 'react-icons/fa'
import css from './style.module.scss'

const SongContainer = ({ children, className = [] }) => {
	return (
		<div className={[css['page-section']].concat(className).join(' ')}>
			<div className={css['song-search']}>
				<button className={css['song-search-icon']}>
					<FaSearch />
				</button>
				<input
					className={css['song-search-input']}
					type="search"
					placeholder="Search for songs..."
				/>
			</div>
			<div className={css['song-container-body']}>{children}</div>
			<div className={css['song-container-footer']}>
				<button className={css['btn-arrow']}>
					<AiFillCaretLeft />
				</button>
				<div className={css['song-container-footer-body']}>
					Page <input className={css['song-container-page-input']} type="number" min="1" max="1" />{' '}
					of 1, songs 1 to 1.
				</div>
				<button className={css['btn-arrow']}>
					<AiFillCaretRight />
				</button>
			</div>
		</div>
	)
}

export default SongContainer
