<template>
  <div class="work_library" :style="disPageAction ? 'pointer-events: none' : ''">
    <!-- 筛选条件 -->
    <div ref="xmSearchRef1">
      <xm_search
        :searchComponents="searchComponents"
        :useOwnReset="true"
        :showShrink="true"
        @getData="querySearch"
        @reset="resetSearch"
        ref="xmSearchRef"
        @openChoseLabel="openChoseLabel"
        @updateShrink="updateShrink"
      >
        <template #labelTip>
          <el-tooltip
            class="item"
            effect="dark"
            content=""
            placement="bottom"
            v-if="systemVersion == 3"
          >
            <template #content>
              <div style="max-width: 400px">
                开启开关后，素材将在小程序【素材宝典】模块内开放给员工下载
              </div>
            </template>
            <img
              src="@/assets/images/content_center/tip_line.png"
              style="width: 14px; height: 14px; margin-left: 5px"
              alt
            />
          </el-tooltip>
        </template>
      </xm_search>
    </div>
    <div
      class="library_page"
      :style="{
        height: contentHeight + 'px'
      }"
      v-loading="changeFileLoading"
    >
      <div class="library_left">
        <filesDOM
          v-if="refreshTree"
          ref="filesRef"
          origin="finishProduct"
          :showDropDown="true"
          :hideFileIcon="true"
          @updateId="updateChooseId"
        />
      </div>
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
          <!-- <el-upload
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
        </el-upload> -->
          <el-button
            v-if="!tableBatchInfo.showBatch"
            type="primary"
            :loading="fileLoading"
            @click="showUploadBatch"
          >
            上传
          </el-button>
          <el-button
            v-if="!tableBatchInfo.showBatch && false"
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
          <div class="batch-operation" v-if="tableBatchInfo.showBatch">
            <el-dropdown popper-class="xm_dropDown" @command="handleCommandRemove">
              <!-- <div class="batch_icon_box">
                <img
                  class="batch_icon"
                  src="https://tagvv-1256030678.file.myqcloud.com/202404025j615.png"
                  alt=""
                />
              </div> -->
              <el-button>
                移动
                <el-icon class="el-icon--right"><i-arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="1">批量移动选中素材</el-dropdown-item>
                  <el-dropdown-item command="2">批量移动搜索出的所有素材</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <!-- <el-dropdown  popper-class="xm_dropDown" @command="handleCommandBatch">
              <el-button type="primary">
                {{ select1 }}
                <el-icon class="el-icon--right"><i-arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="1">去标选中素材</el-dropdown-item>
                  <el-dropdown-item command="2">去标搜索出的所有素材</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown> -->
            <el-dropdown popper-class="xm_dropDown" @command="handleCommandAddTag">
              <!-- <div class="batch_icon_box">
                <img
                  class="batch_icon"
                  src="https://tagvv-1256030678.file.myqcloud.com/20240402aipbr.png"
                  alt=""
                />
              </div> -->
              <el-button>
                打标/去标
                <el-icon class="el-icon--right"><i-arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="1">批量打标选中素材</el-dropdown-item>
                  <el-dropdown-item command="2">批量打标搜索出的所有素材</el-dropdown-item>
                  <el-dropdown-item command="3">批量去标选中素材</el-dropdown-item>
                  <el-dropdown-item command="4">批量去标搜索出的所有素材</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-dropdown popper-class="xm_dropDown" @command="handleCommandDelete">
              <!-- <div class="batch_icon_box">
                <img
                  class="batch_icon"
                  src="https://tagvv-1256030678.file.myqcloud.com/20240402dty1i.png"
                  alt=""
                />
              </div> -->
              <el-button>
                删除
                <el-icon class="el-icon--right"><i-arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="1">批量删除选中素材</el-dropdown-item>
                  <el-dropdown-item command="2">批量删除搜索出的所有素材</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-dropdown popper-class="xm_dropDown" @command="handleCommandDown">
              <el-button>
                下载
                <el-icon class="el-icon--right"><i-arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="1">批量下载选中素材</el-dropdown-item>
                  <el-dropdown-item command="2">批量下载搜索出的所有素材</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-dropdown
              :disabled="generateDialog.loading"
              popper-class="xm_dropDown"
              @command="handleCommandGenerate"
            >
              <el-button :loading="generateDialog.loading">
                生成发布二维码
                <el-icon class="el-icon--right"><i-arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="1">将选中的素材生成二维码</el-dropdown-item>
                  <el-dropdown-item command="2">将搜索出的所有素材生成二维码</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <el-switch
            style="margin: 0 12px 0 16px"
            v-model="tableBatchInfo.showBatch"
            inline-prompt
            :width="45"
            :before-change="beforeBatchChange"
          ></el-switch>
          <span style="color: #909399">批量操作</span>
        </div>
        <manageCard
          ref="manageCardRef"
          :changeFileLoading="changeFileLoading"
          :page="tableForm.page"
          :videoData="tableForm.videoData"
          :batchInfo="tableBatchInfo"
          @getList="getList"
          @delItem="delItem"
          @batchSelect="batchSelect"
          @showRemoveFun="showRemoveFun"
        ></manageCard>
      </div>
    </div>
    <addKJLDialog
      v-if="KJLDialog.show"
      :addDialog="KJLDialog"
      @showSuccessFun="showSuccessFun"
    ></addKJLDialog>
    <successDialog
      v-if="showSuccessDialog.show"
      :successDialog="showSuccessDialog"
      @upList="querySearch"
    ></successDialog>
    <!-- @changeTabFun="changeTabFun" -->
    <addTagDOM v-if="addTagDialog.show" :addDialog="addTagDialog" @updateTag="updateTag" />
    <!-- 批量上传/操作 -->
    <uploadBatch
      ref="uploadBatchRef"
      v-if="uploadBatchInfo.show"
      :infoDialog="uploadBatchInfo"
      @ope="batchOpeFn"
      @close="closeUploadBatch"
      @batchOpeSuccess="batchOpeSuccess"
    />
    <!-- 移动到文件夹的弹窗 -->
    <removeDOM
      origin="finishProduct"
      v-if="removeDialog.show"
      :removeDialog="removeDialog"
      @removeSuccessFun="removeSuccessFun"
      @closeDialog="closeClickIdByDialog"
    />
    <!-- 批量生成二维码的弹窗 -->
    <generateDOM
      origin="finishProduct"
      v-if="generateDialog.show"
      :generateDialog="generateDialog"
      @close="closeUploadBatch(true)"
    />
  </div>
