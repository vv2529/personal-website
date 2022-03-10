export default class Context {
	constructor({ lets, internalLets, consts }) {
		Object.assign(this, {
			lets: lets || {},
			internalLets: internalLets || {},
			consts: consts || {},
			app: {},
		})
	}
}
