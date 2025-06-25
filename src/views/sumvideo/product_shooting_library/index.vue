<template>
  <div class="sumvideo_page">
    <!-- 筛选条件 -->
    <div ref="xmSearchRef">
      <xm_search
        :searchComponents="searchComponents"
        :useOwnReset="true"
        :showShrink="true"
        @getData="querySearch"
        @reset="resetSearch"
        @updateShrink="updateShrink"
      ></xm_search>
      <!-- @openChoseLabel="openChoseLabel" -->
    </div>
    <div
      v-loading="changeFileLoading && tableForm.loading"
      class="page_content"
      :style="{
        height: contentHeight + 'px'
      }"
    >
      <!-- 文件夹 -->
      <div class="content_left">
        <filesDOM
          ref="filesRef"
          origin="productShoot"
          :fileType="4"
          :showDropDown="true"
          :hideFileIcon="true"
          @updateId="updateChooseId"
        />
      </div>
      <!-- 表格 -->
      <div class="content_right">
        <div class="content_top">
          开放至AI终端
          <el-tooltip class="item" effect="dark" placement="top">
            <template #content>
              <div style="max-width: 290px">
                开启后，员工在爆款拆解和AI图文生成功能中可使用所有实拍图
              </div>
            </template>
            <img
              src="https://tagvv-1256030678.file.myqcloud.com/20231122xve4d.png"
              style="width: 16px; height: 16px; margin: 0 8px"
              alt
            />
          </el-tooltip>
          <el-switch
            v-model="aiSwitch"
            :active-value="1"
            :inactive-value="0"
            inline-prompt
            :laoding="aiSwitchLoading"
            :width="44"
            :before-change="aiSwitchChange"
          ></el-switch>
        </div>
        <!-- 表格 -->
        <div class="right_table">
          <tableDOM
            v-if="initTable"
            ref="pageScroll"
            :changeFileLoading="changeFileLoading"
            @loadFun="loadFun"
            @updateDetailFun="updateDetailFun"
            @updateListFun="querySearch"
            :tableForm="tableForm"
            :list="tableForm.listData"
            :chooseFileId="chooseFileId"
            :tableBodyHeight="parseInt(contentHeight - 20 - 34 - 16 - 32)"
          />
        </div>
      </div>
    </div>
    <!-- 编辑标签的弹窗 -->
    <!-- <addTagDOM v-if="addTagDialog.show" :addDialog="addTagDialog" @updateTag="updateTag" /> -->
  </div>
</template>
<script setup>
import { selectBrand } from '@/api/system_setting/brand_info'
import tableDOM from './good_table.vue'
import filesDOM from '@/views/sumvideo/components/files/choose_file_tree.vue'

import { pageShoot, switchAi } from '@/api/sumvideo/product_shooting_library'
import { saveStatLog } from '@/api/content_center/material_library.js'
import { getQuery } from '@/utils/get_query.js'
import { throttle, isNotEmpty, getCHeight } from '@/utils/tools.js'
// 筛选条件
const chooseFileId = ref(null) // 选中的fileId
const changeFileLoading = ref(true) // 是否是更新文件夹触发的loading

const searchComponents = ref([
  {
    type: 'input',
    label: '商品名称',
    val: '',
    placeholder: '请输入商品名称',
    filed: 'name'
  },
  {
    type: 'input',
    label: '实拍模特姓名',
    val: '',
    placeholder: '请输入实拍模特姓名',
    filed: 'mannequinName'
  },

  {
    shrink: true, // 是否支持将筛选项折叠
    type: 'dateRange', // 组件类型
    label: '商品创建时间', // label展示
    val: '', // 响应式绑定
    isDisEdit: true, // 是否禁用文本框输入
    startTimeVal: 'createTimeMin',
    endTimeVal: 'createTimeMax',
    placeholder: ['开始日期', '结束日期'],
    disabledDate(time) {
      return time.getTime() > Date.now()
    }, // 禁用日期
    filed: 'dataTime' // 查询字段名
  },
  {
    shrink: true, // 是否支持将筛选项折叠
    type: 'dateRange', // 组件类型
    label: '实拍图上传时间', // label展示
    val: '', // 响应式绑定
    isDisEdit: true, // 是否禁用文本框输入
    startTimeVal: 'shootUploadTimeMin',
    endTimeVal: 'shootUploadTimeMax',
    placeholder: ['开始日期', '结束日期'],
    disabledDate(time) {
      return time.getTime() > Date.now()
    }, // 禁用日期
    filed: 'dataTime2' // 查询字段名
  },
  {
    shrink: true, // 是否支持将筛选项折叠
    type: 'newLabelFilterV2',
    label: '商品标签',
    behavior: '选择',
    val: [],
    choseName: '标签',
    placeholder: '请选择商品标签',
    filed: 'productTags',
    addTagInfo: {
      type: 16,
      hideTitleSpan: false,
      id: null,
      index: [],
      source: null
    } // addTag的需要的相关数据，比如回显等，不会在入参内
  },
  {
    shrink: true, // 是否支持将筛选项折叠
    type: 'newLabelFilterV2',
    label: '实拍模特标签',
    behavior: '选择',
    val: [],
    choseName: '标签',
    placeholder: '请选择实拍模特标签',
    filed: 'mannequinTags',
    addTagInfo: {
      type: 17,
      hideTitleSpan: false,
      id: null,
      index: [],
      source: null
    } // addTag的需要的相关数据，比如回显等，不会在入参内
  }
])
// 表格的查询条件
const tableForm = reactive({
  loading: true,
  listData: [],
  newListData: [],
  page: {
    index: 1,
    size: 10,
    total: 0
  }
})