</template>

<script setup>
import generateDOM from '../components/generate_dialog.vue'
import removeDOM from '@/views/sumvideo/components/files/file_remove_dialog.vue'
// import filesDOM from '@/views/sumvideo/components/files/files.vue'
import filesDOM from '@/views/sumvideo/components/files/choose_file_tree.vue'
import { setBusinessChooseParam } from '@/utils/search.js'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
// import OSS from 'ali-oss'
// detail
// import { getSts } from '@/api/content_center/material_library.js'
// import { updateWork, uploadWork } from '@/api/content_center/content_repository.js'
import {
  updateWork,
  batchAddTagOrDel,
  saveBatch,
  getWorkLibraryListV2,
  createOrUpdateQrCode
} from '@/api/content_center/content_repository.js'
import { downLoadAllFile, cancelDownFile } from '@/utils/batchDownloadFile.js'

import manageCard from './manage_card.vue'
import { pageList } from '../model/get_works_listV2.js'
import { throttle, getCHeight, isEmpty } from '@/utils/tools.js'
import { ElMessageBox, ElMessage } from 'element-plus'

import addKJLDialog from '../components/addKJL_dialog.vue'
import successDialog from '../components/success_dialog.vue'
import addTagDOM from '@/views/content_center/content_repository/components/addTag_dialog.vue'
import uploadBatch from '@/views/sumvideo/creative_elements/components/upload_batch.vue'

const {
  chooseFileId,
  changeFileLoading,
  searchComponents,
  searchComponents1,
  tableForm,
  getList,
  chooseTab,
  tabDetail,
  useTimesOk,
  isUseTimesOk,
  workSizeOk,
  isWorkSizeOk,
  systemVersion,
  getImgTextDownloadList,
  getBatchActionCondition
} = pageList()
const { tabList, sortMethods } = toRefs(tabDetail) // currentIndex,
const uploadBatchInfo = reactive({
  show: false, // 是否显示
  uploadAccept: '', // 接收的上传类型
  title: '', // 标题
  uploadBtnText: '', // 上传素材/素材按钮文案
  cancelBtnText: '', // 取消按钮文案
  confirmBtnText: '', // 提交按钮文案
  littleTips: '', // 上传素材/素材按钮描述
  origin: 'finishProductStore', // 来源 素材库
  type: '', // 素材/素材上传upload 批量操作allMarking
  batchItem: -1, // 当type="allMarking"时传入；1 去标选中创意元素 2 去标搜索出的所有创意元素 3 打标选中创意元素 4 打标搜索出的所有创意元素 5 删除选中创意元素 6 删除搜索出的所有创意元素
  batchOperationArr: [], // 当type="allMarking"&&batchItem='1||3||5' 时传入；需要批量操作的数据列表
  totalList: 0 // 数据总条数 当type="allMarking"&&batchItem='2||4||6' 时传入；需要批量操作的数据条数
})
const addTagDialog = reactive({
  show: false,
  id: null,
  hideTitleSpan: false,
  type: null,
  chooseTagList: [],
  index: [],
  source: null
})
// const headers = ref({
//   'X-Requested-With': 'XMLHttpRequest',
//   token: localStorage.getItem('token'),
//   brandId: localStorage.getItem('brandInfo')
//     ? JSON.parse(localStorage.getItem('brandInfo')).brandId
//     : '',
//   userId: localStorage.getItem('userInfo')
//     ? JSON.parse(localStorage.getItem('userInfo')).userId
//     : ''
// })

