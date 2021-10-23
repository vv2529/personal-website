const getSongs = async () => {
	return {
		yesterday: { id: 4, name: 'Yesterday' },
		today: { id: 5, name: 'Today' },
		tomorrow: { id: 6, name: 'Tomorrow' },
	}
}

const updateSongs = async () => {
	// ...
}

export default async (req, res) => {
	const songs = await getSongs()
	const timeOffset = +req.query.time_offset || 0
	const date = new Date()
	const minutes = date.getUTCHours() * 60 + date.getUTCMinutes()
	const userHours = (minutes - timeOffset) / 60

	const song = userHours < 0 ? songs.yesterday : userHours > 24 ? songs.tomorrow : songs.today

	res.status(200).json(song)
}
