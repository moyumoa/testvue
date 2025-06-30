<template>
  <div>
    <el-upload
      ref="upload"
      class="upload-demo"
      :disabled="fileLoading"
      action=""
      accept="video/*"
      :show-file-list="false"
      :headers="requestHeaders"
      :http-request="handleRequest"
      :before-upload="beforeUpload"
      :on-success="handleVideoSuccess"
      :on-error="handleUploadError"
      :on-exceed="handleExceed"
      :multiple="multiple"
    >
      <el-button type="primary" :loading="fileLoading" @click="handleUpload">
        {{ btnText || '上传' }}
      </el-button>
    </el-upload>
  </div>
</template>

<script>
import OSS from 'ali-oss'
import { Message as ElMessage } from 'element-ui'
import api from '../api'

export default {
  name: 'OssOpload',
  props: {
    maxSize: Number, // 最大上传文件限制 单位KB
    multiple: Boolean, // 是否多选
    btnText: String
  },
  data() {
    return {
      fileLoading: false,
      clickTime: '',
      requestHeaders: {
        'X-Requested-With': 'XMLHttpRequest',
        token: localStorage.getItem('token'),
        brandId: localStorage.getItem('brandInfo')
          ? JSON.parse(localStorage.getItem('brandInfo')).brandId
          : '',
        userId: localStorage.getItem('userInfo')
          ? JSON.parse(localStorage.getItem('userInfo')).userId
          : ''
      }
    }
  },
  methods: {
    handleUpload() {
      this.clickTime = new Date().getTime() + ''
    },
    // 生成GUID 唯一值
    guid() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
        .replace(/[xy]/g, function (c) {
          const r = (Math.random() * 16) | 0
          const v = c === 'x' ? r : (r & 0x3) | 0x8
          return v.toString(16)
        })
        .replace(/-/g, '')
    },
    async putObject(data, file) {
      console.log('反应',data,file);
      
      try {
        const client = new OSS({
          region: data.region,
          secure: true,
          endpoint: data.endPoint,
          accessKeyId: data.stsData.credentials.accessKeyId,
          accessKeySecret: data.stsData.credentials.accessKeySecret,
          stsToken: data.stsData.credentials.securityToken,
          refreshSTSTokenInterval: 300000,
          timeout: 600000,
          bucket: data.bucketName
        })
        const point = file.name.lastIndexOf('.')
        const name = 'xm/file/' + this.guid() + '_' + this.clickTime + file.name.substr(point)
        return await client.put(name, file)
      } catch (e) {
        console.log(e)
      }
    },
    async handleRequest(option) {
      const res = await api.getSts()
      if (res.code === 0) {        
        return this.putObject(res.data, option.file)
      }
    },
    beforeUpload(file) {
      if (!this.maxSize) {
        this.fileLoading = true
        return true
      }
      const isLimit = file.size / 1024 < this.maxSize
      let limitStr
      if (this.maxSize > 1024) {
        limitStr = `${parseInt(this.maxSize / 1024)}M`
      } else {
        limitStr = `${this.maxSize}K`
      }
      if (!isLimit) {
        ElMessage.error(`文件大小不能超过${limitStr}`)
      }
      this.fileLoading = isLimit
      return isLimit
    },
    handleVideoSuccess(res) {
      this.fileLoading = false
      this.$refs.upload.clearFiles()
      console.log(res);
      
      this.$emit('success', res)
    },
    handleUploadError(err) {
      this.fileLoading = false
      console.log('handleUploadError', err)
    },
    handleExceed(files) {
      if (files.length > 20) {
        ElMessage.warning('单次最多选择20个作品！')
      }
    }
  }
}
</script>

<style lang="scss" scoped></style>
