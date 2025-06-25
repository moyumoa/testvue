<template>
  <div class="content_manage_warp">
    <div class="tab_box">
      <el-tabs v-model="chooseTabPlatform" @tab-click="changeTabPlatform">
        <el-tab-pane :name="tab.key" v-for="tab in tabListPlatform" :key="tab.key">
          <template #label>
            <span
              class="custom-tabs-label"
              :class="{ 'custom-tabs-label-no-padding': !tab.platform }"
            >
              <div
                v-if="tab.platform"
                :class="`xm_platformIcon_${tab.platform}`"
                style="left: 0"
              ></div>
              <span>{{ tab.label }}</span>
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>
    </div>
    <div class="content_manage">
      <xm_search
        :searchComponents="searchComponents"
        @getData="querySearch"
        @reset="resetSearch"
        :btnDis="page.loading"
        ref="xmSearchRef"
      >
        <template #searchBtn>
          <exp_button ref="expButton" :asyncFunc="exportReport" :isExport="true">导出</exp_button>
        </template>
      </xm_search>
      <div class="manage_table">
        <div class="anchorType_box">
          <div
            :class="['one_anchorType', chooseAnchorType === item.value ? 'choose_anchorType' : '']"
            v-for="(item, index) in contentAnchorType.dictionaries"
            :key="index"
            @click="chooseAnchorTypeFun(item.value)"
          >
            <div :class="`xm_anchorType${item.value}_ICON`"></div>
            {{ item.en }}
          </div>
        </div>

        <div class="action_btn">
          <!-- 星麦云渠道发布 -->
          <div
            @click.stop="getXmyPublish"
            :class="{ action_xmy_publish: true, choose_xmy_publish: isXMYPublish }"
          >
            <div :class="`xm_anchorType7_ICON`"></div>
            星麦云渠道发布
          </div>
          <el-dropdown popper-class="xm_dropDown">
            <div class="dropDown_label">
              {{ tabList[chooseTabIndex].label }}
              <img src="https://tagvv-1256030678.file.myqcloud.com/20240308z7clh.png" />
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <template v-for="(item, index) in tabList">
                  <el-dropdown-item v-if="item.show" :key="index" @click="changeTab(item, index)">
                    {{ item.label }}
                  </el-dropdown-item>
                </template>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <manageTable
          :videoData="videoData"
          :page="page"
          v-if="currentIndex == 0 ? true : false"
          @getList="getDetail"
        ></manageTable>
        <manageCard
          :page="page"
          :videoData="videoData"
          v-if="currentIndex == 1 ? true : false"
          @getList="getDetail"
        ></manageCard>
      </div>
      <el-dialog v-model="dialogVisible" title="导出文档" width="30%">
        <span>{{ exportMessage }}</span>
        <template #footer>
          <span class="dialog-footer">
            <!-- <el-button @click="dialogVisible = false">Cancel</el-button> -->
            <el-button type="primary" @click="confirmClick(confirm)">查看</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { onBeforeRouteLeave } from 'vue-router'
import { setBusinessChooseParam } from '@/utils/search.js'
import { contentAnchorType } from '@/utils/dictionary/content-center.js'
import api from '@/api/content_center/content_matrix.js'
import manageTable from './components/manage_table.vue'
import manageCard from './components/manage_card.vue'

import { listVideoV2, exportVideoV2, getSearchLabel } from '@/api/content_center/content_manage.js'
import { exportFileV2 } from '@/utils/exportFile.js'
import { getQuery, checkNumberRange } from '@/utils/get_query.js'
import { useStore } from 'vuex'
import { isNotEmpty, throttle, isEmpty } from '@/utils/tools.js'
const store = useStore()
const brandViewMode = computed(() => store.state.user.brandViewMode)
const labelList = ref([])
function getAllLabel(inValue) {
  const query = {
    orderSetting: '',
    pageNo: 1,
    pageSize: 1000,
    searchCount: true,
    tagName: inValue || ''
  }
  getSearchLabel(query).then(res => {
    // console.log(res, 'get all label res')
    if (res.code === 0) {
      const arr = []
      res.data.records.forEach(item => {
        arr.push({ label: item.name, value: item.id })
      })
      // searchComponents.value.forEach(item => {
      //   if (item.type === 'inputAndSelect') {
      //     item.selects = arr
      //   }
      // })
      searchComponents.value[4].selects = arr
    } else {
      labelList.value = []
    }
  })
}

