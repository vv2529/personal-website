import Model from '../../scripts/Model'
import { transformSong, getPreloadedAudio, getRandomSongs } from '../../scripts/music'

export default class RadioModel extends Model {
	currentTime() {
		return Date.now() / 1000
	}

	isSongOfTheDayPlaying() {
		return this.currentSongs[0].id === this.songOfTheDay.id && this.songOfTheDay.id > 0
	}

	createSingleAudio() {
		const audio = new Audio()
		audio.preload = true
		audio.volume = this.volume
		return audio
	}

	async getSongs(stationId, secondTry) {
		let songs = this.savedSongs[stationId] || []
		const startTime = Date.now()
		if (
			songs.length < 3 ||
			startTime / 1000 >= songs[0].startTime + songs[0].duration + this.songInterval
		) {
			if (stationId) {
				let response
				try {
					response = await (await fetch(`/api/radio/current_songs?station=${stationId}`)).json()
				} catch (e) {
					if (secondTry) this.status = 'error'
					else return await this.getSongs.call(this, stationId, true)
				}

				const endTime = Date.now()
				const approxOffset = Math.round((endTime - startTime) / 2000)

				response[0][6] += approxOffset
				if (response[0][6] >= response[0][5] + this.songInterval)
					return await this.getSongs.call(this, stationId)
				// console.log('Client:', endTime / 1000, '-', startTime / 1000, '=', (endTime - startTime) / 1000)

				let time = Math.floor(startTime / 1000)

				songs = response.map((song) => {
					const elapsed = song[6] || 0
					time -= elapsed
					const obj = transformSong(song)
					obj.startTime = time
					obj.link = `${obj.link}${obj.link.includes('?') ? '&' : '?'}t=${obj.startTime}`
					time += obj.duration + this.songInterval
					return obj
				})

				if (this.savedSongs[stationId]) {
					try {
						if (this.savedSongs[stationId][0].startTime === songs[0].startTime) {
							this.savedSongs[stationId][2] = songs[2]
							songs = this.savedSongs[stationId]
						} else {
							this.savedSongs[stationId] = songs
						}
					} catch (e) {}
				} else this.savedSongs[stationId] = songs
			}

			for (let i = 0; i < 3; i++) if (!songs[i]) songs[i] = this.defaultSong
		}

		return songs
	}

	async changeCurrentStation(id = this.currentStation) {
		this.audio.pause()
		this.startedPreloading = false
		if (id !== this.currentStation) {
			this.status = ''
			this.currentStation = id
			this.currentSongs = [this.defaultSong, this.defaultSong, this.defaultSong]
			this.selectForbidden = true
			clearTimeout(this.timeoutID)
			clearTimeout(this.waitingTimeout)
		}

		const songs = await this.getSongs.call(this, id)

		this.currentSongs = songs
		if (this.selectForbidden)
			setTimeout(() => {
				this.selectForbidden = false
			}, 1000)

		if (id) {
			this.changeSongs(id)
		}
	}

