const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:8899',
        changeOrigin: true,
        ws: true,
        logLevel: 'debug'
      }
    }
  }
})
