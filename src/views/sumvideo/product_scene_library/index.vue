<template>
  <div class="page sumvideo_page">
    <!-- 筛选条件 -->
    <div ref="xmSearchRef">
      <xm_search
        :searchComponents="searchComponents"
        :useOwnReset="true"
        @getData="querySearch"
        @reset="resetSearch"
        @openChoseLabel="openChoseLabel"
      ></xm_search>
    </div>
    <!-- 文件夹+列表 -->
    <div
      class="page_content"
      :style="{
        height: contentHeight + 'px'
      }"
      v-loading="tableForm.loading && changeFileLoading"
    >
      <!-- 文件夹 -->
      <div class="content_left">
        <filesDOM
          v-if="refreshTree"
          ref="filesRef"
          origin="productScene"
          :fileType="5"
          :showDropDown="true"
          :hideFileIcon="true"
          @updateId="updateChooseId"
        />
      </div>
      <!-- 词云+列表 -->
      <div
        class="content_right"
        v-loading="tableForm.loading && changeFileLoading ? false : tableForm.loading"
      >
        <!--   词云标签信息   -->
        <div class="tag_cloud" v-if="tagCloudList.length > 0">
          <div
            :class="[
              'one_tag',
              chooseTagList.findIndex(x => x.id == item.id) > -1 ? 'one_tag_active' : ''
            ]"
            v-for="item in tagCloudList"
            :key="item.id"
            @click="chooseTagFun(item)"
          >
            <el-icon v-if="item.source === 1" style="font-size: 14px; margin-right: 2px">
              <i-star />
            </el-icon>
            {{ item.name }}
          </div>
        </div>
        <!-- tab分区+操作区 -->
        <div class="tab_action_box">
          <el-tabs class="tab_box" v-model="chooseTab" @tab-click="changeTab">
            <el-tab-pane v-for="(tab, i) in tabList" :key="i" :label="tab.label" :name="tab.name">
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
              <el-button @click="handleCommandCompose">组合</el-button>
              <el-dropdown popper-class="xm_dropDown" @command="handleCommandRemove">
                <el-button>
                  移动
                  <el-icon class="el-icon--right"><i-arrow-down /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item :command="1">批量移动选中的场景图</el-dropdown-item>
                    <el-dropdown-item :command="2">批量移动搜索出的所有场景图</el-dropdown-item>
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
                    <el-dropdown-item :command="1">批量删除选中的场景图</el-dropdown-item>
                    <el-dropdown-item :command="2">批量删除搜索出的所有场景图</el-dropdown-item>
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
        <div
          class="scroll_box"
          ref="pageScroll"
          :style="tagCloudList.length > 0 ? '' : ' height: calc(100% - 70px - 30px);'"
        >
          <div class="scroll_box2">
            <!-- 列表 -->
            <template v-if="tableForm.listData && tableForm.listData.length > 0">
              <div
                class="scene_box"
                :infinite-scroll-delay="1000"
                v-infinite-scroll="load"
                :infinite-scroll-distance="50"
                :infinite-scroll-immediate="false"
                :infinite-scroll-disabled="tableForm.listData.length >= tableForm.page.total"
              >
                <div
                  class="one_scene"
                  v-for="(item, index) in tableForm.listData"
                  :key="index"
                  :style="{
                    width: `${oneWidth}px`,
                    height: `${oneWidth}px`
                  }"
                  @click.stop="showDetailFun(item, index)"
                >
                  <!-- 封面 -->
                  <sceneCover :isByXM="item.brandId === '0'" :list="item.pictures" />

                  <div class="scene_back" :style="showBatch ? 'opacity:0' : ''">
                    <div class="back_top">
                      <div class="back_top_mask"></div>
                      <div class="back_top_content">
                        <!-- 名称 -->
                        <div class="scene_name line-hidden1">
                          {{ item.name || '' }}
                        </div>
                        <!-- 大小 -->
                        <div class="scene_size">{{ changeKB(item.size || 1242121) }}</div>
                      </div>
                    </div>

                    <div class="back_bottom">
                      <!-- 文件夹 根目录不显示文件夹 -->
                      <fileTag
                        v-if="item.folderList && item.folderList.length > 0"
                        class="file_tagbox"
                        :fileName="item.folderList[0].name"
                        :fileInfo="item.folderList[0]"
                        @showRemoveFun="showRemoveFun(item, index)"
                      />
                      <!-- 标签 -->
                      <div class="scene_tag" v-if="item.tagList && item.tagList.length > 0">
                        <div class="one_tag line-hidden1" v-for="(x, y) in item.tagList" :key="y">
                          {{ x.name || '' }}
                        </div>
                      </div>
                      <!-- 打标 -->
                      <div class="scene_btn_tag" v-if="item.brandId !== '0'">
                        <el-tooltip effect="dark" content="编辑标签" placement="top">
                          <div
                            class="scene_btn_tag_content"
                            @click.stop="changeTagFun(item, index)"
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
                  <!-- 类型   -->
                  <div class="scene_tab" v-if="!showBatch">
                    {{ item.pictureType === 1 ? '单图' : '组图' }}
                  </div>
                  <!-- 选择框 -->
                  <div class="scene_check" v-if="showBatch" @click.stop="clickBatch(item, $event)">
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
              <div
                class="loading_library"
                style="padding: 0 16px 20px 0px"
                v-if="tableForm.listData && tableForm.listData.length > 0"
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
            </template>
            <div
              v-if="!(tableForm.listData && tableForm.listData.length > 0) && !tableForm.loading"
              class="no_echart"
              style="padding-right: 16px"
            >
              <img src="@/assets/images/content_center/no_activity.png" alt />
              暂无数据
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 编辑标签的弹窗 -->
    <addTagDOM v-if="addTagDialog.show" :addDialog="addTagDialog" @updateTag="updateTag" />
    <!-- 移动到文件夹的弹窗 -->
    <removeDOM
      origin="productScene"
      v-if="removeDialog.show"
      :fileType="5"
      :removeDialog="removeDialog"
      @removeSuccessFun="removeSuccessFun"
      @closeDialog="closeClickIdByDialog"
    />
    <!-- 上传 -->
    <batchUploadDOM
      v-if="batchUploadDialog.show"
      :uploadDialog="batchUploadDialog"
      @showSuccessFun="querySearch"
    />
    <!-- 组合 -->
    <composeDOM
      v-if="composeDialog.show"
      :composeDialog="composeDialog"
      @updateFun="composeUpdateFun"
    />
    <!-- 详情 -->
    <detailDOM v-if="detailDialog.show" :detailDialog="detailDialog" @updateList="querySearch" />
  </div>
