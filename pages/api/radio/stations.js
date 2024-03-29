import { connectToDB } from '../../../scripts/database'

let db

const getStations = async () => {
	const stations = (await db.execute(`SELECT id, name FROM stations ORDER BY id`))[0]
	return stations
}

export default async (req, res) => {
	db = connectToDB('radio')

	const stations = await getStations()

	db.end()

	res.status(200).json(stations.map(({ id, name }) => [id, name]))
}