const vm = getCurrentInstance()

const params = reactive({
  sortMethods: '',
  currentIndex: 0,
  tabList: [
    {
      name: 'DESC:create_time',
      label: '最新发布时间',
      show: true
    },
    {
      name: 'DESC:play_count',
      label: '播放数',
      show: true
    },
    {
      name: 'DESC:digg_count',
      label: '点赞数',
      show: true
    },
    {
      name: 'DESC:comment_count',
      label: '评论数',
      show: true
    },
    {
      name: 'DESC:share_count',
      label: '分享数',
      show: true
    },
    {
      name: 'DESC:commerce_count',
      label: '销售额',
      show: brandViewMode.value === 1
    },
    {
      name: 'DESC:sale_count',
      label: '销售量',
      show: brandViewMode.value === 1
    },
    {
      name: 'DESC:clue_cnt',
      label: '线索数',
      show: true
    }
  ],

  videoData: {}
})
const { currentIndex, tabList, videoData, sortMethods } = toRefs(params)
const searchComponents1 = ref([
  {
    type: 'input',
    label: '内容标题',
    val: '',
    placeholder: '请输入内容标题',
    filed: 'work_name'
  },
  {
    type: 'chooseDept',
    label: '矩阵号部门',
    val: [],
    filed: 'areaIds',
    multiple: true,
    isUsePermission: true
  },
  {
    type: 'input',
    label: '矩阵号昵称',
    val: '',
    placeholder: '请输入矩阵号昵称',
    filed: 'talent_name'
  },
  // {
  //   type: 'select',
  //   label: '矩阵号类型',
  //   placeholder: '请选择矩阵号类型',
  //   val: -1,
  //   defaultVal: -1,
  //   filed: 'matrix_type',
  //   selects: [
  //     {
  //       label: '全部',
  //       value: -1
  //     },
  //     {
  //       label: '个人号',
  //       value: 1
  //     },
  //     {
  //       label: '普通企业号',
  //       value: 2
  //     },
  //     {
  //       label: '认证企业号',
  //       value: 3
  //     },
  //     {
  //       label: '品牌企业号',
  //       value: 4
  //     }
  //   ]
  // },
  {
    type: 'select',
    label: '矩阵号分组',
    placeholder: '请选择矩阵号分组',
    filed: 'groupIds',
    multiple: true,
    filterable: true,
    'collapse-tags': true,
    val: null,
    selects: [],
    selectDefultName: ['id', 'groupName']
  },
  {
    type: 'select',
    label: '作品标签',
    val: [],
    placeholder: '请输入作品标签',
    filed: 'tagIds',
    selects: [],
    filterable: true,
    multiple: true,
    'collapse-tags': true,
    remote: true,
    remoteMethod: getAllLabel
  },

  // {
  //   type: 'select',
  //   label: '发布时间',
  //   val: 12,
  //   defaultVal: 12,
  //   placeholder: '请选择发布时间',
  //   filed: 'publish_time',
  //   selects: [
  //     {
  //       label: '近6小时',
  //       value: 6
  //     },
  //     {
  //       label: '近12小时',
  //       value: 12
  //     },
  //     {
  //       label: '近24小时',
  //       value: 24
  //     },
  //     {
  //       label: '近48小时',
  //       value: 48
  //     },
  //     {
  //       label: '近3日',
  //       value: 72
  //     },
  //     {
  //       label: '近7日',
  //       value: 168
  //     },
  //     {
  //       label: '近30日',
  //       value: 720
  //     }
  //   ]
  // },

  {
    type: 'dateRange', // 组件类型
    typeOrigin: 'dateMonthRange', // 时间组件 支持筛选多少天内
    typeOriginNumber: 1, // 时间组件 支持筛选多少天内
    label: '视频发布时间', // label展示
    defaultVal: [new Date(new Date().setDate(new Date().getDate() - 2)), new Date()],
    val: [new Date(new Date().setDate(new Date().getDate() - 2)), new Date()], // 默认是近七天的数据
    disabledDate(time) {
      return time.getTime() > Date.now()
    }, // 禁用日期
    isDisEdit: true, // 是否禁用文本框输入
    placeholder: ['开始时间', '结束时间'],
    filed: 'dateRange', // 查询字段名
    clearable: true
  },

  // {
  //   type: 'select',
  //   label: '发布平台',
  //   placeholder: '请选择发布平台',
  //   val: -1,
  //   defaultVal: -1,
  //   filed: 'platform',
  //   selects: [
  //     {
  //       label: '全部',
  //       value: -1
  //     },
  //     {
  //       label: '抖音',
  //       value: 1
  //     },
  //     {
  //       label: '视频号',
  //       value: 2
  //     },
  //     {
  //       label: '小红书',
  //       value: 3
  //     },
  //     {
  //       label: '快手',
  //       value: 4
  //     }
  //   ]
  // },
  {
    type: 'select',
    label: '质检状态',
    val: -1,
    defaultVal: -1,
    placeholder: '请选择质检状态',
    filed: 'checkStatus',
    selects: [
      {
        label: '全部',
        value: -1
      },
      {
        label: '未质检',
        value: 0
      },
      {
        label: '质检合格',
        value: 1
      },
      {
        label: '质检不合格',
        value: 2
      }
    ]
  },
  {
    type: 'select',
    label: '风险项',
    val: '',
    defaultVal: '',
    placeholder: '请选择风险项',
    filed: 'riskCondition',
    selects: [
      {
        label: '点赞播放比低于0.1%（播放数>1000）',
        value: 1
      }
    ]
  },
  {
    type: 'numberRange',
    label: '播放数',
    minVal: '',
    maxVal: '',
    isNumber: true,
    minFiled: 'playNumStart',
    maxFiled: 'playNumEnd',
    placeholder: ['最低播放数', '最高播放数']
  },
  {
    type: 'numberRange',
    label: '点赞数',
    minVal: '',
    maxVal: '',
    isNumber: true,
    minFiled: 'diggNumStart',
    maxFiled: 'diggNumEnd',
    placeholder: ['最低点赞数', '最高点赞数']
  },
  {
    type: 'select',
    label: '视频类型',
    multiple: true,
    filterable: true,
    'collapse-tags': true,
    val: null,
    defaultVal: [],
    placeholder: '全部',
    filed: 'isRelatedTask',
    selects: [
      {
        label: '任务视频',
        value: 1
      },
      {
        label: '非任务视频（星麦云渠道发布）',
        value: 2
      },
      {
        label: '非任务视频（用户自行发布）',
        value: 3
      }
    ]
  }
])
const searchComponents = ref(searchComponents1.value)
// 因为有涉及到KeepAlive，所以就先复制一份，后续可用
const initSearch = function () {
  const list = setBusinessChooseParam()
  searchComponents.value = searchComponents.value.concat(list)
}
initSearch()
const contentTypeCode = ref(['all', 'dy', 'xhs']) // 有内容类型筛选的tab
// 内容类型筛选项
const searchComponentsContentType = reactive({
  type: 'select',
  label: '内容类型',
  val: -1,
  defaultVal: -1,
  placeholder: '请选内容类型',
  filed: 'mediaType',
  selects: [
    {
      label: '全部',
      value: -1
    },
    {
      label: '视频内容',
      value: 4
    },
    {
      label: '图文内容',
      value: 2
    }
  ]
})

