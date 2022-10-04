import { randomShuffle } from '../../../scripts/functions'
import { connectToDB } from '../../../scripts/database'

let db

const getSongs = async (n, isRandom) => {
	const songs = (await db.execute(`SELECT * FROM songs${isRandom ? '' : ' ORDER BY id'}`))[0]
	const res = isRandom ? randomShuffle(songs) : songs
	return n ? res.slice(0, n) : res
}

export default async (req, res) => {
	db = connectToDB('radio')
	const songs = await getSongs(req.query.n, 'random' in req.query)
	db.end()
	const map =
		'only_names' in req.query
			? (s) => s.name
			: (s) => {
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
			  }

	res.status(200).json(songs.map(map))
}
