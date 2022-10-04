import mysql from 'mysql2/promise'

export const connectToDB = (db) =>
	mysql.createPool({
		host: process.env.DB_HOST,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: db,
	})
