<template>
  <div>
    <el-upload
      v-loading="props.showLoading ? $data.fileLoading : false"
      :ref="uploadRef"
      class="upload-demo"
      :disabled="$data.fileLoading || props.disabled"
      action=""
      :accept="
        props.acceptTypeList && props.acceptTypeList.length > 0
          ? props.acceptTypeList.join(', ')
          : 'video/*'
      "
      :show-file-list="false"
      :headers="$data.requestHeaders"
      :http-request="handleRequest"
      :before-upload="beforeUpload"
      :on-success="handleVideoSuccess"
      :on-error="handleUploadError"
      :on-exceed="handleExceed"
      :multiple="multiple"
    >
      <slot></slot>
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
  index: Number,
  uploadLoading: Boolean,
  useSelfTip: Boolean, // 使用自身的提示语
  disM4v: Boolean, // 是否禁用m4v的视频
  disabled: {
    type: Boolean,
    default: false
  },
  showLoading: {
    type: Boolean,
    default: true
  }, // 是否使用组件内的loading
  acceptTypeList: { type: Array, default: () => [] } // 接受的视频格式 例如.mp4：video/mp4 .mov：video/quicktime
})
const { maxSize, multiple, useSelfTip, disM4v } = toRefs(props)

const emits = defineEmits(['success', 'update:uploadLoading'])
const upRef = reactive({})
const uploadRef = el => {
  upRef[`upload${props.index}`] = el
}
console.log(upRef, 'upRef')
const videoDuration = ref(null)
const $data = reactive({
  fileLoading: false,
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
    const name = 'xm/file/' + guid() + '_' + new Date().getTime() + '' + file.name.substr(point)
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
  if (file.type.indexOf('video/') === -1) {
    ElMessage.error(`请选择${useSelfTip.value ? '灵感视频' : '视频'}文件`)
    return false
  }
  const suffix = file.name.split('.').at(-1)
  console.log(file, suffix)
  if (disM4v.value) {
    if (['m4v'].includes(suffix.toLowerCase())) {
      ElMessage.error(`暂不支持m4v的${useSelfTip.value ? '灵感视频' : '视频'}格式文件`)
      return false
    }
  }
  if (
    props.acceptTypeList &&
    props.acceptTypeList.length > 0 &&
    props.acceptTypeList.indexOf(file.type) === -1
  ) {
    ElMessage.error(`请选择正确的${useSelfTip.value ? '灵感视频' : '视频'}格式文件`)
    return false
  }
  if (!maxSize.value) {
    $data.fileLoading = true
    emits('update:uploadLoading', true)
    return true
  }
  const isLimit = file.size / 1024 < maxSize.value
  let limitStr
  if (maxSize.value >= 1024 * 1024) {
    limitStr = `${parseInt(maxSize.value / 1024 / 1024)}GB`
  } else if (maxSize.value >= 1024) {
    limitStr = `${parseInt(maxSize.value / 1024)}M`
  } else {
    limitStr = `${maxSize.value}K`
  }
  if (!isLimit) {
    if (useSelfTip.value) {
      ElMessage.error(`当前上传灵感视频最大不能超过${limitStr}`)
    } else {
      ElMessage.error(`文件大小不能超过${limitStr}`)
    }
  }
  $data.fileLoading = isLimit
  emits('update:uploadLoading', isLimit)
  return isLimit
}

// 上传成功
function handleVideoSuccess(res) {
  $data.fileLoading = false
  emits('update:uploadLoading', false)
  upRef[`upload${props.index}`].clearFiles()
  // upload.value.clearFiles()
  emits('success', res, props.index, videoDuration.value)
}

function handleUploadError(err) {
  $data.fileLoading = false
  emits('update:uploadLoading', false)
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
