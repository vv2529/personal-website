export const rand = (a) => Math.floor(Math.random() * a)

export const randomShuffle = (a) => {
	a = [...a]
	const b = []
	for (let i = a.length; i > 0; i--) b.push(a.splice(rand(i), 1)[0])
	return b
}

export const fetchFromAPI = async (path) => {
	try {
		const response = await fetch(`/api/${path}`)
		return await response.json()
	} catch (e) {}
}
