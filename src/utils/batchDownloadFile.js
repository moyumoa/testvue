/* eslint-disable */

import axios from 'axios'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
// 生成GUID 唯一值
function guid() {
  return 'xxx-xxx-4xxx'
    .replace(/[xy]/g, function (c) {
      const r = (Math.random() * 8) | 0
      const v = c === 'x' ? r : r & 0x2
      return v.toString(8)
    })
    .replace(/-/g, '')
}

let controller = null
let signal = null

// 下载方法
export function downLoadAllFile(list, pageSource, instance, zipName, useRename = true) {
  return new Promise((resolve, reject) => {
    if (instance) instance.confirmButtonText = `下载${0}/${list.length}`
    controller = new AbortController()
    signal = controller.signal
    const getFile = (url, suffix) => {
      return new Promise((resolve, reject) => {
        axios
          .get(url, {
            responseType: 'arraybuffer',
            signal: signal
            // responseType: 'arraybuffer'
          })
          .then(res => {
            resolve({ data: res.data, suffix: suffix })
          })
          .catch(err => {
            console.log('err', err)
            reject(err.toString())
          })
      })
    }

    // 创建JSZip实例
    const zip = new JSZip(),
      // promise对象
      promises = []
    // 文件后缀名
    let suffix = ''
    list.forEach(el => {
      // 获取文件后缀名
      if (el.url && el.url.indexOf('.') > -1) {
        suffix = el.url.substring(el.url.lastIndexOf('.'))
      } else {
        suffix = '.txt'
      }
      // 生成promise实例

      // let regex = /[\/\\:*?"<>|.]/g
      // 正则表达式匹配非中文、英文、数字的字符
      let regex = /[^\u4e00-\u9fa5a-zA-Z0-9]/g
      // 替换这些字符为空字符串
      let name = el.name.replace(regex, '')
      if (useRename) name = name + '-' + guid()
      if (suffix === '.txt') {
        const blob = new Blob([el.content], { type: 'text/txt' })
        const promise = new Promise(resolve => {
          zip.file(name + '.txt', blob)
          resolve()
        })
        // const promise = zip.file(name + '.txt', el.content)
        promises.push(promise)
      } else {
        const promise = getFile(el.url, suffix).then(res => {
          zip.file(name + res.suffix, res.data, { binary: true })
        })
        promises.push(promise)
      }
    })
    let completed = 0
    // 异步处理
    Promise.all(
      promises.map(promise => {
        return promise.then(() => {
          completed++
        
          if (instance) instance.confirmButtonText = `下载${completed}/${promises.length}`
        })
      })
    ).then(() => {
      // 生成二进制流
      zip
        .generateAsync(
          {
            type: 'blob',
            signal: signal
          },
          metadata => {
            // metadata包含了压缩过程的信息，如总大小等
            if (instance)
              instance.confirmButtonText = `压缩${((metadata.percent / 100) * 100) | 0}%`
          }
        )

        .then(content => {
          console.log('生成二进制流成功', content)
          saveAs(
            content,
            zipName
              ? zipName
              : pageSource === 'material'
              ? '原料库批量下载文件包.zip'
              : '素材库批量下载文件包.zip'
          )
          resolve()
        })
        .catch(err => {
          reject({})
          ElMessage({
            type: 'error',
            message: `文件压缩失败，请减少选中的文件后再试`
          })
          console.log('生成二进制流失败')
        })
        .finally(res => {
          console.log('finally', res)
        })
    })
  })
}

// 取消下载
export function cancelDownFile() {
  if (controller) {
    controller.abort()
    nextTick(() => {
      controller = null
    })
  }
}
