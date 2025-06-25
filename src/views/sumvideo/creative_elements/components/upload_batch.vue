<template>
  <el-dialog
    @close="closeDialogFun"
    ref="dialog"
    :close-on-click-modal="false"
    destroy-on-close
    v-model="show"
    :title="infoDialog.title"
    :width="infoDialog.type == 'upload' ? '840px' : '560px'"
    custom-class="upload_dialog"
  >
    <div class="upload_content">
      <!-- 批量上传 -->
      <div v-if="infoDialog.type == 'upload'">
        <div class="flex" style="align-items: center">
          <el-upload
            :disabled="fileLoading"
            :show-file-list="false"
            ref="upload"
            class="upload-demo"
            :accept="infoDialog.uploadAccept"
            action=""
            :headers="headers"
            :http-request="handleRequest"
            :before-upload="handleBeforeUpload"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :on-exceed="handleExceed"
            :limit="50"
            :multiple="true"
          >
            <el-button type="primary" :loading="fileLoading" class="btn" @click="handleUpload">
              {{ infoDialog.uploadBtnText || '添加' }}
            </el-button>
          </el-upload>
          <el-button
            v-if="origin == 'mediaResource'"
            style="margin-left: 16px"
            type="primary"
            @click.stop="showBGMFun"
          >
            从原料库导入BGM
          </el-button>
          <div style="margin-left: 30px; color: #303133">
            已添加数量：
            <span style="margin-left: 4px; font-size: 18px; color: #364fcd">
              {{ successFileList.length }}
            </span>
          </div>
        </div>
        <div class="little-tips" v-if="infoDialog.littleTips">
          {{ infoDialog.littleTips }}
        </div>
        <div class="files-list" v-if="successFileList.length > 0">
          <div class="file-item" v-for="(file, index) in successFileList" :key="index">
            <!-- 图标 -->
            <div class="file-item-l" :style="origin == 'mediaResource' ? 'width:50%' : ''">
              <!-- 视频 -->
              <img
                v-if="initFiletype(file.fileFormat) == 'video'"
                src="@/assets/images/content_center/material/video.png"
                alt
              />
              <!-- 图片 -->
              <img
                v-else-if="initFiletype(file.fileFormat) == 'image'"
                src="@/assets/images/content_center/material/photo.png"
                alt
              />
              <!-- 音频 --MP3、WAV、WMA、MP2、Flac、MIDI、RA、APE、AAC、CDA、MOV -->
              <img
                v-else-if="initFiletype(file.fileFormat) == 'radio'"
                src="@/assets/images/content_center/material/music.png"
                alt
              />
              <!-- 字体 -->
              <img
                v-else-if="initFiletype(file.fileFormat) == 'font'"
                src="https://tagvv-1256030678.file.myqcloud.com/20240924zrt9v.png"
                alt
              />
              <!-- 其他 -->
              <img src="@/assets/images/content_center/material/none.png" v-else alt />

              <div class="name">{{ file.name }}</div>
            </div>
            <!--  -->
            <div class="file-item-r" v-if="!fileLoading">
              <!-- 媒体资源库可以将音频进行类型选择 -->
              <div
                class="choose_type_box"
                v-if="initFiletype(file.fileFormat) == 'radio' && origin == 'mediaResource'"
              >
                <div class="choose_type_label">选择类型：</div>
                <div class="choose_type_content">
                  <el-radio-group v-model="file.specificType" @change="updateAudioTypeFun(file)">
                    <el-radio :label="4">BGM</el-radio>
                    <el-radio :label="2">音效</el-radio>
                  </el-radio-group>
                </div>
              </div>
              <img
                src="https://tagvvcloud-material-center-test.oss-cn-shanghai.aliyuncs.com/xm/file/bbdfc407182749598d2f532561e587c8_1659961431125.png"
                alt
              />
              <div class="delete" @click="beforeDel(file)">删除</div>
            </div>
          </div>
        </div>
        <div class="batch-label">
          <div class="title upload_mark" style="margin-right: 14px">批量打标：</div>
          <div style="width: 696px">
            <batchMarking
              :tagType="infoDialog.tagType"
              :useTagType="infoDialog.useTagType"
              :origin="infoDialog.origin"
              @choseOptions="choseOptions"
            />
          </div>
        </div>
        <div class="batch-label" style="margin-top: 0" v-if="!infoDialog.hideFile">
          <div class="title upload_mark">文件夹选择：</div>
          <div style="width: 696px">
            <searchFileDOM
              :fileID="saveFileInfo"
              @select="changeFileFun"
              @fileChange="fileChange"
              failType="listCreationTagFolder"
            />
          </div>
        </div>
        <div class="last-num">
          <div class="title upload_mark">上传批次号：</div>
          <div class="num-r" style="width: 696px">
            <div class="num-r-top">
              {{ batchNumAbout.batchNumber || '' }}
            </div>
            <div class="num-r-bottom">
              上传批次号便于查找批量上传的同批{{
                tipsType ? tipsType : origin === 'finishProductStore' ? '素材' : '原料'
              }}，批量进行打标、删除操作
            </div>
          </div>
        </div>
      </div>
      <!-- 批量打标、去标、删除 -->
      <div class="" v-if="infoDialog.type === 'allMarking'">
        <!--  批量去标-->
        <div class="batch-label" v-if="batchItem === 2 || batchItem === 1">
          <div class="title">标签：</div>
          <div style="width: 90%">
            <batchMarking
              :tagType="infoDialog.tagType"
              :useTagType="infoDialog.useTagType"
              :origin="infoDialog.origin"
              @choseOptions="choseOptions"
            />
            <div class="batch-tips">
              <template v-if="origin === 'finishProductStore'">
                去除
                <span style="color: #364fcd">
                  {{
                    batchItem === 1
                      ? infoDialog.batchOperationArr.length
                      : infoDialog.totalList || 0
                  }}
                </span>
                个素材的所选标签
              </template>
              <template v-else>
                {{
                  `去除所选${
                    batchItem === 1
                      ? infoDialog.batchOperationArr.length
                      : infoDialog.totalList || 0
                  }个${tipsType || '原料'}的指定标签`
                }}
              </template>
            </div>
          </div>
        </div>
        <!-- 批量打标 -->
        <div class="batch-label" v-if="batchItem === 4 || batchItem === 3">
          <div class="title">标签：</div>
          <div style="width: 90%">
            <batchMarking
              :tagType="infoDialog.tagType"
              :useTagType="infoDialog.useTagType"
              :origin="infoDialog.origin"
              @choseOptions="choseOptions"
            />
            <div class="batch-tips">
              <template v-if="origin === 'finishProductStore'">
                批量给
                <span style="color: #364fcd">
                  {{
                    batchItem === 3
                      ? infoDialog.batchOperationArr.length
                      : infoDialog.totalList || 0
                  }}
                </span>
                个素材打上所选标签
              </template>
              <template v-else>
                {{
                  `批量打标${
                    batchItem === 3
                      ? infoDialog.batchOperationArr.length
                      : infoDialog.totalList || 0
                  }个${tipsType || '原料'}`
                }}
              </template>
            </div>
          </div>
        </div>
        <!-- 批量删除 -->
        <div class="all-delete-tips" v-if="batchItem === 6 || batchItem === 5">
          <template v-if="origin === 'finishProductStore'">
            确定批量删除选中的
            <span style="color: #364fcd">
              {{
                batchItem === 6 ? infoDialog.totalList : infoDialog.batchOperationArr.length || 0
              }}
            </span>
            个素材？删除后不可恢复，请谨慎操作
          </template>
          <template v-else>
            {{
              `是否批量删除${
                batchItem === 5
                  ? infoDialog.batchOperationArr.length || 0
                  : '选中的' + (infoDialog.totalList || 0)
              }个原料？此操作不可恢复，请谨慎操作。`
            }}
          </template>
        </div>
      </div>
      <div class="new-bottom-btn">
        <div class="bottom-btn-left">
          <el-checkbox
            v-if="audioInfo.hasAudio && infoDialog.type === 'upload'"
            v-model="audioInfo.validAudio"
            label="请确保您上传的音频可免费商用或取得著作人许可"
            size="large"
          />
        </div>
        <div class="bottom-btn-right">
          <el-button
            type="primary"
            :disabled="fileLoading || saveLoading"
            class="cancel-btn"
            @click="uploadCancelBatch"
          >
            {{ infoDialog.cancelBtnText || '取消' }}
          </el-button>
          <!-- 原料/原料的上传 -->
          <el-button
            v-if="infoDialog.type === 'upload'"
            type="primary"
            :loading="saveLoading"
            :disabled="
              !(
                successFileList.length > 0 &&
                ((audioInfo.hasAudio && audioInfo.validAudio) || !audioInfo.hasAudio)
              ) || fileLoading
            "
            class="ok-btn"
            @click="saveFileUpload"
          >
            {{ infoDialog.confirmBtnText || '上传' }}
          </el-button>
          <!-- 批量操作 -->
          <el-button
            v-else
            type="primary"
            :loading="saveLoading"
            :disabled="
              (batchBtnRulesArr.includes(infoDialog.batchItem) && choseLabelIds.length <= 0) ||
              fileLoading
            "
            class="ok-btn"
            @click="batchOpe"
          >
            {{ infoDialog.confirmBtnText || '确定' }}
          </el-button>
        </div>
      </div>
    </div>
    <!-- 原料库选择 -->
    <selectMaterialDOM
      :origin="BGMDialog.origin"
      v-if="BGMDialog.show"
      :info="BGMDialog"
      :dialogTitle="BGMDialog.dialogTitle"
      :subtitle="BGMDialog.subtitle"
      :materialType="BGMDialog.materialType"
      :materialTypeList="BGMDialog.materialTypeList"
      @updateSelectInfo="updateSelectFun"
      :resourceType="BGMDialog.resourceType"
      :isAllInfo="BGMDialog.isAllInfo"
    />
  </el-dialog>
