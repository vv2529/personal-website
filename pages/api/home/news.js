import { connectToDB } from '../../../scripts/database'

let db

const getNews = async () => {
	const news = (await db.execute(`SELECT date, text FROM news ORDER BY id DESC`))[0]
	return news
}

export default async (req, res) => {
	db = connectToDB('home')

	const news = await getNews()

	db.end()

	res.status(200).json(news)
}
