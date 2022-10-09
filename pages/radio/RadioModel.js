import { fetchFromAPI } from '../../scripts/functions'
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

	removeEventListeners() {
		this.audio.onerror =
			this.audio.onwaiting =
			this.audio.onplaying =
			this.audio.onabort =
			this.audio.ontimeupdate =
				null
	}

	setTitle(songName) {
		this.title = songName && songName !== this.defaultSong.name ? `${songName} | Radio` : 'Radio'
	}

	preloadSong(songs, i) {
		if (![0, 1].includes(i)) return
		if (!songs[i].preloaded) {
			songs[i].preloaded = new Audio()
			songs[i].preloading = true
			getPreloadedAudio(
				songs[i].link,
				Math.max(this.currentTime() - songs[i].startTime, 0),
				songs[i].preloaded
			)
				.then(() => {})
				.catch(() => {
					delete songs[i].preloaded
				})
				.finally(() => {
					delete songs[i].preloading
					this.preloadSong(songs, i + 1)
				})
		} else this.preloadSong(songs, i + 1)
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
					response = await fetchFromAPI(`radio/current_songs?station=${stationId}`)
				} catch (e) {
					if (secondTry) this.status = 'error'
					else return await this.getSongs.call(this, stationId, true)
				}

				const endTime = Date.now()
				const approxOffset = Math.round(((endTime - startTime) / 1000) * (2 / 3))

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
						if (this.savedSongs[stationId][0].startTime !== songs[0].startTime) {
							this.savedSongs[stationId].shift()
						}

						if (this.savedSongs[stationId][0].startTime === songs[0].startTime) {
							this.savedSongs[stationId][2] = songs[2]
							songs = this.savedSongs[stationId]
						} else {
							this.savedSongs[stationId] = songs
						}
					} catch (e) {}
				} else this.savedSongs[stationId] = songs

				this.preloadSong(songs, 0)
			}

			for (let i = 0; i < 3; i++) if (!songs[i]) songs[i] = this.defaultSong
		}

		this.setTitle(songs[0].name)

		return songs
	}

	async changeCurrentStation(id = this.currentStation) {
		this.audio.pause()
		if (id !== this.currentStation) {
			this.status = ''
			this.currentStation = id
			this.currentSongs = [this.defaultSong, this.defaultSong, this.defaultSong]
			this.setTitle()
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
				setNextSrc(true)

				this.timeoutID = setTimeout(() => {
					if (id !== this.currentStation) return
					if (this.savedSongs[id].length === 3) this.savedSongs[id].shift()
					this.setTitle(this.savedSongs[id][0].name)
					this.changeSongs.call(this, id)
					setTimeout(() => this.getSongs.call(this, id), 2000)
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

		const setNextSrc = (refreshInMemory = false) => {
			this.audio.pause()
			this.removeEventListeners()
			const saved = this.savedSongs[id][playingIndex]
			if (this.audio.src !== saved.link) {
				if (!saved.preloaded || saved.preloaded?.src !== saved.link) {
					delete saved.preloaded
					this.preloadSong(this.savedSongs[id], playingIndex)
					this.audio.src = saved.link
				} else if (!saved.preloading) {
					this.audio.src += ''
					this.audio = saved.preloaded
					this.audio.volume = this.volume

					if (refreshInMemory && saved.startTime - this.currentTime() > 3) {
						this.audio.muted = true
						this.audio
							.play()
							.then(() => {
								const onpause = (e) => {
									e.target.muted = false
									e.target.removeEventListener('pause', onpause)
									e.target.removeEventListener('timeupdate', ontimeupdate)
								}

								const ontimeupdate = (e) => {
									if (e.target.currentTime > 0.5) {
										e.target.pause()
										e.target.muted = false
										e.target.removeEventListener('timeupdate', ontimeupdate)
										e.target.currentTime = 0
									}
								}

								this.audio.addEventListener('pause', onpause)
								this.audio.addEventListener('timeupdate', ontimeupdate)
							})
							.catch(() => {})
					}
				} else this.audio.src = saved.link
			}
		}

		setNextSrc()

		if (playingIndex === 1) return

		this.audio.currentTime = Math.max(this.currentTime() - this.savedSongs[id][0].startTime, 0)
		if (this.audio.currentTime < 1.5) this.audio.currentTime = 0

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

		this.audio.ontimeupdate = (e) => {
			if (id !== this.currentStation) return

			let diff = this.audio.currentTime - this.savedSongs[id][0].duration
			if (diff >= 0 || this.audio.currentTime >= this.audio.duration) {
				this.audio.pause()
				this.removeEventListeners()
				return
			}

			const ideal = this.currentTime() - this.savedSongs[id][0].startTime
			diff = ideal - this.audio.currentTime
			if (diff > 1.5) {
				this.audio.currentTime = ideal
			}
		}
	}

	async changeSongOfTheDay() {
		const date = new Date()
		const timeOffset = date.getTimezoneOffset()
		const day = date.getDate()
		const song = await fetchFromAPI(`radio/song_of_the_day?time_offset=${timeOffset}`)
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
		const stations = await fetchFromAPI('radio/stations')
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