</template>
<script setup>
import {
  getSts,
  batchUpload,
  deleteFile,
  fileOk,
  getBatchNum,
  updateUploadSpecificType
} from '@/api/content_center/material_library.js'
import { batchUploadV2 } from '@/api/content_center/content_repository.js'
import OSS from 'ali-oss'
import { throttle, loadFontFun, isNotEmpty } from '@/utils/tools.js'
import initFiletype from '@/views/content_center/content_repository/components/JS/material_library'

import searchFileDOM from '@/views/sumvideo/components/files/search_file.vue'
import batchMarking from '@/views/content_center/content_repository/components/batch_marking.vue'
import selectMaterialDOM from '@/views/sumvideo/components/material/select_material_dialog.vue'

const props = defineProps({
  infoDialog: {
    type: Object,
    default: () => {
      return {
        show: true, // 是否显示弹窗
        uploadAccept: '.jpeg, .jpg, .png, .gif,video/mp4,video/quicktime,audio/mp3', // 接收的上传类型
        title: '上传原料', // 弹窗的标题
        uploadBtnText: '添加', // 打开文件选择按钮文字
        cancelBtnText: '取消', // 取消按钮的显示文字
        confirmBtnText: '上传', // 确定按钮的显示文字
        type: 'upload', // upload批量上传
        littleTips: '', // 上传按钮的提示
        origin: '', // 来源 原料库finishProductStore
        batchItem: -1, // 1去除选中原料标签 2去除所有原料标签 3选中原料打标 4素有原料打标 5删除选中原料 6删除所有原料
        batchOperationArr: [], // 当type="allMarking"时传入；需要批量操作的数据列表
        totalList: 0 // 批量操作-全部
      }
    },
    required: true
  }
})
const dialog = ref()
const show = toRef(props.infoDialog, 'show')
const origin = toRef(props.infoDialog, 'origin')
const batchItem = ref(-1)
const tipsType = ref('')

