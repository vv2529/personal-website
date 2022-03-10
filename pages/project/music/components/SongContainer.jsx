import { useRef } from 'react'
import useMusicModel from '../useMusicModel'
import { AiFillCaretLeft, AiFillCaretRight } from 'react-icons/ai'
import { FaSearch } from 'react-icons/fa'
import Song from './Song'
import css from '../style.module.scss'

const SongContainer = () => {
	const music = useMusicModel()

	const songs = music.filterSongs()
	const changePage = (value) => (music.page = Math.min(Math.max(value, 1), pages))
	const setSearch = (e) => (music.filters = { ...music.filters, search: e.target.value })
	const pages = Math.ceil(songs.length / music.songsPerPage) || 1

	const hi = music.highlightIndex - (music.page - 1) * music.songsPerPage,
		height = 50,
		padding = 30,
		body = useRef(null)
	if (music.highlightIndex !== -1 && body.current) body.current.scrollTop = height * hi - padding

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
					value={music.filters.search}
					onChange={setSearch}
					onInput={setSearch}
				/>
			</div>
			<div className={css['song-container-body']} ref={body}>
				{songs
					.slice((music.page - 1) * music.songsPerPage, music.page * music.songsPerPage)
					.map((song, i) => (
						<Song key={song.id} song={song} highlighted={i === hi} />
					))}
			</div>
			<div className={css['song-container-footer']}>
				<button
					className={css['btn-arrow']}
					onClick={() => changePage(music.page - 1)}
					disabled={music.page === 1}
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
						value={music.page}
						onChange={(e) => changePage(e.target.value)}
					/>{' '}
					of {pages}, songs {(music.page - 1) * music.songsPerPage + 1} to{' '}
					{Math.min(music.page * music.songsPerPage, songs.length)} of {songs.length}.
				</div>
				<button
					className={css['btn-arrow']}
					onClick={() => changePage(music.page + 1)}
					disabled={music.page === pages}
				>
					<AiFillCaretRight />
				</button>
			</div>
		</div>
	)
}

export default SongContainer
