<template>
  <div class="page sumvideo_page" :style="tableForm.loading ? ' pointer-events: none' : ''">
    <!-- 筛选条件 -->
    <div class="top_search" ref="xmSearchRef">
      <xm_search
        :searchComponents="searchComponents"
        :useOwnReset="true"
        @getData="querySearch"
        @reset="resetSearch"
      ></xm_search>
    </div>

    <!-- 分类+标签+定制按钮 -->
    <div class="page_top" ref="pageTopRef">
      <!-- 分类+标签 -->
      <div class="top_left" style="width: 100%">
        <!-- 分类 -->
        <div class="top_catgory">
          <div class="category_content">
            <div
              :class="{ one_category: true, choose_category: item.id == tableForm.chooseCategory }"
              v-for="item in categoryList"
              :key="item.id"
              @click="chooseCategoryFun(item.id)"
            >
              {{ item.name }}
            </div>
          </div>
        </div>
      </div>
      <div class="action_box">
        <el-button v-if="!showBatch" type="primary" @click="showBatchUpload" class="btn">
          上传
        </el-button>
        <div class="action_batch" v-if="showBatch">
          <el-dropdown popper-class="xm_dropDown" @command="handleCommandAddTag">
            <el-button>
              打标/去标
              <el-icon class="el-icon--right">
                <i-arrow-down />
              </el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :command="3">批量打标选中虚拟模特</el-dropdown-item>
                <el-dropdown-item :command="4">批量打标搜索出的所有虚拟模特</el-dropdown-item>
                <el-dropdown-item :command="1">批量去标选中虚拟模特</el-dropdown-item>
                <el-dropdown-item :command="2">批量去标搜索出的所有虚拟模特</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-dropdown
            style="margin-left: 16px"
            popper-class="xm_dropDown"
            @command="handleCommandDelete"
          >
            <el-button>
              删除
              <el-icon class="el-icon--right">
                <i-arrow-down />
              </el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :command="1">批量删除选中的虚拟模特</el-dropdown-item>
                <el-dropdown-item :command="2">批量删除搜索出的所有虚拟模特</el-dropdown-item>
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
      <!-- 定制按钮 -->
      <!-- <div class="top_right" >
        <el-button style="width: 108px" type="primary" @click="customizationFun">
          定制专属模型
        </el-button>
      </div> -->
    </div>
    <!-- 模特列表 -->
    <div class="page_bottom" ref="pageScroll">
      <div style="min-height: 200px" v-loading="tableForm.loading">
        <template v-if="tableForm.listData && tableForm.listData.length > 0">
          <div
            class="model_list"
            :infinite-scroll-delay="1000"
            v-infinite-scroll="loadFun"
            :infinite-scroll-distance="50"
            :infinite-scroll-immediate="false"
            :infinite-scroll-disabled="tableForm.listData.length >= tableForm.page.total"
          >
            <div
              class="one_model"
              v-for="(item, index) in tableForm.listData"
              :key="item.id"
              :style="{
                width: `${oneWidth}px`,
                height: `calc(${oneWidth}px * 1.5111)`
              }"
            >
              <div class="model_top">
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
                <el-image
                  class="model_cover"
                  :src="item.thumbCoverUrl || item.coverUrl || defaultCover"
                  fit="cover"
                >
                  <template #placeholder>
                    <div class="image_placeholder_loading">
                      <div class="image_placeholder_icon"></div>
                    </div>
                  </template>
                </el-image>
                <!--  内置元素标签     -->
                <img
                  v-if="item.brandId === '0'"
                  class="xm_icon"
                  src="https://tagvv-1256030678.file.myqcloud.com/202410218dz9v.png"
                  alt=""
                />
                <!-- 打标  -->
                <div class="scene_btn_tag" v-if="item.brandId !== '0'">
                  <el-tooltip effect="dark" content="编辑标签" placement="top">
                    <div class="scene_btn_tag_content" @click.stop="changeTagFun(item, index)">
                      <img
                        src="https://tagvv-1256030678.file.myqcloud.com/20230307m325c.png"
                        alt=""
                      />
                    </div>
                  </el-tooltip>
                </div>
                <div class="model_style" v-if="item.tagList && item.tagList.length > 0">
                  <template v-for="(x, y) in item.tagList">
                    <div class="one_style" v-if="x.tagType == 9" :key="y">{{ x.name }}</div>
                  </template>
                </div>
              </div>
              <div class="model_bottom line-hidden1">
                <div class="has_title" v-if="editNameInfo.showIndex !== index">
                  <div class="name_text">{{ item.name || '' }}</div>
                  <img
                    v-if="item.brandId !== '0' && !showBatch"
                    @click="showEditFun(item, index)"
                    class="edit_icon"
                    src="https://tagvv-1256030678.file.myqcloud.com/20231021q0ibz.png"
                    alt=""
                  />
                </div>
                <div class="edit_title" v-else>
                  <el-input
                    :ref="el => (editRefList[index] = el)"
                    :disabled="editLoading"
                    class="input_box"
                    placeholder="请输入模板名称"
                    type="text"
                    v-model.trim="editNameInfo.name"
                    @blur="inputBlurFun"
                    @keyup.enter="inputBlurFun"
                    maxlength="20"
                  />
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
                ? tableForm.listData.length > 8
                  ? '已经到底了~'
                  : ''
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
    <!-- 编辑标签的弹窗 -->
    <addTagDOM v-if="addTagDialog.show" :addDialog="addTagDialog" @updateTag="updateTag" />

    <!-- 上传 -->
    <batchUploadDOM
      v-if="batchUploadDialog.show"
      :uploadDialog="batchUploadDialog"
      @showSuccessFun="querySearch"
    />

    <!-- 批量上传 -->
    <uploadBatch
      ref="uploadBatchRef"
      origin="virtualModel"
      v-if="uploadBatchInfo.show"
      :infoDialog="uploadBatchInfo"
      @ope="batchOpeFn"
      @close="closeUploadBatch"
      @batchOpeSuccess="batchOpeSuccess"
    ></uploadBatch>
    <!-- 详情 -->
  </div>
