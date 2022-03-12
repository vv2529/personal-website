import css from '../style.module.scss'

const AddSong = () => {
	return (
		<div className={css['page-section']}>
			<div className={`${css['offset-group']} ${css['inline-group']}`}>
				<div>Song title:</div>
				<input type="text" placeholder="Author - Song" className={css['stretch']} />
			</div>
			<fieldset className={css['spaced-fieldset']}>
				<legend>Link to the audio file</legend>
				<div className={css['inline-group']}>
					<div>Select file source:</div>
					<select className={css['stretch']}>
						<option>Google Drive</option>
						<option>Other</option>
					</select>
				</div>
				<input
					type="text"
					placeholder={true ? 'ID on Google Drive' : 'Full link'}
					className={css['single-stretch']}
				/>
			</fieldset>
			<fieldset className={css['spaced-fieldset']}>
				<legend>Link to original</legend>
				<div className={css['inline-group']}>
					<div>Select source:</div>
					<select className={css['stretch']}>
						<option>Youtube</option>
						<option>Newgrounds</option>
						<option>Other</option>
					</select>
				</div>
				<input
					type="text"
					placeholder={true ? 'Audio ID on Newgrounds' : true ? 'Video ID on Youtube' : 'Full link'}
					className={css['single-stretch']}
				/>
			</fieldset>
			<div className={`${css['offset-group']} ${css['inline-group']}`}>
				Duration:
				<div className={css['stretch']}>
					<input type="number" min="0" />:
					<input type="number" min="0" />
				</div>
			</div>
			<button className={css['btn-done']}>Done</button>
		</div>
	)
}

export default AddSong