console.log('======= infoDialog ========', props.infoDialog)
const message = inject('$message')
const emits = defineEmits(['close', 'ope', 'batchOpeSuccess'])

watch(
  () => props.infoDialog.batchItem,
  val => {
    batchItem.value = val
  },
  { deep: true, immediate: true }
)
onMounted(() => {
  // 获取上传批次号
  fetBatchNumInit()
  console.log(origin.value)
  tipsType.value =
    origin.value === 'mediaResource'
      ? '资源'
      : origin.value === 'finishProductStore'
      ? '素材'
      : origin.value === 'virtualModel'
      ? '虚拟模特图片'
      : '原料'
  console.warn(tipsType.value)
  if (isNotEmpty(props.infoDialog.chooseFileId)) {
    saveFileInfo.value = {
      id: props.infoDialog.chooseFileId
    }
  }
})

// el-upload相关 --start
const headers = ref({
  'X-Requested-With': 'XMLHttpRequest',
  token: localStorage.getItem('token'),
  brandId: localStorage.getItem('brandInfo')
    ? JSON.parse(localStorage.getItem('brandInfo')).brandId
    : '',
  userId: localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo')).userId
    : ''
})
const fileLoading = ref(false) // 上传时的loading
let clickTime = '' // 点击上传/添加按钮的时刻
let mutipImg = 0
let uploadNum = 0
const upload = ref()
const successFileList = ref([]) // 创意上传成功列表
// 上传的原料包含音频
const audioInfo = reactive({
  validAudio: false, // 音频的许可是否勾选
  hasAudio: false // 上传的列表里是否有音频
})

