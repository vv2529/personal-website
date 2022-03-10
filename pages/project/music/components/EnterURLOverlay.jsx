import useMusicModel from '../useMusicModel'
import css from '../style.module.scss'

const EnterURLOverlay = () => {
	const music = useMusicModel()

	return (
		<div className={css['overlay']}>
			<div className={css['overlay-center']}>
				<div className={css['overlay-caption']}>Enter sound URL:</div>
				<input
					className={css['overlay-input']}
					type="text"
					placeholder="http://..."
					value={music.customURL}
					onChange={(e) => (music.customURL = e.target.value)}
				/>
				<button
					className={`${css['btn-done']} ${css['overlay-btn']}`}
					onClick={() => {
						music.playCustomURL()
						music.overlayOpen = false
					}}
				>
					Play
				</button>
				<button
					className={`${css['btn-done']} ${css['overlay-btn']}`}
					onClick={() => {
						music.overlayOpen = false
					}}
				>
					Cancel
				</button>
			</div>
		</div>
	)
}

export default EnterURLOverlay
