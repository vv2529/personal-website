import mysql from 'mysql2/promise'
import config from '../../../config.json'

let db

const getStations = async () => {
	const stations = (
		await db.execute(`SELECT id, name FROM stations WHERE createdBy=0 ORDER BY id`)
	)[0]
	return stations
}

export default async (req, res) => {
	db = mysql.createPool({
		...config.database,
		database: 'radio',
	})

	const stations = await getStations()

	db.end()

	res.status(200).json(stations.map(({ id, name }) => [id, name]))
}
