<template>
  <div>
    <el-upload
      ref="upload"
      class="upload-demo"
      :disabled="$data.fileLoading"
      action=""
      accept="video/*"
      :show-file-list="false"
      :headers="$data.requestHeaders"
      :http-request="handleRequest"
      :before-upload="beforeUpload"
      :on-success="handleVideoSuccess"
      :on-error="handleUploadError"
      :on-exceed="handleExceed"
      :multiple="multiple"
    >
      <el-button type="primary" :loading="$data.fileLoading" @click="handleUpload">
        {{ btnText || '上传' }}
      </el-button>
    </el-upload>
  </div>
</template>

<script setup>
import OSS from 'ali-oss'
import { ElMessage } from 'element-plus'
import { getSts } from '@/api/content_center/material_library.js'

const props = defineProps({
  maxSize: Number, // 最大上传文件限制 单位KB
  multiple: Boolean, // 是否多选
  btnText: String
})
const { maxSize, multiple } = toRefs(props)

const emits = defineEmits('success')

const upload = ref()
const $data = reactive({
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
})

function handleUpload() {
  // 最近一次上传的表示
  $data.clickTime = new Date().getTime() + ''
}
// 生成GUID 唯一值
function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    .replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
    .replace(/-/g, '')
}
async function putObject(data, file) {
  try {
    const client = new OSS({
      // yourRegion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
      region: data.region,
      secure: true, //* 这句话很重要！！！！！！！！！
      endpoint: data.endPoint, // 这句话更重要,不设置为报错。STS接入地址，例如sts.cn-hangzhou.aliyuncs.com。
      // 从STS服务获取的临时访问密钥（AccessKey ID和AccessKey Secret）。
      accessKeyId: data.stsData.credentials.accessKeyId,
      accessKeySecret: data.stsData.credentials.accessKeySecret,
      // 从STS服务获取的安全令牌（SecurityToken）。
      stsToken: data.stsData.credentials.securityToken,
      // refreshSTSToken: async () => {
      //   console.log('过期')
      //   // 向您搭建的STS服务获取临时访问凭证。
      //   const info = await fetch('your_sts_server')
      //   return {
      //     accessKeyId: info.accessKeyId,
      //     accessKeySecret: info.accessKeySecret,
      //     stsToken: info.stsToken
      //   }
      // },
      // // 刷新临时访问凭证的时间间隔，单位为毫秒。
      refreshSTSTokenInterval: 300000,
      timeout: 600000,
      // 填写Bucket名称。
      bucket: data.bucketName
    })
    const point = file.name.lastIndexOf('.')
    // const fileName = file.name.substr(0, point)
    const name = 'xm/file/' + guid() + '_' + $data.clickTime + file.name.substr(point)
    return await client.put(name, file)
  } catch (e) {
    console.log(e)
  }
}

async function handleRequest(option) {
  console.log('handleRequest', option)
  const res = await getSts()
  if (res.code === 0) {
    return putObject(res.data, option.file)
    // putObject(res.data, option.file).then(resPut => {
    //   if (resPut) {
    //     console.log('handleRequest-resPut', resPut)
    //   } else {
    //     option.onError()
    //   }
    // })
  }
}

// 上传文件大小限制
function beforeUpload(file) {
  if (!maxSize.value) {
    $data.fileLoading = true
    return true
  }
  const isLimit = file.size / 1024 < maxSize.value
  let limitStr
  if (maxSize.value > 1024) {
    limitStr = `${parseInt(maxSize.value / 1024)}M`
  } else {
    limitStr = `${maxSize.value}K`
  }
  if (!isLimit) {
    ElMessage.error(`文件大小不能超过${limitStr}`)
  }
  $data.fileLoading = isLimit
  return isLimit
}

// 上传成功
function handleVideoSuccess(res) {
  $data.fileLoading = false
  upload.value.clearFiles()
  emits('success', res)
}

function handleUploadError(err) {
  $data.fileLoading = false
  console.log('handleUploadError', err)
}

// 上传作品超过限制的回调
function handleExceed(files, fileList) {
  if (files.length > 20) {
    ElMessage.warning('单次最多选择20个作品！')
  }
}
</script>

<style lang="scss" scoped></style>
