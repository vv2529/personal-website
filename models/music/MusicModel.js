import { randomShuffle, fetchFromAPI, rand } from '../../scripts/functions'
import Model from '../../scripts/Model'
import { transformSong, getPreloadedAudio } from '../../scripts/music'
import css from '../../scss/music.module.scss'

export default class MusicModel extends Model {
	numberToTime(time) {
		time = Math.floor(time)
		const s = time % 60
		const m = (time - s) / 60
		return `${m}:${s < 10 ? 0 : ''}${s}`
	}

	changePage(page) {
		this.page = page
		if (this.highlightIndex === -1) {
			this.scrollTop = 0
			this.scrollTopChanged = true
		}
	}

	showInList() {
		this.highlightIndex = this.songs.findIndex((song) => song.id === this.songPlaying.id)
		if (this.highlightIndex === -1) return
		this.changePage(Math.floor(this.highlightIndex / this.songsPerPage) + 1)
		setTimeout(() => {
			this.highlightIndex = -1
		}, 1000)
	}

	setTitle(songName) {
		this.title = songName && songName !== this.defaultSong.name ? `${songName} | Music` : 'Music'
	}

	createAudio(audio) {
		this.audio = audio || new Audio()
		this.audio.preload = true
		this.audio.preservesPitch = this.audio.mozPreservesPitch = this.options.preservePitch
		this.audio.loop = this.options.loop
		this.audio.volume = this.volume
		this.audio.defaultPlaybackRate = this.audio.playbackRate = this.speed

		this.audio.oncanplay = (e) => {
			if (this.isPreloading) return
			if (this.justLoaded) {
				this.justLoaded = false
				if (!this.isPausedOnLoad) e.target.play().catch(() => {})
			}
			clearTimeout(this.waitingTimeout)
			this.status = ''
		}

		this.audio.onwaiting = () => {
			if (this.isPreloading) return
			clearTimeout(this.waitingTimeout)
			this.waitingTimeout = setTimeout(() => {
				this.status = 'loading'
			}, 250)
		}

		this.audio.onerror = (e) => {
			if (this.isPreloading) return
			e.preventDefault()
			clearTimeout(this.waitingTimeout)
			this.status = 'error'
			if (this.hadError) {
				this.audio.pause()
			} else {
				this.hadError = true
				this.audio.src += ''
			}
		}

		this.audio.onabort = (e) => {
			e.preventDefault()
		}

		this.audio.onplaying = () => {
			if (this.isPreloading) return
			clearTimeout(this.waitingTimeout)
			if (this.songPlaying.paused) this.songPlaying = { ...this.songPlaying, paused: false }
		}

		this.audio.onpause = () => {
			if (this.isPreloading) return
			if (!this.songPlaying.paused) this.songPlaying = { ...this.songPlaying, paused: true }
		}

		this.audio.onended = () => {
			if (this.isPreloading) return
			if (!this.isSeeking && this.options.autoplay) {
				this.playNext()
			}
		}

		this.audio.ontimeupdate = (e) => {
			if (this.isPreloading) return
			if (!this.isSeeking) this.currentTime = e.target.currentTime
		}
	}

	changeVolume(newVolume) {
		newVolume = Math.min(Math.max(newVolume, 0), 1)
		localStorage.music_volume = newVolume.toFixed(2)
		this.audio.volume = newVolume
		this.volume = newVolume
	}

	changeSpeed(newSpeed) {
		newSpeed = Math.round(Math.min(Math.max(newSpeed, 0.5), 2) * 100) / 100
		localStorage.music_speed = newSpeed.toFixed(2)
		this.audio.defaultPlaybackRate = newSpeed
		this.audio.playbackRate = newSpeed
		this.speed = newSpeed
	}