</template>
<script setup>
import { ElMessageBox } from 'element-plus'
import detailDOM from './components/detail_dialog.vue'
import composeDOM from './components/compose_dialog.vue'
import batchUploadDOM from './components/batch_upload_img.vue'
import sceneCover from '@/views/sumvideo/components/scene_cover.vue'
import { detail, list, saveStatLog, batchOpr } from '@/api/content_center/material_library.js'
import { getRecentMostUseTag } from '@/api/sumvideo/product_scene_library'
import removeDOM from '@/views/sumvideo/components/files/file_remove_dialog.vue'
import fileTag from '@/views/sumvideo/components/files/file_tag.vue'
import filesDOM from '@/views/sumvideo/components/files/choose_file_tree.vue'
import addTagDOM from '@/views/content_center/content_repository/components/addTag_dialog.vue'

import { getQuery } from '@/utils/get_query.js'
import { throttle, changeKB, getCWidth, getCHeight, isNotEmpty } from '@/utils/tools.js'
// 选择的tab
const chooseTab = ref(-1)
const tabList = ref([
  {
    name: -1,
    label: '全部'
  },
  {
    name: 1,
    label: '单图'
  },
  {
    name: 2,
    label: '组图'
  }
])
// 筛选条件
const searchComponents = ref([
  {
    type: 'input',
    label: '场景图名称',
    val: '',
    placeholder: '请输入场景图名称',
    filed: 'name'
  },

  {
    type: 'input',
    label: '上传批次号',
    val: '',
    placeholder: '请输入上传批次号',
    filed: 'batchNumber'
  },
  {
    type: 'newLabelFilter',
    label: '场景图标签',
    val: [],
    placeholder: '请输入场景图关键词',
    filed: 'tags'
  }
])
// 表格的查询条件
const tableForm = reactive({
  loading: true,
  listData: [],
  newListData: [],
  page: {
    index: 1,
    size: 50,
    total: 0
  }
})
const chooseFileId = ref('0') // 选中的fileId
const chooseFileInfo = ref(null) // 选中的文件夹信息 用于组合弹窗里的文件夹回显
const changeFileLoading = ref(true) // 是否是更新文件夹触发的loading

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
  getList().then(() => {
    changeFileLoading.value = false
  })
}, 500)
// 重置的回调
const resetSearch = throttle(function () {
  // 清空标签词云
  chooseTagList.value = []
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
  getList().then(() => {
    changeFileLoading.value = false
  })
}, 500)
function getCommonParams() {
  const params = getQuery(searchComponents.value)
  console.log('com', params)
  params.pageNo = tableForm.page.index
  params.pageSize = tableForm.page.size
  params.type = [99]
  params.folderIds = [chooseFileId.value || '0']
  params.tagType = 11
  params.pictureType = chooseTab.value === -1 ? 0 : chooseTab.value
  return params
}
// 获取线索列表数据
function getList(type) {
  return new Promise((resolve, reject) => {
    tableForm.loading = true
    // 处理请求参数
    const params = getCommonParams()
    // 如果标签有内容 就记录标签查询记录
    if (isNotEmpty(params.tags)) {
      saveTagLog(params.tags)
    }
    if (type === 'batchSearch' || showBatch.value) {
      params.isExcludeDefault = true
      params.pageSize = 200
    }
    // 发送请求
    list(params)
      .then(res => {
        const arr = []
        res.data.records.forEach(item => {
          arr.push(item.tagList)
        })

        if (res.code === 0) {
          ;(res.data.records || []).forEach(x => {
            const pictures = isNotEmpty(x.pictures) ? JSON.parse(x.pictures) : []
            x.pictures = pictures
            x.pictureNumber = pictures.length
            x.pictureType = pictures && pictures.length > 1 ? 2 : 1
            x.isChecked = chooseList.value.findIndex(y => y.id === x.id) > -1
          })
          if (tableForm.page.index === 1) {
            tableForm.listData = res.data.records || []
            tableForm.page.total = res.data.total || 0
          } else {
            tableForm.newListData = res.data.records || []
            tableForm.listData = tableForm.listData.concat(tableForm.newListData)
          }
        } else {
          if (tableForm.page.index === 1) {
            tableForm.listData = []
            tableForm.page.total = 0
          }
        }
        tableForm.loading = false
        resolve()
      })
      .catch(() => {
        if (tableForm.page.index === 1) {
          tableForm.listData = []
          tableForm.page.total = 0
        }
        tableForm.loading = false
        resolve()
      })
  })
}
const load = throttle(function () {
  if (tableForm.loading) return
  tableForm.loading = true
  tableForm.page.index++
  getList()
}, 1000)