const choseLabelIds = ref([]) // 批量打标-选择的标签ids
const saveLoading = ref(false) // 右下角保存按钮的loading
const batchNumAbout = reactive({ batchNumber: '' }) // 上传批次号，每次打开弹窗都不同
// el-upload相关 --end
const batchBtnRulesArr = [-1, 1, 2, 3, 4]

// 批量打标-选择的标签回调
function choseOptions(val) {
  choseLabelIds.value = val
}
// 获取上传批次号
function fetBatchNumInit() {
  getBatchNum({ batchNumber: '' }).then(res => {
    if (res.code === 0) batchNumAbout.batchNumber = res.data?.batchNumber
  })
}

// 删除一个已添加的文件
const beforeDel = throttle(function (item) {
  if (origin.value === 'finishProductStore') {
    deleteFileFin(item)
  } else {
    deleteFileS(item)
  }
}, 700)

// 删除-原料库
function deleteFileFin(item) {
  successFileList.value = successFileList.value.filter(x => x.fileKey !== item.fileKey)
}
// 删除-创意原料库
function deleteFileS(item) {
  deleteFile({ id: item.id }).then(res => {
    if (res.code === 0) {
      successFileList.value = successFileList.value.filter(x => x.id !== item.id)
      let hasA = false
      successFileList.value.forEach(xx => {
        if (xx.data && xx.data.length > 0) {
          if (initFiletype(xx.fileFormat) === 'radio') {
            hasA = true
          }
        }
      })
      audioInfo.hasAudio = hasA
    }
  })
}

// 添加文件失败回调
function handleUploadError() {
  mutipImg = 0
  uploadNum = 0
  // message.warning('创意原料上传失败')
  // 关闭loading
  // tableForm.loading = false
  fileLoading.value = false
  upload.value.clearFiles()
}