const manageCardRef = ref(null)
const select1 = '批量去标'
const select2 = '批量打标'
const select3 = '批量删除'
const select4 = '移动到文件夹'
const select5 = '批量下载'
const select6 = '批量生成'
const batchChose = [1, 3, 5, 7, 9, 11]
const batchAll = [2, 4, 6, 8, 10, 12]

const uploadBatchRef = ref(null)
const fileLoading = ref(false)
const tableBatchInfo = reactive({
  showBatch: false // 是否显示批量操作
})

// 列表为空不能打开批量操作开关
function beforeBatchChange() {
  return new Promise(resolve => {
    if (!tableBatchInfo.showBatch) {
      if (tableForm.videoData && tableForm.videoData?.records.length > 0) {
        resolve(true)
      } else {
        message.warning('暂无数据')
        resolve(false)
      }
    } else {
      clearBatch()
      resolve(true)
    }
  })
}

// 批量操作选择
function batchSelect(list) {
  tableForm.choseList = list
}

// 清除选择的数据
function clearBatch(hideBatch = false) {
  if (hideBatch) tableBatchInfo.showBatch = false
  tableForm.choseList = []
  uploadBatchInfo.batchOperationArr = []
  manageCardRef && manageCardRef.value.clearBatch()
}

// 打开批量上传弹窗
function showUploadBatch() {
  uploadBatchInfo.uploadAccept = '.jpeg, .jpg, .png, .gif,video/mp4,video/quicktime'
  uploadBatchInfo.title = '上传素材'
  uploadBatchInfo.uploadBtnText = '添加素材'
  uploadBatchInfo.cancelBtnText = '取消'
  uploadBatchInfo.confirmBtnText = '确定上传'
  uploadBatchInfo.littleTips =
    '支持批量添加，每次最多选择50个文件，图片支持：jpg/jpeg/png/gif，大小不超过15M，视频支持：mp4/mov，大小不超过500M。'
  uploadBatchInfo.type = 'upload'
  uploadBatchInfo.hideFile = true
  uploadBatchInfo.chooseFileId = chooseFileId.value || '0' // 上传到具体文件夹
  uploadBatchInfo.show = true
}
// 打开批量操作弹窗
function showOpeBatch(info) {
  uploadBatchInfo.show = true
  uploadBatchInfo.cancelBtnText = '取消'
  uploadBatchInfo.confirmBtnText = '确定'
  uploadBatchInfo.littleTips = '' // 不显示
  uploadBatchInfo.origin = 'finishProductStore'
  uploadBatchInfo.type = 'allMarking'
  uploadBatchInfo.batchItem = info.batchItem
  uploadBatchInfo.title = info.title
  uploadBatchInfo.batchOperationArr = info.list
  uploadBatchInfo.totalList = info.totalList
}
const filesRef = ref()
function closeUploadBatch(refresh = false, refreshFile = false) {
  // 如果上传弹窗中新建了文件夹，那关闭弹窗要更新文件夹
  if (refreshFile) {
    filesRef.value?.refreshFun()
  }
  uploadBatchInfo.show = false
  if (refresh) {
    querySearch()
  }
}
function batchOpeSuccess(batchItem) {
  const text = batchItem === 5 || batchItem === 6 ? '删除成功！' : '操作成功！'
  message.success(text)
  beforeBatchChange()
  querySearch()
  if (uploadBatchInfo.type === 'upload') {
    uploadBatchInfo.chooseFileId = null
  }
}

const handleCommandRemove = command => {
  if (command === '1') {
    optionChange(7)
  } else if (command === '2') {
    optionChange(8)
  }
}

const handleCommandDown = command => {
  if (command === '1') {
    console.log('下载选择')
    optionChange(9)
  } else if (command === '2') {
    console.log('xiazaisuoyou')
    optionChange(10)
  }
}

