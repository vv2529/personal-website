import mysql from 'mysql2/promise'

let db

const getStations = async () => {
	const stations = (
		await db.execute(`SELECT id, name FROM stations WHERE createdBy=0 ORDER BY id`)
	)[0]
	return stations
}

export default async (req, res) => {
	db = mysql.createPool({
		host: process.env.DB_HOST,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: 'radio',
	})

	const stations = await getStations()

	db.end()

	res.status(200).json(stations.map(({ id, name }) => [id, name]))
}