// 添加文件成功回调
function handleUploadSuccess(res, file) {
  // 加载列表
  console.log('成功')
  // console.log(res)
  // console.log(file)
  if (res) {
    if (res.code === 0) {
      uploadNum++
      if (uploadNum >= mutipImg) {
        mutipImg = 0
        uploadNum = 0
        upload.value.clearFiles()
        message.success(`${tipsType.value}添加成功`)
        fileLoading.value = false
        // querySearch()
      }
    } else {
      mutipImg = 0
      uploadNum = 0
      message.warning(`${tipsType.value}添加失败`)
      // tableForm.loading = false
      fileLoading.value = false
    }
  }
}
// 超出选择数量
function handleExceed(files, fileList) {
  if (files.length > 50) {
    message.warning(`单次最多选择50个${tipsType.value}！`)
    // console.log(upload.value, 'upload.value.============')
    upload.value.clearFiles()
  }
}
// 添加前验证
function handleBeforeUpload(file, fileList) {
  // loading
  // console.log(file)
  const size = file.size
  const suffix = file.name.split('.').at(-1)
  const videoTypeList = ref(['mp4', 'm4v', 'mov'])
  const imageType = ref(['jpg', 'png', 'gif', 'jpeg'])
  if (isNotEmpty(props.infoDialog.imageType)) {
    imageType.value = JSON.parse(JSON.stringify(props.infoDialog.imageType))
  }
  const audioType = ref(['mp3'])
  const fontType = ref(['ttf', 'otf'])
  const maxSizeList = {
    video: 500 * 1024 * 1024,
    image: 15 * 1024 * 1024,
    audio: 20 * 1024 * 1024,
    font: 25 * 1024 * 1024
  }
  const allowedTypes =
    origin.value === 'mediaResource'
      ? imageType.value.concat(audioType.value).concat(fontType.value)
      : origin.value === 'finishProductStore'
      ? videoTypeList.value.concat(imageType.value)
      : videoTypeList.value.concat(imageType.value).concat(audioType.value)
  const type = videoTypeList.value.includes(suffix.toLowerCase())
    ? 'video'
    : imageType.value.includes(suffix.toLowerCase())
    ? 'image'
    : audioType.value.includes(suffix.toLowerCase())
    ? 'audio'
    : fontType.value.includes(suffix.toLowerCase())
    ? 'font'
    : ''
  if (!allowedTypes.includes(suffix.toLowerCase())) {
    mutipImg = 0
    message({
      type: 'warning',
      message: `不支持${suffix}格式文件`
    })
    upload.value.clearFiles()
    // tableForm.loading = false
    fileLoading.value = false
    return false
  } else if (
    (type === 'video' && size > maxSizeList[type]) ||
    (type === 'image' && size > maxSizeList[type]) ||
    (type === 'audio' && size > maxSizeList[type]) ||
    (type === 'font' && size > maxSizeList[type])
  ) {
    mutipImg = 0
    // const limitSize = maxSizeList[type] / 1024 / 1024
    message({
      type: 'warning',
      // message: `${tipsType.value}大小不能超过${limitSize || 50}M`,
      message:
        origin.value === 'mediaResource'
          ? '单个BGM和音效不超过20M，单个字体不超过25M，单个贴纸不超过15M且单次上传不超过50个素材'
          : '单个图片不超过15M，单个视频不超过500M且单次上传不超过50个素材'
    })
    // console.log(upload.value, 'upload.value-----------创意原料大小不能超过50M')
    console.log(upload.value.clearFiles, 'upload.value.clearFiles')
    upload.value.clearFiles()
    // tableForm.loading = false
    fileLoading.value = false
    return false
  } else {
    mutipImg++
    // tableForm.loading = true
    fileLoading.value = true
  }
}
// 点击添加按钮
function handleUpload() {
  // 最近一次上传的表示
  clickTime = new Date().getTime() + ''
}
// 本次添加文件成功的返回
async function handleRequest(option) {
  const suffix = option.file.name.split('.').at(-1)
  const videoTypeList = ref(['mp4', 'm4v', 'mov'])
  const imageType = ref(['jpg', 'png', 'gif', 'jpeg'])
  if (isNotEmpty(props.infoDialog.imageType)) {
    imageType.value = JSON.parse(JSON.stringify(props.infoDialog.imageType))
  }
  const audioType = ref(['mp3'])
  const fontType = ref(['ttf', 'otf'])
  const maxSizeList = {
    video: 500 * 1024 * 1024,
    image: 15 * 1024 * 1024,
    audio: 20 * 1024 * 1024,
    font: 25 * 1024 * 1024
  }
  const type = videoTypeList.value.includes(suffix.toLowerCase())
    ? 'video'
    : imageType.value.includes(suffix.toLowerCase())
    ? 'image'
    : audioType.value.includes(suffix.toLowerCase())
    ? 'audio'
    : fontType.value.includes(suffix.toLowerCase())
    ? 'font'
    : ''
  if (
    (type === 'video' && option.file.size < maxSizeList[type]) ||
    (type === 'audio' && option.file.size < maxSizeList[type]) ||
    (type === 'image' && option.file.size < maxSizeList[type]) ||
    (type === 'font' && option.file.size < maxSizeList[type])
  ) {
    const res = await getSts()
    if (res.code === 0) {
      putObject(res.data, option.file).then(resPut => {
        if (resPut) {
          // console.log('handleRequest-resPut', resPut)
          const point = option.file.name.lastIndexOf('.')
          const fileName = option.file.name.substr(0, point)
          // 获取这个文件是不是最近一次上传的，如果不是就不掉接口
          const namePoit = resPut.name.lastIndexOf('_')
          const namePonita = resPut.name.substr(namePoit + 1)
          const namePonitab = namePonita.split('.')
          if (fileLoading.value && namePonitab[0] === clickTime) {
            let uploadForm = {}
            if (origin.value === 'finishProductStore') {
              const resUpload = {
                code: 0,
                name: fileName,
                data: [
                  {
                    fileFormat: type === 'font' ? suffix.toLowerCase() : option.file.type
                  }
                ]
              }
              uploadForm = {
                specificType: type === 'audio' ? 4 : null,
                fileFormat: type === 'font' ? suffix.toLowerCase() : option.file.type,
                fileKey: resPut.name,
                url: decodeURIComponent(resPut?.url),
                name: fileName,
                size: option.file.size,
                ...resUpload // 以上是右下角上传入参，点击时需处理提取，这个用于页面显示
              }
              successFileList.value.push(uploadForm)
              option.onSuccess(resUpload, option.file)
            } else if (origin.value === 'mediaResource') {
              uploadForm = {
                source: 17,
                specificType: type === 'font' ? 6 : type === 'image' ? 3 : 4,
                subSource: 5,
                batchNumber: batchNumAbout.batchNumber,
                url: decodeURIComponent(resPut.url),
                name: fileName,
                size: option.file.size
              }
              if (type === 'font') {
                uploadForm.fontApplyType = 1
                uploadForm.type = 6
              }
            }
            // if(origin.value === ''){
            //   uploadForm = {
            //      // fileFormat: option.file.type,
            //      // fileKey: resPut.name,
            //      url: decodeURIComponent(resPut.url),
            //      name: fileName,
            //      size: option.file.size
            //    }
            //   if (batchNumAbout.batchNumber) uploadForm.batchNumber = batchNumAbout.batchNumber
            // }
            // 原料库没有入库概念不调这个接口，上边的步骤（上传阿里云成功）就已经算添加成功
            if (origin.value !== 'finishProductStore') {
              uploadFile(uploadForm, option)
            }
          }
        } else {
          option.onError()
        }
      })
    }
  }
}