</template>
<script setup>
import {
  list,
  getTags,
  batchOpr,
  batchAddRemove,
  detail,
  save
} from '@/api/content_center/material_library'

import { throttle, getCWidth, isNotEmpty, isEmpty } from '@/utils/tools'
import { ElMessage, ElMessageBox } from 'element-plus'
import uploadBatch from '@/views/sumvideo/creative_elements/components/upload_batch.vue'
import { getQuery } from '@/utils/get_query'
import addTagDOM from '@/views/content_center/content_repository/components/addTag_dialog.vue'
import batchUploadDOM from './components/batch_upload_img.vue'

const defaultCover = ref('https://tagvv-1256030678.file.myqcloud.com/202212066b4kq.png')
// 筛选条件
const searchComponents = ref([
  {
    type: 'input',
    label: '虚拟模特名称',
    val: '',
    placeholder: '请输入虚拟模特名称',
    filed: 'name'
  },
  {
    // subSource  pc后台：subSource=11  小程序：subSource=12  内置是 4
    type: 'select',
    label: '模特来源',
    val: [],
    filed: 'subSource',
    multiple: true,
    'collapse-tags': true,
    'collapse-tags-tooltip': true,
    selects: [
      {
        label: '员工上传',
        value: 12
      },
      {
        label: '批量上传',
        value: 11
      },
      {
        label: '内置资源',
        value: 4
      }
    ]
  },
  {
    type: 'input',
    label: '上传批次号',
    val: '',
    placeholder: '请输入上传批次号',
    filed: 'batchNumber'
  },
  {
    label: '虚拟模特标签',
    val: [],
    placeholder: '请输入场景图关键词',
    filed: 'tags',
    type: 'newLabelFilterV2',
    behavior: '选择',
    choseName: '标签',
    addTagInfo: {
      type: 20,
      hideTitleSpan: false,
      id: null,
      index: [],
      source: null
    }
  }
])
const categoryList = ref([]) // 分类列表
const styleList = ref([]) // 标签列表
// 表格筛选
const tableForm = reactive({
  loading: true,
  chooseCategory: null, // 选中的分类
  // chooseStyle: null, // 选中的标签
  listData: [],
  page: {
    index: 1,
    size: 32,
    total: 0
  },
  currentModelSource: 1 // 模特来源
})
const pageScroll = ref()

const querySearch = (closeBatch = true) => {
  if (closeBatch) {
    clearBatch()
    showBatch.value = false
  }
  pageScroll.value?.scrollTo(0, 0)
  tableForm.loading = true
  tableForm.page.index = 1
  getList()
}

const resetSearch = () => {
  tableForm.loading = true
  tableForm.page.index = 1
  tableForm.page.size = 32
  querySearch()
}
// 上拉加载
const loadFun = throttle(function () {
  tableForm.loading = true
  tableForm.page.index++
  getList()
}, 1000)

