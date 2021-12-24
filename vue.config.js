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
          include: 'installer.nsh'
        },
        protocols: [{
          name: 'sumvideo-client',
          schemes: ['sumvideo-client']
        }],
      },
      win:{
        target: [{ target: 'nsis', arch: ['ia32', 'x64'] }]
      },
      
      
    }
  }
}