// 上传文件给后端 - 暂存在
async function uploadFile(uploadForm, option) {
  const arr = []
  arr.push(uploadForm)
  await batchUpload(arr)
    .then(resUpload => {
      console.log(resUpload, '入存入临时表成功返回，resUpload==========')
      if (resUpload.code === 0 && resUpload.data && resUpload.data.length > 0) {
        const resUploadInfo = resUpload.data[0]
        successFileList.value.push(resUploadInfo)
        if (!audioInfo.hasAudio && initFiletype(resUploadInfo.fileFormat) === 'radio') {
          audioInfo.hasAudio = true
        }
        option.onSuccess(resUpload, option.file)
      }
    })
    .catch(() => {
      option.onError()
    })
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
// 异步添加文件（上传文件获取地址）
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
    const name = 'xm/file/' + guid() + '_' + clickTime + file.name.substr(point)
    return await client.put(name, file)
  } catch (e) {
    console.log(e)
  }
}

// 从原料库选择BGM
const BGMDialog = reactive({
  show: false,
  dialogTitle: '原料库',
  subtitle: '',
  materialType: 3,
  materialTypeList: [3],
  resourceType: 0,
  isAllInfo: true,
  origin: origin.value
})
const showBGMFun = throttle(() => {
  BGMDialog.show = true
}, 700)
// const uniqueBy = (arr, key) => {
//   const seen = new Set()
//   return arr.filter(item => {
//     const k = item[key]
//     return seen.has(k) ? false : seen.add(k)
//   })
// }