// 切换tab
function changeTab() {
  querySearch()
}

// --标签选择
const addTagDialog = reactive({
  show: false,
  id: null,
  hideTitleSpan: false,
  type: null,
  chooseTagList: [],
  index: [],
  source: null
})
const tagCloudList = ref([])
const chooseTagList = ref([]) // 选中的标签列表

// 获取标签词云的信息
const getTagCloudList = () => {
  getRecentMostUseTag({
    count: 30,
    tagType: 11
  }).then(res => {
    if (res.code === 0) {
      tagCloudList.value = res.data || []
    }
  })
}

// 词云查询
const chooseTagFun = throttle(item => {
  const index = chooseTagList.value.findIndex(x => x.id === item.id)

  if (index === -1) {
    chooseTagList.value.push(item)
  } else {
    chooseTagList.value.splice(index, 1)
  }

  updateTagBySearch(true)
}, 500)

// 打开选择标签弹窗
function openChoseLabel() {
  addTagDialog.type = 18
  addTagDialog.hideTitleSpan = false
  addTagDialog.id = null
  addTagDialog.index = []
  addTagDialog.source = null
  addTagDialog.chooseTagList = chooseTagList.value || []
  addTagDialog.show = true
}

// 打开设置标签弹窗
function changeTagFun(e, index) {
  addTagDialog.type = 8
  addTagDialog.hideTitleSpan = true
  addTagDialog.id = e.id
  addTagDialog.index = index
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
  if (addTagDialog.type === 8) {
    tableForm.listData[addTagDialog.index].tagList = e || []
    return
  }
  chooseTagList.value = e
  // 传值给search组件
  updateTagBySearch()
}

