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
      :limit="limit"
    >
      <slot></slot>
    </el-upload>
  </div>
</template>

<script setup>
import OSS from 'ali-oss'
import { ElMessage } from 'element-plus'
import { getSts, mediaInfoParam } from '@/api/content_center/material_library.js'
import { throttle, debounce, isNotEmpty } from '@/utils/tools'

const props = defineProps({
  origin: String, // 页面来源  createByTemplate 模板式生成
  minDuration: Number, // 最短文件时长限制 单位s
  maxDuration: Number, // 最大文件时长限制 单位s
  durationUnit: String, // 时长单位 默认是s 也支持ms(毫秒)
  ConvertOfdurationUnit: {
    type: Boolean,
    default: true
  }, // 提示词里时长单位是否进行转换
  maxSize: Number, // 最大上传文件限制 单位KB
  videoMaxSize: Number, // 如果支持视频和图片同时上传，视频的大小限制存在这里 单位KB
  imgMaxSize: Number, // 如果支持视频和图片同时上传，图片的大小限制存在这里 单位KB
  multiple: Boolean, // 是否多选
  imgRatio: Array, // 图片长宽比限制 [1,2]代表宽/长要在1-2之间
  imgRatioCompare: {
    type: Number,
    default: 1
  }, // 长宽比限制 1 >min&<max 2 >=min&<max 3 >=min&<=max 4 >min&<=max
  imgResolution: Array, // 图片分辨率限制 ['256*256','4096*4096','宽*长']代表宽和长都要>=256&&<=4096
  imgResolutionCompare: {
    type: Number,
    default: 3
  }, // 分辨率限制 1 >min&<max 2 >=min&<max 3 >=min&<=max  4 >min&<=max
  index: Number,
  uploadLoading: Boolean,
  disM4v: Boolean, // 是否禁用m4v的视频
  disabled: {
    type: Boolean,
    default: false
  },
  newImageInfo: { // 需要调用后端接口查看宽高信息的
    type: Boolean,
    default: false
  },
  showLoading: {
    type: Boolean,
    default: true
  }, // 是否使用组件内的loading
  acceptTypeList: { type: Array, default: () => [] }, // 接受的视频格式 例如.mp4：video/mp4 .mov：video/quicktime
  limit: {
    type: Number,
    default: 1
  },
  acceptVideoImg: {
    type: Boolean,
    default: false
  }, // 是否支持同时上传图片和视频
  commonErrTip: {
    type: String,
    default: '请选择正确的文件'
  }, // 通用的上传失败提示语
  commonErrTipInfo: {
    type: Object,
    default: () => {
      return {}
    }
  } // 上传失败提示语 按类型区分 示例：{ maxSize:'每张图片不超过5M',type:'仅支持png,webp格式图片', imgResolution:'每张图片长边不超过2048像素', limit:'每次最多选择10张图片'}
})
const {
  origin,
  maxSize,
  videoMaxSize,
  imgMaxSize,
  multiple,
  imgRatio,
  imgRatioCompare,
  imgResolution,
  imgResolutionCompare,
  disM4v,
  maxDuration,
  minDuration,
  limit,
  acceptVideoImg,
  commonErrTip,
  commonErrTipInfo,
  durationUnit,
  ConvertOfdurationUnit
} = toRefs(props)
const isErr = ref(false) // 是否失败了
const errTime = ref(0) // 失败次数
const emits = defineEmits(['success', 'error', 'update:uploadLoading'])
const upRef = reactive({})
const uploadRef = el => {
  upRef[`upload${props.index}`] = el
}
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
  },
  unloadList: [], // 多选时上传的列表
  chooseNum: 0, // 多选时选择的数量
  validDurationFunNum: 0 // validDurationFun调用次数
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
    fileName.value = file.name.substr(0, point)
    // const fileName = file.name.substr(0, point)
    const name = 'xm/file/' + guid() + '_' + new Date().getTime() + '' + file.name.substr(point)
    return await client.put(name, file)
  } catch (e) {
    console.log(e)
  }
}
const fileName = ref() // 选取的文件原名
async function handleRequest(option) {
  let uploadType = ''
  if (props.acceptTypeList && props.acceptTypeList.length > 0) {
    uploadType = props.acceptTypeList[0].split('/')[0]
  }
  if (option?.file?.type.indexOf('video/') > -1) {
    uploadType = 'video'
  } else if (option?.file?.type.indexOf('audio/') > -1) {
    uploadType = 'audio'
  } else if (option?.file?.type.indexOf('image/') > -1) {
    uploadType = 'image'
  } else {
    uploadType = ''
  }
  if (
    (uploadType === 'video' || uploadType === 'audio') &&
    (maxDuration.value || minDuration.value)
  ) {
    const duration = await getDurationFun(option.file)
    if (minDuration.value && duration < minDuration.value) {
      const durationText =
        ConvertOfdurationUnit.value && minDuration.value >= 60
          ? Number(parseFloat(minDuration.value / 60).toFixed(2)) + 'min'
          : Number(parseFloat(minDuration.value).toFixed(2)) + 's'
      if (origin.value === 'createByTemplate') {
        debouncedWarning(`上传失败，原料时长需超过当前分镜时长的0.5倍以上`)
      } else {
        debouncedWarning(`上传失败，时长最短${durationText}`)
      }
      option.onError()
      return
    } else if (maxDuration.value && duration > maxDuration.value) {
      const durationText =
        ConvertOfdurationUnit.value && maxDuration.value >= 60
          ? maxDuration.value / 60 + 'min'
          : maxDuration.value + 's'
      if (origin.value === 'createByTemplate') {
        debouncedWarning(`超过分镜时长2倍原料暂不支持智能倍速，请重新选择原料或调整长素材处理方式`)
      } else {
        debouncedWarning(`上传失败，时长最长${durationText}`)
      }
      option.onError()
      return
    }
  }
  if (uploadType === 'image' && (isNotEmpty(imgRatio.value) || isNotEmpty(imgResolution.value))) {
    const resData = await getImgFun(option.file)
    if (resData.width) {
      const resWidth = Math.min(resData.width, resData.height)
      const resHeight = Math.max(resData.width, resData.height)
      const resRatio = resHeight / resWidth
      console.log('图片比例', resWidth, resHeight, resRatio)
      // 是图片类型，并且有分辨率或者长宽比限制
      if (resWidth && resHeight) {
        let isValidOver = true
        let validErr = ''
        if (isNotEmpty(imgRatio.value)) {
          let compareResult = false
          if (imgRatioCompare.value === 1) {
            compareResult = resRatio > imgRatio.value[0] && resRatio < imgRatio.value[1]
          } else if (imgRatioCompare.value === 2) {
            compareResult = resRatio >= imgRatio.value[0] && resRatio < imgRatio.value[1]
          } else if (imgRatioCompare.value === 3) {
            compareResult = resRatio >= imgRatio.value[0] && resRatio <= imgRatio.value[1]
          } else if (imgRatioCompare.value === 4) {
            compareResult = resRatio > imgRatio.value[0] && resRatio <= imgRatio.value[1]
          }
          if (!compareResult) {
            isValidOver = false
            if (!validErr) {
              validErr = commonErrTipInfo.value.imgRatio || commonErrTip.value
            }
          }
        }
        if (isNotEmpty(imgResolution.value)) {
          const resolutionMin = imgResolution.value[0].split('*')
          const resolutionMax = imgResolution.value[1].split('*')
          console.log('xx', resolutionMin, resolutionMax, resWidth, resHeight)
          let compareResult = false
          if (imgResolutionCompare.value === 1) {
            compareResult =
              resWidth > parseInt(resolutionMin[0]) &&
              resWidth < parseInt(resolutionMax[0]) &&
              resHeight > parseInt(resolutionMin[1]) &&
              resHeight < parseInt(resolutionMax[1])
          } else if (imgResolutionCompare.value === 2) {
            compareResult =
              resWidth >= parseInt(resolutionMin[0]) &&
              resWidth < parseInt(resolutionMax[0]) &&
              resHeight >= parseInt(resolutionMin[1]) &&
              resHeight < parseInt(resolutionMax[1])
          } else if (imgResolutionCompare.value === 3) {
            compareResult =
              resWidth >= parseInt(resolutionMin[0]) &&
              resWidth <= parseInt(resolutionMax[0]) &&
              resHeight >= parseInt(resolutionMin[1]) &&
              resHeight <= parseInt(resolutionMax[1])
          } else if (imgResolutionCompare.value === 4) {
            compareResult =
              resWidth > parseInt(resolutionMin[0]) &&
              resWidth <= parseInt(resolutionMax[0]) &&
              resHeight > parseInt(resolutionMin[1]) &&
              resHeight <= parseInt(resolutionMax[1])
          }
          if (!compareResult) {
            isValidOver = false
            if (!validErr) {
              validErr = commonErrTipInfo.value.imgResolution || commonErrTip.value
            }
          }
        }
        if (!isValidOver) {
          debouncedWarning(validErr)
          option.onError()
          return
        }
      }
    } else {
      debouncedWarning(resData)
      option.onError()
      return
    }
  }
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
function getDurationFun(file) {
  return new Promise(resolve => {
    const videoElement = document.createElement('video')
    videoElement.src = URL.createObjectURL(file)

    videoElement.addEventListener('loadedmetadata', function () {
      resolve(durationUnit.value === 'ms' ? videoElement.duration * 1000 : videoElement.duration)
    })
    videoElement.addEventListener('error', function () {
      resolve(null)
    })
  })
}
function getImgFun(file) {
  return new Promise(resolve => {
    const videoElement = document.createElement('img')
    videoElement.src = URL.createObjectURL(file)

    videoElement.addEventListener('load', function () {
      console.log('videoe', videoElement.width, videoElement.height)
      resolve(videoElement)
    })
    videoElement.addEventListener('error', function () {
      console.log('videoe1', videoElement)
      resolve(commonErrTipInfo.value.type || '浏览器不支持该类型图片')
    })
  })
}
const typeNameList = new Map([
  ['video', '视频'],
  ['audio', '音频'],
  ['image', '图片']
])

// 上传文件大小限制
function beforeUpload(file) {
  let uploadType = ''
  if (props.acceptTypeList && props.acceptTypeList.length > 0) {
    uploadType = props.acceptTypeList[0].split('/')[0]
  }
  // 仅支持一种类型上传
  if (!acceptVideoImg.value && uploadType && file.type.indexOf(`${uploadType}/`) === -1) {
    debouncedWarning(commonErrTipInfo.value.type || `请选择${typeNameList.get(uploadType)}文件`)
    clearCatch('beforeUpload')
    emits('error')
    return false
  }
  const suffix = file.name.split('.').at(-1)
  // 支持图片和视频上传
  if (
    acceptVideoImg.value &&
    !(file.type.indexOf('video/') > -1 || file.type.indexOf('image/') > -1)
  ) {
    debouncedWarning(
      commonErrTip.value
        ? commonErrTip.value
        : suffix
        ? `不支持${suffix}格式文件`
        : `${commonErrTipInfo.value.type || commonErrTip.value}`
    )
    clearCatch('beforeUpload')
    emits('error')
    return false
  }
  if (disM4v.value) {
    if (['m4v'].includes(suffix.toLowerCase())) {
      debouncedWarning(commonErrTip.value || `暂不支持m4v的视频格式文件`)
      clearCatch('beforeUpload')
      emits('error')
      return false
    }
  }
  if (
    props.acceptTypeList &&
    props.acceptTypeList.length > 0 &&
    props.acceptTypeList.indexOf(file.type) === -1
  ) {
    debouncedWarning(
      commonErrTipInfo.value.type
        ? commonErrTipInfo.value.type
        : commonErrTip.value
        ? commonErrTip.value
        : acceptVideoImg.value
        ? `不支持${suffix}格式文件`
        : `请选择正确的${typeNameList.get(uploadType)}格式文件`
    )
    clearCatch('beforeUpload')
    emits('error')
    return false
  }
  // 支持单个类型上传时，检查是否有大小类型限制
  if (!acceptVideoImg.value && !maxSize.value) {
    $data.fileLoading = true
    emits('update:uploadLoading', true)
    return true
  }
  // 支持多个类型上传时，检查是否有大小类型限制
  if (acceptVideoImg.value && !(videoMaxSize.value || imgMaxSize.value)) {
    $data.fileLoading = true
    emits('update:uploadLoading', true)
    return true
  }
  if (acceptVideoImg.value) {
    let isLimit = false
    // 视频大小限制
    if (file.type.indexOf('video/') > -1) {
      isLimit = file.size / 1024 < videoMaxSize.value
    } else {
      // 图片大小限制
      isLimit = file.size / 1024 < imgMaxSize.value
    }
    if (!isLimit) {
      debouncedWarning(commonErrTipInfo.value.maxSize || commonErrTip.value)
      clearCatch('beforeUpload')
    }
    $data.fileLoading = isLimit
    emits('update:uploadLoading', isLimit)
    if (isLimit) {
      $data.chooseNum++
    }
    return isLimit
  } else {
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
      debouncedWarning(commonErrTipInfo.value.maxSize || `文件大小不能超过${limitStr}`)
      clearCatch()
      // ElMessage.warning(`文件大小不能超过${limitStr}`)
    }
    $data.fileLoading = isLimit
    emits('update:uploadLoading', isLimit)

    if (isLimit) {
      $data.chooseNum++
    }
    return isLimit
  }
}
// 通过接口再次校验时长
function validDurationFun(res, fileType) {
  mediaInfoParam({
    materialUrl: res.url
  })
    .then(res1 => {
      if (res1.code === 0) {
        let uploadType = ''
        if (props.acceptTypeList && props.acceptTypeList.length > 0) {
          uploadType = props.acceptTypeList[0].split('/')[0]
        }
        if (acceptVideoImg.value && fileType) {
          uploadType = fileType.split('/')[0]
        }
        const duration = res1.data?.duration
        if (
          (uploadType === 'video' || uploadType === 'audio') &&
          maxDuration.value &&
          ((durationUnit.value === 'ms' && duration > maxDuration.value) ||
            (durationUnit.value !== 'ms' && duration > maxDuration.value * 1000))
        ) {
          const durationText =
            ConvertOfdurationUnit.value && maxDuration.value >= 60
              ? maxDuration.value / 60 + 'min'
              : maxDuration.value + 's'
          if (origin.value === 'createByTemplate') {
            debouncedWarning(
              `超过分镜时长2倍原料暂不支持智能倍速，请重新选择原料或调整长素材处理方式`
            )
          } else {
            debouncedWarning(`上传失败，时长最长${durationText}`)
          }
        } else if (
          (uploadType === 'video' || uploadType === 'audio') &&
          minDuration.value &&
          ((durationUnit.value === 'ms' && duration < minDuration.value) ||
            (durationUnit.value !== 'ms' && duration < minDuration.value * 1000))
        ) {
          const durationText1 =
            ConvertOfdurationUnit.value && minDuration.value >= 60
              ? Number(parseFloat(minDuration.value / 60).toFixed(2)) + 'min'
              : Number(parseFloat(minDuration.value).toFixed(2)) + 's'
          if (origin.value === 'createByTemplate') {
            debouncedWarning(`上传失败，原料时长需超过当前分镜时长的0.5倍以上`)
          } else {
            debouncedWarning(`上传失败，时长最短${durationText1}`)
          }
        } else {
          if (multiple.value) {
            $data.validDurationFunNum++
            // 处理时间
            const ii = $data.unloadList.findIndex(x => x.url === res.url)
            if (ii > -1) {
              $data.unloadList[ii].duration = duration
            }
            if ($data.validDurationFunNum === $data.chooseNum) {
              successAfterFun(res, duration)
              $data.validDurationFunNum = 0
            }
          } else {
            successAfterFun(res, duration)
          }
        }
      }
    })
    .catch(() => {
      successAfterFun(res)
    })
}
// 通过接口再次校验图片
function validImgFun(res) {
  mediaInfoParam({
    materialUrl: res.url
  })
    .then(res1 => {
      if (res1.code === 0) {
        const resWidth = Math.min(res1.data?.height, res1.data?.width)
        const resHeight = Math.max(res1.data?.height, res1.data?.width)
        const resRatio = resHeight / resWidth
        // 是图片类型，并且有分辨率或者长宽比限制

        let isValidOver = true
        let validErr = ''
        if (isNotEmpty(imgRatio.value)) {
          if (!(resRatio > imgRatio.value[0] && resRatio < imgRatio.value[1])) {
            isValidOver = false
            if (!validErr) {
              validErr = commonErrTipInfo.value.imgRatio || ''
            }
          }
        }
        if (isNotEmpty(imgResolution.value)) {
          const resolutionMin = imgResolution.value[0].split('*')
          const resolutionMax = imgResolution.value[1].split('*')
          if (
            !(
              resWidth >= parseInt(resolutionMin[0]) &&
              resWidth <= parseInt(resolutionMax[0]) &&
              resHeight >= parseInt(resolutionMin[1]) &&
              resHeight <= parseInt(resolutionMax[1])
            )
          ) {
            isValidOver = false
            if (!validErr) {
              validErr = commonErrTipInfo.value.imgResolution
            }
          }
        }
        if (isValidOver) {
          if (multiple.value) {
            $data.validDurationFunNum++
            // 处理时间
            const ii = $data.unloadList.findIndex(x => x.url === res.url)
            if (ii > -1) {
              $data.unloadList[ii].width = res1.data?.width
              $data.unloadList[ii].height = res1.data?.height
              $data.unloadList[ii].size = res1.data?.size
              $data.unloadList[ii].hasAlpha = res1.data?.hasAlpha
            }
            if ($data.validDurationFunNum === $data.chooseNum) {
              successAfterFun(res)
              $data.validDurationFunNum = 0
            }
          } else {
            successAfterFun(res)
          }
        } else {
          $data.fileLoading = false
          debouncedWarning(validErr)
        }
      }
    })
    .catch(() => {
      successAfterFun(res)
    })
}
function successAfterFun(res, duration) {
  $data.fileLoading = false
  if (multiple.value) {
    if ($data.unloadList.length === $data.chooseNum) {
      if (!acceptVideoImg.value) {
        emits('update:uploadLoading', false)
      }
      emits('success', $data.unloadList, props.index, duration, fileName.value, multiple.value)
      $data.unloadList = []
      $data.chooseNum = 0
      upRef[`upload${props.index}`]?.clearFiles()
    }
  } else {
    emits('update:uploadLoading', false)
    upRef[`upload${props.index}`]?.clearFiles()
    // upload.value.clearFiles()
    emits('success', res, props.index, duration, fileName.value, multiple.value)
  }
}
// 上传成功
function handleVideoSuccess(res, file) {
  console.log('上传成功', res, file)
  if (multiple.value) {
    const point = file?.name?.lastIndexOf('.')
    const fileName1 = file?.name?.substr(0, point)
    res = {
      ...res,
      fileName: fileName1,
      fileType:
        file?.raw?.type.indexOf('video/') > -1
          ? 'video'
          : file?.raw?.type.indexOf('image/') > -1
          ? 'image'
          : ''
    }
    $data.unloadList.push(res)
  }
  // 如果有判断视频时长的，上传之后调后端接口在校验一次，防止有些视频读取不到视频时长
  let uploadType = ''
  if (props.acceptTypeList && props.acceptTypeList.length > 0) {
    uploadType = props.acceptTypeList[0].split('/')[0]
  }
  if (
    (acceptVideoImg.value && file?.raw?.type.indexOf('video/') > -1) ||
    (!acceptVideoImg.value && (uploadType === 'video' || uploadType === 'audio'))
  ) {
    validDurationFun(res, file?.raw?.type)
  } else if (
    ((acceptVideoImg.value && file?.raw?.type.indexOf('image/') > -1) ||
      (!acceptVideoImg.value && uploadType === 'image')) &&
    (isNotEmpty(imgRatio.value) || isNotEmpty(imgResolution.value))
  ) {
    validImgFun(res, file?.raw?.type)
  } else if (props.newImageInfo) {
    validImgFun(res, file?.raw?.type)
  } else {
    successAfterFun(res)
  }
}