function updateSelectFun(chooseList, dialog, btnLoading) {
  console.log('选择的音频', chooseList, dialog, btnLoading)
  const list = []
  chooseList.forEach(x => {
    list.push({
      source: 17,
      specificType: 4,
      subSource: 6,
      batchNumber: batchNumAbout.batchNumber,
      url: x.url,
      name: x.name,
      size: x.size
    })
  })
  batchUpload(list)
    .then(res => {
      if (res.code === 0) {
        const resData = res.data || []
        // resData.forEach(x => {
        //   x.fileKey = x.id
        //   x.specificType = 4
        //   x.data = [
        //     {
        //       fileFormat: x.fileFormat
        //     }
        //   ]
        // })
        successFileList.value = successFileList.value.concat(resData)
        if (!audioInfo.hasAudio) {
          audioInfo.hasAudio = true
        }
        dialog.handleClose()
      }
      btnLoading.value = false
    })
    .catch(() => {
      btnLoading.value = false
    })
}
// 更新音频类型
const updateAudioTypeFun = throttle(info => {
  console.log('更新', info)
  updateUploadSpecificType({
    id: info.id,
    specificType: info.specificType
  })
    .then(res => {
      if (res.code !== 0) {
        info.specificType = info.specificType === 4 ? 2 : 4
      }
    })
    .catch(() => {
      info.specificType = info.specificType === 4 ? 2 : 4
    })
}, 300)
// 关闭弹窗
function cancelBatch() {
  choseLabelIds.value = []
  fileLoading.value = false
  if (props.infoDialog.type === 'upload') {
    isEmitOver.value = true
  }
  emits('close', false, uploadAddFile.value)
}
function uploadCancelBatch() {
  fileLoading.value = false
  // 清空上传成功列表
  successFileList.value = []
  cancelBatch()
}

// 批量打标/去标/删除成功
function batchOpeSuccess(batchItem) {
  fileLoading.value = false
  saveLoading.value = false
  emits('close')
  emits('batchOpeSuccess', batchItem)
}

// 批量操作失败
function batchOpeCatch(batchItem) {
  fileLoading.value = false
  saveLoading.value = false
}

// 批量操作
const batchOpe = throttle(function () {
  saveLoading.value = true
  if (batchItem.value === 5 || batchItem.value === 6) {
    emits('ope', batchItem.value)
  } else {
    emits('ope', batchItem.value, choseLabelIds.value)
  }
}, 700)

// 上传文件
const saveFileUpload = throttle(function () {
  saveLoading.value = true
  const params = {
    brandId: JSON.parse(localStorage.getItem('brandInfo')).brandId,
    userId: JSON.parse(localStorage.getItem('userInfo')).userId,
    tags: choseLabelIds.value
  }
  if (props.infoDialog.type === 'upload') {
    const uploadBelongFiles = [saveFileInfo.value?.id || '0']
    params.tags = (params.tags || []).concat(uploadBelongFiles)
  }
  if (batchNumAbout.batchNumber) params.batchNumber = batchNumAbout.batchNumber
  // 判断文件列表是否为空
  if (successFileList.value.length === 0) {
    saveLoading.value = false
    message.warning(`未上传${tipsType.value || '原料'}`)
    return
  }
  if (origin.value === 'finishProductStore') {
    upBatchFinStore(params.tags)
  } else {
    upBatchCreate(params)
  }
}, 700)
const isEmitOver = ref(false) // 是否批量上传成功
// 素材库-批量上传
function upBatchFinStore(tags = []) {
  const params = successFileList.value.map(item => {
    return {
      fileFormat: item.fileFormat,
      fileKey: item.fileKey,
      url: item.url,
      name: item.name,
      size: item.size,
      tags,
      batchNumber: batchNumAbout.batchNumber || ''
    }
  })

  batchUploadV2(params)
    .then(res => {
      if (res.code === 0) {
        message.success('素材批量上传成功')
        fileLoading.value = false
        successFileList.value = []
        isEmitOver.value = true
        emits('close', true, uploadAddFile.value)
      } else {
        saveLoading.value = false
        fileLoading.value = false
        message.warning('素材批量上传失败')
      }
    })
    .catch(() => {
      saveLoading.value = false
      fileLoading.value = false
      message.warning('素材批量上传失败')
    })
}

// 创意原料-批量上传
function upBatchCreate(params) {
  fileOk(params)
    .then(res => {
      if (res.code === 0) {
        emits('close', true)
        saveLoading.value = false
        fileLoading.value = false
        message.success(`${tipsType.value || '原料'}批量上传成功`)
        // 如果涉及到上传字体，就在项目里加载字体，方便后续调用
        ;(res.data || []).forEach(x => {
          if (initFiletype(x.fileFormat) === 'font') {
            loadFontFun(x.url, x.fileKey)
          }
        })
        // 重新获取视频列表
        successFileList.value = []
      } else {
        saveLoading.value = false
        fileLoading.value = false
      }
    })
    .catch(() => {
      saveLoading.value = false
      fileLoading.value = false
    })
}

