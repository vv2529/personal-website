import css from './style.module.scss'

const Fieldset = ({ legend, name, labels = [], type }) => {
	return (
		<fieldset className={css['spaced-fieldset']}>
			{legend ? <legend>{legend}</legend> : ''}
			{labels.map((label) => (
				<label key={label} className={css['block-label']}>
					<input type={type} name={name} className={css['spaced-input']} />
					{label}
				</label>
			))}
		</fieldset>
	)
}

const Checkbox = ({ label }) => {
	return (
		<label className={css['block-label']}>
			<input type="checkbox" className={css['spaced-input']} />
			{label}
		</label>
	)
}

const Filters = ({ className = [] }) => {
	return (
		<div className={[css['page-section']].concat(className).join(' ')}>
			<div className={css['offset-group']}>
				<Checkbox label="Favorite" />
				<Checkbox label="Hard" />
			</div>
			<Fieldset
				legend="Lyrics"
				name="lyrics"
				labels={['Has lyrics', 'Has words', 'Has none']}
				type="checkbox"
			/>
			<Fieldset
				legend="Original source"
				name="source"
				labels={['Newgrounds', 'Youtube', 'No source', 'Other']}
				type="checkbox"
			/>
			<fieldset className={css['spaced-fieldset']}>
				<legend>Approximate duration range</legend>
				<label className={css['block-label']}>
					<div>From 0:55</div>
					<input type="range" min="55" max="420" step="1" />
				</label>
				<label className={css['block-label']}>
					<div>To 7:00</div>
					<input type="range" min="55" max="420" step="1" />
				</label>
			</fieldset>
		</div>
	)
}

export default Filters
