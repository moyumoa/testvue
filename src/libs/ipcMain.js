//接收渲染进程广播的数据执行最小化 最大化  关闭的操作

import { BrowserWindow } from 'electron'
//获取当前的窗口对象   BrowserWindow.getFocusedWindow();

export function scaleWindow(ipcMain,mainWindow){
    let windows= BrowserWindow.getFocusedWindow();
    // 缩小
    ipcMain.on('window-min',()=>{
        // console.log('window-min')
        windows.minimize()
    })
    // 放大
    ipcMain.on('window-max',()=>{
        // console.log('window-max')
        if(windows.isMaximized()){
            windows.restore();
         }else{
            windows.maximize()
        }
    })
    // 关闭
    ipcMain.on('window-close',()=>{
        windows.close()
    })
    // 触发退出全屏
    windows.on('unmaximize',function(){
        mainWindow.webContents.send('unmaximize', false)
    })
}