const saveFileInfo = ref(null) // 上传选择的文件夹信息
const uploadAddFile = ref(false) // 是否新增了文件夹，是的话弹窗关闭时要刷新整个树
// 更新树
function fileChange() {
  uploadAddFile.value = true
}
// 获取到的文件夹信息
function changeFileFun(e) {
  console.log('获取到的文件夹信息', e)
  saveFileInfo.value = e
}
function closeDialogFun() {
  if (props.infoDialog.type === 'upload' && !isEmitOver.value) {
    emits('close', false, uploadAddFile.value)
  }
}
defineExpose({ batchOpeSuccess, batchOpeCatch })
</script>
<style lang="scss" scoped>
.upload_content {
  padding: 16px;
  .upload_mark {
    width: 100px;
    padding-right: 8px;
    text-align: right;
    margin: 0 !important;
    line-height: 32px;
  }
  .title {
    font-size: 14px;
    font-weight: 400;
    color: #333333;
    margin-top: 6px;
  }
  .upload-demo {
    .btn {
      // margin-top: 4px;
    }
  }
  .little-tips {
    margin-top: 20px;
    line-height: 20px;
    color: #909399;
  }
  .files-list {
    margin-top: 16px;
    height: 164px;
    box-sizing: border-box;
    background-color: #f6f8fa;
    padding: 16px;
    overflow-y: auto;
    .file-item:first-child {
      margin-top: unset;
    }
    .file-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 16px;
      .file-item-l,
      .file-item-r {
        display: flex;
        align-items: center;
      }
      .file-item-l {
        > img {
          width: 14px;
          height: 14px;
          margin-right: 8px;
        }
        .name {
          max-width: 600px;
          height: 20px;
          font-size: 14px;
          font-weight: 400;
          color: #303133;
          line-height: 20px;
          white-space: nowrap; //不换行
          overflow: hidden; //超出隐藏
          text-overflow: ellipsis; //变成...
        }
      }
      .file-item-r {
        > img {
          width: 16px;
          height: 16px;
          margin-right: 20px;
        }
        .delete {
          font-size: 14px;
          font-weight: 400;
          color: #364fcd;
          cursor: pointer;
        }
        .choose_type_box {
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: center;
          margin-right: 20px;
          .choose_type_label {
            font-weight: 400;
            font-size: 14px;
            color: #909399;
            line-height: 20px;
            margin-right: 8px;
          }
          .choose_type_content {
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            align-items: center;
          }
        }
      }
    }
  }
  .batch-label {
    margin-top: 20px;
    // min-height: 84px;
    display: flex;
    padding-bottom: 20px;
    .batch-tips {
      font-size: 14px;
      margin-top: 26px;
      font-weight: 400;
      color: #909399;
    }
    .title {
      margin-top: 10px;
    }
  }
  .last-num {
    // margin-top: 20px;
    // height: 64px;
    display: flex;
    .title {
      margin-top: 10px;
    }

    .num-r-top {
      height: 32px;
      line-height: 32px;
      background: #f6f8fa;
      border-radius: 2px;
      border: 1px solid #dcdee0;
      text-indent: 12px;
      color: #303133;
      // user-select: none; //禁止用户选中文本
      // //user-select有2个值（none表示不能选中文本，text表示可以选择文本）
      // -moz-user-select: none; /*兼容火狐*/
      // -webkit-user-select: none; /*webkit浏览器*/
      // -ms-user-select: none; /*IE10*/
      // -khtml-user-select: none; /*早期浏览器*/
    }
    .num-r-bottom {
      font-size: 14px;
      margin-top: 12px;
      font-weight: 400;
      color: #909399;
    }
  }
  .new-bottom-btn {
    margin-top: 32px;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    .bottom-btn-left {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      height: 32px;
      :deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
        color: #909399;
      }
      :deep(.el-checkbox.el-checkbox--large .el-checkbox__label) {
        color: #909399;
      }
    }
    .bottom-btn-right {
      display: flex;
      flex-direction: row;
      justify-content: flex-right;
      align-items: center;
    }
  }
  .bottom-btn {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-top: 32px;
  }

  .cancel-btn {
    border-radius: 2px;
    border: 1px solid #dcdee0;
    background-color: #fff;
    color: #000;
  }
}
</style>
