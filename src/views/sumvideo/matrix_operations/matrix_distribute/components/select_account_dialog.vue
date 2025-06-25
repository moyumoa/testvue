<template>
  <el-dialog
    v-model="info.show"
    custom-class="hide_footer_line info_dialog"
    title="选择账号"
    width="820px"
    @close="cancel"
  >
    <div class="content" v-loading="tableForm.loading">
      <xm_search
        :searchComponents="searchComponents"
        @getData="querySearch"
        @reset="resetSearch"
      ></xm_search>
      <div class="top_warp">
        <industrySearch
          :industryList="choseTabList"
          source="titlePage"
          @updateIndustry="choseChange"
        />
        <div class="switch_war">
          <span style="margin-right: 8px">过滤授权失效账号</span>
          <el-switch
            v-model="filterAuthStatus"
            inline-prompt
            :width="44"
            @change="resetSearch"
          ></el-switch>
        </div>
      </div>
      <div
        ref="tableRef"
        class="acc_warp"
        :infinite-scroll-delay="1000"
        v-infinite-scroll="getListNext"
        :infinite-scroll-distance="50"
        :infinite-scroll-immediate="false"
        :infinite-scroll-disabled="tableForm.materialList.length == tableForm.page.total"
      >
        <template v-if="tableForm.materialList.length > 0">
          <div
            class="acc_item"
            :style="item.disChoose ? 'cursor: no-drop;' : ''"
            v-for="(item, index) in tableForm.materialList"
            :key="index"
            @click="updateSelect(item)"
          >
            <div class="ava_box" :class="{ g_failure: isInvalid(item) }">
              <img :src="item.dyHeadUrl || defaultPhoto" alt="" class="item_ava" />
              <div :class="[`xm_platformIcon_${item.platform}_16`]"></div>
            </div>
            <div class="info_box">
              <div class="name">{{ item.dyNickname || '-' }}</div>
              <div class="id">ID：{{ item.openId || '-' }}</div>
            </div>
            <div
              :class="{
                'select-state': true,
                'selected-state': item.checked,
                'selected-disabled': item.disChoose
              }"
            >
              <div :class="{ 'state-chose': item.checked }"></div>
            </div>
          </div>
          <!-- 加载更多 -->
          <div
            class="loading_library"
            v-if="tableForm.materialList && tableForm.materialList.length > 0"
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
                : tableForm.materialList.length >= tableForm.page.total
                ? tableForm.page.total > 12
                  ? '已经到底了~'
                  : ''
                : '上拉加载更多~'
            }}
          </div>
        </template>

        <div v-if="tableForm.materialList.length === 0 && !tableForm.loading" class="no_echart">
          <img class="no_echart_icon" src="@/assets/images/content_center/no_activity.png" alt />
          暂无数据
        </div>
      </div>
    </div>
    <template #footer>
      <div class="footer_warp">
        <div class="f_info_box">
          <div class="btn_r">
            <div class="xm_check_box_round select_all_text" @click="selectAllFun">
              <div
                :class="[
                  'check_box',
                  checkStatus === 1
                    ? 'check_box_half_choose'
                    : checkStatus === 2
                    ? 'check_box_active'
                    : ''
                ]"
              ></div>

              <span class="select_all_text">全选本页</span>
              <span
                class="select_all_text"
                style="color: #364fcd; cursor: pointer"
                @click.stop="clearSelect"
              >
                清除
              </span>
            </div>

            <span>
              已选择
              <span style="color: #364fcd">{{ selectData.chooseIds.length }}</span>
              个
            </span>
          </div>
        </div>
        <span class="dialog-footer">
          <el-button @click="cancel">取消</el-button>
          <el-button
            type="primary"
            @click="submit"
            v-loading="btnLoading"
            :disabled="selectData.chooseList.length <= 0"
          >
            确定
          </el-button>
        </span>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { throttle } from '@/utils/tools.js'
import api from '@/api/content_center/content_matrix.js'
import { getQuery } from '@/utils/get_query'

import industrySearch from '@/views/sumvideo/creative_mould/components/industry_search.vue'

