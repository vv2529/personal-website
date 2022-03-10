import { useContext, useEffect, useState } from 'react'

const useModel = (context, Model, hookKeys = []) => {
	const state = useContext(context)
	const firstTime = Object.keys(state.app).length === 0
	const app = firstTime ? new Model(state) : state.app

	const _refresh = useState(0)[1]

	if (firstTime) {
		const refresh = () => _refresh(Math.random())
		app.setHooks(hookKeys, refresh)
	}

	/* useEffect(() => {
		console.log('Component updated')
	}) */

	return app
}

export default useModel
