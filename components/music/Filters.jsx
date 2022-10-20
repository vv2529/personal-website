import useMusicModel from '../../models/music/useMusicModel'
import css from '../../scss/music.module.scss'
import { Fieldset, Checkbox } from './FormElements'

const Filters = () => {
	const music = useMusicModel()

	return (
		<div className={css['page-section']}>
			<div className={css['offset-group']}>
				<Checkbox label="Favorite" />
				<Checkbox
					label="Hard"
					checked={music.filters.hard}
					onChange={(e) => music.changeFilters({ ...music.filters, hard: e.target.checked })}
				/>
			</div>
			<Fieldset
				legend="Lyrics"
				name="lyrics"
				labels={['Has lyrics', 'Has words', 'Has none']}
				type="checkbox"
			/>
			<Fieldset
				legend="Original source"
				name="original"
				labels={['Newgrounds', 'Youtube', 'No source', 'Other']}
				type="checkbox"
			/>
			<fieldset className={css['spaced-fieldset']}>
				<legend>Approximate duration range</legend>
				<label className={css['block-label']}>
					<div>From {music.numberToTime(music.filters.duration.min)}</div>
					<input
						type="range"
						step="1"
						min={music.filters.duration.totalMin}
						max={music.filters.duration.totalMax}
						value={music.filters.duration.min}
						onChange={(e) => {
							music.filters.duration.min = Math.min(e.target.value, music.filters.duration.max)
							music.changeFilters({ ...music.filters })
						}}
					/>
				</label>
				<label className={css['block-label']}>
					<div>To {music.numberToTime(music.filters.duration.max)}</div>
					<input
						type="range"
						min={music.filters.duration.totalMin}
						max={music.filters.duration.totalMax}
						value={music.filters.duration.max}
						onChange={(e) => {
							music.filters.duration.max = Math.max(e.target.value, music.filters.duration.min)
							music.changeFilters({ ...music.filters })
						}}
					/>
				</label>
			</fieldset>
		</div>
	)
}

export default Filters
