<template>
  <div class="page sumvideo_page">
    <!-- 筛选条件 -->
    <div ref="xmSearchRef">
      <xm_search
        :searchComponents="searchComponents"
        :useOwnReset="true"
        @getData="querySearch"
        @reset="resetSearch"
      ></xm_search>
    </div>
    <div
      v-loading="tableForm.loading"
      class="page_content"
      :style="{
        height: contentHeight + 'px'
      }"
    >
      <!-- tab分区+操作区 -->
      <div class="tab_action_box">
        <el-tabs class="tab_box" v-model="chooseTab" @tab-click="changeTab">
          <el-tab-pane v-for="(tab, i) in tabList" :key="i" :label="tab.label" :name="tab.value">
            <template #label>
              <div class="tab_label">{{ tab.label }}</div>
            </template>
          </el-tab-pane>
        </el-tabs>

        <div class="action_box">
          <el-button v-if="!showBatch" type="primary" @click="showBatchUpload" class="btn">
            上传
          </el-button>
          <div class="action_batch" v-if="showBatch">
            <el-dropdown popper-class="xm_dropDown" @command="handleCommandAddTag">
              <el-button>
                打标/去标
                <el-icon class="el-icon--right"><i-arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="3">批量打标选中资源</el-dropdown-item>
                  <el-dropdown-item :command="4">批量打标搜索出的所有资源</el-dropdown-item>
                  <el-dropdown-item :command="1">批量去标选中资源</el-dropdown-item>
                  <el-dropdown-item :command="2">批量去标搜索出的所有资源</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-dropdown popper-class="xm_dropDown" @command="handleCommandDelete">
              <el-button>
                删除
                <el-icon class="el-icon--right"><i-arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="1">批量删除选中的资源</el-dropdown-item>
                  <el-dropdown-item :command="2">批量删除搜索出的所有资源</el-dropdown-item>
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
                  <el-dropdown-item :command="1">批量下载选中资源</el-dropdown-item>
                  <el-dropdown-item :command="2">批量下载搜索出的所有资源</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <el-switch
            style="margin: 0 12px 0 16px"
            v-model="showBatch"
            inline-prompt
            :width="45"
            :before-change="beforeBatchChange"
          ></el-switch>
          <span style="color: #909399">批量操作</span>
        </div>
      </div>
      <!-- 列表 -->
      <div class="scroll_box" ref="pageScroll">
        <div class="container">
          <template v-if="tableForm.listData && tableForm.listData.length > 0">
            <div
              class="column"
              :infinite-scroll-delay="1000"
              v-infinite-scroll="load"
              :infinite-scroll-distance="50"
              :infinite-scroll-immediate="false"
              :infinite-scroll-disabled="tableForm.listData.length >= tableForm.page.total"
              v-for="(column, index) in columns"
              :key="index"
            >
              <div
                :class="{
                  item: true,

                  xm_item_click: pageClickId == item.id
                }"
                v-for="(item, itemIndex) in column.columnArr"
                :key="item.id"
                :style="{
                  width: `${oneWidth}px`,
                  height: `${oneWidth * (item.specificType == 3 ? 1 : 0.6818)}px`
                }"
                @click.stop="showDetailFun(item, itemIndex, index)"
              >
                <!-- 贴纸 -->
                <div class="one_pic one_item" v-if="item.specificType === 3">
                  <img class="item_cover" :src="item.url" alt="" />
                  <img
                    v-if="item.source === 6"
                    class="item_xm"
                    src="https://tagvv-1256030678.file.myqcloud.com/202410218dz9v.png"
                    alt=""
                  />
                  <!-- <div
                    class="chose-mask"
                    :class="{ 'show-chose-mask': showBatch }"
                    @click.stop="clickBatch(item, $event)"
                  >
                    <div
                      :class="{
                        'select-state': true,
                        'selected-state': chooseList.findIndex(x => x.id == item.id) > -1
                      }"
                    >
                      <div class="state-chose"></div>
                    </div>
                  </div> -->
                  <div class="item_content" v-if="!showBatch">
                    <div class="item_box item_box1">
                      <div class="item_title line-hidden1">
                        {{ item.name || '--' }}
                      </div>
                      <div class="item_status">贴纸</div>
                    </div>
                    <div class="item_parent_box">
                      <fileTag
                        v-if="item.folderList && item.folderList.length > 0 && item.source != 6"
                        class="file_tagbox"
                        :fileName="item.folderList[0].name"
                        :fileInfo="item.folderList[0]"
                        @showRemoveFun="showRemoveFun(item, itemIndex, index)"
                      />
                      <div class="item_box" style="align-items: flex-end">
                        <div class="item_box item_label" style="justify-content: unset">
                          <div v-for="(tag, tagIndex) in item.tagList" :key="tagIndex">
                            {{ tag.name }}
                          </div>
                        </div>
                        <el-tooltip
                          v-if="item.source != 6"
                          effect="dark"
                          content="编辑标签"
                          placement="top"
                        >
                          <div
                            class="item_detail"
                            @click.stop="changeTagFun(item, itemIndex, index)"
                          >
                            <img
                              src="https://tagvv-1256030678.file.myqcloud.com/20230307m325c.png"
                              alt=""
                            />
                          </div>
                        </el-tooltip>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 除贴纸外 -->
                <div class="one_audio one_item" v-else>
                  <div class="one_audio_box">
                    <!-- 4 BGM 5/6 字体  2音效 -->
                    <div class="one_audio_top">
                      <img
                        class="audio_img"
                        :src="
                          item.specificType == 4
                            ? 'https://tagvv-1256030678.file.myqcloud.com/20240925zp39y.png'
                            : item.specificType == 5 || item.specificType == 6
                            ? 'https://tagvv-1256030678.file.myqcloud.com/20240924jgr7j.png'
                            : 'https://tagvv-1256030678.file.myqcloud.com/20240924818a4.png'
                        "
                        alt=""
                      />
                      <img
                        v-if="item.source === 6"
                        class="item_xm"
                        src="https://tagvv-1256030678.file.myqcloud.com/202410218dz9v.png"
                        alt=""
                      />
                      <div class="audio_right">
                        <div class="item_title line-hidden2">{{ item.name || '--' }}</div>
                        <div class="item_status">
                          {{ RESOURCE_TYPE.getCN(item.specificType) }}
                        </div>
                      </div>
                    </div>
                    <div class="item_parent_box">
                      <fileTag
                        v-if="item.folderList && item.folderList.length > 0"
                        class="file_tagbox"
                        :fileName="item.folderList[0].name"
                        :fileInfo="item.folderList[0]"
                        @showRemoveFun="showRemoveFun(item, itemIndex, index)"
                      />
                      <div class="item_box">
                        <div class="item_box item_label" style="justify-content: unset">
                          <div v-for="(tag, tagIndex) in item.tagList" :key="tagIndex">
                            {{ tag.name }}
                          </div>
                        </div>

                        <el-tooltip
                          v-if="item.source != 6"
                          effect="dark"
                          content="编辑标签"
                          placement="top"
                        >
                          <div
                            class="item_detail"
                            @click.stop="changeTagFun(item, itemIndex, index)"
                          >
                            <img
                              src="https://tagvv-1256030678.file.myqcloud.com/20230307m325c.png"
                              alt=""
                            />
                          </div>
                        </el-tooltip>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 选择框 -->
                <div class="resource_check" v-if="showBatch" @click.stop="clickBatch(item, $event)">
                  <div class="xm_check_box_noBorder">
                    <div
                      :class="{
                        check_box: true,
                        check_box_active: item.isChecked
                      }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </template>
          <div v-else class="no_echart">
            <img src="@/assets/images/content_center/no_activity.png" alt />
            暂无数据
          </div>
        </div>
        <div
          class="xm_pullUpToLoadMore"
          style="padding-bottom: 15px"
          v-if="tableForm.listData && tableForm.listData.length > 20"
        >
          <img
            src="/public/loading.gif"
            v-if="tableForm.loading && tableForm.page.index > 1"
            alt=""
          />
          {{
            tableForm.loading
              ? tableForm.page.index === 1
                ? ''
                : '加载中...'
              : tableForm.listData.length >= tableForm.page.total
              ? '已经到底了~'
              : '上拉加载更多~'
          }}
        </div>
      </div>
    </div>
    <!-- 移动到文件夹的弹窗 -->
    <removeDOM
      origin="material"
      v-if="removeDialog.show"
      :fileType="6"
      :removeDialog="removeDialog"
      @removeSuccessFun="removeSuccessFun"
    />
    <!-- 批量上传 -->
    <uploadBatch
      ref="uploadBatchRef"
      origin="mediaResource"
      v-if="uploadBatchInfo.show"
      :infoDialog="uploadBatchInfo"
      @ope="batchOpeFn"
      @close="closeUploadBatch"
      @batchOpeSuccess="batchOpeSuccess"
    ></uploadBatch>
    <!-- 详情 -->
    <detailDOM v-if="detailDialog.show" :detailDialog="detailDialog" @updateList="querySearch" />
    <!-- 编辑标签的弹窗 -->
    <addTagDOM v-if="addTagDialog.show" :addDialog="addTagDialog" @updateTag="updateTag" />
  </div>
