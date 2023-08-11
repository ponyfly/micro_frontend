module.exports = {
	lintOnSave: false,
	publicPath: '//localhost:4001',
  transpileDependencies: true,
	configureWebpack: {
		output: {
			library: 'singleChildVue1',
			libraryTarget: 'umd'
		},
	},
	devServer: {
		port: 4001
	}
}
