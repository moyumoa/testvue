'use strict'

import { app, protocol, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import Store from "electron-store";
Store.initRenderer()
// 更新
import { handleUpdate } from './libs/updater.js';
import { scaleWindow } from './libs/ipcMain';

const isDevelopment = process.env.NODE_ENV !== 'production'
const baseUrl = process.env.VUE_APP_BASE_API

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])
let mainWindow
// const fs = require('fs')
async function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    // width: 440,
    // height: 460,
    width: 880,
    height: 920,
    resizable: false,
    frame: false,
    webPreferences: {
      
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: true,
      webSecurity: false,
      enableRemoteModule: true,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
    }
  })
  //解决10.X版本跨域不成功问题(上线删除)
  app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');
  //去掉顶部菜单
  if (process.platform === 'win32'){
    mainWindow.setMenu(null);  
    //  自定义菜单
    scaleWindow(ipcMain,mainWindow)
  }
  // 自动更新事件
  await handleUpdate(mainWindow)

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) mainWindow.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    mainWindow.loadURL('app://./index.html')
  }
  // 主进程中
  
  // 监听渲染进程发出的download事件
  let saveUrl = null
  let size = null
  ipcMain.on('download', (evt, args) => {
    // 打开系统弹窗 选择文件下载位置
    dialog.showOpenDialog({
      properties: ['openFile', 'openDirectory']
    }).then(file => {
      saveUrl = file.filePaths[0];  // 保存文件路径
      if (!saveUrl) return; // 如果用户没有选择路径,则不再向下进行
      let downloadUrl =`${baseUrl}/sv/material/download?path=${JSON.parse(args).downloadUrl}`; // 获取渲染进程传递过来的 下载链接
      size = JSON.parse(args).size;
      mainWindow.webContents.downloadURL(downloadUrl); // 触发 will-download 事件
    })
  })
  mainWindow.webContents.session.on('will-download', (event, item) => {
    const totalBytes = size*1024
    item.setSavePath(saveUrl+`\\${item.getFilename()}`); // 'C:\Users\kim\Downloads\第12次.zip'
    //监听下载过程，计算并设置进度条进度
    item.on('updated', (evt, state) => {
      let value = 0
      if ('progressing' === state) {
        //此处  用接收到的字节数和总字节数求一个比例  就是进度百分比
        if (item.getReceivedBytes() && totalBytes) {
          value = parseInt(
            100 * (
              item.getReceivedBytes() / totalBytes
            )
          )
        }
        // 把百分比发给渲染进程进行展示
        mainWindow.webContents.send('updateProgressing', value);
        // mac 程序坞、windows 任务栏显示进度
        
        mainWindow.setProgressBar(item.getReceivedBytes() / totalBytes);
      }
    });
    //监听下载结束事件
    item.on('done', (e, state) => {
      //如果窗口还在的话，去掉进度条
      if (!mainWindow.isDestroyed()) {
        mainWindow.setProgressBar(-1);
      }
      //下载被取消或中断了
      if (state === 'interrupted') {
        dialog.showErrorBox('下载失败', `文件 ${item.getFilename()} 因为某些原因被中断下载`);
      }
      // 下载成功后打开文件所在文件夹
      if (state === 'completed') {
        setTimeout(() => {
          shell.showItemInFolder(saveUrl+`\\${item.getFilename()}`)
        }, 1000);
      }
    });
  });
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

 

