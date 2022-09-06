import mysql from 'mysql2/promise'

export const connectToDB = (db) =>
	mysql.createPool({
		host: process.env.DB_HOST,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: db,
	})

export const rand = (a) => Math.floor(Math.random() * a)

export const randomShuffle = (a) => {
	const b = []
	for (let i = a.length; i > 0; i--) b.push(a.splice(rand(i), 1)[0])
	return b
}
