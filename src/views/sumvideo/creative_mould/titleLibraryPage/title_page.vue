<template>
  <div class="title_page" v-loading="pageData.loading">
    <div class="search_warp">
      <industrySearch
        :industryList="choseTabList"
        source="titlePage"
        @updateIndustry="choseChange"
      />
      <div class="btn_warp">
        <el-button type="primary" class="btn_item" @click="addTitleFn">添加标题</el-button>
        <el-button type="primary" class="btn_item" @click="importData.show = true">
          批量导入
        </el-button>
        <el-button type="primary" class="btn_item btn_more" @click="more">
          生成更多
          <img
            src="https://tagvv-1256030678.file.myqcloud.com/20240229zojyt.png"
            alt=""
            class="more_icon"
          />
        </el-button>
      </div>
    </div>
    <!-- 列表 -->
    <div class="container_warp" ref="scrollRef">
      <template v-if="pageData.listData && pageData.listData.length > 0">
        <div class="container">
          <div
            class="column"
            :infinite-scroll-delay="300"
            v-infinite-scroll="getMoreList"
            :infinite-scroll-distance="50"
            :infinite-scroll-immediate="false"
            :infinite-scroll-disabled="pageData.listData.length >= total"
            v-for="(column, index) in columns"
            :key="index"
          >
            <div
              class="item"
              v-for="(item, itemIndex) in column.columnArr"
              :key="itemIndex"
              :style="{
                width: (listWidth - (columns.length - 1) * 14) / columns.length + 'px'
              }"
            >
              <div class="title_item_column">
                <el-tooltip
                  effect="dark"
                  :show-after="300"
                  :hide-after="0"
                  :enterable="false"
                  :offset="30"
                  :fallback-placements="['top', 'bottom', 'left', 'right']"
                >
                  <template #content>
                    <div
                      :style="{
                        width: (listWidth - (columns.length - 1) * 14) / columns.length + 'px'
                      }"
                    >
                      {{ item.title }}
                      <br />
                      {{ item.description || '' }}
                    </div>
                  </template>
                  <div class="item_content">
                    {{ item.title }}
                    <br />
                    {{ item.description || '' }}
                  </div>
                </el-tooltip>

                <div class="item_foot">
                  <img :src="iconObj[item.creationType]" alt="" class="plat_icon" @click.stop />
                  <div class="times_warp" v-if="item.useTimes > 0">
                    使用次数：
                    <span class="use_text">{{ item.useTimes || 0 }}</span>
                  </div>
                  <div style="flex: 1" v-else></div>
                  <div class="btn_warp">
                    <img
                      src="https://tagvv-1256030678.file.myqcloud.com/20240228azlqt.png"
                      alt=""
                      class="edit_icon"
                      @click="editOne(item)"
                    />
                    <img
                      src="https://tagvv-1256030678.file.myqcloud.com/202402281wj2y.png"
                      alt=""
                      class="del_icon"
                      @click="delOne(item)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="loading_library" v-if="loadingTips">
          <img
            src="/public/loading.gif"
            v-if="pageData.loading && pageData.listData.length > 0"
            alt=""
          />
          {{ loadingTips }}
        </div>
      </template>
      <div
        v-else-if="pageData.listData && pageData.listData.length == 0 && !pageData.loading"
        class="no_echart"
      >
        <img src="@/assets/images/content_center/no_activity.png" alt />
        暂无数据
      </div>
    </div>

    <div class="footer">
      <div class="footer_l">
        共
        <span class="num">{{ total }}</span>
        条
      </div>
      <div class="footer_r">
        <div class="back_center" @click="_backCenter">
          <img
            src="https://tagvv-1256030678.file.myqcloud.com/20231023elnn8.png"
            alt=""
            class="del"
          />
          回收站
        </div>
        <!-- <div class="more" @click="more">生成更多</div> -->
      </div>
    </div>
    <backCenter
      v-if="showBack"
      :show="showBack"
      @close="backClose"
      @reduction="reduction"
      :creativeId="creativeId"
      :creationType="creationType"
    />
    <addTitle
      :info="addTitleInfo"
      v-if="addTitleInfo.show"
      :creativeId="creativeId"
      @updateList="addTitleUpdateList"
    />
    <!-- 批量导入 -->
    <import-file-dialog
      v-model:show="importData.show"
      title="批量导入"
      uploadUrl="/api/v1/sumvideo/sv/creative/copy/importTitleAndDesc"
      :exportFile="downLoadTemplate"
      :canBatchAddExportFiles="canBatchAddExportFiles"
      :otherData="{ creativeId }"
      @uploadSuccess="getList"
    ></import-file-dialog>
  </div>