</template>
<script setup>
import addTagDOM from '@/views/content_center/content_repository/components/addTag_dialog.vue'

import uploadBatch from '@/views/sumvideo/creative_elements/components/upload_batch.vue'
import detailDOM from './components/detail_dialog.vue'
import removeDOM from '@/views/sumvideo/components/files/file_remove_dialog.vue'
import fileTag from '@/views/sumvideo/components/files/file_tag.vue'
import { pageList } from './js/list.js'
import { detail, list, batchAddRemove, batchOpr } from '@/api/content_center/material_library.js'
import { saveBatch } from '@/api/content_center/content_repository.js'
import { downLoadAllFile, cancelDownFile } from '@/utils/batchDownloadFile.js'
import { RESOURCE_TYPE } from '@/utils/dictionary/sumvideo'
import { ElMessageBox } from 'element-plus'
import { throttle, isNotEmpty, getCHeight } from '@/utils/tools.js'
const message = inject('$message')
const xmSearchRef = ref()
const {
  showBatch,
  chooseList,
  init,
  columns,
  load,
  searchComponents,
  tableForm,
  getList,
  getParams,
  chooseTab,
  tabList,
  getContentWidth,
  oneWidth

  // chooseFileId
} = pageList()

const pageScroll = ref() // 滚动的区域
// 查询的回调
const querySearch = throttle(function () {
  // 触发查询退出批量操作
  showBatch.value = false
  clearBatch()

  tableForm.page.index = 1
  tableForm.loading = true
  // fileLoading.value = false
  pageScroll.value?.scrollTo(0, 0)
  getList('querySearch').then(() => {
    init()
  })
}, 500)
// 重置的回调
const resetSearch = throttle(function () {
  // 触发查询退出批量操作
  showBatch.value = false
  clearBatch()

  tableForm.loading = true
  tableForm.page = {
    index: 1,
    size: 50,
    total: 0
  }

  pageScroll.value?.scrollTo(0, 0)
  getList('resetSearch').then(() => {
    init()
  })
}, 500)