const props = defineProps({
  source: String, // batchPublishVideo 批量发布选择视频 batchPublishImgtext 批量发布选择图文
  info: {
    type: Object,
    default: () => {
      return {
        list: [],
        show: false
      }
    }
  },
  accountGroupList: {
    type: Object,
    default: () => {
      return []
    }
  } // 矩阵号的分组
})
const { info, accountGroupList, source } = toRefs(props)
const defaultPhoto = ref('https://tagvv-1256030678.file.myqcloud.com/20220402eaa5p.png')
const platformVlues = ref(null)
const btnLoading = ref(false)
const emits = defineEmits(['cancel', 'submit'])
// 列表的查询条件
const tableForm = reactive({
  loading: false,
  materialList: [],
  page: {
    index: 1,
    size: 18,
    total: 0
  }
})
const filterAuthStatus = ref(true) // 获取列表时是否过滤失效账号
const searchComponents = ref([
  {
    type: 'select',
    label: '分组',
    placeholder: '请选择矩阵号分组',
    filed: 'groupIds',
    val: '',
    defaultVal: '',
    multiple: true,
    'collapse-tags': true,
    selects: [],
    selectDefultName: ['id', 'groupName']
  },
  {
    type: 'input',
    label: '矩阵号',
    val: '',
    placeholder: '请输入矩阵号名称',
    filed: 'dyNickName'
  }
])

const choseTabList =
  source.value === 'batchPublishImgtext'
    ? [
        {
          name: '小红书',
          id: 'xhs',
          checked: false,
          icon: 'https://tagvv-1256030678.file.myqcloud.com/20231023jccep.png',
          value: 1
        },
        {
          name: '抖音',
          id: 'dy',
          checked: false,
          icon: 'https://tagvv-1256030678.file.myqcloud.com/20231023wmb1d.png',
          value: 2
        }
      ]
    : [
        {
          name: '小红书',
          id: 'xhs',
          checked: false,
          icon: 'https://tagvv-1256030678.file.myqcloud.com/20231023jccep.png',
          value: 1
        },
        {
          name: '抖音',
          id: 'dy',
          checked: false,
          icon: 'https://tagvv-1256030678.file.myqcloud.com/20231023wmb1d.png',
          value: 2
        },
        {
          name: '快手',
          id: 'ks',
          checked: false,
          icon: 'https://tagvv-1256030678.file.myqcloud.com/20240228osml4.png',
          value: 3
        }
      ]
const listParams = ref({}) // 当前列表的请求参数

// const message = inject('$message')

// 选择逻辑
const selectData = reactive({
  chooseIds: [], // 选择的ids
  chooseList: [] // 页面加载出来的，已选中的素材列表，包含了任何条件下的选中
})
// 返回全选本页的状态 0 未选 1 半选 2全选
const checkStatus = computed(() => {
  if (
    selectData.chooseIds &&
    selectData.chooseIds.length > 0 &&
    tableForm.materialList &&
    tableForm.materialList.length > 0
  ) {
    const ids = tableForm.materialList.map(x => x.openId)
    const num = countCommonElements(selectData.chooseIds, ids)
    // 可选择的账号总列表
    const num2 = tableForm.materialList.filter(x => !x.disChoose)
    console.log('num2', num2, num)
    // console.log('checkStatus-num', num, selectData.chooseIds, ids, tableForm.materialList)
    return num === num2.length ? 2 : 1
  } else {
    return 0
  }
})
// 比较两个数组，获取重复的数据长度
function countCommonElements(arr1, arr2) {
  return arr1.filter(item => arr2.includes(item)).length
}
// 比较两个数组，将重复的数据删除
function compareAndRemoveDuplicates(arr1, arr2) {
  const combined = [...new Set([...arr1, ...arr2])] // 合并两个数组并去除重复项
  const filtered = combined.filter(item => !arr1.includes(item) || !arr2.includes(item)) // 过滤掉在两个数组中都出现的项
  return filtered
}
function compareAndRemoveDuplicatesV2(list, ids) {
  const result = list.filter(x => !ids.includes(x.openId))
  return result
}