const page = reactive({
  loading: false,
  index: 1,
  size: 10,
  total: 0
})

const tabListPlatform = ref([
  {
    label: '全部',
    key: 'all',
    platform: null
  },
  {
    label: '抖音',
    key: 'dy',
    platform: 1
  },
  {
    label: '小红书',
    key: 'xhs',
    platform: 3
  },
  {
    label: '快手',
    key: 'ks',
    platform: 4
  },
  {
    label: '视频号',
    key: 'wx',
    platform: 2
  }
])
const chooseTabPlatform = ref('all')
const message = inject('$message')
function changeTabPlatform() {
  // 检查时间是否超过30天，是的话置为开始时间+30天
  const time = toRaw(searchComponents.value.find(item => item.type === 'dateRange').val)

  const range = time[1].getTime() - time[0].getTime()
  if (range > 30 * 24 * 60 * 60 * 1000) {
    message.warning('列表查询跨度最多30天，更多数据可重新设置条件后导出查看')

    const index = searchComponents.value.findIndex(item => item.type === 'dateRange')
    console.log('index', index, time[0], time, time[0].getTime())
    searchComponents.value[index].val = [
      new Date(time[0].getTime()),
      new Date(time[0].getTime() + 30 * 24 * 60 * 60 * 1000)
    ]
  }

  // 检查是否要添加/去掉内容类型的筛选项
  const contentIndex = searchComponents.value.findIndex(x => x.filed === 'mediaType')
  if (contentTypeCode.value.includes(chooseTabPlatform.value)) {
    if (contentIndex > -1) {
      console.log('已存在')
    } else {
      console.log('添加')
      searchComponents.value.push(searchComponentsContentType)
    }
  } else {
    if (contentIndex > -1) {
      console.log('删除')
      searchComponents.value.splice(contentIndex, 1)
    }
  }

  querySearch()
}
// 选择的内容挂载类型
const chooseAnchorType = ref(-1)
const chooseAnchorTypeFun = throttle(e => {
  // || page.loading
  if (chooseAnchorType.value === e) {
    return
  }
  chooseAnchorType.value = e
  changeTabPlatform()
}, 500)
// 分组
function getNewGroupList() {
  api.getNewGroupList({}).then(res => {
    if (res.code === 0) {
      searchComponents.value[3].selects = res.data || []
    }
  })
}