// 获取表格
function getList(type = '') {
  const queryInfo = getQuery(searchComponents.value)
  const param = {
    name: queryInfo?.name || '',
    subSource: queryInfo?.subSource || [],
    tags: queryInfo?.tags || [],
    batchNumber: queryInfo?.batchNumber || '',
    rangeTags: isNotEmpty(tableForm.chooseCategory) ? [tableForm.chooseCategory] : [],
    sources: [22],
    tagType: 9,
    pageNo: tableForm.page.index,
    pageSize: tableForm.page.size,
    isDelete: 0,
    tagsQueryType: 'or'
  }
  if (type === 'batchSearch') {
    param.subSource = [11, 12]
    param.pageSize = 200
    const item = searchComponents.value.find(item => item.filed === 'subSource') || {}
    if (isNotEmpty(item)) {
      item.val = [11, 12]
    }
  }
  return new Promise((resolve, reject) => {
    list(param)
      .then(res => {
        if (res.code === 0) {
          if (tableForm.page.index === 1) {
            tableForm.listData = res.data.records || []
            tableForm.page.total = res.data.total || 0
          } else {
            const newListData = res.data.records || []
            tableForm.listData = tableForm.listData.concat(newListData)
          }
        } else {
          if (tableForm.page.index === 1) {
            tableForm.listData = []
          }
        }
        tableForm.loading = false
        resolve()
      })
      .catch(() => {
        tableForm.loading = false
        resolve()
      })
  })
}

// 获取分类列表
function getCategoryList() {
  getTags({
    tagType: 8,
    orderSetting: '',
    pageNo: 1,
    pageSize: 1000,
    searchCount: true,
    tagName: '',
    source: 1
  }).then(res => {
    if (res.code === 0) {
      const list = res.data.records || []
      const womanInfo = list.filter(x => x.name === '女模')
      if (womanInfo && womanInfo.length > 0) {
        tableForm.chooseCategory = womanInfo[0].id
      }
      categoryList.value = list
      querySearch()
    }
  })
}

// 获取标签列表
function getStyleList() {
  return new Promise(resolve => {
    getTags({
      tagType: 9,
      orderSetting: '',
      pageNo: 1,
      pageSize: 1000,
      searchCount: true,
      tagName: '',
      source: 1
    })
      .then(res => {
        if (res.code === 0) {
          styleList.value = res.data.records || []
        }
      })
      .finally(() => {
        resolve()
      })
  })
}

// 选择分类 选择完毕要清空标签
const chooseCategoryFun = throttle(e => {
  if (tableForm.chooseCategory === e) return
  tableForm.chooseCategory = e
  querySearch(false)
}, 500)

// 每个卡片宽度自适应
const cLen = ref(7)
const listWidth = ref()
const oneWidth = ref(180)

function getWidth() {
  listWidth.value = getCWidth() - 32 - 24 - 7 // 第一个32是main_main的padding 第二个32是model_list距外的 7是滚动条
  init()
}

function init() {
  cLen.value = parseInt(listWidth.value / 196) // 196=UI图的单个宽度180+每个单图间距16
  oneWidth.value = Math.floor(listWidth.value / cLen.value) - 16
}

const topHeight = ref()
const pageTopRef = ref()
onMounted(() => {
  getCategoryList()
  getStyleList().then(() => {
    topHeight.value = pageTopRef.value.offsetHeight
  })

  getWidth()
  window.onresize = () => {
    getWidth()
  }
})
// --修改模版名称
const editLoading = ref(false)
const editNameInfo = ref({
  showIndex: -1,
  name: '',
  id: ''
})
const editRefList = ref([])
const showEditFun = throttle((item, index) => {
  console.log(index)
  editNameInfo.value = {
    showIndex: index,
    name: item.name || '',
    id: item.id,
    item: item
  }
  nextTick(() => {
    editRefList.value[index]?.focus()
  })
})

function inputBlurFun() {
  const reg =
    // eslint-disable-next-line no-misleading-character-class
    /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\\A9|AE]\u3030|\uA9|\uAE|\u3030/gi
  editNameInfo.value.name = editNameInfo.value.name.replace(reg, '')
  if (
    isEmpty(editNameInfo.value.name) ||
    editNameInfo.value.name === editNameInfo.value?.item.name
  ) {
    editNameInfo.value = {
      showIndex: -1,
      name: ''
    }
  } else {
    editLoading.value = true
    save({
      id: editNameInfo.value.id,
      name: editNameInfo.value.name
    }).then(res => {
      if (res.code === 0) {
        editLoading.value = false
        editNameInfo.value.item.name = editNameInfo.value.name
        editNameInfo.value = {
          showIndex: -1,
          name: ''
        }
        ElMessage.success('修改成功')
      }
    })
  }
}