// 切换tab
function changeTab() {
  console.log('切换', chooseTab.value)
  const index = searchComponents.value.findIndex(item => item.filed === 'specificType1')

  searchComponents.value[index].val = chooseTab.value
  resetSearch()
}
// --上传操作
const uploadBatchInfo = reactive({
  useTagType: true,
  tagType: 10,
  show: false, // 是否显示
  hideFile: false, // 上传的时候隐藏文件夹选项
  uploadAccept: '', // 接收的上传类型
  title: '', // 标题
  uploadBtnText: '', // 上传资源/资源按钮文案
  cancelBtnText: '', // 取消按钮文案
  confirmBtnText: '', // 提交按钮文案
  littleTips: '', // 上传资源/资源按钮描述
  origin: 'mediaResource', // 来源 媒体资源库
  type: '', // 资源/资源上传upload 批量操作allMarking
  batchItem: -1, // 当type="allMarking"时传入；1 去标选中创意元素 2 去标搜索出的所有创意元素 3 打标选中创意元素 4 打标搜索出的所有创意元素 5 删除选中创意元素 6 删除搜索出的所有创意元素
  batchOperationArr: [], // 当type="allMarking"&&batchItem='1||3||5' 时传入；需要批量操作的数据列表
  totalList: 0 // 数据总条数 当type="allMarking"&&batchItem='2||4||6' 时传入；需要批量操作的数据条数
})
// 打开批量上传弹窗
const showBatchUpload = throttle(() => {
  uploadBatchInfo.hideFile = true
  uploadBatchInfo.uploadAccept = '.gif,audio/mp3,.ttf,.otf'
  uploadBatchInfo.imageType = ['gif']
  uploadBatchInfo.title = '上传媒体资源'
  uploadBatchInfo.uploadBtnText = '本地上传'
  uploadBatchInfo.cancelBtnText = '取消'
  uploadBatchInfo.confirmBtnText = '上传'
  uploadBatchInfo.littleTips =
    '支持批量添加，每次最多选择 50 个文件，BGM和音效支持：mp3，大小不超过20M，字体支持：ttf/otf，大小不超过25M，贴纸支持：gif，大小不超过15M'
  uploadBatchInfo.type = 'upload'
  uploadBatchInfo.show = true
}, 700)
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
function batchOpeSuccess() {
  message.success('操作成功！')
  beforeBatchChange()
}