const handleCommandGenerate = command => {
  if (command === '1') {
    optionChange(11)
  } else if (command === '2') {
    optionChange(12)
  }
}
// const handleCommandBatch = command => {
//   if (command === '1') {
//     optionChange(1)
//   } else if (command === '2') {
//     optionChange(2)
//   }
// }
const handleCommandAddTag = command => {
  if (command === '1') {
    optionChange(3)
  } else if (command === '2') {
    optionChange(4)
  } else if (command === '3') {
    optionChange(1)
  } else if (command === '4') {
    optionChange(2)
  }
}
const handleCommandDelete = command => {
  if (command === '1') {
    optionChange(5)
  } else if (command === '2') {
    optionChange(6)
  }
}

function optionChange(item) {
  if (batchChose.includes(item) && tableForm.choseList.length <= 0)
    return message.warning('请先勾选素材')
  const info = {
    batchItem: item, // 1 去标选中创意元素 2 去标搜索出的所有创意元素 3 打标选中创意元素 4 打标搜索出的所有创意元素 5 删除选中创意元素 6 删除搜索出的所有创意元素  7移动选中素材 8移动搜索出的所有素材
    title: '批量操作',
    list: [], // 批量操作的数据
    totalList: 0
  }
  info.title =
    item === 1 || item === 2
      ? select1
      : item === 3 || item === 4
      ? select2
      : item === 5 || item === 6
      ? select3
      : item === 7 || item === 8
      ? select4
      : item === 9 || item === 10
      ? select5
      : item === 11 || item === 12
      ? select6
      : '未知操作'
  info.list = tableForm.choseList || []
  if (batchAll.includes(item)) {
    info.list = []
    info.totalList = tableForm.page.total
  }
  // batchAbout.dataList = []
  // batchAbout.dataList = batchOperationArr.value
  // clickShow('allMarking', title)
  if (item === 7 || item === 8) {
    uploadBatchInfo.batchOperationArr = info.list
    showBatchRemoveFun(item)
  } else if (item === 9 || item === 10) {
    console.log('item', item, info.totalList, info.list)
    // const hasImgText = info.list.filter(x => x.type === 99)
    // console.log(hasImgText)
    // if (hasImgText && hasImgText.length > 0) {
    //   message.warning('暂不支持批量下载图文类型的素材')
    // } else {
    batchDownLoadFun(item, item === 9 ? info.list.length : info.totalList)
    // }
  } else if (item === 11 || item === 12) {
    uploadBatchInfo.batchOperationArr = info.list
    batchGenerateFun(item)
  } else {
    showOpeBatch(info)
  }
}

const generateDialog = ref({
  loading: false, // 生成二维码的loading
  show: false // 显示二维码弹窗
})
const disPageAction = ref(false) // 是否禁用该页面的所有点击事件

// 批量生成二维码
function batchGenerateFun(type) {
  disPageAction.value = true
  generateDialog.value.loading = true
  if (type === 11) {
    if (uploadBatchInfo.batchOperationArr && uploadBatchInfo.batchOperationArr.length > 0) {
      const ids = []
      uploadBatchInfo.batchOperationArr.forEach(item => {
        ids.push(item.id)
      })
      createGenerateFun({
        materialIds: ids,
        isAll: false
      })
    } else {
      disPageAction.value = false
      generateDialog.value.loading = false
      message.warning('您未选择素材')
    }
  } else {
    createGenerateFun({
      materialCondition: getBatchActionCondition(),
      isAll: true
    })
  }
}
// 调用创建二维码的接口
function createGenerateFun(params) {
  createOrUpdateQrCode(params)
    .then(res => {
      if (res.code === 0) {
        disPageAction.value = false
        generateDialog.value = {
          qrId: res.data?.qrId,
          info: res.data || {},
          show: true
        }
        generateDialog.value.loading = false
      } else {
        disPageAction.value = false
        generateDialog.value.show = false
        generateDialog.value.loading = false
      }
    })
    .catch(() => {
      disPageAction.value = false
      generateDialog.value.show = false
      generateDialog.value.loading = false
    })
}
function batchDownLoadFun(type, total) {
  // 排除文本类型，其他拿到url进行下载
  ElMessageBox.confirm(
    `已选择 ${total} 条素材，${total > 50 ? '单次下载不超过 50 条，' : ''}是否下载${
      total > 50 ? '前 50 条素材' : '选中素材'
    }？<br/><span style="line-height: 30px;font-size:13px;color:#606266">注：图文素材将作为多条素材进行下载</span>`,
    '批量下载',
    {
      dangerouslyUseHTMLString: true,
      showCancelButton: true,
      closeOnClickModal: false,
      confirmButtonText: '下载',
      cancelButtonText: '取消',
      type: '',
      customClass: 'xm_dialog_messageBox',
      beforeClose: (action, instance, done) => {
        if (action === 'confirm') {
          instance.confirmButtonLoading = true
          instance.confirmButtonText = '下载'
          secondDownloadFun(instance, done, type)
        } else {
          cancelDownFile()
          done()
        }
      }
    }
  ).then(async () => {})
}

