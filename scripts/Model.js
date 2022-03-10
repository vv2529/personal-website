export default class Model {
	hooks = {}

	constructor(state) {
		state.app = this

		const doNothing = () => {}

		Object.keys(state.lets).forEach((key) => {
			this.hooks[key] = doNothing

			Object.defineProperty(this, key, {
				get() {
					return state.lets[key]
				},
				set(newValue) {
					if (state.lets[key] === newValue) return
					state.lets[key] = newValue
					this.hooks[key]()
				},
			})
		})

		Object.keys(state.internalLets).forEach((key) => {
			Object.defineProperty(this, key, {
				get() {
					return state.internalLets[key]
				},
				set(newValue) {
					state.internalLets[key] = newValue
				},
			})
		})

		Object.keys(state.consts).forEach((key) => {
			Object.defineProperty(this, key, {
				get() {
					return state.consts[key]
				},
			})
		})
	}

	setHooks(keys, hook) {
		keys.forEach((key) => {
			this.hooks[key] = hook
		})
	}
}