// --上传操作 end

const pageClickId = ref(null) // 页面点击的是哪个id
// function closeClickIdByDialog() {
//   pageClickId.value = null
// }
// --批量操作

function clickBatch(e) {
  e.isChecked = !e.isChecked
  const index = chooseList.value.findIndex(x => x.id === e.id)
  if (index === -1) {
    chooseList.value.push(e)
  } else {
    chooseList.value.splice(index, 1)
  }
}
// 列表为空不能打开批量操作开关
function beforeBatchChange() {
  return new Promise(resolve => {
    chooseList.value = []
    if (!showBatch.value) {
      // 查询前200条非内置的数据

      // if (tableForm.listData && tableForm.listData.length > 0) {
      //   pageScroll.value?.scrollTo(0, 0)
      //   resolve(true)
      // } else {
      //   message.warning('暂无数据')
      //   resolve(false)
      // }
      batchBeforeSearch()
        .then(() => {
          pageScroll.value?.scrollTo(0, 0)
          resolve(true)
        })
        .catch(() => {
          message.warning('暂无可批量操作的数据，不支持开启')
          pageScroll.value?.scrollTo(0, 0)
          clearBatch()
          querySearch()
          resolve(false)
        })
    } else {
      querySearch()
      pageScroll.value?.scrollTo(0, 0)
      clearBatch()
      resolve(false)
    }
  })
}
// 开启批量操作要查询非内置的
function batchBeforeSearch() {
  return new Promise((resolve, reject) => {
    tableForm.page.index = 1
    tableForm.loading = true
    pageScroll.value?.scrollTo(0, 0)
    getList('batchSearch').then(() => {
      init()
      if (isNotEmpty(tableForm.listData)) {
        resolve()
      } else {
        reject(new Error())
      }
    })
  })
}
// 退出批量操作需要清空选中的数据
function clearBatch() {
  chooseList.value = []
  // querySearch()
  // tableForm.listData.forEach(x => (x.isChecked = false))
}
function validChooseFun(isAll) {
  return new Promise((resolve, reject) => {
    if (isAll) {
      tableForm.listData.forEach(x => {
        x.isChecked = true
      })
      chooseList.value = JSON.parse(JSON.stringify(tableForm.listData))
    }

    if (isNotEmpty(chooseList.value)) {
      resolve()
    } else {
      message.warning('请先选择资源')
      reject(new Error())
    }
  })
}
// 点击批量删除
const handleCommandDelete = throttle(e => {
  console.log(e, 'eee')
  console.log(e)
  // 选中的
  validChooseFun(e === 2)
    .then(() => {
      ElMessageBox.alert(
        `<div>确定批量删除选中的<span style="font-weight:600;color:#364FCD;margin:0 4px">${chooseList.value.length}</span>个资源？删除后不可恢复，请谨慎操作。</div>`,
        '批量删除',
        {
          closeOnClickModal: false,
          showCancelButton: true,
          dangerouslyUseHTMLString: true,
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: '',
          customClass: 'xm_dialog_messageBox xm_dialog_messageBox_15vh'
        }
      )

        .then(() => {
          const ids = chooseList.value.map(x => x.id)
          batchOpr({
            isDelete: 1,
            ids
          })
            .then(res => {
              if (res.code === 0) {
                message.success('删除成功')
                querySearch()
              }
            })
            .catch(() => {})
        })
        .catch(() => {})
    })
    .catch(() => {})
}, 700)

