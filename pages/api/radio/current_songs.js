import mysql from 'mysql2/promise'
import config from '../../../config.json'

let db

const songInterval = 4

const rand = (a) => Math.floor(Math.random() * a)

const randomShuffle = (a) => {
	const b = []
	for (let i = a.length; i > 0; i--) b.push(a.splice(rand(i), 1)[0])
	return b
}

const newPlaylist = (s, exclude = []) => {
	const n = Object.keys(s.songs).length
	const IDs = Object.keys(s.songs)
		.map((id) => +id)
		.filter((id) => !exclude.includes(id))
	const playlist = exclude.concat(randomShuffle(IDs)).slice(0, 100)
	if (playlist.length === 1) playlist.push(playlist[0])
	if (playlist.length === 2) playlist.push(...playlist)
	if (playlist.length === 3) playlist.push(playlist[3 - n])
	// console.log('IDs:', IDs, playlist)
	return playlist
}

const getStationSongs = (s, songs) => {
	const array = songs.filter((song) =>
		s.id == 1
			? true
			: s.id == 2
			? song.originalSource === 'NG'
			: s.id == 3
			? song.isSong === 1
			: s.id == 4
			? !song.isSong
			: s.id == 5
			? song.isHard
			: true
	)
	return Object.fromEntries(array.map((song) => [song.id, song]))
}

const getUpdateIndex = (s) => {
	const n = Object.keys(s.songs).length
	return s.playlist.length - Math.max(Math.min(Math.round(n / 3) + 1, 50), 3)
}

const getSongs = async (stationId, latest) => {
	const sql = `SELECT * FROM stations WHERE id=? AND createdBy=?`
	const s = (await db.execute(sql, [stationId, 0]))[0][0] || (await db.execute(sql, [1, 0]))[0][0]

	const songsFull = (await db.execute(`SELECT * FROM songs`))[0]

	s.playlist = s.playlist.split(',').map((id) => +id)
	s.songs = getStationSongs(s, songsFull)

	let response
	const currentTime = Math.floor(Date.now() / 1000)

	if (currentTime >= s.updateTime) {
		// console.log('Update:', currentTime, s.playlist)
		const exclude = currentTime >= s.endTime ? [] : s.playlist.slice(getUpdateIndex(s) + 1)

		s.playlist = newPlaylist(s, exclude)
		s.startTime = exclude.length
			? s.updateTime
			: currentTime - rand(s.songs[s.playlist[0]].duration + songInterval)
		s.endTime = s.startTime
		s.updateTime = 0
		s.playlist
			.map((id) => s.songs[id])
			.forEach((song, i) => {
				s.endTime += song.duration + songInterval
				if (i === getUpdateIndex(s)) s.updateTime = s.endTime
			})
		if (!s.updateTime) s.updateTime = s.endTime
		await db.execute(
			`UPDATE stations SET
				playlist=?,
				startTime=?,
				updateTime=?,
				endTime=?
				WHERE id=? AND createdBy=0`,
			[s.playlist.join(), s.startTime, s.updateTime, s.endTime, stationId]
		)
	} else {
		// console.log('No update:', currentTime, s.playlist)
	}

	let time = s.startTime
	const i = s.playlist
		.map((id) => s.songs[id])
		.findIndex((song) => {
			const nextTime = time + song.duration + songInterval
			if (nextTime > currentTime) return true
			time = nextTime
			return false
		})
	response = s.playlist.slice(i, i + 3).map((id) => s.songs[id])
	response[0].elapsed = currentTime - time

	return response.slice(response.findIndex((id) => id === latest) + 1)
}

export default async (req, res) => {
	// const startTime = Date.now()
	const station = +(req.query.station || 1)
	const latest = +(req.query.latest || 0)

	db = mysql.createPool({
		...config.database,
		database: 'radio',
		connectionLimit: Infinity,
		queueLimit: Infinity,
	})

	const songs = (await getSongs(station, latest)).map((song) => {
		delete song.isHard
		delete song.isSong
		delete song.addedBy
		return Object.values(song)
	})

	db.end()

	// const endTime = Date.now()
	// const diff = (endTime - startTime) / 1000
	// console.log('Server:', endTime / 1000, '-', startTime / 1000, '=', diff)

	res.status(200).json(songs)
}
