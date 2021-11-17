import mysql from 'mysql2/promise'
import config from '../../../config.json'

let db

const getSongs = async () => {
	const songs = (await db.execute(`SELECT * FROM songs WHERE addedBy=0 ORDER BY id`))[0]
	return songs
}

export default async (req, res) => {
	db = mysql.createPool({
		...config.database,
		database: 'radio',
	})

	const songs = await getSongs()

	db.end()

	res
		.status(200)
		.json(
			songs.map((s) => [
				s.id,
				s.name,
				s.linkId,
				s.originalId,
				s.originalSource,
				s.duration,
				s.isHard,
				s.isSong,
			])
		)
}
