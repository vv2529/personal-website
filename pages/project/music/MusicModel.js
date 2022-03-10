import Model from '../../../scripts/Model'
import { transformSong } from '../../../scripts/music'
import css from './style.module.scss'

export default class MusicModel extends Model {
	numberToTime(time) {
		time = Math.floor(time)
		const s = time % 60
		const m = (time - s) / 60
		return `${m}:${s < 10 ? 0 : ''}${s}`
	}

	createAudio() {
		this.audio = new Audio()
		this.audio.preload = true
		this.audio.preservesPitch = this.audio.mozPreservesPitch = this.options.preservePitch
		this.audio.loop = this.options.loop

		if ('music_volume' in localStorage && isFinite(+localStorage.music_volume)) {
			this.volume = Math.min(Math.max(+localStorage.music_volume, 0), 1)
		}
		this.audio.volume = this.volume

		if ('music_speed' in localStorage && isFinite(+localStorage.music_speed)) {
			this.speed = Math.min(Math.max(+localStorage.music_speed, 0.5), 2)
		}
		this.audio.defaultPlaybackRate = this.audio.playbackRate = this.speed

		this.audio.oncanplay = () => {
			if (this.justLoaded) {
				this.justLoaded = false
				this.audio.play()
			}
			this.status = ''
		}

		this.audio.onwaiting = () => {
			this.status = 'loading'
		}

		this.audio.onerror = (e) => {
			this.status = 'error'
			if (this.hadError) {
				this.audio.pause()
			} else {
				this.hadError = true
				this.audio.src += ''
			}
		}
		this.audio.onplaying = () => {
			if (this.songPlaying.paused) this.songPlaying = { ...this.songPlaying, paused: false }
		}
		this.audio.onpause = () => {
			if (!this.songPlaying.paused) this.songPlaying = { ...this.songPlaying, paused: true }
		}
		this.audio.ontimeupdate = () => {
			if (!this.isSeeking) this.currentTime = this.audio.currentTime
		}
	}

	changeVolume(newVolume) {
		newVolume = Math.min(Math.max(newVolume, 0), 1)
		localStorage.music_volume = newVolume
		this.audio.volume = newVolume
		this.volume = newVolume
	}

	changeSpeed(newSpeed) {
		newSpeed = Math.round(Math.min(Math.max(newSpeed, 0.5), 2) * 100) / 100
		localStorage.music_speed = newSpeed
		this.audio.defaultPlaybackRate = newSpeed
		this.audio.playbackRate = newSpeed
		this.speed = newSpeed
	}

	changeSongPlaying(song) {
		if (this.songPlaying.id === song.id) return false
		this.songPlaying = { ...song, paused: true }
		this.currentTime = 0
		this.status = 'loading'
		this.justLoaded = true
		this.hadError = false
		this.audio.currentTime = 0
		this.audio.src = song.link
	}

	playCustomURL() {
		if (!this.customURL) return
		this.changeSongPlaying({
			id: this.customURL,
			name: this.customURL,
			link: this.customURL,
			duration: 0,
		})
	}

	playPause() {
		if (!this.audio.error && this.audio.paused) this.audio.play()
		else this.audio.pause()
	}

	async getSongs() {
		const response = await (await fetch('/api/music/songs')).json()
		this.songs = response.map(transformSong)
		return this.songs
	}

	async changeSongs() {
		const songs = await this.getSongs()
		let min = 9999,
			max = 0
		songs.forEach(({ duration }) => {
			if (duration < min) min = duration
			if (duration > max) max = duration
		})
		let f = this.filters.duration
		f.totalMin = min
		f.totalMax = max
		if (f.min < min) f.min = min
		if (f.max > max) f.max = max
		this.songs = songs
	}

	filterSongs() {
		return this.songs.filter((song) => {
			if (this.filters.hard) if (!song.isHard) return false
			if (!this.filters.lyrics[0]) if (song.isSong === 1) return false
			if (!this.filters.lyrics[1]) if (song.isSong === 2) return false
			if (!this.filters.lyrics[2]) if (!song.isSong) return false
			if (!this.filters.original[0]) if (song.originalSource === 'NG') return false
			if (!this.filters.original[1]) if (song.originalSource === 'YT') return false
			if (!this.filters.original[2]) if (song.originalSource === '-') return false
			if (!this.filters.original[3]) if (!song.originalSource) return false
			if (song.duration < this.filters.duration.min || song.duration > this.filters.duration.max)
				return false
			if (this.filters.search)
				if (!song.name.toLowerCase().includes(this.filters.search.toLowerCase())) return false
			return true
		})
	}

	changeFilters(newFilters) {
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
		this.filters = f
	}

	getLocalFilters() {
		if (!localStorage.music_filters) return

		const f = JSON.parse(`[${localStorage.music_filters}]`)
		const f2 = {
			hard: f[1],
			lyrics: f[2],
			original: f[3],
			duration: {
				min: f[4][0],
				max: f[4][1],
				totalMin: this.filters?.totalMin || 0,
				totalMax: this.filters?.totalMax || 9999,
			},
			search: '',
		}

		return f2
	}

	changeOptions(newOptions) {
		const o = newOptions
		localStorage.music_options = JSON.stringify([
			+o.showSpeedSlider,
			+o.preservePitch,
			+o.loop,
		]).slice(1, -1)
		this.options = o
	}

	getLocalOptions() {
		if (!localStorage.music_options) return

		const o = JSON.parse(`[${localStorage.music_options}]`)
		const o2 = {
			showSpeedSlider: !!o[0],
			preservePitch: !!o[1],
			loop: !!o[2],
		}

		return o2
	}

	setup() {
		if (!this.SSR) {
			this.filters = this.getLocalFilters()
			this.options = this.getLocalOptions()
			this.createAudio()

			const click = () => {
				this.userClicked = true
				window.removeEventListener('click', click)
			}
			window.addEventListener('click', click)

			window.onclick = (e) => {
				if (
					this.optionsOpen &&
					!e.target.closest(`.${css['song-options']}`) &&
					!e.target.closest(`.${css['song-options-list']}`)
				)
					this.optionsOpen = false
			}

			window.onkeydown = (e) => {
				if (!this.songPlaying.id || this.tab !== 0 || ['search', 'text'].includes(e.target.type))
					return

				if (e.key === ' ') {
					this.playPause()
				} else if (e.key === 'ArrowLeft') {
					this.audio.currentTime = this.currentTime - 10
					this.currentTime = this.audio.currentTime
				} else if (e.key === 'ArrowRight') {
					this.audio.currentTime = this.currentTime + 10
					this.currentTime = this.audio.currentTime
				} else if (e.key === 'ArrowDown') {
					if (e.ctrlKey) {
						this.changeSpeed(this.speed - 0.1)
					} else {
						this.changeVolume(this.volume - 0.1)
					}
				} else if (e.key === 'ArrowUp') {
					if (e.ctrlKey) {
						this.changeSpeed(this.speed + 0.1)
					} else {
						this.changeVolume(this.volume + 0.1)
					}
				} else {
					return
				}

				e.preventDefault()
			}
		}

		this.changeSongs()
		this.setupComplete = true
	}
}
