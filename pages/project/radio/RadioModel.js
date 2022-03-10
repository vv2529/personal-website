import Model from '../../../scripts/Model'
import { transformSong } from '../../../scripts/music'

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
					time += obj.duration + this.songInterval
					return obj
				})

				this.savedSongs[stationId] = songs
			}

			for (let i = 0; i < 3; i++) if (!songs[i]) songs[i] = this.defaultSong
		}

		return songs
	}

	async changeCurrentStation(id = this.currentStation) {
		this.audio.pause()
		if (id !== this.currentStation) {
			this.status = ''
			this.currentStation = id
			this.currentSongs = [this.defaultSong, this.defaultSong, this.defaultSong]
			this.selectForbidden = true
			clearTimeout(this.timeoutID)
			clearTimeout(this.errorTimeout)
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
		clearTimeout(this.errorTimeout)
		this.audio.pause()

		const timeout = (time) => {
			clearTimeout(this.timeoutID)

			this.timeoutID = setTimeout(() => {
				if (id !== this.currentStation) return
				if (this.savedSongs[id].length === 3) this.savedSongs[id].shift()
				this.changeSongs(id)
				setTimeout(() => this.getSongs.call(this, id), 1000)
			}, time * 1000)
		}

		const untilNext = this.savedSongs[id][1].startTime - this.currentTime()
		timeout(untilNext)
		if (untilNext <= this.songInterval + 1) {
			this.status = ''
			this.selectForbidden = false
			if (this.audio.src !== this.savedSongs[id][1].link)
				this.audio.src = this.savedSongs[id][1].link
			return
		}
		if (this.audio.src !== this.savedSongs[id][0].link) {
			this.audio.src = this.savedSongs[id][0].link
		}

		let cb = () => {
			this.audio.currentTime = Math.max(this.currentTime() - this.savedSongs[id][0].startTime, 0)
			if (this.audio.currentTime < 1) this.audio.currentTime = 0
		}
		this.audio.readyState > 0 ? cb() : (this.audio.onloadedmetadata = cb)

		cb = () => {
			if (
				this.audio.currentTime < this.savedSongs[id][0].duration &&
				id === this.currentStation &&
				this.userClicked
			)
				this.audio.play()
		}
		this.audio.readyState > 2 ? cb() : (this.audio.oncanplay = cb)

		this.audio.onplaying = () => {
			if (this.audio.currentTime >= this.savedSongs[id][0].duration) {
				this.audio.pause()
				return
			}
			const ideal = this.currentTime() - this.savedSongs[id][0].startTime
			// console.log('Ideal:', ideal, 'Real:', this.audio.currentTime)
			const diff = ideal - this.audio.currentTime
			if (diff > 1) this.audio.currentTime = ideal
		}

		this.audio.onerror = () => {
			if (id === this.currentStation) {
				this.status = 'error'
				// console.log('Error:', this.audio.currentTime, this.audio)
				this.audio.src += ''
			}
		}

		const checkStatus = () => {
			if (id === this.currentStation) {
				if (this.audio.currentTime > 1 && this.audio.readyState < 3 && this.status !== 'loading')
					this.status = 'loading'
				if (this.audio.readyState > 2 && this.status !== '') this.status = ''
			}
		}

		checkStatus()

		this.audio.ontimeupdate = () => {
			checkStatus()
			const diff = this.audio.currentTime - this.savedSongs[id][0].duration
			if (diff >= 0) {
				this.audio.pause()
				if (this.audio.src !== this.savedSongs[id][1].link)
					this.audio.src = this.savedSongs[id][1].link
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

		this.setupComplete = true
	}
}