const expButton = ref(null)
// 查询
function querySearch(val) {
  // 星麦云渠道发布的联动
  queryLinkageFun()
  page.index = 1
  getDetail()
}
// function getMonth(){
//   const month = new Date(new Date().toLocaleDateString()).getTime()-60*24*3600*1000
// }

const xmSearchRef = ref(null)
const menuOfKeepAlive = inject('$menuOfKeepAlive')
onActivated(() => {
  if (menuOfKeepAlive('judge')) {
    sortMethods.value = ''
    chooseTabIndex.value = 0
    chooseAnchorType.value = -1
    currentIndex.value = 0
    chooseTabPlatform.value = 'all'
    if (xmSearchRef.value) {
      xmSearchRef.value?.reset()
    } else {
      getDetail()
    }
    menuOfKeepAlive('reset')
  } else {
    getDetail(true)
  }
  getNewGroupList()
  getAllLabel()
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
    const list = setBusinessChooseParam(businessChooseObj)
    searchComponents.value = searchComponents1.value.concat(list)
  }
  // 增加内容类型筛选项，放到最后

  if (contentTypeCode.value.includes(chooseTabPlatform.value)) {
    searchComponents.value.push(searchComponentsContentType)
  }
})
// 页面里开的时候 清空分组组件
onBeforeRouteLeave((to, from) => {
  if (to.path !== '/content_center/content_manage/manage_detail') {
    searchComponents.value = []
    nextTick(() => {
      searchComponents.value = searchComponents1.value
    })
  }
})
// 作品列表数据 hideExpButton是否隐藏导出按钮的提示
async function getDetail(hideExpButton) {
  if (isEmpty(searchComponents.value)) return
  page.loading = true
  const stu = checkNumberRange(searchComponents.value)
  if (stu) {
    page.loading = false
    return
  }

  const time = toRaw(searchComponents.value.find(item => item.type === 'dateRange').val)
  if (time && time.length > 0) {
    const range = new Date(time[1])?.getTime() - new Date(time[0])?.getTime()
    if (range > 31 * 24 * 60 * 60 * 1000) {
      page.loading = false
      if (hideExpButton) {
        return
      } else {
        return expButton.value?.showTipDialog(31)
      }
    }
  }
  const data = getQuery(searchComponents.value, ['minCreateTime', 'maxCreateTime'])
  // console.log(data, 'getDetail data')
  const params = {
    groupIds: data.groupIds || [],
    areaIds: data.areaIds || [],
    dyOpenIds: [],
    maxCreateTime: data.maxCreateTime,
    minCreateTime: data.minCreateTime, // 最近的时间
    nickname: data.talent_name, // 达人昵称
    orderSetting: '',
    pageNo: page.index,
    pageSize: page.size,
    // platform: data.platform,
    xuserType: data.matrix_type,
    searchCount: true,
    sortType: sortMethods.value ? sortMethods.value : 'DESC:create_time', // 排序类型 (ASC/DESC:create_time 默认, ASC/DESC:clue_cnt 线索, ASC/DESC:play_count 播放, ASC/DESC:digg_count 点赞, ASC/DESC:comment_count 评论, ASC/DESC:share_count 分享)
    title: data.work_name, // 作品名称
    videoStatus: 1,
    tagIds: data.tagIds, // 选择的视频标签
    playNumStart: data.playNumStart,
    playNumEnd: data.playNumEnd,
    diggNumEnd: data.diggNumEnd,
    diggNumStart: data.diggNumStart,
    videoRelateTypes: data.isRelatedTask, // 1是 0否
    checkStatus: data.checkStatus, // 0未质检 1质检合格 2 质检不合格
    riskCondition: data.riskCondition, // 1
    anchorType: chooseAnchorType.value === -1 ? null : chooseAnchorType.value
  }
  if (contentTypeCode.value.includes(chooseTabPlatform.value)) {
    params.mediaType = data.mediaType || null
  }
  params.platform =
    (tabListPlatform.value.find(x => x.key === chooseTabPlatform.value) || {}).platform || null
  if (isNotEmpty(data.businessQueryParams)) {
    params.businessQueryParams = data.businessQueryParams
  }
  const res = await listVideoV2(params)
  if (res.success) {
    page.loading = false
    videoData.value = res.data
    // console.log(videoData.value, 'videoData.value')
    page.total = res.data.total
  }
}
// 重置
function resetSearch() {
  queryLinkageFun()
  getDetail()
}
const chooseTabIndex = ref(0)
// tab切换
function changeTab(val, index) {
  page.index = 1
  chooseTabIndex.value = index
  sortMethods.value = val.name
  // console.log(sortMethods.value, 'sortMethods.value')
  getDetail()
}