</template>

<script setup>
import industrySearch from '../components/industry_search.vue'
import backCenter from '../components/back_center.vue'
import addTitle from './addTiitle.vue'
import importFileDialog from '@/views/market/components/import_file_dialog.vue'

import {
  listTitleAndDesc,
  recycleOrRestoreCreativeTitleDesc,
  getBatchSaveTitleAndDescTemplate
  // deleteTitleAndDesc
} from '@/api/sumvideo/creative_ai_title.js'
import { throttle, getCWidth } from '@/utils/tools.js'
import { exportFile } from '@/utils/exportFile'

const props = defineProps({
  creativeId: {
    type: String || Number,
    default: null
  }
})
const { creativeId } = toRefs(props, 'creativeId')
const message = inject('$message')
const scrollRef = ref(null)
const iconObj = {
  0: 'https://tagvv-1256030678.file.myqcloud.com/202402285wmfw.png',
  1: 'https://tagvv-1256030678.file.myqcloud.com/20231023jccep.png',
  2: 'https://tagvv-1256030678.file.myqcloud.com/20231023wmb1d.png',
  3: 'https://tagvv-1256030678.file.myqcloud.com/20240228osml4.png',
  4: 'https://tagvv-1256030678.file.myqcloud.com/202402286v6ix.png'
}
// 添加标题
const addTitleInfo = reactive({
  show: false,
  title: '添加标题',
  editItem: null // 编辑
})

const choseTabList = [
  {
    name: '通用',
    id: 'common',
    isChoose: false,
    icon: 'https://tagvv-1256030678.file.myqcloud.com/202402285wmfw.png',
    value: 0
  },
  {
    name: '小红书',
    id: 'xhs',
    isChoose: false,
    icon: 'https://tagvv-1256030678.file.myqcloud.com/20231023jccep.png',
    value: 1
  },
  {
    name: '抖音',
    id: 'dy',
    isChoose: false,
    icon: 'https://tagvv-1256030678.file.myqcloud.com/20231023wmb1d.png',
    value: 2
  },
  {
    name: '快手',
    id: 'ks',
    isChoose: false,
    icon: 'https://tagvv-1256030678.file.myqcloud.com/20240228osml4.png',
    value: 3
  },
  {
    name: '视频号',
    id: 'wx',
    isChoose: false,
    icon: 'https://tagvv-1256030678.file.myqcloud.com/202402286v6ix.png',
    value: 4
  }
]
const pageData = reactive({
  loading: true, // 列表加载状态
  page: {
    pageNo: 1,
    pageSize: 50
  },
  listData: [],
  newListData: []
})
const total = ref(0)
const listDataCLen = ref(7) // 数据有几列

const emits = defineEmits(['changeTab'])
const showBack = ref(false)
const creationType = ref('') // 选择的类别

const columns = ref([[{}], [{}]])
const arrIndex = ref([])
const listWidth = ref()
const importData = reactive({
  show: false // 批量导入是否打开
})
const canBatchAddExportFiles = ref(true) // 是否可以点击导出

function getWidth() {
  listWidth.value = getCWidth() - 32 - 48 - 7
  listDataCLen.value = Math.floor((getCWidth() - 32 - 48 - 84) / 220)
}

const loadingTips = computed(() => {
  let displayText = ''
  if (pageData.loading && pageData.listData.length > 0) {
    displayText = '加载中...'
  } else if (pageData.listData.length < total.value && pageData.listData.length !== 0) {
    displayText = '上拉加载更多~'
  } else if (pageData.listData.length / listDataCLen.value > 3) {
    displayText = '已经到底了~'
  } else {
    displayText = ''
  }
  return displayText
})