// 全选当前数据
function selectAllFun() {
  // 判断当前是否有数据 没有就return
  if (tableForm.materialList.length === 0) return
  // 判断当前是否有未选择的数据 有就是把那些未选择都改成选择 否则 就是取消当前页面的所有数据
  const unCheckList = tableForm.materialList.filter(x => !x.disChoose && !x.checked)
  if (unCheckList && unCheckList.length > 0) {
    // 把未选中的都改成选中状态 并且把ID添加到chooseIds里
    const ids = []
    const list = []
    tableForm.materialList.forEach(x => {
      if (!x.checked && !x.disChoose) {
        x.checked = true
        ids.push(x.openId)
        list.push(x)
      }
    })
    selectData.chooseIds = selectData.chooseIds.concat(ids)
    selectData.chooseList = selectData.chooseList.concat(list)
  } else {
    const ids2 = []
    tableForm.materialList.forEach(x => {
      if (!x.disChoose) {
        x.checked = false
        ids2.push(x.openId)
      }
    })
    selectData.chooseIds = compareAndRemoveDuplicates(selectData.chooseIds, ids2)
    selectData.chooseList = compareAndRemoveDuplicatesV2(selectData.chooseList, ids2)
  }
}

function batchRemoveFun(dataList, addNum) {
  let num = 0
  dataList.forEach(x => {
    if (x.checked) {
      x.checked = false
      num++
    }
  })
  const getId2 = dataList.map(item => item.openId)
  const list2 = selectData.chooseIds.filter(openId => !getId2.includes(openId))
  selectData.chooseIds = list2

  const list3 = selectData.chooseList.filter(x => !getId2.includes(x.openId))
  console.log('list3', list3)
  selectData.chooseList = list3

  if (addNum) {
    selectData.checkNum = selectData.checkNum - num
  }
}

// 选择/取消选择
function updateSelect(item) {
  // 失效或没有发布能力的不支持选择
  if (item.disChoose) return
  item.checked = !item.checked
  console.log('选择或取消选择', item)
  if (selectData.chooseIds.includes(item.openId)) {
    // 删除
    selectData.chooseIds = selectData.chooseIds.filter(x => x !== item.openId)
    selectData.chooseList = selectData.chooseList.filter(x => x.openId !== item.openId)
  } else {
    selectData.chooseIds.push(item.openId)
    selectData.chooseList.push(item)
  }
}
// 清空已选择
function clearSelect() {
  clearFun()
  batchRemoveFun(tableForm.materialList)
}
// 清空数据
function clearFun() {
  console.log('清空')
  selectData.chooseIds = []
  selectData.chooseList = []
}

// 矩阵号是否授权有效
const isInvalid = item => {
  // 0 有效 1无效 非0都为无效
  return item.isDel !== 0
}

// 获取下一页
function getListNext() {
  tableForm.loading = true
  tableForm.page.index++
  getList()
}
function getPlatformNum(val) {
  const obj = {
    dy: 1,
    wx: 2,
    xhs: 3,
    ks: 4
  }
  return obj[val] || null
}

// 平台变化
function choseChange(val) {
  console.log('选择的平台', val ? val[0] : '')
  platformVlues.value = val ? val[0] : ''
  tableForm.loading = true
  tableForm.page.index = 1
  getList()
}
// 获取列表
function getList() {
  return new Promise((resolve, reject) => {
    const data = getQuery(searchComponents.value)
    console.log('获取列表', data)

    const param = {
      pageSize: tableForm.page.size,
      pageNo: tableForm.page.index,
      excludePlatforms: source.value === 'batchPublishImgtext' ? [2, 4] : [2], // 排除视频号、快手
      dyNickName: data.dyNickName,
      groupIds: data.groupIds ? data.groupIds : [],
      authStatus: filterAuthStatus.value ? 0 : null,
      dyWebAuthStatus: filterAuthStatus.value ? 0 : null,
      platform: getPlatformNum(platformVlues.value),
      isSimpleInfo: 1,
      orderBy: 2
    }
    listParams.value = JSON.parse(JSON.stringify(param))
    api
      .getMatrixList(param)
      .then(res => {
        console.log('获取列表返回', res)
        if (res.code === 0 && res.data) {
          const { records: list = [], total: resultTotal = 0 } = res.data
          const resultList = list.map(x => {
            let checked = false
            if (selectData.chooseIds.includes(x.openId)) {
              checked = true
            }
            return {
              ...x,
              checked: checked,
              disChoose: isInvalid(x) || (x.platform === 1 && x.dyWebAuthStatus !== 0) // 授权失效和未授权发布能力账号不可选中
            }
          })

          if (tableForm.page.index === 1) {
            console.log('第一页 处理后数据', resultList)
            tableForm.materialList = resultList
          } else {
            console.log('第二页或者更多')
            tableForm.materialList = tableForm.materialList.concat(resultList)
          }
          tableForm.page.total = resultTotal
        }
        tableForm.loading = false
        resolve()
      })
      .catch(err => {
        tableForm.loading = false
        reject(err)
      })
  })
}
const tableRef = ref()
// 重置
function resetSearch() {
  tableForm.loading = true
  tableForm.page.index = 1
  tableForm.page.size = 18
  tableRef.value?.scrollTo(0, 0)
  getList()
}
// 查询
function querySearch() {
  tableForm.loading = true
  tableForm.page.index = 1
  tableRef.value?.scrollTo(0, 0)
  getList()
}
const cancel = throttle(function () {
  emits('cancel')
}, 500)

