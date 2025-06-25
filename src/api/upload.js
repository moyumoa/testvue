import Axios from 'axios'

const axios = Axios.create()
// 腾讯oss上传地址
export const uploadFileURL = '/api/mission/file/upload'
// 上传视频 返回数据包括视频封面
export const videoUploadReturnImg = '/api/mission/file/videoUploadReturnImg'

// 下载文件进度条 -- 使用地方：直播录屏文件下载
export const downFileProgress = params => {
  const { url, callback } = params
  return axios({
    url: url,
    method: 'get',
    responseType: 'blob',
    onDownloadProgress(progress) {
      callback && callback(progress)
    }
  })
}

export const uploadImage = '/api/v1/sumvideo/sv/utils/upload/img' // 上传图片