	changeSongs(id) {
		if (!id || id !== this.currentStation) return

		if (new Date().getDate() !== this.songOfTheDay.day) this.changeSongOfTheDay()
		this.currentSongs = [...this.savedSongs[id]]
		clearTimeout(this.waitingTimeout)
		this.audio.pause()

		const timeout = (time) => {
			clearTimeout(this.timeoutID)

			const time1 = Math.max(time - 4, 0),
				time2 = Math.min(time, 4)

			this.timeoutID = setTimeout(() => {
				playingIndex = 1
				setNextSrc()

				try {
					preload()
					this.startedPreloading = true
				} catch (e) {
					console.log('Preloading failed.')
				}

				this.timeoutID = setTimeout(() => {
					if (id !== this.currentStation) return
					if (this.savedSongs[id].length === 3) this.savedSongs[id].shift()
					this.changeSongs.call(this, id)
					setTimeout(() => this.getSongs.call(this, id), 1000)
				}, time2 * 1000)
			}, time1 * 1000)
		}

		const untilNext = this.savedSongs[id][1].startTime - this.currentTime()
		timeout.call(this, untilNext)

		let playingIndex = 0

		// If we happen to catch the song at the last second, we don't bother playing it
		if (untilNext <= this.songInterval + 1) {
			this.status = ''
			this.selectForbidden = false
			playingIndex = 1
		}

		const setNextSrc = () => {
			this.audio.pause()
			if (this.audio.src !== this.savedSongs[id][playingIndex].link) {
				this.audio.onerror =
					this.audio.onwaiting =
					this.audio.onplaying =
					this.audio.onabort =
					this.audio.ontimeupdate =
						null
				if (this.savedSongs[id][playingIndex].preloadedAudio) {
					this.audio.src += ''
					this.audio = this.savedSongs[id][playingIndex].preloadedAudio
					this.audio.muted = false
					this.audio.volume = this.volume
				} else this.audio.src = this.savedSongs[id][playingIndex].link
			}
		}

		const preload = () => {
			if (this.startedPreloading) return

			const onError = () => {}

			const preloadNext = () => {
				if (id !== this.currentStation) return

				// console.log('Preloading:', songs[1].name)
				if (!songs[1].preloaded)
					getPreloadedAudio(songs[1].link, Math.max(this.currentTime() - songs[1].startTime, 0))
						.then((preloadedAudio) => {
							songs[1].preloaded = preloadedAudio
						})
						.catch(onError)
			}

			const songs = this.savedSongs[id].slice(playingIndex, playingIndex + 2)
			// console.log('Preloading:', songs[0].name)

			songs[0].preloaded
				? preloadNext()
				: getPreloadedAudio(songs[0].link, Math.max(this.currentTime() - songs[0].startTime, 0))
						.then((preloadedAudio) => {
							songs[0].preloaded = preloadedAudio
							preloadNext()
						})
						.catch(onError)
		}

		setNextSrc()
		preload()
		this.startedPreloading = false

		if (playingIndex === 1) return

		this.audio.currentTime = Math.max(this.currentTime() - this.savedSongs[id][0].startTime, 0)
		if (this.audio.currentTime < 1) this.audio.currentTime = 0

		if (
			this.audio.currentTime < this.savedSongs[id][0].duration &&
			id === this.currentStation &&
			this.userClicked
		)
			this.audio.play().catch(() => {})

		const maxErrorCount = 2
		let errorCount = 0
		this.audio.onerror = (e) => {
			e.preventDefault()
			if (id === this.currentStation) {
				this.status = 'error'
				// console.log('Error:', this.audio.currentTime, this.audio)
				if (errorCount < maxErrorCount) {
					this.audio.src += ''
					errorCount++
				}
			}
		}

		this.audio.onwaiting = () => {
			clearTimeout(this.waitingTimeout)
			this.waitingTimeout = setTimeout(() => {
				this.status = 'loading'
			}, 250)
		}
		this.audio.onplaying = () => {
			clearTimeout(this.waitingTimeout)
			this.status = ''
		}
		this.audio.onabort = (e) => {
			e.preventDefault()
		}

		this.audio.ontimeupdate = () => {
			let diff = this.audio.currentTime - this.savedSongs[id][0].duration
			if (diff >= 0) {
				playingIndex = 1
				setNextSrc()
				return
			}

			const ideal = this.currentTime() - this.savedSongs[id][0].startTime
			diff = ideal - this.audio.currentTime
			if (diff > 1) {
				this.audio.currentTime = ideal
			}
		}
	}

	async changeSongOfTheDay() {
		const date = new Date()
		const timeOffset = date.getTimezoneOffset()
		const day = date.getDate()
		const song = await (await fetch(`/api/radio/song_of_the_day?time_offset=${timeOffset}`)).json()
		song.day = day
		this.songOfTheDay = song
		this.status = ''
	}

	changeVolume(newVolume) {
		localStorage.radio_volume = newVolume
		this.audio.volume = newVolume
		this.volume = newVolume
	}

	async getStations() {
		const stations = await (await fetch('/api/radio/stations')).json()
		return stations.map(([id, name]) => ({ id, name }))
	}

	async changeStations() {
		const stations = await this.getStations()
		this.stations = stations
		this.selectForbidden = false
	}

	setup() {
		if (!this.SSR) {
			if (isNaN(+localStorage.radio_volume)) localStorage.radio_volume = 1

			this.audio = this.createSingleAudio()

			this.changeStations()
			this.changeSongOfTheDay()
			this.changeVolume(+localStorage.radio_volume)

			const click = () => {
				this.userClicked = true
				window.removeEventListener('click', click)
			}

			window.addEventListener('click', click)
		}

		const fetched = getRandomSongs(25, true)
		fetched.then(async (songs) => {
			songs = songs.map((song) => song.replace(/ \(feat\. .+?\)/, ''))
			this.background = { songs }
		})

		this.setupComplete = true
	}
}