// 点击批量打标/去标
const handleCommandAddTag = throttle(e => {
  // 选中的
  validChooseFun([2, 4].includes(e))
    .then(() => {
      uploadBatchInfo.show = true
      uploadBatchInfo.cancelBtnText = '取消'
      uploadBatchInfo.confirmBtnText = '确定'
      uploadBatchInfo.littleTips = '' // 不显示
      uploadBatchInfo.type = 'allMarking'
      uploadBatchInfo.batchItem = e
      uploadBatchInfo.title = [1, 2].includes(e) ? '批量去标' : '批量打标'
      uploadBatchInfo.batchOperationArr = chooseList.value
      uploadBatchInfo.totalList = chooseList.value.length
    })
    .catch(() => {})
}, 700)
const uploadBatchRef = ref()
// 批量打标/去标的保存
function batchOpeFn(batchItem, tags) {
  const ids = chooseList.value.map(x => x.id)
  console.log('batch', batchItem, tags, ids)
  const params = reactive({
    ids: ids
  })
  if (batchItem === 3 || batchItem === 4) {
    params.addTagIds = tags
  } else {
    params.deleteTagIds = tags
  }
  batchAddRemove(params)
    .then(res => {
      if (res.code === 0) {
        uploadBatchRef?.value.batchOpeSuccess(batchItem)
      }
    })
    .catch(() => {
      uploadBatchRef?.value.batchOpeCatch(batchItem)
    })
}
// 点击批量下载
const handleCommandDown = throttle(e => {
  validChooseFun(e === 2)
    .then(() => {
      batchDownLoadFun(e, e === 1 ? chooseList.value.length : tableForm.page.total)
    })
    .catch(() => {})
}, 700)
function batchDownLoadFun(type, total) {
  // 排除文本类型，其他拿到url进行下载
  ElMessageBox.confirm(
    `已选择 ${total} 条资源，${total > 50 ? '单次下载不超过 50 条，' : ''}是否下载${
      total > 50 ? '前 50 条资源' : '选中资源'
    }？`,
    '批量下载',
    {
      closeOnClickModal: false,
      confirmButtonText: '下载',
      cancelButtonText: '取消',
      type: '',
      customClass: 'xm_dialog_messageBox xm_dialog_messageBox_15vh',
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
// 下载第二步：获取选中的前50资源列表
function secondDownloadFun(instance, done, type) {
  const urlList = []
  const idList = []
  let list2 = []
  // 选中的资源
  if (type === 1) {
    list2 = (chooseList.value || []).slice(0, 50)
    list2.forEach(x => {
      idList.push({
        cId: x.id,
        useWay: 21
      })

      urlList.push({
        name: x.name,
        url: x.url,
        content: x.content
      })
    })
    lastDownLoadFun(urlList, idList, instance, done)
  } else {
    // 筛选出的所有资源
    const params = getParams('batchSearch')
    params.pageNo = 1
    params.pageSize = 50
    // 发送请求
    list(params).then(res => {
      if (res.code === 0) {
        list2 = res.data.records || []
        list2.forEach(x => {
          idList.push({
            cId: x.id,
            useWay: 21
          })
          urlList.push({
            name: x.name,
            url: x.url,
            content: x.content
          })
        })
        lastDownLoadFun(urlList, idList, instance, done)
      }
    })
  }
}

// 下载第三步：开始下载
function lastDownLoadFun(urlList, idList, instance, done) {
  downLoadAllFile(urlList, 'mediaResource', instance, '媒体资源库批量下载文件包.zip')
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
// --批量操作 end

// --移动文件夹
const removeDialog = reactive({
  show: false
})
// 打开移动的弹窗 origin detailDialog 代表是详情弹窗打开的，移动成功后，需要更新详情弹窗
function showRemoveFun(item, itemIndex, index, origin) {
  if (item.source === 6) return
  // pageClickId.value = item.id
  removeDialog.isBatchRemove = false
  removeDialog.openOrigin = origin || ''
  removeDialog.onlyRemoveFile = false
  removeDialog.index = index
  removeDialog.itemIndex = itemIndex
  removeDialog.materialIds = [item.id]
  removeDialog.deleteFileIds =
    item.folderList && item.folderList.length > 0 ? [item.folderList[0].id] : []
  removeDialog.fileId = item.folderList && item.folderList.length > 0 ? item.folderList[0].id : null
  removeDialog.parentId = null
  removeDialog.show = true
}
// const elementDetailDialogRef = ref()
function removeSuccessFun(id, info) {
  console.log('移动成功', id, info, removeDialog.fileId)

  // if (showBatch.value) {
  //   batchOver()
  // } else {
  //   // 如果当前左侧文件夹列表选中的不是根文件夹，那移动成功后就刷新列表
  //   if (chooseFileId.value !== '0') {
  //     querySearch()
  //   } else {
  //     // 否则就直接更新文件夹名称
  //     if (id === '0') {
  //       columns.value[removeDialog.index].columnArr[removeDialog.itemIndex].folderList = []
  //     } else {
  //       if (id !== removeDialog.fileId && info && info.name) {
  //         columns.value[removeDialog.index].columnArr[removeDialog.itemIndex].folderList = [info]
  //       }
  //     }
  //   }
  //   if (removeDialog.openOrigin === 'detailDialog') {
  //     // 更新详情接口
  //     elementDetailDialogRef.value?.init()
  //   }
  // }
}
// --移动文件夹 end

// --查看详情
const detailDialog = ref({
  show: false
})
const showDetailFun = throttle((e, itemIndex, index) => {
  detailDialog.value = {
    show: true,
    id: e.id,
    itemIndex: itemIndex,
    index: index
  }
}, 700)
// --查看详情 end

const contentHeight = ref(130) // 178
function getContentHeight() {
  contentHeight.value = getCHeight() - 10 - 16 - (xmSearchRef.value?.offsetHeight || 130)
  console.log('getContentHeight', contentHeight.value, xmSearchRef.value?.offsetHeight)
}
onMounted(() => {
  resetSearch()
  getContentHeight()
  getContentWidth()
  window.onresize = () => {
    getContentHeight()
    getContentWidth()
    init()
  }
})

onUnmounted(() => {
  window.onresize = null
})

// --标签
const addTagDialog = reactive({
  show: false,
  id: null,
  hideTitleSpan: false,
  type: null,
  chooseTagList: [],
  index: [],
  source: null
})
// 打开设置标签弹窗
function changeTagFun(e, itemIndex, index) {
  addTagDialog.type = 9
  addTagDialog.hideTitleSpan = true
  addTagDialog.id = e.id
  addTagDialog.index = [index, itemIndex]
  addTagDialog.source = 0
  detail({
    id: e.id
  })
    .then(res => {
      if (res.code === 0) {
        addTagDialog.chooseTagList = res.data.tagList || []
        addTagDialog.show = true
      }
    })
    .catch(() => {
      addTagDialog.chooseTagList = e.tagList ? JSON.parse(JSON.stringify(e.tagList)) : []
      addTagDialog.show = true
    })
}

// 更新标签
function updateTag(e) {
  columns.value[addTagDialog.index[0]].columnArr[addTagDialog.index[1]].tagList = e
}
// --标签end
</script>
<style lang="scss" scoped>
.page_content {
  margin-top: 16px;
  width: 100%;
  overflow: hidden;
  background: #ffffff;
  border-radius: 4px;
  padding: 0 24px;
}
.tab_action_box {
  width: 100%;
  height: 65px;
  position: relative;
  padding-top: 30px;
  margin-bottom: 20px;
  :deep(.el-tabs__item.is-active) {
    color: #303133;
    font-weight: 600;
  }
  .action_box {
    position: absolute;
    right: 0;
    top: 0;
    height: 65px;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
  }
}
.scroll_box {
  width: calc(100% + 24px);
  height: calc(100% - 85px);
  overflow: auto;
  overflow-x: hidden;
}
.action_batch {
  :deep(.xm_dropDown),
  :deep(.el-dropdown) {
    margin-left: 16px;
    .el-button {
      padding: 8px 10px;
    }
  }
}
.resource_check {
  position: absolute;
  left: 0;
  top: 0;
  width: 100% !important;
  height: 100% !important;
  background-color: rgba(0, 0, 0, 0.4) !important;
  border-radius: 4px !important;
  padding-top: 8px;
}
.container {
  margin: 0 auto;
  // padding-bottom: 20px;
  display: flex;
  justify-content: flex-start;
  transition: all 0.2s ease-in-out;
}
.item {
  position: relative;
  cursor: pointer;
  width: 220px;
  color: #000;
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.5s ease-in-out;
  margin: 0 14px 14px 0;
  > div {
    width: 100%;
    height: 100%;
    background: #e6e8ee;
    border-radius: 4px;
  }
  .one_pic {
    position: relative;
    .item_content {
      position: absolute;
      left: 0;
      top: 0;
    }
    .item_box {
      padding-left: unset;
      align-items: center;
    }
    .item_title {
      opacity: 0;
      padding: 10px 0px 0px 12px !important;
      transition: all 0.2s ease-in-out;
      // background: linear-gradient(180deg, rgba(0, 0, 0, 0.36) 0%, rgba(0, 0, 0, 0) 100%);
      padding-bottom: 10px !important;
      border-radius: 4px 4px 0px 0px !important;
      width: calc(100% - 52px) !important;
    }
  }
  .one_pic:hover {
    .file_tagbox {
      opacity: 1;
      display: flex;
    }
    .item_title {
      opacity: 1;
    }
    .item_box1 {
      padding-bottom: 0;
      border-radius: 4px 4px 0px 0px !important;
      background: linear-gradient(180deg, rgba(0, 0, 0, 0.36) 0%, rgba(0, 0, 0, 0) 100%);
    }
  }
  .one_item {
    .item_cover {
      width: 100%;
      height: 100%;
      object-fit: contain;
      border-radius: 4px;
      display: flex;
      overflow-clip-margin: border-box;
      -webkit-overflow-clip-margin: border-box;
    }
    .item_xm {
      position: absolute;
      left: 0;
      top: 0;
      width: 52px;
      height: 52px;
      object-fit: contain;
    }
    .item_content {
      border-radius: 4px;
      overflow: hidden;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: flex-start;
      .item_title {
        width: 70%;
        padding: 10px 12px 0;
        font-size: 14px;
        font-weight: 400;
        color: #ffffff;
        line-height: 20px;
      }
    }
  }
  .item_box {
    width: 100%;
    padding: 0 12px 12px 12px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-end;
    .item_label {
      width: 100%;
      margin-right: 0px;
      flex-wrap: wrap;
      max-height: 20px;
      padding: 0 0 0 12px;
      overflow: hidden;
      > div {
        padding: 0px 6px;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 2px;
        min-height: 20px;
        line-height: 20px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: #fff;
        font-size: 12px;
        margin-right: 8px;
      }
    }
    .item_status {
      background: rgba(51, 51, 51, 0.2);
      border-radius: 12px;
      font-size: 12px;
      font-weight: 400;
      color: #ffffff;
      height: 18px;
      padding: 0 10px;
      line-height: 18px;
    }
    .item_detail {
      opacity: 0;
      width: 0;
      height: 32px;
      cursor: pointer;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      border-radius: 100%;
      background: rgba(51, 51, 51, 0.2);
      img {
        width: 16px;
        height: 16px;
        object-fit: contain;
      }
    }
  }
  .one_audio {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: flex-start;
    flex-direction: column;
    padding: 12px;
    position: relative;
    .one_audio_box {
      height: 100%;
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: flex-start;
    }
    .item_box {
      padding: unset;
    }
    .one_audio_top {
      width: 100%;
      display: flex;
      justify-content: flex-start;
      .item_title {
        width: 100%;
        font-size: 14px;
        font-weight: 400;
        color: #333333 !important;
        line-height: 20px;
      }
      .item_status {
        background: rgba(51, 51, 51, 0.2);
        border-radius: 12px;
        font-size: 12px;
        font-weight: 400;
        color: #ffffff;
        height: 18px;
        line-height: 18px;
        width: 50px;
        text-align: center;
        margin-top: 8px;
      }
    }
    .audio_img {
      width: 71px;
      height: 74px;
      border-radius: 4px;
      margin-right: 8px;
      display: flex;
      object-fit: cover;
    }
    .audio_right {
      width: calc(100% - 79px);
    }
    .audio_content {
      width: calc(100% - 79px) !important;
      height: 74px !important;
      .item_box,
      .item_title {
        padding: 0;
        color: #333333 !important;
      }
    }
  }
}
.no_echart {
  background: #fff;
  width: 100%;
  height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  font-weight: 400;
  color: #909399;
  line-height: 20px;
  img {
    width: 70px;
    height: 70px;
    object-fit: cover;
    margin-bottom: 7px;
  }
}

.one_item:hover {
  .file_tagbox {
    opacity: 1;
    display: flex;
  }
  .item_detail {
    opacity: 1 !important;
    width: 32px !important;
    flex-shrink: 0 !important;
  }
  .item_label {
    width: calc(100% - 32px);
  }
}
.item_parent_box {
  width: 100%;
  .file_tagbox {
    opacity: 0;
    display: none;
  }
  :deep(.file_tag) {
    // margin-left: 12px;
    max-width: calc(100% - 24px);
    margin-bottom: 6px;
  }
}
.chose-mask {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  opacity: 0;
  border-radius: 4px;
  .select-state {
    width: 14px;
    height: 14px;
    background-color: #fff;
    margin: 8px 0 0 8px;
    line-height: 14px;
    text-align: center;
    transition: all 0.2s;
    cursor: pointer;
    padding-top: 2px;
    display: flex;
    flex-direction: row;
    justify-content: center;
  }
}
.selected-state {
  background: #364fcd !important;
  .state-chose {
    width: 4px;
    height: 8px;
    border-color: #fff;
    border-style: solid;
    border-width: 0 1px 1px 0;
    transform: rotate(45deg);
  }
}
.show-chose-mask {
  opacity: 1;
  transition: all 0.3s ease;
}
</style>
