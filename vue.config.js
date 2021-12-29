const path = require('path')
// const webpack = require('webpack')

function resolve(dir) {
  return path.join(__dirname, dir)
}
module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        '@': resolve('src'),
        '_c': resolve('src/components')
      }
    }
  },
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        productName: 'sumvideo-client',
        publish: [
          {
            provider: "generic",
            url: ""
          }
        ],
        nsis:{
          oneClick: false,
          perMachine: true,
          allowElevation: true,
          allowToChangeInstallationDirectory: true,
          createDesktopShortcut: true,
          createStartMenuShortcut: true,
          deleteAppDataOnUninstall: true,
          artifactName: '${productName}-${version}.${ext}',
          include: 'installer.nsh',
          installerIcon: "./public/icon.ico", // 安装图标
          uninstallerIcon: "./public/icon.ico", //卸载图标
          installerHeaderIcon: "./public/icon.ico", // 安装时头部图标
        },
        protocols: [{
          name: 'sumvideo-client',
          schemes: ['sumvideo-client']
        }],
      },
      win:{
        icon: "./public/icon.ico",
        target: [{ target: 'nsis', arch: ['ia32', 'x64'] }]
      },
      mac: {
        icon: './public/icon.icns'
      }
    }
  }
}
