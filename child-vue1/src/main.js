import Vue from 'vue'
import App from './App.vue'
import router from './router'
import singleSpa from './libs/single-spa-vue';

Vue.config.productionTip = false

const appOptions = {
	el: '#microApp', // 挂载到父应用中的id为microApp的标签中
	router,
	render: h => h(App)
}
const vueLifeCycle = singleSpa({
	Vue,
	appOptions
})

// 如果是父应用引用我，就会有这个属性
if(window.singleSpaNavigate){
	__webpack_public_path__ = 'http://localhost:4001/'
}
// 如果不是父应用引用我
if(!window.singleSpaNavigate){
	delete appOptions.el;
	new Vue(appOptions).$mount('#app');
}

// 协议接入：我订好了协议，父应用会调用这些方法

export function bootstrap (props) {
	console.log('app1 bootstrap')
	return vueLifeCycle.bootstrap(() => {})
}

export function mount (props) {
	console.log('app1 mount')
	return vueLifeCycle.mount(() => {})
}

export function unmount (props) {
	console.log('app1 unmount')
	return vueLifeCycle.unmount(() => {})
}
window.childVue1 = {
	name: '自定义内容1'
}


// 我们需要父应用加载子应用，将子应用加载成一个个的lib给父应用使用
// 子应用需要导出 bootstrap mount unmount
// single-spa single-spa-vue single-spa-react