// 下载第二步：获取选中的前50素材列表
function secondDownloadFun(instance, done, type) {
  let urlList = []
  const idList = []
  let list = []
  // 选中的素材
  if (type === 9) {
    list = (tableForm.choseList || []).slice(0, 50)
    list.forEach(x => {
      idList.push({
        cId: x.id,
        useWay: 21
      })
      if (x.type === 99) {
        urlList = urlList.concat(getImgTextDownloadList(x))
      } else {
        urlList.push({
          name: x.name,
          url: x.url,
          content: x.content
        })
      }
    })
    lastDownLoadFun(urlList, idList, instance, done)
  } else {
    // 筛选出的所有素材
    const params = getBatchActionCondition()
    params.pageNo = 1
    params.pageSize = 50
    // 发送请求
    getWorkLibraryListV2(params).then(res => {
      if (res.code === 0) {
        list = res.data.records || []
        list.forEach(x => {
          idList.push({
            cId: x.id,
            useWay: 21
          })
          if (x.type === 99) {
            urlList = urlList.concat(getImgTextDownloadList(x))
          } else {
            urlList.push({
              name: x.name,
              url: x.url,
              content: x.content
            })
          }
        })
        lastDownLoadFun(urlList, idList, instance, done)
      }
    })
  }
}

// 下载第三步：开始下载
function lastDownLoadFun(urlList, idList, instance, done) {
  downLoadAllFile(urlList, 'finishProduct', instance)
    .then(() => {
      message.success(`下载成功`)
      saveBatch(idList)
      done()
      setTimeout(() => {
        instance.confirmButtonLoading = false
      }, 300)
    })
    .catch(() => {
      done()
      setTimeout(() => {
        instance.confirmButtonLoading = false
      }, 300)
    })
}
function showBatchRemoveFun(type) {
  console.log('sdhow', type)
  if (type === 7) {
    if (uploadBatchInfo.batchOperationArr && uploadBatchInfo.batchOperationArr.length > 0) {
      const ids = []

      const deleteFileIds = []
      uploadBatchInfo.batchOperationArr.forEach(item => {
        ids.push(item.id)
      })
      showRemoveFun(true, ids, null, deleteFileIds || [], false)
    } else {
      message.warning('您未选择素材')
    }
  } else {
    showRemoveFun(true, [], null, [], true)
  }
}
// 选择的批量操作
function batchOpeFn(batchItem, tags) {
  const choseIds = []
  tableForm.choseList &&
    tableForm.choseList.forEach(item => {
      choseIds.push(item.id)
    })
  const params = {
    isAll: false, // 是否全选 true/false，默认 false
    // ids: [],// 作品ids，全选时忽略
    isDel: 0 //	是否删除作品 1删除 0不删除
    // tags: null, //	打标ids，去除打标传 []，不操作传 null
    // tagOpType：-1 // 1仅去标 2仅加标 3替换为指定的
  }
  switch (batchItem) {
    case 1:
      params.tagOpType = 1
      params.ids = choseIds
      params.tags = tags
      break
    case 2:
      params.tagOpType = 1
      params.isAll = true
      params.tags = tags
      break
    case 3:
      params.tagOpType = 2
      params.ids = choseIds
      params.tags = tags
      break
    case 4:
      params.tagOpType = 2
      params.isAll = true
      params.tags = tags
      break
    case 5:
      params.ids = choseIds
      params.isDel = 1

      break
    case 6:
      params.isAll = true
      params.isDel = 1
      break
    default:
      break
  }

  if (batchAll.includes(batchItem)) {
    // const data = getQuery(searchComponents.value, ['createTimeMin', 'createTimeMax'])
    // const condition = {
    //   folderIds: [chooseFileId.value || '0'],
    //   createTimeMax: data.createTimeMax,
    //   createTimeMin: data.createTimeMin,
    //   name: data.name || '',
    //   batchNumber: data.batchNumber || '',
    //   isOpen: data.isOpen,
    //   type: data.type ? [data.type] : null,
    //   pipelineTaskName: data.pipelineTaskName,
    //   sources: data.type && data.type === 99 ? [16] : data.sources ? [data.sources] : null,
    //   tags1: data.tags1,
    //   templateName: data.templateName,
    //   useTimesMax: data.useTimesMax,
    //   useTimesMin: data.useTimesMin,
    //   isDelete: 0,
    //   orderSetting: 'DESC:create_time'
    // }
    // if (condition.sources && condition.sources.includes(1)) {
    //   condition.subSource = 12
    //   condition.sources = null
    // } else {
    //   condition.subSource = null
    // }
    params.condition = getBatchActionCondition()
  }
  batchAddTagOrDelFn(params, batchItem)
}
// 批量操作
function batchAddTagOrDelFn(params, batchItem) {
  batchAddTagOrDel(params)
    .then(res => {
      if (res.code === 0) {
        uploadBatchRef?.value.batchOpeSuccess(batchItem)
      }
    })
    .catch(() => {
      uploadBatchRef?.value.batchOpeCatch(batchItem)
    })
}

