<template>
  <div class="work_library">
    <!-- 筛选条件 -->
    <xm_search
      :searchComponents="searchComponents"
      :useOwnReset="true"
      @getData="querySearch"
      @reset="resetSearch"
      ref="xmSearchRef"
    >
      <template #searchItem1>
        <!-- 作品大小 -->
        <div class="search_item add_item">
          <label class="item_label">作品大小(MB)</label>
          <div
            class="item_box"
            :style="{ border: workSizeOk ? '1px solid #dcdfe6' : '1px solid #f21111' }"
          >
            <el-input-number
              placeholder="最小容量"
              v-model="tableForm.minCapacity"
              @change="isWorkSizeOk"
            ></el-input-number>
            <!-- :min="0"
              :max="tableForm.maxCapacity || 9999" -->
            <span>至</span>
            <el-input-number
              placeholder="最高容量"
              v-model="tableForm.maxCapacity"
              @change="isWorkSizeOk"
            ></el-input-number>
            <!-- :min="validationSearchForm(tableForm.minCapacity, tableForm.maxCapacity)"
              :max="9999" -->
          </div>
        </div>
        <!-- 使用次数 -->
        <div class="search_item add_item">
          <label class="item_label">使用次数</label>
          <div
            class="item_box"
            :style="{ border: useTimesOk ? '1px solid #dcdfe6' : '1px solid #f21111' }"
          >
            <el-input-number
              placeholder="最低次数"
              v-model="tableForm.minNum"
              :precision="0"
              @change="isUseTimesOk"
            ></el-input-number>
            <!-- :min="0"
              :max="tableForm.maxNum || 9999" -->
            <span>至</span>
            <el-input-number
              placeholder="最高次数"
              v-model="tableForm.maxNum"
              :precision="0"
              @change="isUseTimesOk"
            ></el-input-number>
            <!-- :min="tableForm.minNum || undefined" -->
            <!-- :min="validationSearchForm(tableForm.minNum, tableForm.maxNum)"
              :max="9999" -->
          </div>
        </div>
      </template>
    </xm_search>
    <!-- 数据列表 -->
    <div class="manage_table">
      <el-tabs class="tab_box" v-model="chooseTab" @tab-click="changeTab">
        <el-tab-pane v-for="(tab, i) in tabList" :key="i" :label="tab.label" :name="tab.name">
          <template #label>
            <div class="tab_label">
              {{ tab.label }}
            </div>
          </template>
        </el-tab-pane>
      </el-tabs>
      <div class="action_btn">
        <!-- <el-button @click="toRecord" style="margin-right: 18px">导入记录</el-button> -->
        <el-upload
          ref="upload"
          class="upload-demo"
          :disabled="fileLoading"
          action=""
          accept="video/*"
          :show-file-list="false"
          :headers="headers"
          :http-request="handleRequest"
          :before-upload="beforUpload"
          :on-error="handleUploadError"
          :on-success="handleVideoSuccess"
          :on-exceed="handleExceed"
          :limit="20"
          :multiple="true"
        >
          <el-button type="primary" :loading="fileLoading" @click="handleUpload">上传</el-button>
        </el-upload>
        <el-button
          v-if="!judgeHWork()"
          type="primary"
          @click="handleCommand('kjl')"
          style="margin-left: 18px; padding: 8px 15px 8px 20px"
        >
          导入酷家乐视频
        </el-button>
        <!-- <el-dropdown popper-class="xm_dropDown" style="" trigger="click" @command="handleCommand">
          <el-button type="primary" style="padding: 8px 15px 8px 20px">
            导入
            <el-icon class="el-icon--right"><i-arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="(item, index) in importRecordList"
                :key="index"
                :command="item.command"
              >
                {{ item.name }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown> -->
      </div>
      <manageCard
        :page="tableForm.page"
        :videoData="tableForm.videoData"
        :version="1"
        @getList="getList"
        @delItem="delItem"
      ></manageCard>
    </div>
    <addKJLDialog
      v-if="KJLDialog.show"
      :addDialog="KJLDialog"
      :version="1"
      @showSuccessFun="showSuccessFun"
    ></addKJLDialog>
    <successDialog
      v-if="showSuccessDialog.show"
      :successDialog="showSuccessDialog"
      @upList="querySearch"
    ></successDialog>
    <!-- @changeTabFun="changeTabFun" -->
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import OSS from 'ali-oss'
import { getSts } from '@/api/content_center/material_library.js'
import { updateWork, uploadWork } from '@/api/content_center/content_repository.js'
import manageCard from './manage_card.vue'
import { pageList } from '../model/get_works_list.js'
import { throttle } from '@/utils/tools.js'
import { ElMessage } from 'element-plus'
import addKJLDialog from '../components/addKJL_dialog.vue'
import successDialog from '../components/success_dialog.vue'
const judgeHWork = inject('$judgeHWork')
const {
  searchComponents,
  tableForm,
  getList,
  chooseTab,
  tabDetail,
  useTimesOk,
  isUseTimesOk,
  workSizeOk,
  isWorkSizeOk
} = pageList()
const { tabList, sortMethods } = toRefs(tabDetail) // currentIndex,
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
const fileLoading = ref(false)
// 查询的回调
const querySearch = throttle(function () {
  tableForm.page.index = 1
  getList()
}, 500)
// 清空查询参数
function clearSearchQuery() {
  tableForm.minNum = undefined
  tableForm.maxNum = undefined
  tableForm.maxCapacity = undefined
  tableForm.minCapacity = undefined
  tableForm.page = {
    index: 1,
    size: 35,
    total: 0
  }
}
// 重置的回调
const resetSearch = throttle(function () {
  clearSearchQuery()
  isWorkSizeOk()
  isUseTimesOk()
  getList()
}, 500)
clearSearchQuery()
const xmSearchRef = ref(null)
const menuOfKeepAlive = inject('$menuOfKeepAlive')
onActivated(() => {
  if (menuOfKeepAlive('judge')) {
    workSizeOk.value = true
    useTimesOk.value = true
    if (xmSearchRef.value) {
      xmSearchRef.value?.reset()
    } else {
      resetSearch()
    }
    menuOfKeepAlive('reset')
  } else {
    getList()
  }
})
// tab切换的回调
function changeTab(val, event) {
  sortMethods.value = val.props.name
  getList()
}
const upload = ref()
const message = inject('$message')
let mutipImg = 0
let uploadNum = 0
let clickTime = ''
// 作品上传前的回调
function beforUpload(file) {
  const size = file.size
  if (size > 419430400) {
    mutipImg = 0
    message({
      type: 'warning',
      message: '作品大小不能超过400M'
    })

    upload.value.clearFiles()
    tableForm.page.loading = false
    fileLoading.value = false
    return false
  } else if (file.type.indexOf('video/') === -1) {
    mutipImg = 0
    message({
      type: 'warning',
      message: '只能上传视频相关的作品哦~'
    })
    upload.value.clearFiles()
    tableForm.page.loading = false
    fileLoading.value = false
    return false
  } else {
    mutipImg++

    tableForm.page.loading = true
    fileLoading.value = true
  }
}
// 上传作品超过限制的回调
function handleExceed(files, fileList) {
  console.log(files, fileList)
  console.log(files)
  if (files.length > 20) {
    ElMessage.warning('单次最多选择20个作品！')
    upload.value.clearFiles()
  }
}
// 上传一个作品成功的回调
function handleVideoSuccess(res, item) {
  console.log(res)
  if (res) {
    if (res.code === 0) {
      uploadNum++
      if (uploadNum >= mutipImg) {
        mutipImg = 0
        uploadNum = 0
        upload.value.clearFiles()
        message.success('作品上传成功')
        fileLoading.value = false
        resetSearch()
      }
    } else {
      mutipImg = 0
      uploadNum = 0
      message.warning('作品上传失败')
      tableForm.page.loading = false
      fileLoading.value = false
    }
  }
}
// 视频上传失败的回调
function handleUploadError() {
  mutipImg = 0
  uploadNum = 0
  fileLoading.value = false
  // ElMessage({ type: 'error', message: '作品上传失败' })
  tableForm.page.loading = false
  upload.value.clearFiles()
}

function handleUpload() {
  // 最近一次上传的表示
  clickTime = new Date().getTime() + ''
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
    const name = 'xm/file/' + guid() + '_' + clickTime + file.name.substr(point)
    return await client.put(name, file)
  } catch (e) {
    console.log(e)
  }
}
async function handleRequest(option) {
  console.log('handleRequest', option)
  if (option.file.size <= 419430400 && option.file.type.indexOf('video/') > -1) {
    const res = await getSts()
    if (res.code === 0) {
      putObject(res.data, option.file).then(resPut => {
        if (resPut) {
          console.log('handleRequest-resPut', resPut)
          const point = option.file.name.lastIndexOf('.')
          const fileName = option.file.name.substr(0, point)
          // 获取这个文件是不是最近一次上传的，如果不是就不掉接口
          const namePoit = resPut.name.lastIndexOf('_')
          const namePonita = resPut.name.substr(namePoit + 1)
          const namePonitab = namePonita.split('.')

          if (fileLoading.value && namePonitab[0] === clickTime) {
            const uploadForm = {
              fileFormat: option.file.type,
              fileKey: resPut.name,
              url: decodeURIComponent(resPut.url),
              name: fileName,
              size: option.file.size
            }
            // getFileInfo(option.file)
            //   .then(resFile => {
            //     console.log('resFile', resFile)
            //     if (resFile.type !== 'none') {
            //       switch (resFile.type) {
            //         case 'video':
            //           uploadForm.wight = resFile.width
            //           uploadForm.height = resFile.height
            //           uploadForm.duration = resFile.duration ? parseInt(resFile.duration * 1000) : 0
            //           break
            //         case 'audio':
            //           uploadForm.duration = resFile.duration ? parseInt(resFile.duration * 1000) : 0
            //           break
            //         case 'image':
            //           uploadForm.wight = resFile.width
            //           uploadForm.height = resFile.height
            //           break
            //       }
            //       uploadFile(uploadForm, option)
            //     } else {
            //       uploadFile(uploadForm, option)
            //     }
            //   })
            //   .catch(() => {
            //     uploadFile(uploadForm, option)
            //   })
            uploadFile(uploadForm, option)
          }
        } else {
          option.onError()
        }
      })
    }
  }
}
// 上传文件给后端
function uploadFile(uploadForm, option) {
  uploadWork(uploadForm)
    .then(resUpload => {
      option.onSuccess(resUpload, option.file)
    })
    .catch(() => {
      option.onError()
    })
}
// 获取素材信息
// function getFileInfo(file) {
//   const getVideoInfo = new Promise(resolve => {
//     if (file.type.indexOf('video/') > -1) {
//       const videoElement = document.createElement('video')
//       videoElement.src = URL.createObjectURL(file)
//       videoElement.addEventListener('loadedmetadata', function () {
//         resolve({
//           type: 'video',
//           duration: videoElement.duration || 0,
//           height: videoElement.videoHeight || 0,
//           width: videoElement.videoWidth || 0
//         })
//       })
//     } else if (file.type.indexOf('audio/') > -1) {
//       const audioElement = document.createElement('audio')
//       audioElement.src = URL.createObjectURL(file)
//       audioElement.addEventListener('loadedmetadata', function () {
//         console.log('audio', audioElement.width, audioElement.audioWidth)
//         resolve({
//           type: 'audio',
//           duration: audioElement.duration || 0
//         })
//       })
//     } else if (file.type.indexOf('image/') > -1) {
//       const imgElement = document.createElement('img')
//       imgElement.src = URL.createObjectURL(file)
//       imgElement.addEventListener('load', function () {
//         resolve({
//           type: 'image',
//           height: imgElement.width || 0,
//           width: imgElement.height || 0
//         })
//       })
//     } else {
//       resolve({
//         type: 'none'
//       })
//     }
//   })
//   return getVideoInfo
// }
// 删除一个作品的回调
function delItem(item) {
  console.log('删除视频', item)
  updateWork({ id: item.id, isDelete: 1, bizShow: 1 })
    .then(res => {
      if (res.success) {
        ElMessage({ type: 'success', message: '删除成功' })
        resetSearch()
      }
    })
    .catch(() => {
      ElMessage({ type: 'error', message: '删除失败' })
    })
}
// 使用次数(作品大小)验证
// function validationSearchForm(min, max) {
//   if (max && max < min) {
//     return min
//   } else if (max === 0 && max < min) {
//     return min
//   }
// }
// 导入的下拉菜单
// const importRecordList = ref([
//   {
//     command: 'kjl',
//     name: '酷家乐视频'
//   },
//   {
//     command: 'record',
//     name: '导入记录'
//   }
// ])