function getMinHeight(arr) {
  const a = []
  for (let i = 0; i < arr.length; i++) {
    a.push(parseInt(arr[i].showHeight || 0) + parseInt(arr[i].top || 0))
  }
  return Math.min.apply(null, a)
}
function getMinIndex(val) {
  for (let i = 0; i < columns.value.length; i++) {
    const showHeight =
      columns.value[i].columnArr.length > 0
        ? columns.value[i].columnArr[columns.value[i].columnArr.length - 1].showHeight
        : 0
    const top =
      columns.value[i].columnArr.length > 0
        ? columns.value[i].columnArr[columns.value[i].columnArr.length - 1].top
        : 0
    if (parseInt(showHeight) + parseInt(top) === val) {
      arrIndex.value.push(i)
    }
  }
}
function init() {
  // console.log(container.value.clientWidth)
  columns.value = []
  const contentLen = pageData.listData.length
  // 根据可视区域的宽度判断需要几列
  const cLen = Math.floor((getCWidth() - 32 - 48 - 84) / 220)
  listDataCLen.value = JSON.parse(JSON.stringify(cLen))
  // 初始化每一列的第一行元素
  for (let i = 0; i < cLen; i++) {
    if (i < pageData.listData.length) {
      pageData.listData[i].top = 0 // 预设距离顶部值为0
      columns.value.push({ columnArr: [pageData.listData[i]] })
    } else {
      columns.value.push({
        columnArr: []
      })
    }
  }

  // 对剩余元素的判断，应该放到哪一列
  for (let index = cLen; index < contentLen; index++) {
    arrIndex.value = []
    const arr = [] // 找到高度最小的一列，可能有多个
    let minHeight = 0 // 高度最小的一列的高度
    let pushIndex = 0 // 高度最小的一列所在位置的索引

    for (let i = 0; i < columns.value.length; i++) {
      arr.push({
        showHeight:
          columns.value[i].columnArr.length > 0
            ? columns.value[i].columnArr[columns.value[i].columnArr.length - 1].showHeight
            : 0,
        top:
          columns.value[i].columnArr.length > 0
            ? columns.value[i].columnArr[columns.value[i].columnArr.length - 1].top
            : 0
      })
    }

    minHeight = getMinHeight(arr)
    getMinIndex(minHeight)

    if (arrIndex.value.length > 0) {
      pushIndex = Math.min.apply(null, arrIndex.value) // 出现高度一样的，去索引最小的
    }

    pageData.listData[index].top = minHeight + 20
    columns.value[pushIndex].columnArr.push(pageData.listData[index])
  }
}
// 编辑一个
const editOne = throttle(function (item) {
  addTitleInfo.title = '编辑标题'
  addTitleInfo.editItem = item
  addTitleInfo.show = true
}, 500)

function addTitleFn() {
  addTitleInfo.title = '添加标题'
  addTitleInfo.editItem = null
  addTitleInfo.show = true
}

// 下载模板
function downLoadTemplate() {
  canBatchAddExportFiles.value = false
  return exportFile(getBatchSaveTitleAndDescTemplate, {}, '文案批量导入模板', 'xlsx')
    .then(() => {
      canBatchAddExportFiles.value = true
    })
    .catch(() => {
      canBatchAddExportFiles.value = true
    })
}

function getList() {
  pageData.loading = true
  pageData.page.pageNo = 1
  listTitleAndDescFn()
}

function addTitleUpdateList(tipsType, tips) {
  if (tips) {
    message[tipsType](tips)
  }
  addTitleInfo.show = false
  pageData.page.pageNo = 1
  listTitleAndDescFn()
}