// 打开设置标签弹窗
function openChoseLabel() {
  addTagDialog.type = 12
  addTagDialog.hideTitleSpan = true
  addTagDialog.id = null
  addTagDialog.index = []
  addTagDialog.source = null
  addTagDialog.chooseTagList = tableForm.tags1 || []
  addTagDialog.show = true
}
// 更新标签
function updateTag(e) {
  console.log('选择回调e', e)
  tableForm.tags1 = e
  const arr = ref([])
  tableForm.tags1.forEach(item => {
    arr.value.push(item.id)
  })
  const index = searchComponents.value.findIndex(x => x.type === 'newLabelFilter')
  searchComponents.value[index].val = arr.value
}

// 更新选中的文件夹ID
function updateChooseId(e) {
  if (!changeFileLoading.value) {
    console.log('更新选中的文件夹', e)
    changeFileLoading.value = true
    chooseFileId.value = e
    querySearch()
  }
}

// 查询的回调
const querySearch = throttle(function () {
  clearBatch(true)
  tableForm.page.index = 1
  getList()
}, 500)
// 清空查询参数
function clearSearchQuery() {
  console.log('tableForm', tableForm)
  tableForm.minNum = undefined
  tableForm.maxNum = undefined
  tableForm.maxCapacity = undefined
  tableForm.minCapacity = undefined
  tableForm.tags1 = []
  tableForm.page = {
    loading: true,
    index: 1,
    size: 24,
    total: 0
  }
  tableForm.choseList = []
}
// 重置的回调
const resetSearch = throttle(function () {
  clearBatch(true)
  clearSearchQuery()
  isWorkSizeOk()
  isUseTimesOk()
  getList()
}, 500)
clearSearchQuery()
const xmSearchRef = ref(null)
const refreshTree = ref(true) // 重新加载文件夹树
const menuOfKeepAlive = inject('$menuOfKeepAlive')
onActivated(() => {
  console.log("menuOfKeepAlive('judge')", menuOfKeepAlive('judge'))
  if (menuOfKeepAlive('judge')) {
    tableForm.page.loading = true
    changeFileLoading.value = true
    workSizeOk.value = true
    useTimesOk.value = true
    refreshTree.value = false
    chooseFileId.value = null
    nextTick(() => {
      refreshTree.value = true

      if (xmSearchRef.value) {
        xmSearchRef.value?.reset()
        xmSearchRef.value?.clearShrink()
      } else {
        resetSearch()
      }
    })

    menuOfKeepAlive('reset')
  } else {
    getList()
  }
  // 为保证业务主体是最新的，
  const businessChooseObj = {}
  searchComponents.value.forEach(item => {
    if (!item.hiddenItem) {
      if (item.type === 'chooseBusiness' || item.type === 'chooseBusinessGroup') {
        const info = {
          ids: item.ids || [],
          isCheckAll: item.isCheckAll || false
        }
        businessChooseObj[item.principalType] = info
      }
    }
  })
  if (isEmpty(businessChooseObj)) {
    const list = setBusinessChooseParam(businessChooseObj, true)
    searchComponents.value = searchComponents1.value.concat(list)
  }
})
onBeforeUnmount(() => {
  chooseFileId.value = null
})
// 页面里开的时候 清空分组组件
onBeforeRouteLeave((to, from) => {
  if (to.path !== '/sumwhy_video/finish_product_store/works_detail') {
    searchComponents.value = []
    nextTick(() => {
      searchComponents.value = searchComponents1.value
    })
  }
})
// tab切换的回调
function changeTab(val, event) {
  clearBatch(true)
  sortMethods.value = val.props.name
  getList()
}
// const upload = ref()
const message = inject('$message')
// let mutipImg = 0
// let uploadNum = 0
// let clickTime = ''
// 作品上传前的回调
// function beforUpload(file) {
//   const size = file.size
//   if (size > 419430400) {
//     mutipImg = 0
//     message({
//       type: 'warning',
//       message: '作品大小不能超过400M'
//     })

//     upload.value.clearFiles()
//     tableForm.page.loading = false
//     fileLoading.value = false
//     return false
//   } else if (file.type.indexOf('video/') === -1) {
//     mutipImg = 0
//     message({
//       type: 'warning',
//       message: '只能上传素材相关的作品哦~'
//     })
//     upload.value.clearFiles()
//     tableForm.page.loading = false
//     fileLoading.value = false
//     return false
//   } else {
//     mutipImg++