const KJLDialog = reactive({
  show: false
})
// 导入--下拉菜单的指令
const handleCommand = throttle(function (command) {
  switch (command) {
    case 'kjl':
      console.log(command)
      KJLDialog.show = true
      break
    case 'record':
      toRecord()
      break
  }
}, 700)
// 导入成功的弹窗
const showSuccessDialog = reactive({
  show: false
})
function showSuccessFun() {
  showSuccessDialog.show = true
}

// const emits = defineEmits(['changeTab'])
// function changeTabFun(e) {
//   emits('changeTab', e)
// }
// 跳转到导入记录
const router = useRouter()
const toRecord = throttle(function () {
  router.push({
    path: '/content_center/work_library/import_record'
  })
}, 700)
</script>

<style lang="scss" scoped>
.work_library {
  :deep(.item_label) {
    flex-basis: auto;
    width: auto;
    margin-right: 14px;
    text-align: right;
  }
}
.bgk {
  background: #364fcd;
  overflow: hidden;
  border-radius: 4px;
}
.manage_table {
  padding: 14px 0px;
  background: #fff;
  margin-top: 10px;
  position: relative;
  :deep(.el-tabs__item.is-active) {
    color: #303133;
    font-weight: 600;
  }
  :deep(.el-tabs__header) {
    padding: 16px 24px 0 24px;
    background-color: #fff;
    border-radius: 5px;
  }
  :deep(.el-tabs__item.is-active) {
    color: #303133;
    font-weight: 600;
  }
  .action_btn {
    position: absolute;
    top: 18px;
    right: 24px;
    display: flex;
    .btn {
      margin-right: 24px;
    }
    .right_choice {
      cursor: pointer;

      width: 78px;
      height: 32px;
      overflow: hidden;
      display: flex;
      background: #f6f7f8;

      .table_choice {
        padding: 8px 11px;
        img {
          width: 16px;
          height: 16px;
        }
      }
    }
  }
  .tab_box {
    background: #fff;
    .tab_label {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      img {
        display: flex;
        width: 14px;
        height: 14px;
      }
    }
  }
}
.add_item .item_box {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}
:deep(.add_item .el-input.el-input--default) {
  width: 108px;
}
:deep(.add_item .el-input__inner) {
  border: 0;
  padding: 0 11px 0 11px;
  text-align: center;
}
:deep(.el-input-number__increase) {
  display: none !important;
  width: 0 !important;
}
:deep(.el-input-number__decrease, ) {
  display: none !important;
  width: 0 !important;
}
:deep(.el-input-number) {
  width: auto !important;
}
</style>