// --查询
// 更新选中的文件夹ID
function updateChooseId(e) {
  if (!changeFileLoading.value) {
    console.log('更新选中的文件夹', e)
    changeFileLoading.value = true
    chooseFileId.value = e
    querySearch()
  }
}
const pageScroll = ref() // 滚动的区域
// 查询的回调
const querySearch = throttle(function () {
  tableForm.page.index = 1
  tableForm.loading = true

  pageScroll.value?.scrollToFun()
  getList().then(() => {})
}, 500)
// 重置的回调
const resetSearch = throttle(function () {
  tableForm.loading = true
  tableForm.page = {
    index: 1,
    size: 10,
    total: 0
  }
  pageScroll.value?.scrollToFun()
  getList().then(() => {})
}, 500)
// 获取线索列表数据
function getList() {
  return new Promise((resolve, reject) => {
    // 判断是否可以发送请求
    // 处理请求参数
    const params = getQuery(searchComponents.value)
    console.log('ppp', params)
    tableForm.loading = true
    params.folderIds = [chooseFileId.value || '0']
    params.pageNo = tableForm.page.index
    params.pageSize = tableForm.page.size

    // 如果标签有内容 就记录标签查询记录
    if (isNotEmpty(params.tags)) {
      saveTagLog(params.tags)
    }
    // 发送请求
    pageShoot(params)
      .then(res => {
        // const arr = []
        // res.data.records.forEach(item => {
        //   arr.push(item.tagList)
        // })

        if (res.code === 0) {
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
        changeFileLoading.value = false
        resolve()
      })
      .catch(() => {
        if (tableForm.page.index === 1) {
          tableForm.listData = []
          tableForm.page.total = 0
        }
        tableForm.loading = false
        changeFileLoading.value = false
        resolve()
      })
  })
}
const loadFun = throttle(function () {
  if (tableForm.loading) return
  tableForm.loading = true
  tableForm.page.index++
  getList()
}, 1000)

// 获取单条商品详情
function updateDetailFun(index, info) {
  console.log('获取详情', index)
  tableForm.listData[index] = info
}
// --查询 end

// --标签
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
// --标签 end
const xmSearchRef = ref()
const contentHeight = ref(80) // 178
const initTable = ref(false) // 表格初始化完成
function getTableHeight() {
  // 128
  contentHeight.value = getCHeight() - 10 - 16 - (xmSearchRef.value?.offsetHeight || 80)
  nextTick(() => {
    initTable.value = true
  })
}
// 开放至AI终端
const aiSwitch = ref(0)
const aiSwitchLoading = ref(false)
const aiSwitchChange = async value => {
  aiSwitchLoading.value = true
  const res = await switchAi({
    allowMiniQueryShotMaterial: aiSwitch.value === 0 ? 1 : 0
  })
  aiSwitchLoading.value = false
  return res?.code === 0
}

onMounted(() => {
  // 获取表格数据
  resetSearch()
  getTableHeight()
  window.onresize = () => {
    getTableHeight()
  }
  /**
   * 品牌配置查询
   */
  getBrandInfo()
})
function getBrandInfo() {
  selectBrand({})
    .then(res => {
      aiSwitch.value = res?.data?.allowMiniQueryShotMaterial || 0
    })
    .finally(() => {})
}
// 筛选项折叠/展开
function updateShrink() {
  nextTick(() => {
    getTableHeight()
  })
}
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
  }
  .content_right {
    margin-left: 16px;
    width: calc(100% - 264px);
    height: 100%;
    background: #ffffff;
    border-radius: 4px;
    padding: 0 16px;
    .content_top {
      padding-top: 16px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }
    .right_cloud {
      padding: 20px 0 16px;
      border-bottom: 1px solid #e8e8e8;
      .one_cloud {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;

        .cloud_label {
          margin-right: 8px;
          font-weight: 400;
          font-size: 14px;
          color: #303133;
          line-height: 20px;
        }
        .cloud_content {
          width: calc(100% - 80px);
          display: flex;
          height: 26px;
          overflow: hidden;
          flex-direction: row;
          justify-content: flex-start;
          align-items: center;
          flex-wrap: wrap;
          .one_cloud_content {
            margin: 0 12px 12px 0;
            cursor: pointer;
            padding: 2px 8px;
            border-radius: 4px;
            border: 1px solid #dcdee0;
            font-weight: 400;
            font-size: 12px;
            color: #606266;
            line-height: 20px;
            &:hover {
              background: #f6f8fa;
            }
          }
          .one_cloud_content_12 {
            border-radius: 12px !important;
          }
          .choose_cloud_content {
            background: #364fcd !important;
            border: 1px solid #364fcd !important;
            color: #ffffff !important;
          }
        }
      }
      .one_cloud + .one_cloud {
        margin-top: 12px;
      }
    }
    .right_table {
      width: 100%;
      // height: 0;
      // height: calc(100% - 101px);
      padding: 17px 1px;
    }
  }
}
:deep(.content_content_box) {
  padding-right: 0 !important;
}
</style>
