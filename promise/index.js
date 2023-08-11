function fn1() {
	return Promise.resolve().then(() => {
		console.log('fn1');
		throw new Error('fn1 error')
		// return Promise.reject('fn1 reject');
	})
}

function foo() {
	const fn1Result = fn1()
	fn1Result.then((res) => {
		console.log(res)
		console.log('foo')
	}).catch(err => {
		console.log(err)
		console.log('foo catch')
	})
}

function flattenFnArray(fns) {
	return fns.reduce((result, fn) => {
		return result.then((res) => {
			return fn
		})
	}, Promise.resolve())
}
const promises = [
	Promise.resolve(1),
	Promise.resolve(2),
	Promise.resolve(3)
]
flattenFnArray(promises).then((res) => {
	console.log(res)
})

function sayHello() {
	return Promise.resolve().then(() => {
		return sayWorld()
	})
}
function sayWorld() {
	return Promise.resolve().then(() => {
		return 'world0'
	})
}
sayHello().then((res) => {
	console.log(res)
})
