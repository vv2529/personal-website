import mysql from 'mysql2/promise'

let db

const getSongs = async () => {
	const songs = (await db.execute(`SELECT * FROM songs WHERE addedBy=0 ORDER BY id`))[0]
	return songs
}

export default async (req, res) => {
	db = mysql.createPool({
		host: process.env.DB_HOST,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: 'radio',
	})

	const songs = await getSongs()

	db.end()

	res.status(200).json(
		songs.map((s) => {
			let a = [
				s.id,
				s.name,
				s.linkId,
				s.originalId,
				s.originalSource,
				s.duration,
				s.isSong || 0,
				s.isHard,
			]
			if (!a[a.length - 1]) a.pop()
			if (!a[a.length - 1]) a.pop()
			return a
		})
	)
}