function handleUploadError(err) {
  console.log('失败')
  $data.fileLoading = false
  emits('error')
  emits('update:uploadLoading', false)
  console.log('handleUploadError', err)
  clearCatch()
}

// 上传作品超过限制的回调
function handleExceed(files, fileList) {
  if (files.length > limit.value) {
    emits('error')
    $data.unloadList = []
    $data.chooseNum = 0
    upRef[`upload${props.index}`]?.clearFiles()
    debouncedWarning(
      commonErrTipInfo.value.limit
        ? commonErrTipInfo.value.limit
        : acceptVideoImg.value && commonErrTip.value
        ? commonErrTip.value
        : `每次最多选择${limit.value}个文件！`
    )
  }
}
// 手动触发选择方法
const showUploadFun = throttle(() => {
  if (origin.value === 'createByTemplate') {
    isErr.value = false
    errTime.value = 0
  }
  console.log('触发次数')
  upRef[`upload${props.index}`].$el.querySelector('input').click()
}, 500)
function abortFun() {
  upRef[`upload${props.index}`]?.abort()
}

// 使用debounce来包装ElMessage.warning，多选时的提示只触发一次
const debouncedWarning = debounce(message => {
  if (origin.value === 'createByTemplate') {
    isErr.value = true
    errTime.value++
    console.log('触发', isErr.value, errTime.value)
    if (isErr.value && errTime.value === 1) {
      ElMessage.warning(message)
    }
  } else {
    ElMessage.warning(message)
  }
}, 300)
// 多选时清除上传缓存
function clearCatch() {
  if (multiple.value) {
    upRef[`upload${props.index}`]?.clearFiles()
    $data.validDurationFunNum = 0
    $data.chooseNum = 0
  }
}

defineExpose({
  showUploadFun,
  abortFun
})
</script>

<style lang="scss" scoped></style>
