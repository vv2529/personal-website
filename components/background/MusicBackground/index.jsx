import { rand } from '../../../scripts/functions'
import css from './style.module.scss'

const MusicBackground = ({ data }) => {
	if (!data.setup) setupBG(data)

	return (
		<div className={css['bg']}>
			{data.setup &&
				data.songs.map((song, i) => {
					const rest = {}
					if (i >= data.smallScreenLimit) rest['data-wide-screen-only'] = true

					return (
						<div key={song} className={css['bg-text']} style={data.styles[i]} {...rest}>
							{song}
						</div>
					)
				})}
		</div>
	)
}

const setupBG = (data) => {
	if (!data || !data.songs) return
	const n = data.songs.length
	const sizeMin = 1.25,
		sizeMax = 2.5,
		opacityMin = 0.2,
		opacityMax = 0.5
	const kSize = Math.pow(sizeMax / sizeMin, 1 / (n - 1))
	const kOpacity = Math.pow(opacityMax / opacityMin, 1 / (n - 1))
	let size = sizeMin,
		opacity = opacityMin

	data.styles = []
	const allX = Array(n)
		.fill(0)
		.map((_, i) => 100 * (i / (n - 1)))
	const allY = [...allX]
	data.smallScreenLimit = Math.ceil(n * 0.5)

	data.songs.forEach((_, i) => {
		const x = allX.splice(rand(allX.length), 1)[0]
		const y = allY.splice(rand(allY.length), 1)[0]

		data.styles.push({
			left: x + '%',
			top: y + '%',
			fontSize: size + 'em',
			color: `rgb(${Array(3)
				.fill(Math.round(255 * opacity))
				.join(',')})`,
		})

		size *= kSize ** 2
		opacity *= kOpacity ** 2

		if (size > sizeMax) {
			size -= sizeMax - sizeMin
			opacity -= opacityMax - opacityMin
		}
	})

	data.setup = true
}

export default MusicBackground
