export const transformSong = (song) => {
	return {
		id: song[0],
		name: song[1],
		linkId: song[2],
		link: song[2].includes('/') ? song[2] : `https://sharedby.blomp.com/${song[2]}`,
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
}
