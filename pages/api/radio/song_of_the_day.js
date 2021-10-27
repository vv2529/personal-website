import mysql from 'mysql2/promise'
import config from '../../../config.json'

let db

const getRandomSong = async () => {
	const songs = (await db.execute(`SELECT id, name FROM songs WHERE addedBy=0`))[0]
	return songs[Math.floor(Math.random() * songs.length)]
}

const getSong = async (timeOffset) => {
	const date = new Date()
	const minutes = date.getUTCHours() * 60 + date.getUTCMinutes()
	const userHours = (minutes - timeOffset) / 60
	const dayOffset = Math.min(Math.max(Math.floor(userHours / 24), -1), 1)

	const msInDay = 24 * 60 * 60 * 1000
	const queryDate = new Date(Date.now() + msInDay * dayOffset)
	const [y, m, d] = [queryDate.getUTCFullYear(), queryDate.getUTCMonth(), queryDate.getUTCDate()]
	let song = (
		await db.execute(
			`SELECT id, name
			FROM song_of_the_day
			WHERE year=? AND month=? AND day=?`,
			[y, m, d]
		)
	)[0][0]
	if (!song) song = await setSong(y, m, d)
	return song
}

const setSong = async (y, m, d) => {
	try {
		const song = await getRandomSong()
		await db.execute(`INSERT INTO song_of_the_day VALUES (?,?,?,?,?)`, [
			y,
			m,
			d,
			song.id,
			song.name,
		])
		return song
	} catch (e) {}
}

export default async (req, res) => {
	const timeOffset = +req.query.time_offset || 0

	db = mysql.createPool({
		...config.database,
		database: 'radio',
	})

	const song = await getSong(timeOffset)

	db.end()

	res.status(200).json(song)
}