// 更新筛选器的标签 并查询数据
function updateTagBySearch(useSearch) {
  const arr = []
  if (isNotEmpty(chooseTagList.value)) {
    chooseTagList.value.forEach(item => {
      arr.push(item.id)
    })
  }

  const searchIndex = searchComponents.value.findIndex(x => x.filed === 'tags')
  if (searchIndex > -1) {
    searchComponents.value[searchIndex].val = arr
  }
  if (useSearch) querySearch()
}

// 更新标签的使用记录
const saveTagLog = list => {
  saveStatLog(
    list.map(item => {
      return {
        key: `query_tag_${item}`,
        value: item
      }
    })
  )
}
// --标签选择 end

// 更新选中的文件夹ID
function updateChooseId(e, info) {
  if (!changeFileLoading.value) {
    console.log('更新选中的文件夹', e, info)
    changeFileLoading.value = true
    chooseFileId.value = e
    chooseFileInfo.value = info
    querySearch()
  }
}
const pageClickId = ref(null) // 页面点击的是哪个id
const removeDialog = reactive({
  show: false
})
function closeClickIdByDialog() {
  pageClickId.value = null
}
// 打开移动的弹窗 origin detailDialog 代表是详情弹窗打开的，移动成功后，需要更新详情弹窗
function showRemoveFun(item, index, origin) {
  if (item.brandId === '0') return
  // pageClickId.value = item.id
  removeDialog.isBatchRemove = false
  removeDialog.openOrigin = origin || ''
  removeDialog.onlyRemoveFile = false
  removeDialog.index = index
  removeDialog.itemIndex = null
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

  if (showBatch.value) {
    querySearch()
  } else {
    // 如果当前左侧文件夹列表选中的不是根文件夹，那移动成功后就刷新列表
    if (chooseFileId.value !== '0') {
      querySearch()
    } else {
      // 否则就直接更新文件夹名称
      if (id === '0') {
        tableForm.listData[removeDialog.index].folderList = []
      } else {
        if (id !== removeDialog.fileId && info && info.name) {
          tableForm.listData[removeDialog.index].folderList = [info]
        }
      }
    }
    // if (removeDialog.openOrigin === 'detailDialog') {
    //   // 更新详情接口
    //   elementDetailDialogRef.value?.init()
    // }
  }
}

