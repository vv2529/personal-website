import useMusicModel from '../../models/music/useMusicModel'
import css from '../../scss/music.module.scss'

const TabNav = () => {
	const music = useMusicModel()

	return (
		<nav className={css['nav']}>
			<ul className={css['nav-ul']}>
				{['Music', 'Filters'].map((caption, i) => {
					return (
						<div key={caption} className={css['nav-block']}>
							<input
								className={`visually-hidden ${css['nav-radio']}`}
								type="radio"
								name="nav"
								id={`nav-radio-${i}`}
								checked={i === music.tab}
								onChange={() => (music.tab = i)}
							/>
							<li className={css['nav-li']}>
								<label className={css['nav-label']} htmlFor={`nav-radio-${i}`}>
									{caption}
								</label>
							</li>
						</div>
					)
				})}
			</ul>
		</nav>
	)
}

export default TabNav