// 星麦云渠道发布 begin--
const isXMYPublish = ref(false)
const getXmyPublish = throttle(() => {
  isXMYPublish.value = !isXMYPublish.value
  page.index = 1
  searchComponents.value.forEach(x => {
    if (x.filed === 'isRelatedTask') {
      x.val = isXMYPublish.value ? [1, 2] : null
    }
  })
  getDetail()
}, 300)
// 星麦云渠道发布和筛选项的联动
function queryLinkageFun() {
  let searchVal = []
  searchComponents.value.forEach(x => {
    if (x.filed === 'isRelatedTask') {
      searchVal = isNotEmpty(x.val) ? x.val : []
    }
  })
  console.log('筛选条件里视频类型的选项内容', searchVal)
  isXMYPublish.value = searchVal.includes(2) || searchVal.includes(1)
}
// 星麦云渠道发布 end--

// const fullscreenLoading = ref(false)
const dialogVisible = ref(false)
const exportMessage = ref('')
const url = ref('')
const isWeChat = ref(true)
isWeChat.value = localStorage.getItem('isWeChat') === '1'
function exportReport() {
  // fullscreenLoading.value = true
  const data = getQuery(searchComponents.value, ['minCreateTime', 'maxCreateTime'])
  const params = {
    groupIds: data.groupIds || [],
    areaIds: data.areaIds || [],
    dyOpenIds: [],
    maxCreateTime: data.maxCreateTime,
    minCreateTime: data.minCreateTime, // 最近的时间
    nickname: data.talent_name, // 达人昵称
    orderSetting: '',
    pageNo: 1,
    pageSize: page.size,
    // platform: data.platform,
    xuserType: data.matrix_type,
    searchCount: true,
    sortType: sortMethods.value ? sortMethods.value : 'DESC:create_time', // 排序类型
    title: data.work_name, // 作品名称
    videoStatus: 1,
    tagIds: data.tagIds, // 选择的视频标签
    playNumStart: data.playNumStart,
    playNumEnd: data.playNumEnd,
    diggNumEnd: data.diggNumEnd,
    diggNumStart: data.diggNumStart,
    videoRelateTypes: data.isRelatedTask, // 1是 0否
    checkStatus: data.checkStatus, // 0未质检 1质检合格 2 质检不合格
    riskCondition: data.riskCondition, // 1
    anchorType: chooseAnchorType.value === -1 ? null : chooseAnchorType.value
  }
  if (contentTypeCode.value.includes(chooseTabPlatform.value)) {
    params.mediaType = data.mediaType || null
  }
  params.platform =
    (tabListPlatform.value.find(x => x.key === chooseTabPlatform.value) || {}).platform || null
  if (isNotEmpty(data.businessQueryParams)) {
    params.businessQueryParams = data.businessQueryParams
  }
  vm.appContext.config.globalProperties.$tracking.clickBtn(105)

  return exportFileV2(exportVideoV2, params, '视频数据', 'xlsx')
  // .then(() => {
  //   fullscreenLoading.value = false
  // })
  // .catch(() => {
  //   fullscreenLoading.value = false
  // })
}