// --上传操作
const batchUploadDialog = reactive({
  show: false,
  fileId: null,
  title: '上传场景图'
})
const showBatchUpload = throttle(() => {
  batchUploadDialog.show = true
  batchUploadDialog.chooseFileId = chooseFileId.value || '0'
}, 700)
// --上传操作 end
const message = inject('$message')
// --批量操作
const showBatch = ref(false)
const chooseList = ref([]) // 选中的数据
function clickBatch(e) {
  e.isChecked = !e.isChecked
  const index = chooseList.value.findIndex(x => x.id === e.id)
  if (index === -1) {
    chooseList.value.push(e)
  } else {
    chooseList.value.splice(index, 1)
  }
  console.log('xxxxxxxx', chooseList.value, tableForm.listData)
}
// 列表为空不能打开批量操作开关
function beforeBatchChange() {
  return new Promise(resolve => {
    chooseList.value = []
    if (!showBatch.value) {
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
      pageScroll.value?.scrollTo(0, 0)
      clearBatch()
      querySearch()
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
  // tableForm.listData.forEach(x => (x.isChecked = false))
}
function validChooseFun(e) {
  return new Promise((resolve, reject) => {
    if (e === 2) {
      tableForm.listData.forEach(x => {
        x.isChecked = true
      })
      chooseList.value = JSON.parse(JSON.stringify(tableForm.listData))
    }

    if (isNotEmpty(chooseList.value)) {
      resolve()
    } else {
      message.warning('请先选择图片')
      reject(new Error())
    }
  })
}
// 点击组合
const composeDialog = reactive({
  show: false
})
const refreshTree = ref(true) // 重新加载文件夹树
const handleCommandCompose = throttle(() => {
  if (isNotEmpty(chooseList.value)) {
    // 拿到选中的数据，组图是取对应的单图张数 单图是取1 相加看是否符合2-20
    let len = 0
    const ids = []
    chooseList.value.forEach(x => {
      ids.push(x.id)
      len += x.pictureNumber
    })
    if (len > 20 || len < 2) {
      message.warning('请先选择2-20张图片')
    } else {
      console.log('组合')
      composeDialog.show = true
      composeDialog.ids = ids
      composeDialog.chooseFileId = chooseFileId.value || '0'
      composeDialog.chooseFileInfo = chooseFileInfo.value
    }
  } else {
    message.warning('请先选择2-20张图片')
  }
}, 700)
function composeUpdateFun(isAdd) {
  if (isAdd) {
    refreshTree.value = false
    nextTick(() => {
      refreshTree.value = true
    })
  }
  querySearch()
}
// 点击批量移动
const handleCommandRemove = throttle(e => {
  console.log('移动', e)
  validChooseFun(e)
    .then(() => {
      const ids = chooseList.value.map(x => x.id)
      removeDialog.isBatchRemove = true
      removeDialog.openOrigin = ''
      removeDialog.onlyRemoveFile = false
      removeDialog.index = null
      removeDialog.itemIndex = null
      removeDialog.materialIds = ids || []
      removeDialog.deleteFileIds = []
      removeDialog.fileId = null
      removeDialog.parentId = null
      removeDialog.show = true
    })
    .catch(() => {})
}, 700)
// 点击批量删除
const handleCommandDelete = throttle(e => {
  console.log(e, 'eee')
  console.log(e)
  // 选中的
  validChooseFun(e)
    .then(() => {
      ElMessageBox.alert(
        `<div>确定批量删除选中的<span style="font-weight:600;color:#364FCD;margin:0 4px">${
          e === 1 ? chooseList.value.length : tableForm.page.total
        }</span>个场景图？删除后不可恢复，请谨慎操作。</div>`,
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
// --批量操作 end

// --查看详情
const detailDialog = ref({
  show: false
})
const showDetailFun = throttle((e, index) => {
  detailDialog.value = {
    show: true,
    id: e.id,
    info: e,
    index: index
  }
}, 700)
// function updateName(name) {
//   tableForm.listData[detailDialog.value.index].name = name
// }

// --查看详情 end

const xmSearchRef = ref()
const listWidth = ref()
const oneWidth = ref(240)
const contentHeight = ref(80) // 178
function getWidth() {
  contentHeight.value = getCHeight() - 10 - 16 - (xmSearchRef.value?.offsetHeight || 80)
  listWidth.value = getCWidth() - 248 - 16 - 40 - 24 - 7 //
  const cLen = parseInt(listWidth.value / 256) // 256=UI图的单个宽度240+每个单图间距16

  oneWidth.value = Math.floor(listWidth.value / cLen) - 16
  console.log('xxx', listWidth.value, cLen, oneWidth.value)
}

onMounted(() => {
  getTagCloudList()
  resetSearch()
  getWidth()
  window.onresize = () => {
    // init()
    getWidth()
  }
})

onUnmounted(() => {
  window.onresize = null
})
</script>
<style lang="scss" scoped>
.page_content {
  margin-top: 16px;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  .content_left {
    width: 248px;
    height: 100%;
    :deep(.content_content_box) {
      padding-right: 0 !important;
    }
  }
  .content_right {
    margin-left: 16px;
    width: calc(100% - 264px);
    height: 100%;
    background: #ffffff;
    border-radius: 4px;
    padding: 0 24px;
    .tag_cloud {
      border-bottom: 1px solid #e8e8e8;
      height: 60px;
      padding: 20px 0 16px;
      overflow: hidden;
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: flex-start;
      flex-wrap: wrap;
      .one_tag {
        cursor: pointer;
        margin: 0 12px 16px 0;
        border-radius: 12px;
        border: 1px solid #dcdee0;
        font-weight: 400;
        font-size: 12px;
        color: #606266;
        line-height: 20px;
        padding: 2px 8px;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
      }
      .one_tag_active {
        background: #364fcd;
        color: #ffffff;
        border-color: #364fcd;
      }
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
      height: calc(100% - 60px - 85px);
      overflow-y: auto;
      overflow-x: hidden;

      .scroll_box2 {
        width: 100%;
      }
      .scene_box {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: flex-start;
        flex-wrap: wrap;
        .one_scene {
          cursor: pointer;
          margin-right: 16px;
          margin-bottom: 16px;
          border-radius: 4px;
          position: relative;
          .scene_back {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: flex-start;
            .back_top {
              opacity: 0;
              width: 100%;
              height: 50%;
              position: relative;
              .back_top_mask {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 40px;
                background: linear-gradient(180deg, rgba(0, 0, 0, 0.36) 0%, rgba(0, 0, 0, 0) 100%);
                border-radius: 4px 4px 0px 0px;
              }
              .back_top_content {
                padding: 10px 12px;
                position: absolute;
                left: 0;
                top: 0;
                width: calc(100% - 68px);
                height: 100%;
                .scene_name {
                  width: 100%;
                  font-weight: 400;
                  font-size: 14px;
                  color: #ffffff;
                  line-height: 20px;
                }
                .scene_size {
                  margin-top: 2px;
                  font-weight: 400;
                  font-size: 14px;
                  color: #ffffff;
                  line-height: 20px;
                }
              }
            }
            .back_bottom {
              padding: 12px;
              width: 100%;
              height: 50%;
              display: flex;
              flex-direction: row;
              justify-content: space-between;
              align-items: flex-end;
              position: relative;
              .file_tagbox {
                opacity: 0;
                position: absolute;
                left: 12px;
                bottom: 40px;
              }
              .scene_tag {
                // width: calc(100% - 40px);
                height: 20px;
                overflow: hidden;
                display: flex;
                flex-direction: row;
                justify-content: flex-start;
                align-items: flex-start;
                flex-wrap: wrap;
                .one_tag {
                  width: max-content;
                  margin-right: 8px;
                  background: rgba(0, 0, 0, 0.4);
                  border-radius: 4px;
                  font-weight: 400;
                  font-size: 12px;
                  color: #ffffff;
                  line-height: 18px;
                  padding: 1px 6px;
                }
              }
              .scene_btn_tag {
                display: none;
                flex-direction: row;
                justify-content: flex-end;
                align-items: center;
                flex: 1;
                flex-shrink: 0;
                flex-basis: 32px;
                .scene_btn_tag_content {
                  cursor: pointer;
                  width: 32px;
                  height: 32px;
                  background: rgba(0, 0, 0, 0.4);
                  border-radius: 16px;
                  display: flex;
                  flex-direction: row;
                  justify-content: center;
                  align-items: center;
                }
                img {
                  width: 16px;
                  height: 16px;
                  display: flex;
                  object-fit: contain;
                }
              }
            }
          }
          .scene_tab {
            position: absolute;
            right: 12px;
            top: 9px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 11px;

            font-weight: 400;
            font-size: 14px;
            color: #ffffff;
            line-height: 20px;
            padding: 1px 10px;
          }
          .scene_check {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.4);
            border-radius: 4px;
            padding-top: 8px;
          }
        }
        .scene_back:hover {
          .file_tagbox {
            opacity: 1 !important;
            display: flex !important;
          }
          .back_top,
          .file_tagbox {
            opacity: 1;
          }
          .scene_btn_tag {
            display: flex !important;
          }
        }
      }
    }
  }
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
</style>
