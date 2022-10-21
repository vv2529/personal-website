import { useContext, useState } from 'react'

const alreadySet = {}

const useModel = (context, Model, hookKeys = []) => {
	const state = useContext(context)
	const firstTime = Object.keys(state.app).length === 0
	const app = firstTime ? new Model(state) : state.app

	const _refresh = useState(0)[1]

	if (hookKeys[0]) {
		// use first hook key to identify the component
		if (!alreadySet[hookKeys[0]]) alreadySet[hookKeys[0]] = 0
		// 1 pass is not enough to ensure hooks are set, haven't looked into why yet
		if (alreadySet[hookKeys[0]] < 2) {
			const refresh = () => _refresh(Math.random())
			app.setHooks(hookKeys, refresh)
			alreadySet[hookKeys[0]]++
		}
	}

	return app
}

export default useModel