const submit = throttle(function () {
  console.log('确定选择 selectData', selectData)
  emits('submit', selectData)
}, 500)
onMounted(() => {
  searchComponents.value[0].selects = accountGroupList.value
  tableForm.loading = true
  getList()
})
</script>

<style lang="scss" scoped>
.content {
  padding: 16px 0;
  :deep(.xm_search) {
    padding: 0 16px;
    .search_item {
      margin-bottom: unset;
    }
  }
  :deep(.item_content) {
    .el-input {
      width: 180px !important;
    }
  }
  .top_warp {
    margin-top: 20px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .switch_war {
      display: flex;
      align-items: center;
      max-height: 32px;
      white-space: nowrap;
    }
  }
  .acc_warp {
    display: flex;
    flex-wrap: wrap;
    margin-top: 16px;
    height: 260px;
    min-height: 260px;
    overflow-y: auto;
    padding: 0 16px;
    align-content: flex-start;

    .acc_item {
      margin-right: 12px;
      margin-bottom: 12px;
      border-radius: 4px;
      border: 1px solid transparent;
      width: 252px;
      cursor: pointer;
      padding: 0 8px;
      height: 56px;
      display: flex;
      align-items: center;
      background: #f2f3f5;
      position: relative;
      &:nth-child(3n) {
        margin-right: 0;
      }
      .ava_box {
        width: 40px;
        height: 40px;
        min-width: 40px;
        border-radius: 50%;
        background: #d8d8d8;
        position: relative;
        .item_ava {
          position: absolute;
          top: 0;
          left: 0;
          border-radius: 50%;
          width: 100%;
          height: 100%;
        }
      }
      .info_box {
        margin-left: 8px;
        width: calc(100% - 80px);
        .name {
          font-family: PingFangSC, PingFang SC;
          font-weight: 500;
          font-size: 14px;
          color: #303133;
          line-height: 20px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .id {
          font-family: PingFangSC, PingFang SC;
          font-weight: 400;
          font-size: 12px;
          color: #909399;
          line-height: 18px;
          margin-top: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
      .select-state {
        width: 16px;
        height: 16px;
        background-color: #fff;
        line-height: 16px;
        text-align: center;
        transition: all 0.2s;
        cursor: pointer;
        display: flex;
        flex-direction: row;
        justify-content: center;
        border-radius: 2px;
        position: absolute;
        top: 8px;
        right: 8px;
        border: 1px solid #dcdee0;
      }
      .selected-disabled {
        cursor: no-drop;
        background: #f2f3fa;
      }
      .state-chose {
        width: 6px;
        height: 10px;
        border-color: #fff;
        border-style: solid;
        border-width: 0 1px 1px 0;
        transform: rotate(45deg);
      }
      .selected-state {
        background: #364fcd !important;
      }
    }
    .loading_library {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      width: 100%;
      margin-bottom: 15px;
      img {
        height: 25px;
        margin-right: 4px;
      }
    }
  }
  .no_echart {
    background: #fff;
    width: 100%;
    height: 100%;
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
}
.footer_warp {
  display: flex;
  align-items: center;
  justify-content: space-between;
  .btn_r {
    display: flex;
    align-items: center;
    .select_all_warp {
      display: flex;
      align-items: center;
      cursor: pointer;
    }
    .select_icon {
      width: 16px;
      height: 16px;
      min-width: 16px;
    }
    .select_all_text {
      :deep(.check_box) {
        margin-left: 0;
      }
      display: flex;
      margin-left: 8px;
      margin-right: 8px;
      cursor: pointer;
    }
    .select_all_text + .select_all_text {
      margin-right: 16px;
    }
    .btn_item {
      cursor: pointer;
    }
    .btn_clear {
      color: red;
    }
    .btn_all {
      color: #364fed;
    }
  }
}
</style>
