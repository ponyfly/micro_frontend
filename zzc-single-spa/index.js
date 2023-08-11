import {
	NOT_LOADED,
	NOT_BOOTSTRAPPED,
	NOT_MOUNTED,
	MOUNTED,
	LOADING_SOURCE_CODE,
	BOOTSTRAPPING,
	UNMOUNTING
} from './status.js'

const apps = []
export function registerApplication (appConfig) {
	apps.push(Object.assign({}, appConfig, {
		status: NOT_LOADED,
	}))
	reroute();
}

function reroute () {
	// 获取需要被加载的app
	const {
		appsToLoad,
		appsToMount,
		appsToUnmount,
		appsToUnload
	} = getAppChanges()
	if (isStarted()) {
		return performAppChanges()
	} else {
		return loadApps()
	}

	function loadApps () {
		appsToLoad.map(toLoad)
	}
	function performAppChanges () {
		console.log(appsToLoad, appsToMount, appsToUnmount, appsToUnload, '这是app的变化')
		const unMountPromsies = appsToUnmount.map(toUnmount)
		const unloadMountPromsies = Promise.all(unMountPromsies).then(apps => {
			return apps.map(toUnload)
		})
		const unloadPromises = appsToUnload.map(toUnload)
		const allUnloadPromises = unloadPromises.concat(unloadMountPromsies)
		Promise.all(allUnloadPromises).then(() => {
			appsToLoad.map(app => {
				return toLoad(app).then((app) => {
					tryToBoostrapAndMount(app)
				})
			})
			appsToMount.map(tryToBoostrapAndMount)
		})
	}
}
// 初始化 + 挂载app
async function tryToBoostrapAndMount (app) {
	if (app.status !== NOT_BOOTSTRAPPED) return app
	if (shouldBeActive(app)) {
		app.status = BOOTSTRAPPING
		await app.bootstrap(app.customProps)
		apps.status = NOT_MOUNTED
		if (shouldBeActive(app)) {
			await app.mount(app.customProps)
			app.status = MOUNTED
		}
	}
}
// 卸载app
async function toUnmount (app) {
	if (app.status !== MOUNTED) return app
	// 正在卸载
	app.status = UNMOUNTING
	await app.unmount(app.customProps)
	// 卸载完成
	app.status = NOT_MOUNTED
	return app
}
async function toUnload (app) {
	if (app.status !== NOT_MOUNTED) return app
	app.status = NOT_LOADED
	if (app.unload) {
		await app.unload(app.customProps)
	}
	return app
}
// 加载app
async function toLoad (app) {
	if (app.status !== NOT_LOADED) return
	app.status = LOADING_SOURCE_CODE
	const {bootstrap, mount, unmount, unload} = await app.app(app.customProps)
	console.log(childVue1, '这是load之后')
	app.status = NOT_BOOTSTRAPPED
	app.bootstrap = bootstrap
	app.mount = mount
	app.unmount = unmount
	app.unload = unload
	reroute()
	return app
}
function getAppChanges () {
	const appsToLoad = []
	const appsToMount = []
	const appsToUnmount = []
	const appsToUnload = []
	apps.forEach(app => {
		const appShouldBeActive = shouldBeActive(app)
		switch (app.status) {
			case NOT_LOADED:
				if (appShouldBeActive) {
					appsToLoad.push(app)
				}
				break
			case NOT_BOOTSTRAPPED:
			case NOT_MOUNTED:
					if (!appShouldBeActive) {
						appsToUnload.push(app)
					} else {
						appsToMount.push(app)
					}
				break
			case MOUNTED:
				if (!appShouldBeActive) {
					appsToUnmount.push(app)
				}
				break
		}
	})

	return {
		appsToLoad,
		appsToMount,
		appsToUnmount,
		appsToUnload
	}
}
let started = false
export function start () {
	started = true
	reroute()
}
function isStarted () {
	return started
}
// 应用是否需要激活
function shouldBeActive (app) {
	return app.activeWhen(window.location)
}

window.addEventListener('hashchange', reroute)
window.history.pushState = patchedUpdateState(window.history.pushState)
window.history.replaceState = patchedUpdateState(window.history.replaceState)
function patchedUpdateState (updateState) {
	return function (...args) {
		console.log('statechange')
		const urlBefore = window.location.href
		const result = Reflect.apply(updateState, this, args)
		const urlAfter = window.location.href
		if (urlBefore !== urlAfter) {
			// 重新加载应用
			reroute()
		}
		return result
	}
}
