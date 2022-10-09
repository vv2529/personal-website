import { fetchFromAPI } from './functions'

export const transformSong = (song) => {
	const object = {
		id: song[0],
		name: song[1],
		linkId: song[2],
		link: song[2].includes('/')
			? song[2]
			: `https://drive.google.com/uc?export=download&id=${song[2]}`,
		originalId: song[3],
		originalSource: song[4],
		original:
			song[4] == 'NG'
				? `https://newgrounds.com/audio/listen/${song[3]}`
				: song[4] == 'YT'
				? `https://youtube.com/watch?v=${song[3]}`
				: song[3],
		duration: song[5],
		isSong: song[6],
		isHard: song[7],
	}

	if (object.isSong === undefined) delete object.isSong
	if (object.isHard === undefined) delete object.isHard

	return object
}

export const getPreloadedAudio = async (src, startTime = 0, originalAudio) => {
	const audio = originalAudio || new Audio()
	audio.preload = true
	audio.muted = true
	audio.src = src
	audio.currentTime = startTime

	try {
		await audio.play()
	} catch (e) {}

	const timeupdate = () => {
		if (audio.buffered.length === 0) return
		const edge = audio.buffered.end(audio.buffered.length - 1)
		if (edge - audio.currentTime > 1) {
			audio.currentTime = edge
		}

		// console.log(audio.currentTime, '/', edge)
	}

	audio.addEventListener('timeupdate', timeupdate)

	return new Promise((resolve, reject) => {
		const removeAll = () => {
			audio.removeEventListener('timeupdate', timeupdate)
			audio.removeEventListener('ended', ended)
			audio.removeEventListener('error', error)
			audio.removeEventListener('abort', abort)
		}

		const abort = (e) => {
			e.preventDefault()
			removeAll()
			reject('Audio preloading aborted')
		}

		const ended = () => {
			removeAll()
			audio.muted = false
			audio.currentTime = startTime
			resolve(audio)
		}

		const error = (e) => {
			e.preventDefault()
			removeAll()
			reject(e)
		}

		audio.addEventListener('ended', ended)
		audio.addEventListener('error', error)
		audio.addEventListener('abort', abort)
	})
}

export const getRandomSongs = async (n = 1, onlyNames = true) => {
	const response = await fetchFromAPI(`music/songs?random&n=${n}${onlyNames ? `&only_names` : ''}`)
	return onlyNames ? response : response.map(transformSong)
}
