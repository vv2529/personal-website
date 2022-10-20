import useMusicModel from '../../models/music/useMusicModel'
import css from '../../scss/music.module.scss'

const Fieldset = ({ legend, labels = [], name, ...rest }) => {
	const music = useMusicModel()

	return (
		<fieldset className={css['spaced-fieldset']}>
			{legend ? <legend>{legend}</legend> : ''}
			{labels.map((label, i) => (
				<label key={label} className={css['block-label']}>
					<input
						className={css['spaced-input']}
						{...rest}
						checked={music.filters[name][i]}
						onChange={(e) => {
							music.filters[name][i] = e.target.checked
							music.changeFilters({ ...music.filters })
						}}
					/>
					{label}
				</label>
			))}
		</fieldset>
	)
}

const Checkbox = ({ label, ...rest }) => {
	return (
		<label className={css['block-label']}>
			<input type="checkbox" className={css['spaced-input']} {...rest} />
			{label}
		</label>
	)
}

export { Fieldset, Checkbox }
