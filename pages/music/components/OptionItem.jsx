import useMusicModel from '../useMusicModel'
import { ImCheckmark, ImCheckmark2 } from 'react-icons/im'
import css from '../style.module.scss'

const OptionItem = ({ caption = '', onClick = () => {}, optionName, index }) => {
	const music = useMusicModel()

	return (
		<li className={css['song-options-item']}>
			{optionName ? (
				<>
					<button className={css['song-options-item-inner']}>
						<label
							className={css['song-options-item-inner-label']}
							htmlFor={`song-option-${index}`}
						>
							<div className={css['song-options-item-caption']}>{caption}</div>
							<input
								className={`visually-hidden ${css['song-options-item-checkbox']}`}
								type="checkbox"
								id={`song-option-${index}`}
								checked={music.options[optionName]}
								onChange={(e) => {
									music.changeOptions({ ...music.options, [optionName]: e.target.checked })
									onClick()
								}}
							/>
							<ImCheckmark className={css['song-options-checkmark']} />
						</label>
					</button>
				</>
			) : (
				<button className={css['song-options-item-inner']} onClick={onClick}>
					{caption}
				</button>
			)}
		</li>
	)
}

export default OptionItem
