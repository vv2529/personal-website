import { useRef } from 'react'
import useMusicModel from '../../models/music/useMusicModel'
import { AiFillCaretLeft, AiFillCaretRight, AiFillCaretDown, AiFillCaretUp } from 'react-icons/ai'
import { FaSearch } from 'react-icons/fa'
import Song from './Song'
import css from '../../scss/music.module.scss'

const SongContainer = () => {
	const music = useMusicModel(['songs', 'page', 'highlightIndex'])

	const hi = music.highlightIndex - (music.page - 1) * music.songsPerPage,
		height = 50,
		padding = 30,
		body = useRef(null)

	if (music.tab !== 0) {
		return false
	}

	const songs = music.filterSongs()
	const changePage = (value) => music.changePage(Math.min(Math.max(value, 1), pages))
	const setSearch = (e) => (music.filters = { ...music.filters, search: e.target.value })
	const pages = Math.ceil(songs.length / music.songsPerPage) || 1

	if (body.current) {
		if (music.highlightIndex !== -1) body.current.scrollTop = height * hi - padding
		if (music.scrollTopChanged) {
			body.current.scrollTop = music.scrollTop
			music.scrollTopChanged = false
		}
	}

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
					className={`${css['btn-arrow']} ${css['btn-arrow-floating']}`}
					onClick={() => {
						music.controlsShown = !music.controlsShown
					}}
				>
					{music.controlsShown ? <AiFillCaretDown /> : <AiFillCaretUp />}
				</button>
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
					of {pages}
					<span className={css['extra-text']}>
						, songs {(music.page - 1) * music.songsPerPage + 1} to{' '}
						{Math.min(music.page * music.songsPerPage, songs.length)} of {songs.length}.
					</span>
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