function confirmClick() {
  window.open(url.value, '_blank')
}
</script>

<style lang="scss" scoped>
.content_manage_warp {
  .tab_box {
    background-color: #ffffff;
    height: 52px;
    border-radius: 4px;
    padding: 18px 24px 0;

    //margin-bottom
    :deep(.el-tabs__nav-wrap) {
      &::after {
        background-color: #ffffff;
      }

      .el-tabs__item {
        color: #909399;
        font-weight: 400;
        font-family: PingFangSC-Regular, PingFang SC;
      }

      .is-active {
        font-weight: 500;
        color: #303133;
      }
      .custom-tabs-label {
        display: inline-block;
        position: relative;
        padding-left: 24px;
      }
      .custom-tabs-label-no-padding {
        padding-left: 0;
      }
    }
  }
}
.content_manage {
  margin-top: 16px;
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
  border-radius: 4px;
  padding: 22px 24px;
  background: #fff;
  margin-top: 10px;
  position: relative;
  :deep(.el-tabs__item.is-active) {
    color: #303133;
    font-weight: 600;
  }
  .action_btn {
    position: absolute;
    top: 22px;
    right: 24px;
    display: flex;
    .choose_dropdownItem {
      color: #364fcd;
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
.anchorType_box {
  margin-bottom: 20px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  .one_anchorType {
    padding: 2px 8px;
    width: max-content;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    font-weight: 400;
    font-size: 14px;
    color: rgba(48, 49, 51, 1);
    line-height: 20px;
    text-align: left;
    font-style: normal;
    opacity: 0.6;
    &:hover {
      opacity: 1;
    }
  }
  .one_anchorType + .one_anchorType {
    margin-left: 8px;
  }
  .choose_anchorType {
    opacity: 1;
    color: #303133;
    border-radius: 4px;
    background: rgba(0, 0, 0, 0.1);
  }
}
.dropDown_label {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  font-weight: 400;
  font-size: 14px;
  color: #303133;
  line-height: 20px;
  cursor: pointer;
  padding: 2px 8px;
  border-radius: 4px;
  img {
    width: 16px;
    height: 16px;
    display: flex;
    margin-left: 4px;
  }
  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }
}
.action_xmy_publish {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  margin-right: 8px;
  cursor: pointer;
  padding: 2px 8px;
  border-radius: 4px;
  // &:hover {
  //   background: rgba(0, 0, 0, 0.1);
  // }
}
.choose_xmy_publish {
  background: rgba(0, 0, 0, 0.1);
}
</style>
