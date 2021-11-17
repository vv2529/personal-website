import css from './style.module.scss'

const EditStations = ({ stations = [], className = [] }) => {
	return (
		<div className={[css['page-section']].concat(className).join(' ')}>
			<div className={`${css['offset-group']} ${css['inline-group']}`}>
				<div>Select station to edit:</div>
				<select className={css['stretch']}>
					<option>—</option>
					<option className={css['italic-option']}>Create new</option>
					{stations.map((station) => (
						<option key={station.name}>{station.name}</option>
					))}
				</select>
			</div>
			{true ? (
				<>
					<input
						type="text"
						placeholder="Enter station name"
						disabled={false}
						className={css['single-stretch']}
					/>
					<div className={css['single-stretch']}>
						<p>Go to the music tab and check the songs you choose for this radio station.</p>
					</div>
					<button className={css['btn-done']}>Done</button>
				</>
			) : (
				''
			)}
		</div>
	)
}

export default EditStations