	changeSongPlaying(song) {
		if (this.songPlaying.id === song.id) return false
		if (!this.controlsAutoShown) {
			this.controlsShown = true
			this.controlsAutoShown = true
		}
		this.status = 'loading'
		this.songPlaying = { ...song, paused: true }
		this.currentTime = 0
		this.justLoaded = true
		this.hadError = false
		this.isPreloading = true
		this.isPausedOnLoad = false
		this.audio.pause()
		this.audio.loop = false
		this.setTitle(song.name)
		getPreloadedAudio(song.link, 0, this.audio).then(() => {
			this.isPreloading = false
			this.audio.loop = this.options.loop
			this.audio.oncanplay({ target: this.audio })
			this.status = ''
		})
	}

	playNext() {
		// index = id - 1
		let index = this.songPlaying.id
		if (this.options.random) {
			do {
				index = rand(this.songs.length)
			} while (index + 1 === this.songPlaying.id)
			this.changeSongPlaying(this.songs[index])
		} else {
			if (this.songPlaying.id < this.songs.length) this.changeSongPlaying(this.songs[index])
		}
		this.showInList()
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
		if (!this.songPlaying.id) {
			this.playNext()
			return
		}
		if (this.isPreloading) {
			this.isPausedOnLoad = !this.isPausedOnLoad
			return
		}
		if (!this.audio.error && this.audio.paused) this.audio.play().catch(() => {})
		else this.audio.pause()
	}

	async getSongs() {
		const response = await fetchFromAPI('music/songs')
		this.songs = response.map(transformSong)

		const songs = randomShuffle(this.songs)
			.slice(0, 25)
			.map((song) => song.name.replace(/ \(feat\. .+?\)/, ''))
		this.background = { songs }
	}

	async changeSongs() {
		await this.getSongs()
		let min = 9999,
			max = 0
		this.songs.forEach(({ duration }) => {
			if (duration < min) min = duration
			if (duration > max) max = duration
		})
		let f = this.filters.duration
		f.totalMin = min
		f.totalMax = max
		if (f.min < min) f.min = min
		if (f.max > max) f.max = max
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
		if (!localStorage.music_filters) return this.filters

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
			+o.autoplay,
			+o.random,
		]).slice(1, -1)
		this.options = o
	}

	getLocalOptions() {
		if (!localStorage.music_options) return this.options

		const o = JSON.parse(`[${localStorage.music_options}]`)
		const o2 = {
			showSpeedSlider: !!o[0],
			preservePitch: !!o[1],
			loop: !!o[2],
			autoplay: !!o[3],
			random: !!o[4],
		}

		return o2
	}

	setup() {
		if (!this.SSR) {
			if (isNaN(+localStorage.music_volume)) localStorage.music_volume = 1
			if (isNaN(+localStorage.music_speed)) localStorage.music_speed = 1
			this.volume = Math.min(Math.max(+localStorage.music_volume, 0), 1)
			this.speed = Math.min(Math.max(+localStorage.music_speed, 0.5), 2)
			this.filters = this.getLocalFilters()
			this.options = this.getLocalOptions()
			this.createAudio()

			const seekBackward = () => {
				this.audio.currentTime = Math.max(this.currentTime - 10, 0)
				this.currentTime = this.audio.currentTime
			}
			const seekForward = () => {
				this.audio.currentTime = this.currentTime + 10
				this.currentTime = this.audio.currentTime
			}

			const click = () => {
				this.userClicked = true
				window.removeEventListener('click', click)

				navigator.mediaSession.setActionHandler('previoustrack', () => {
					seekBackward()
				})
				navigator.mediaSession.setActionHandler('nexttrack', () => {
					this.playNext()
				})
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
				if (
					!this.songPlaying.id ||
					this.tab !== 0 ||
					['search', 'text', 'number'].includes(e.target.type)
				)
					return

				if (e.key === ' ') {
					this.playPause()
				} else if (e.key === 'ArrowLeft') {
					seekBackward()
				} else if (e.key === 'ArrowRight') {
					seekForward()
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
