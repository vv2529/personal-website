import css from './style.module.scss'

const TabNav = () => {
	return (
		<nav className={css['nav']}>
			<ul className={css['nav-ul']}>
				{['Music', 'Filters', 'Add new song', 'Edit radio stations'].map((caption, i) => (
					<>
						<input
							key={i * 2}
							className={`visually-hidden ${css['nav-radio']}`}
							type="radio"
							name="nav"
							id={`nav-radio-${i}`}
							defaultChecked={i === 0}
						/>
						<li key={i * 2 + 1} className={css['nav-li']}>
							<label className={css['nav-label']} htmlFor={`nav-radio-${i}`}>
								{caption}
							</label>
						</li>
					</>
				))}
			</ul>
		</nav>
	)
}

export default TabNav