// --修改模板名称 end
// --标签选择
const addTagDialog = reactive({
  show: false,
  id: null,
  hideTitleSpan: true,
  type: 22,
  chooseTagList: [],
  index: -1,
  source: 0
})

// 打开设置标签弹窗
function changeTagFun(e, index) {
  console.log('e,index', e, index)
  addTagDialog.type = 22
  addTagDialog.hideTitleSpan = true
  addTagDialog.id = e.id
  addTagDialog.index = index
  addTagDialog.source = 0
  detail({
    id: e.id
  })
    .then(res => {
      if (res.code === 0) {
        addTagDialog.chooseTagList = res.data.tagList?.filter(item => item.tagType === 9) || []
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
  console.log(e)
  tableForm.listData[addTagDialog.index].tagList = e
}

// 上传
const batchUploadDialog = reactive({
  show: false,
  fileId: null,
  title: '上传虚拟模特图',
  subtitle: '(上传的虚拟模特图将对所有成员可见)',
  categoryList: categoryList.value
})
const showBatchUpload = throttle(() => {
  batchUploadDialog.show = true
  batchUploadDialog.categoryList = categoryList.value
  // batchUploadDialog.chooseFileId = chooseFileId.value || '0'
}, 700)

// 上传与批量操作
const showBatch = ref(false)
const chooseList = ref([]) // 选中的数据
// --上传操作
const uploadBatchInfo = reactive({
  useTagType: true,
  tagType: 9,
  show: false, // 是否显示
  hideFile: false, // 上传的时候隐藏文件夹选项
  uploadAccept: '', // 接收的上传类型
  title: '', // 标题
  uploadBtnText: '', // 上传资源/资源按钮文案
  cancelBtnText: '', // 取消按钮文案
  confirmBtnText: '', // 提交按钮文案
  littleTips: '', // 上传资源/资源按钮描述
  origin: 'virtualModel', // 来源 媒体资源库
  type: '', // 资源/资源上传upload 批量操作allMarking
  batchItem: -1, // 当type="allMarking"时传入；1 去标选中创意元素 2 去标搜索出的所有创意元素 3 打标选中创意元素 4 打标搜索出的所有创意元素 5 删除选中创意元素 6 删除搜索出的所有创意元素
  batchOperationArr: [], // 当type="allMarking"&&batchItem='1||3||5' 时传入；需要批量操作的数据列表
  totalList: 0 // 数据总条数 当type="allMarking"&&batchItem='2||4||6' 时传入；需要批量操作的数据条数
})
// 打开批量上传弹窗
// const showBatchUpload = throttle(() => {
//   uploadBatchInfo.hideFile = true
//   uploadBatchInfo.uploadAccept = '.gif,audio/mp3,.ttf,.otf'
//   uploadBatchInfo.imageType = ['gif']
//   uploadBatchInfo.title = '上传媒体资源'
//   uploadBatchInfo.uploadBtnText = '本地上传'
//   uploadBatchInfo.cancelBtnText = '取消'
//   uploadBatchInfo.confirmBtnText = '上传'
//   uploadBatchInfo.littleTips =
//     '支持批量添加，每次最多选择 50 个文件，BGM和音效支持：mp3，大小不超过20M，字体支持：ttf/otf，大小不超过25M，贴纸支持：gif，大小不超过15M'
//   uploadBatchInfo.type = 'upload'
//   uploadBatchInfo.show = true
// }, 700)
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
  ElMessage.success('操作成功！')
  beforeBatchChange()
}

// --上传操作 end

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
      batchBeforeSearch()
        .then(() => {
          pageScroll.value?.scrollTo(0, 0)
          resolve(true)
        })
        .catch(() => {
          ElMessage.warning('暂无可批量操作的数据，不支持开启')
          pageScroll.value?.scrollTo(0, 0)
          clearBatch()
          querySearch()
          resolve(false)
        })
    } else {
      clearBatch()
      resetSearch()
      pageScroll.value?.scrollTo(0, 0)
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
  if (showBatch.value) {
    const item = searchComponents.value.find(item => item.filed === 'subSource') || {}
    if (isNotEmpty(item)) {
      item.val = []
    }
  }
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
      ElMessage.warning('请先选择资源')
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
        `<div>确定批量删除选中的<span style="font-weight:600;color:#364FCD;margin:0 4px">${chooseList.value.length}</span>个虚拟模特图片？删除后不可恢复，请谨慎操作。</div>`,
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
                ElMessage.success('删除成功')
                clearBatch()
                showBatch.value = false
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

// --批量操作 end

onUnmounted(() => {
  window.onresize = null
})
</script>
<style lang="scss" scoped>
.page {
  width: 100%;
  height: 100%;

  .top_search {
    margin-bottom: 16px;
    border-radius: 4px;
    overflow: hidden;
  }

  .page_top {
    position: relative;
    background: #fff;
    border-bottom: 1px solid #e8e8e8;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
    padding: 20px 24px 0;
    border-radius: 4px 4px 0 0;
    overflow: hidden;

    .top_left {
      width: calc(100% - 120px);

      .top_catgory {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: flex-start;

        .catgory_label {
          margin-bottom: 12px;
          margin-right: 8px;
          font-weight: 400;
          font-size: 14px;
          color: #303133;
          line-height: 26px;
        }

        .category_content {
          width: calc(100% - 80px);
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: flex-start;
          flex-wrap: wrap;

          .one_category {
            margin-bottom: 12px;
            margin-right: 12px;
            border-radius: 4px;
            border: 1px solid #dcdee0;
            font-weight: 400;
            font-size: 12px;
            color: #606266;
            line-height: 20px;
            padding: 2px 8px;
            cursor: pointer;

            &:hover {
              background: #f6f8fa;
            }
          }

          .choose_category {
            background: #364fcd !important;
            color: #ffffff;
            border-color: #364fcd;
          }
        }
      }
    }

    .action_box {
      position: absolute;
      right: 24px;
      top: 0;
      height: 65px;
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      align-items: center;
    }
  }

  .page_bottom {
    width: 100%;
    overflow: auto;
    overflow-x: hidden;
    padding: 0 0 0 24px;
    background: #fff;
    height: calc(100% - 150px);

    .model_list {
      width: calc(100% + 24px);
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: flex-start;
      flex-wrap: wrap;

      .one_model {
        margin-right: 16px;
        margin-top: 16px;

        .model_top {
          position: relative;
          width: 100%;
          height: calc(100% - 32px);

          .resource_check {
            position: absolute;
            left: 0;
            top: 0;
            z-index: 10;
            width: 100% !important;
            height: 100% !important;
            background-color: rgba(0, 0, 0, 0.4) !important;
            border-radius: 4px !important;
            padding-top: 8px;
          }

          .model_cover {
            overflow-clip-margin: border-box;
            -webkit-overflow-clip-margin: border-box;
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: flex;
            border-radius: 4px;
          }

          .model_style {
            position: absolute;
            top: 8px;
            right: 8px;
            height: 20px;
            overflow: hidden;
            width: 70%;
            display: flex;
            flex-direction: row;
            justify-content: flex-end;
            align-items: flex-start;
            flex-wrap: wrap;

            .one_style {
              margin-bottom: 8px;
              margin-right: 8px;
              font-weight: 400;
              font-size: 12px;
              color: #ffffff;
              line-height: 18px;
              padding: 1px 8px;
              background: rgba(0, 0, 0, 0.4);
              border-radius: 4px;
              white-space: nowrap; /* 确保文本不换行 */
              overflow: hidden; /* 超出部分隐藏 */
              text-overflow: ellipsis; /* 使用省略符号 */
            }
          }

          .scene_btn_tag {
            position: absolute;
            bottom: 12px;
            right: 12px;
            display: none;

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

        .model_top:hover {
          .scene_btn_tag {
            display: block !important;
          }
        }

        .model_bottom {
          width: 100%;
          text-align: center;
          font-weight: 400;
          font-size: 14px;
          color: #303133;
          line-height: 20px;
          padding: 0 8px 0;

          .has_title {
            width: 100%;
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            padding-top: 12px;

            .name_text {
              max-width: 100px;
              font-size: 14px;
              color: #303133;
              line-height: 22px;
              //@include mult_line(1);
              white-space: nowrap; /* 确保文本不换行 */
              overflow: hidden; /* 超出部分隐藏 */
              text-overflow: ellipsis; /* 使用省略符号 */
            }

            .edit_icon {
              margin-left: 8px;
              cursor: pointer;
              width: 14px;
              height: 14px;
              object-fit: contain;
              display: flex;
              margin-right: 8px;
            }
          }

          .edit_title {
            padding-top: 8px;
          }
        }
      }
    }
  }
}
</style>
