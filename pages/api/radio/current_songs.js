const getSongs = async (station, latest) => {
	const songs = [
		[1, `Station ${station} playing`, 'LinkID-1', 'http://newgrounds.com', '-', 65, 10],
		[2, `Station ${station} next`, 'LinkID-2', '623104', 'NG', 90],
		[3, `Station ${station} after next`, 'LinkID-3', '_EshTvppW8U', 'YT', 99],
	]
	return songs.slice(songs.findIndex((song) => song[0] === latest) + 1)
}

export default async (req, res) => {
	const startTime = Date.now()
	const station = +req.query.station
	const latest = +req.query.latest
	const songs = await getSongs(station, latest)

	const endTime = Date.now()
	const diff = (endTime - startTime) / 1000
	// console.log('Server:', endTime / 1000, '-', startTime / 1000, '=', diff)

	res.status(200).json(songs)
}