//     tableForm.page.loading = true
//     fileLoading.value = true
//   }
// }
// 上传作品超过限制的回调
// function handleExceed(files, fileList) {
//   console.log(files, fileList)
//   console.log(files)
//   if (files.length > 20) {
//     ElMessage.warning('单次最多选择20个作品！')
//     upload.value.clearFiles()
//   }
// }
// 上传一个作品成功的回调
// function handleVideoSuccess(res, item) {
//   console.log(res)
//   if (res) {
//     if (res.code === 0) {
//       uploadNum++
//       if (uploadNum >= mutipImg) {
//         mutipImg = 0
//         uploadNum = 0
//         upload.value.clearFiles()
//         message.success('作品上传成功')
//         fileLoading.value = false
//         resetSearch()
//       }
//     } else {
//       mutipImg = 0
//       uploadNum = 0
//       message.warning('作品上传失败')
//       tableForm.page.loading = false
//       fileLoading.value = false
//     }
//   }
// }
// 素材上传失败的回调
// function handleUploadError() {
//   mutipImg = 0
//   uploadNum = 0
//   fileLoading.value = false
//   // ElMessage({ type: 'error', message: '作品上传失败' })
//   tableForm.page.loading = false
//   upload.value.clearFiles()
// }

// function handleUpload() {
//   // 最近一次上传的表示
//   clickTime = new Date().getTime() + ''
// }

// 生成GUID 唯一值
// function guid() {
//   return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
//     .replace(/[xy]/g, function (c) {
//       const r = (Math.random() * 16) | 0
//       const v = c === 'x' ? r : (r & 0x3) | 0x8
//       return v.toString(16)
//     })
//     .replace(/-/g, '')
// }
// async function putObject(data, file) {
//   try {
//     const client = new OSS({
//       // yourRegion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
//       region: data.region,
//       secure: true, //* 这句话很重要！！！！！！！！！
//       endpoint: data.endPoint, // 这句话更重要,不设置为报错。STS接入地址，例如sts.cn-hangzhou.aliyuncs.com。
//       // 从STS服务获取的临时访问密钥（AccessKey ID和AccessKey Secret）。
//       accessKeyId: data.stsData.credentials.accessKeyId,
//       accessKeySecret: data.stsData.credentials.accessKeySecret,
//       // 从STS服务获取的安全令牌（SecurityToken）。
//       stsToken: data.stsData.credentials.securityToken,
//       // refreshSTSToken: async () => {
//       //   console.log('过期')
//       //   // 向您搭建的STS服务获取临时访问凭证。
//       //   const info = await fetch('your_sts_server')
//       //   return {
//       //     accessKeyId: info.accessKeyId,
//       //     accessKeySecret: info.accessKeySecret,
//       //     stsToken: info.stsToken
//       //   }
//       // },
//       // // 刷新临时访问凭证的时间间隔，单位为毫秒。
//       refreshSTSTokenInterval: 300000,
//       timeout: 600000,
//       // 填写Bucket名称。
//       bucket: data.bucketName
//     })
//     const point = file.name.lastIndexOf('.')
//     // const fileName = file.name.substr(0, point)
//     const name = 'xm/file/' + guid() + '_' + clickTime + file.name.substr(point)
//     return await client.put(name, file)
//   } catch (e) {
//     console.log(e)
//   }
// }
// async function handleRequest(option) {
//   console.log('handleRequest', option)
//   if (option.file.size <= 419430400 && option.file.type.indexOf('video/') > -1) {
//     const res = await getSts()
//     if (res.code === 0) {
//       putObject(res.data, option.file).then(resPut => {
//         if (resPut) {
//           console.log('handleRequest-resPut', resPut)
//           const point = option.file.name.lastIndexOf('.')
//           const fileName = option.file.name.substr(0, point)
//           // 获取这个文件是不是最近一次上传的，如果不是就不掉接口
//           const namePoit = resPut.name.lastIndexOf('_')
//           const namePonita = resPut.name.substr(namePoit + 1)
//           const namePonitab = namePonita.split('.')

