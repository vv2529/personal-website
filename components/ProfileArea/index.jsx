import { useState } from 'react'
import { signIn, signOut } from 'next-auth/react'
import Link from 'next/link'
import css from './style.module.scss'

const profile = {
	id: 'abcd',
	name: 'Big Bill Brin Fred BARBARA - SMIT BB? or not?..',
}

const changeName = async (newName) => {
	const processed = newName
		.trim()
		.replace(/\s/g, ' ')
		.replace(/[^A-Za-z0-9- ]/g, '')
		.replace(/ {2,}/g, ' ')
		.replace(/-{2,}/g, '-')
	if (processed.length <= 2 || processed.length > 30) return [processed, false]
	// await "save it to the database"
	profile.name = processed
	return [processed, newName === processed]
}

const LoggedInArea = ({ setNameChangeOpen }) => {
	return (
		<>
			<div className={css['profile-name']}>{profile.name}</div>
			<div className={css['profile-btn-row']}>
				<button className={css['profile-btn']} onClick={() => setNameChangeOpen(true)}>
					Change name
				</button>
				<button className={css['profile-btn']}>Log out</button>
			</div>
		</>
	)
}

const LoggedOutArea = ({ setProfileAreaOpen }) => {
	return (
		<>
			<div className={css['profile-btn-row']}>
				<button className={`${css['profile-btn']} ${css['full']}`}>Sign in with Google</button>
			</div>
			<Link href="/sign-in">
				<a className={css['profile-link']} onClick={() => setProfileAreaOpen(false)}>
					Learn what data is collected and why
				</a>
			</Link>
		</>
	)
}

const NameChangeArea = ({ setNameChangeOpen }) => {
	const [newName, setNewName] = useState('')

	return (
		<>
			<input
				type="text"
				className={css['profile-name-input']}
				placeholder="Enter new name"
				value={newName}
				onChange={(e) => setNewName(e.target.value)}
			/>
			<div className={css['profile-btn-row']}>
				<button className={css['profile-btn']} onClick={() => setNameChangeOpen(false)}>
					Cancel
				</button>
				<button
					className={css['profile-btn']}
					onClick={async () => {
						const [processed, ok] = await changeName(newName)
						if (ok) setNameChangeOpen(false)
						if (newName !== processed) setNewName(processed)
					}}
				>
					OK
				</button>
			</div>
		</>
	)
}

const ProfileArea = ({ session, setProfileAreaOpen }) => {
	const [nameChangeOpen, setNameChangeOpen] = useState(false)

	return (
		<div
			className={css['profile']}
			onClick={(e) => {
				e.stopPropagation()
			}}
		>
			{nameChangeOpen ? (
				<NameChangeArea setNameChangeOpen={setNameChangeOpen} />
			) : session ? (
				<LoggedInArea setNameChangeOpen={setNameChangeOpen} />
			) : (
				<LoggedOutArea setProfileAreaOpen={setProfileAreaOpen} />
			)}
		</div>
	)
}

export default ProfileArea