// 回收一个
const delOne = throttle(function (item) {
  const params = {
    creativeId: creativeId.value,
    id: item.id,
    operateWay: 1
  }
  recycleOrRestoreCreativeTitleDesc(params)
    .then(res => {
      if (res.code === 0) {
        // pageData.listData = pageData.listData.filter(s => {
        //   return s.id !== item.id
        // })
        // total.value--
        // 如果剩余数量 < 30 并且有下一页就获取下一页
        // if (pageData.listData.length < 30) {
        message.success('移入回收站成功！')
        pageData.page.pageNo = 1
        listTitleAndDescFn()
        // }
      }
    })
    .catch(() => {
      message.error('操作失败！')
    })
}, 500)
function listChange(list) {
  list.forEach(x => {
    if (x.type === 1 || x.type === 2) {
      const showHeight = x.wight ? (220 / x.wight) * x.height : 108
      x.showHeight = showHeight < 108 ? 108 : showHeight
    } else if (x.type === 3) {
      x.showHeight = 132
    } else if (x.type === 4) {
      x.showHeight = 182
    } else {
      x.showHeight = 108
    }
    x.top = ''
  })
  return list
}
// 获取列表
function listTitleAndDescFn() {
  const tabItem = choseTabList.find(item => item.id === creationType.value)
  const params = {
    creativeId: Number(creativeId.value),
    creationType: tabItem && tabItem.value === 0 ? 0 : tabItem?.value || '', // 创作类型 1小红书文案 2抖音标题
    isRecycle: 0, // 是否回收 1是 0否
    orderSetting: '',
    pageNo: pageData.page.pageNo,
    pageSize: pageData.page.pageSize
  }
  listTitleAndDesc(params)
    .then(res => {
      if (res.code === 0) {
        total.value = res.data.total

        if (params.pageNo === 1) {
          pageData.listData = listChange(res.data.records || [])
          total.value = res.data.total || 0
        } else {
          pageData.newListData = listChange(res.data.records || [])
          pageData.listData = pageData.listData.concat(pageData.newListData)
        }
      } else {
        if (params.pageNo === 1) {
          pageData.listData = []
          total.value = 0
        }
      }
      init()
      nextTick(() => {
        pageData.loading = false
      })
    })
    .catch(() => {
      pageData.loading = false
    })
}
function choseChange(val) {
  pageData.loading = true
  creationType.value = val ? val[0] : ''
  pageData.page.pageNo = 1
  listTitleAndDescFn()
  nextTick(() => {
    scrollRef.value.scrollTop = 0
  })
}

function getMoreList() {
  if (pageData.listData.length >= total.value) return
  pageData.page.pageNo++
  pageData.loading = true
  listTitleAndDescFn()
}

function _backCenter() {
  showBack.value = true
}

function backClose() {
  showBack.value = false
}

function reduction() {
  pageData.page.pageNo = 1
  listTitleAndDescFn()
}

function more() {
  emits('changeTab', 'create_title')
}

onMounted(() => {
  pageData.loading = true
  listTitleAndDescFn()
  getWidth()
  window.onresize = () => {
    init()
    getWidth()
  }
})
</script>

