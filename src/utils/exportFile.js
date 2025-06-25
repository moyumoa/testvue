/*
 * @Author: Dong wen hao
 * @Date: 2022-01-07 15:43:49
 * @LastEditors: Dong wen hao
 * @LastEditTime: 2022-02-24 10:05:54
 * @Description: 导出文件公共方法
 */

import { EXPORT_TYPE } from '@/utils/dictionary/export-type'
import { ElMessage } from 'element-plus'

/**
 * @description: 导出文件
 * @param {Promise} apiRequest 请求接口
 * @param {Object} params 请求参数
 * @param {String} fileName 导出文件名称
 * @param {String} type 导出文件类型
 *
 * @return {Promise}
 */
export function exportFile(apiRequest, params, fileName, type) {
  return new Promise((resolve, reject) => {
    apiRequest(params)
      .then(response => {
        const contentType = EXPORT_TYPE.get(type)
        const blob = new Blob([response.data], {
          type: contentType
        })
        const downloadElement = document.createElement('a')
        const href = window.URL.createObjectURL(blob)
        // filename自定义
        const filename = fileName
        downloadElement.style.display = 'none'
        downloadElement.href = href
        downloadElement.download = filename
        document.body.appendChild(downloadElement)
        downloadElement.click()
        document.body.removeChild(downloadElement)
        window.URL.revokeObjectURL(href)
        resolve()
      })
      .catch(buffer => {
        const content = buffer
        const resBlob = new Blob([content])
        const reader = new FileReader()
        reader.readAsText(resBlob, 'utf-8')
        reader.onload = () => {
          if (reader.result.indexOf('Error: timeout') > -1) {
            reject(reader.result)
          } else {
            const res = JSON.parse(reader.result)
            ElMessage({
              message: res.msg,
              type: 'warning'
            })
            reject(res)
          }
        }
      })
  })
}

// 下载文件统一提交到右上角下载中心
export function exportFileV2(apiRequest, params, fileName, type) {
  return new Promise((resolve, reject) => {
    apiRequest(params)
      .then(response => {
        resolve()
      })
      .catch(buffer => {
        const content = buffer
        const resBlob = new Blob([content])
        const reader = new FileReader()
        reader.readAsText(resBlob, 'utf-8')
        reader.onload = () => {
          if (reader.result.indexOf('Error: timeout') > -1) {
            reject(reader.result)
          } else {
            const res = JSON.parse(reader.result)
            ElMessage({
              message: res.msg,
              type: 'warning'
            })
            reject(res)
          }
        }
      })
  })
}

/**
 * @description: 下载文件
 * @param {String} 文件下载地址
 * @param {String} 文件名字，要带后缀
 * @param {String} 页面来源，例如:素材库，素材库会有存在flac等无法正确获取后缀名的文件类型，下载时需要自己带上后缀名
 */
export function downLoadFile(filepath, fileName, pageName) {
  return new Promise((resolve, reject) => {
    fetch(filepath)
      .then(res => res.blob())
      .then(blob => {
        // 输出结果
        const a = document.createElement('a')
        document.body.appendChild(a)
        a.style.display = 'none'
        const url = window.URL.createObjectURL(blob)
        a.href = url
        if (blob.type === 'application/octet-stream' && pageName === 'material_library') {
          // 获取最后一个.的位置
          const index = filepath.lastIndexOf('.')
          // 获取后缀
          const ext = filepath.substr(index + 1)
          a.download = fileName + '.' + ext
        } else {
          a.download = fileName
        }

        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        resolve()
      })
      .catch(err => {
        reject(new Error(err))
      })
  })
}
