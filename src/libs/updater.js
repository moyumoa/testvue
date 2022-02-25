import {autoUpdater} from 'electron-updater'
import {ipcMain} from 'electron'
const path = require('path')
const fs_extra = require('fs-extra')
const isMac = process.platform === 'darwin'
// let mainWindow = null;
// 通过main进程发送事件给renderer进程，提示更新信息
function sendUpdateMessage(mainWindow,type,data) {
    const senddata = {
        state: type.status,
        msg: data || ''
    }
    //通知BrowserWindow页面显示进度条
    mainWindow.webContents.send('updateAppMessage', senddata)
}
// 更新
export function handleUpdate(mainWindow) {
    autoUpdater.autoDownload = false
    // 更新前，删除本地安装包 ↓
    let updaterCacheDirName = 'electron-sumvideo-updater'
    const updatePendingPath = path.join(autoUpdater.app.baseCachePath, updaterCacheDirName, 'pending')
    fs_extra.emptyDir(updatePendingPath)
     // 更新前，删除本地安装包 ↑
    const returnData = {
        error: {status: -1, msg: '检测更新查询异常'},
        checking: {status: 0, msg: '正在检查应用程序更新'},
        updateAva: {status: 1, msg: '检测到新版本'},
        uploading: {status: 3, msg: '正在下载'},
        uploadedUpdate: {status: 4, msg: '下载完成'},
        updateNotAva: {status: -1, msg: '您现在使用的版本为最新版本,无需更新!'},
    };
    // 本地开发环境，改变app-update.yml地址
    if (process.env.NODE_ENV === 'development' && !isMac) {
      autoUpdater.updateConfigPath = path.join(__dirname, 'win-unpacked/resources/app-update.yml');
    }else if(process.env.NODE_ENV === 'development' && isMac){
      autoUpdater.updateConfigPath = path.join(__dirname, 'Contents/Resources/app-update.yml');
    }else {
      autoUpdater.updateConfigPath = path.join(__dirname, '../app-update.yml');
    }
    // 修改地址
    // autoUpdater.setFeedURL('http://localhost:3000/public');
    if(isMac){
      autoUpdater.setFeedURL('https://test.tagvv.com/download/mac/')
    }else{
      autoUpdater.setFeedURL('https://test.tagvv.com/download/windows/');
    }
    //更新错误
    autoUpdater.on('error', function (error) {
      sendUpdateMessage(mainWindow,returnData.error,error)
    });
  
    //检查中
    autoUpdater.on('checking-for-update', function () {
        sendUpdateMessage(mainWindow,returnData.checking)
    });

    //发现新版本
    autoUpdater.on('update-available', function () {
        // if(!isDevelopment){
          sendUpdateMessage(mainWindow,returnData.updateAva)
        // }else{
          // sendUpdateMessage(returnData.updateNotAva)
        // }
        
    });
   
    //当前版本为最新版本
    autoUpdater.on('update-not-available', function () {
        // setTimeout(function () {
        //     hotUpdate();//热更新检查
            sendUpdateMessage(mainWindow,returnData.updateNotAva)
        // }, 1000);
    });
   
    // 更新下载进度事件
    autoUpdater.on('download-progress', function (event,progressObj) {
        console.log(111111111)
      sendUpdateMessage(mainWindow,returnData.uploading,progressObj)
    });
    // 更新完成
    autoUpdater.on('update-downloaded', function (event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {
      sendUpdateMessage(mainWindow,returnData.uploadedUpdate)
    });
    ipcMain.on('isUpdateNow', () => {
        autoUpdater.quitAndInstall(true,true);
      });
    // ('执行自动更新检查!!!');
    ipcMain.on("checkForUpdate", () => {
        autoUpdater.checkForUpdates().catch(err => {
            console.log('网络连接问题', err)
        })
    });
    // 手动下载更新
    ipcMain.on("confirm-downloadUpdate", () => {
        autoUpdater.downloadUpdate()
    });
  }