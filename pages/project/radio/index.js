import PageContainer from '../../../components/PageContainer'
import { FaExternalLinkAlt } from 'react-icons/fa'
import css from './style.module.scss'

const StationOptions = () => {
	let official = (
		<>
			<option selected className={css['station-option']}>
				&#8212;
			</option>
			<option className={css['station-option']}>Main</option>
		</>
	)
	let signedIn = false
	return signedIn ? <optgroup label="Official stations">{official}</optgroup> : <>{official}</>
}

export default function RadioProject() {
	return (
		<PageContainer title="Radio" className={css['page-container']}>
			<div className={css['inner-container']}>
				<div className={css['main-block']}>
					<h1 className={css['main-title']}>Radio</h1>
					<div className={css['main-section']}>
						<div className={css['section-caption']}>Select station:</div>
						<select className={css['station-select']}>
							<StationOptions />
						</select>
					</div>
					<div className={css['main-section']}>
						<div className={css['section-caption']}>Now playing:</div>
						<div className={css['section-content']}>
							<div className={css['section-name']}>Name 1</div>
							<div className={css['section-extra']}>
								<a href="http://vv2529.ucoz.ua" target="_blank">
									Original <FaExternalLinkAlt className={css['section-extra-icon']} />
								</a>
							</div>
						</div>
					</div>
					<div className={css['main-section']}>
						<div className={css['section-caption']}>Next:</div>
						<div className={css['section-content']}>
							<div className={css['section-name']}>Name 2</div>
						</div>
					</div>
					<div className={css['main-section']}>
						<div className={css['section-caption']}>Song of the day:</div>
						<div className={css['section-content']}>
							<div className={css['section-name']}>Name 3</div>
						</div>
					</div>
				</div>
				<div className={css['options-block']}>
					<div className={css['main-section']}>
						<div>Volume: 100%</div>
						<input className={css['slider']} type="range" min="0" max="1" step="any" />
					</div>
				</div>
				<div hidden className={css['loading-spinner']}></div>
			</div>
		</PageContainer>
	)
}