//           if (fileLoading.value && namePonitab[0] === clickTime) {
//             const uploadForm = {
//               fileFormat: option.file.type,
//               fileKey: resPut.name,
//               url: decodeURIComponent(resPut.url),
//               name: fileName,
//               size: option.file.size
//             }
//             // getFileInfo(option.file)
//             //   .then(resFile => {
//             //     console.log('resFile', resFile)
//             //     if (resFile.type !== 'none') {
//             //       switch (resFile.type) {
//             //         case 'video':
//             //           uploadForm.wight = resFile.width
//             //           uploadForm.height = resFile.height
//             //           uploadForm.duration = resFile.duration ? parseInt(resFile.duration * 1000) : 0
//             //           break
//             //         case 'audio':
//             //           uploadForm.duration = resFile.duration ? parseInt(resFile.duration * 1000) : 0
//             //           break
//             //         case 'image':
//             //           uploadForm.wight = resFile.width
//             //           uploadForm.height = resFile.height
//             //           break
//             //       }
//             //       uploadFile(uploadForm, option)
//             //     } else {
//             //       uploadFile(uploadForm, option)
//             //     }
//             //   })
//             //   .catch(() => {
//             //     uploadFile(uploadForm, option)
//             //   })
//             uploadFile(uploadForm, option)
//           }
//         } else {
//           option.onError()
//         }
//       })
//     }
//   }
// }
// 上传文件给后端
// function uploadFile(uploadForm, option) {
//   uploadWork(uploadForm)
//     .then(resUpload => {
//       option.onSuccess(resUpload, option.file)
//     })
//     .catch(() => {
//       option.onError()
//     })
// }
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
  console.log('删除素材', item)
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
//     name: '酷家乐素材'
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
const xmSearchRef1 = ref()
const contentHeight = ref(80) // 178
function getWidth() {
  contentHeight.value = getCHeight() - 10 - 16 - (xmSearchRef1.value?.offsetHeight || 80)
}
onMounted(() => {
  getWidth()
  window.onresize = () => {
    getWidth()
  }
})

onUnmounted(() => {
  window.onresize = null
})

// 筛选项折叠/展开
function updateShrink() {
  nextTick(() => {
    getWidth()
  })
}
const pageClickId = ref(null) // 页面点击的是哪个id
const removeDialog = reactive({
  show: false
})
// 打开移动弹窗 isBatchRemove 是否批量 materialIds选中的作品id列表 index单个操作时选中的index isBatchSearch是否是批量移动搜索出来的
function showRemoveFun(isBatchRemove, materialIds, index, deleteFileIds, isBatchSearch) {
  console.log('打开移动弹窗', isBatchRemove, materialIds, index, deleteFileIds)
  let condition = null
  if (!isBatchRemove) {
    pageClickId.value = materialIds[0]
  } else {
    condition = getBatchActionCondition()
  }
  removeDialog.isBatchRemove = isBatchRemove
  removeDialog.onlyRemoveFile = false
  removeDialog.materialIds = materialIds || []
  removeDialog.deleteFileIds = deleteFileIds || []
  removeDialog.fileId = null
  removeDialog.parentId = null
  removeDialog.index = isBatchRemove ? null : index
  removeDialog.isBatchSearch = isBatchSearch
  removeDialog.condition = isBatchSearch ? condition : null
  removeDialog.show = true
}
function removeSuccessFun(id, info) {
  console.log(
    '移动成功',
    id,
    info,
    removeDialog,
    tableForm.videoData.records,
    tableForm.videoData.records[removeDialog.index]
  )
  if (removeDialog.isBatchRemove) {
    beforeBatchChange()
    querySearch()
  } else {
    // 如果当前左侧文件夹列表选中的不是根文件夹，那移动成功后就刷新列表
    if (chooseFileId.value !== '0') {
      querySearch()
    } else {
      // 否则就直接更新文件夹名称
      if (id === '0') {
        tableForm.videoData.records[removeDialog.index].folderList = []
      } else {
        if (id !== removeDialog.fileId && info && info.name) {
          tableForm.videoData.records[removeDialog.index].folderList = [info]
        }
      }
    }
  }
}
function closeClickIdByDialog() {
  pageClickId.value = null
}
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
.el-dropdown {
  .el-button {
    background: #ffffff;
    color: #606266;
  }
  .el-icon {
    color: #c0c4cc;
  }
}
.library_page {
  margin-top: 16px;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  .library_left {
    width: 248px;
    height: 100%;
    background: #ffffff;
    border-radius: 4px;
    margin-right: 16px;
    :deep(.content_content_box) {
      padding-right: 0;
    }
    :deep(.one_left .file_title) {
      width: 100% !important;
    }
  }
}
.manage_table {
  width: calc(100% - 264px);
  height: 100%;
  padding: 14px 0px;
  background: #fff;
  // margin-top: 10px;
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
    align-items: center;
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
    .batch-operation {
      position: absolute;
      top: -1px;
      right: 112px;
      display: flex;
      > div {
        height: 24px;
        line-height: 24px;
        margin-right: 14px;
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
:deep(.xm_dropDown),
:deep(.el-dropdown) {
  .el-button {
    padding: 8px 10px;
  }
}
</style>