<style lang="scss" scoped>
.title_page {
  height: calc(100% - 148px);
  position: relative;
  margin-top: -14px;
  padding-top: 14px;
  .search_warp {
    padding: 0 24px 0 24px;
    position: relative;
    .btn_warp {
      position: absolute;
      top: 0;
      right: 24px;
      display: flex;
      align-items: flex-start;
      .btn_item {
        margin-left: 16px;
      }
      .btn_more {
        position: relative;
        .more_icon {
          width: 23px;
          height: 17px;
          position: absolute;
          top: -8px;
          right: -16px;
        }
      }
    }
  }
  .title_list {
    padding: 0 24px 0 10px;
    height: calc(100% - 32px);
    overflow-y: scroll;
    .title_list_scroll {
      column-count: 2;
      column-gap: 12px;
      position: relative;
      column-width: 50%;
      .title_item {
        height: auto;
        box-sizing: border-box;
        background: rgba(23, 11, 26, 0.1);
        margin-top: 12px !important;
        padding: 12px 16px;
        border-radius: 4px;
        position: relative;
        transition: opacity 1s;
        break-inside: avoid;
        width: 100%;
        display: inline-block;
        .label {
          width: max-content;
          white-space: nowrap;
          // min-width: 70px;
          color: #303133;
          line-height: 20px;
          font-size: 14px;
          display: inline-block;
        }
        .c_content {
          display: inline-block;
          word-break: break-all;
        }
        .c_desc,
        .cr_title {
          color: #303133;
          line-height: 20px;
          font-size: 14px;
          display: flex;
        }
        .c_desc {
          margin-top: 4px;
        }
        .item_warp {
          display: none;
          opacity: 0; /* 初始状态下不可见 */
          transition: opacity 1s; /* 添加过渡效果 */
          position: absolute;
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          border: 1px solid;
          border-radius: 4px;
          top: 0;
          left: 0;
          .del_icon {
            position: absolute;
            width: 20px;
            height: 20px;
            top: -12px;
            right: -12px;
            cursor: pointer;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
          }
        }
        .item_warp_1 {
          border-color: #e85978;
        }
        .item_warp_2 {
          border-color: #170b1a;
        }
        &:hover {
          .item_warp {
            display: block;
            animation: fadeIn 2s forwards; /* 使用动画来在一秒后渐显 */
          }
        }
        .use_num {
          position: absolute;
          top: 0;
          left: 0;
          background: rgba(0, 0, 0, 0.45);
          height: 22px;
          line-height: 22px;
          text-align: center;
          border-radius: 4px 0px 11px 0px;
          font-size: 12px;
          color: #ffffff;
          padding: 0 8px;
        }
      }
      .title_item_xhs {
        background: rgba(232, 89, 120, 0.1);
      }
    }
  }
  .footer {
    height: 72px;
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    padding: 0 24px;
    .footer_l {
      margin-top: 32px;
      .num {
        color: #364fcd;
      }
    }
    .footer_r {
      display: flex;
      align-items: center;
      font-size: 14px;
      .back_center {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 90px;
        height: 32px;
        border-radius: 4px;
        // opacity: 0.5;
        border: 1px solid rgba(153, 153, 153, 0.5);
        color: #303133;
        // margin-right: 16px;
        cursor: pointer;
        margin-left: 24px;
        margin-top: 20px;
        .del {
          width: 20px;
          height: 20px;
          margin-right: 4px;
        }
      }
      // .more {
      //   cursor: pointer;
      //   width: 99px;
      //   height: 32px;
      //   background: #364fcd;
      //   border-radius: 4px;
      //   line-height: 32px;
      //   text-align: center;
      //   color: #ffffff;
      // }
    }
  }

  .em_warp {
    position: absolute;
    box-sizing: border-box;
    top: 32px;
    left: 24px;
    width: calc(100% - 48px);
    height: calc(100% - 32px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .em_img {
      width: 70px;
      height: 70px;
    }
    .text {
      margin-top: 8px;
      color: #8f939a;
      line-height: 20px;
      font-size: 14px;
    }
  }
}
@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.container_warp {
  margin: 16px auto 0 24px;
  height: calc(100% - 35px);
  overflow-y: scroll;
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
  .loading_library {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin-top: 15px;

    img {
      height: 25px;
      margin-right: 4px;
    }
  }
}
.container {
  // padding-bottom: 20px;
  display: flex;
  justify-content: flex-start;
  transition: all 0.2s ease-in-out;

  .item {
    // cursor: pointer;
    width: 220px;
    height: 154px;
    color: #000;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.5s ease-in-out;
    margin: 0 14px 14px 0;
  }

  .title_item_column {
    width: 100%;
    height: 100%;
    background: #f2f3f5;
    border-radius: 4px;
    padding: 8px 12px 6px 12px;
    .item_content {
      font-family: PingFangSC, PingFang SC;
      font-weight: 400;
      font-size: 14px;
      color: #333333;
      line-height: 19px;
      height: max-content;
      height: calc(100% - 24px);
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 6; /* 控制显示的行数 */
      -webkit-box-orient: vertical;
      cursor: default;
    }

    .item_foot {
      display: flex;
      margin-top: 6px;
      .plat_icon {
        margin-top: 2px;
        width: 16px;
        min-width: 16px;
        height: 16px;
      }
      .times_warp {
        margin-top: 1px;
        margin-left: 6px;
        font-family: PingFangSC, PingFang SC;
        font-weight: 400;
        font-size: 12px;
        color: #909399;
        line-height: 18px;
        flex: 1;
        .use_text {
          color: #333333;
        }
      }
      .btn_warp {
        .edit_icon,
        .del_icon {
          width: 20px;
          height: 20px;
          min-width: 20px;
          cursor: pointer;
        }
        .del_icon {
          margin-left: 8px;
        }
      }
    }
  }
}
</style>
