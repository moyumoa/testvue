<template>
  <el-dialog
    ref="dialog"
    :close-on-click-modal="false"
    destroy-on-close
    v-model="show"
    title="选择商品"
    width="560px"
    custom-class="xm_element_dialog"
  >
    <xm_search
      class="dialog_serach_box"
      :searchComponents="searchComponents"
      :useOwnReset="true"
      @getData="querySearch"
      @reset="resetSearch"
    ></xm_search>
    <div class="sumvideo_page" ref="scrollRef" v-loading="tableForm.loading">
      <template v-if="tableForm.listData && tableForm.listData.length > 0">
        <div
          class="good_list"
          :infinite-scroll-delay="1000"
          v-infinite-scroll="loadFun"
          :infinite-scroll-distance="50"
          :infinite-scroll-immediate="false"
          :infinite-scroll-disabled="tableForm.listData.length >= tableForm.page.total"
        >
          <div
            @click.stop="updateSelect(item)"
            :class="{ one_good: true, choose_good: item.checked }"
            v-for="(item, index) in tableForm.listData"
            :key="index"
          >
            <div class="good_top">
              <img class="good_cover" :src="item.coverUrl || defaultCover" alt="" />
              <div class="good_select">
                <img
                  src="https://tagvv-1256030678.file.myqcloud.com/20240328o5ms2.png"
                  alt=""
                  class="select_icon"
                  v-if="item.checked"
                />
                <img
                  src="https://tagvv-1256030678.file.myqcloud.com/20240328hqqm4.png"
                  alt=""
                  class="select_icon select_icon_active"
                  v-else
                />
              </div>
            </div>
            <div class="good_bottom line-hidden1">{{ item.name || '' }}</div>
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
      <div v-else class="no_echart" style="padding-right: 16px; height: 350px">
        <img src="@/assets/images/content_center/no_activity.png" alt />
        暂无数据
      </div>
    </div>
    <template #footer>
      <div class="footer_btn">
        <div class="btn_r" v-if="false">
          <!-- 没有筛选条件下的全选/取消全选/清空已选  -->
          <div class="xm_check_box_round select_all_text" @click="selectAllFun">
            <!-- 未选 -->
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
            <span style="color: #364fcd">{{ selectData.chooseIds.length || 0 }}</span>
            个
          </span>
        </div>

        <div class="f_btn_warp">
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" :loading="btnLoading" @click="handleConfirm">确定</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>
<script setup>
import { pageProduct } from '@/api/sumvideo/product_shooting_library'

import { getQuery } from '@/utils/get_query.js'

import { throttle } from '@/utils/tools.js'
const defaultCover = ref('https://tagvv-1256030678.file.myqcloud.com/202212066b4kq.png')
const message = inject('$message')

const dialog = ref()
const props = defineProps({
  chooseDialog: {
    type: Object,
    default: () => {
      return {
        show: false,
        ids: [] // 选中的商品ID
      }
    }
  }
})

const show = toRef(props.chooseDialog, 'show')
const pageScroll = ref()
const searchComponents = ref([
  {
    type: 'input',
    label: '商品名称',
    val: '',
    placeholder: '请输入商品名称',
    filed: 'name'
  },
  {
    type: 'newLabelFilterV2',
    label: '商品标签',
    behavior: '选择',
    val: [], // 选择数据
    choseName: '标签',
    placeholder: '请输入标签关键词',
    filed: 'tags',
    addTagInfo: {
      type: 16,
      hideTitleSpan: false,
      id: null,
      index: [],
      source: null
    } // addTag的需要的相关数据，比如回显等，不会在入参内
  },
  {
    type: 'dateRange',
    label: '创建时间',
    val: '',
    disabledDate(time) {
      return time.getTime() > Date.now()
    }, // 禁用日期
    isDisEdit: true, // 是否禁用文本框输入
    placeholder: ['开始时间', '结束时间'],
    filed: 'dateRange'
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
// 选择逻辑
const selectData = reactive({
  totalNum: 0,

  chooseIds: [], // 页面加载出来的，已选中的原料列表，包含了任何条件下的选中
  chooseInfo: [] // 选中的原料信息
})
const scrollRef = ref()
// 查询的回调
const querySearch = throttle(function () {
  tableForm.page.index = 1
  tableForm.loading = true
  scrollRef.value?.scrollTo(0, 0)
  getList()
}, 500)
// 重置的回调
const resetSearch = throttle(function () {
  tableForm.loading = true
  tableForm.page = {
    index: 1,
    size: 50,
    total: 0
  }

  scrollRef.value?.scrollTo(0, 0)
  getList()
}, 500)
function getList() {
  const params = getQuery(searchComponents.value, ['createTimeMin', 'createTimeMax'])
  if (tableForm.page.index === 1) {
    pageScroll.value?.scrollTo(0, 0)
  }
  params.pageNo = tableForm.page.index
  params.pageSize = tableForm.page.size

  pageProduct(params)
    .then(res => {
      console.log('获取列表返回', res)

      if (res.code === 0 && res.data) {
        const { records: list = [], total: resultTotal = 0 } = res.data
        const resultList = (list || []).map(x => {
          let checked = false
          // console.log(
          //   '嘻嘻嘻嘻嘻嘻嘻嘻嘻嘻嘻嘻嘻嘻嘻嘻嘻嘻嘻嘻嘻嘻嘻嘻',

          //   x.id
          // )

          checked = selectData.chooseIds.findIndex(xx => xx === x.id) > -1
          console.log('checked', checked, x.id)
          return {
            ...x,
            checked: checked
          }
        })
        console.log('处理后数据', resultList)
        if (tableForm.page.index === 1) {
          tableForm.listData = resultList

          selectData.totalNum = resultTotal
        } else {
          tableForm.listData = tableForm.listData.concat(resultList)
        }
        tableForm.page.total = resultTotal
      }
      tableForm.loading = false
    })
    .catch(() => {
      tableForm.loading = false
    })
}
// 上拉加载
const loadFun = throttle(function () {
  tableForm.loading = true
  tableForm.page.index++
  getList()
}, 1000)

// 清空已选择
function clearSelect() {
  selectData.chooseIds = []
  selectData.chooseInfo = []

  tableForm.listData.forEach(x => {
    x.checked = false
  })
}
// 选择/取消选择
function updateSelect(item) {
  item.checked = !item.checked
  // console.log('单个多选框', item, selectData.chooseIds)
  // 新增选择
  if (item.checked) {
    // 选中 往chooseIds添加数据
    selectData.chooseIds.push(item.id)
    selectData.chooseInfo.push(item)

    console.log('单个多选框')
  } else {
    // 取消选中 在chooseIds删除数据
    const index = selectData.chooseIds.findIndex(y => y === item.id)
    console.log('删除的ids', index)
    if (index > -1) {
      selectData.chooseIds.splice(index, 1)
      selectData.chooseInfo.splice(index, 1)
    }
  }
}
// 全选当前数据
function selectAllFun() {
  // 判断当前是否有数据 没有就return
  if (tableForm.listData.length === 0) return
  // 判断当前是否有未选择的数据 有就是把那些未选择都改成选择 否则 就是取消当前页面的所有数据
  const unCheckList = tableForm.listData.filter(x => !x.checked)
  console.log('是否有我选中', unCheckList)
  if (unCheckList && unCheckList.length > 0) {
    // 把未选中的都改成选中状态 并且把ID添加到chooseIds里
    const ids = []
    const infos = []
    tableForm.listData.forEach(x => {
      if (!x.checked) {
        x.checked = true

        ids.push(x.id)
        infos.push(x)
      }
    })
    selectData.chooseIds = selectData.chooseIds.concat(ids)
    selectData.chooseInfo = selectData.chooseInfo.concat(infos)
  } else {
    const ids2 = []
    const infos2 = []
    tableForm.listData.forEach(x => {
      x.checked = false
      ids2.push(x.id)
      infos2.push(x)
    })
    selectData.chooseIds = compareAndRemoveDuplicates(selectData.chooseIds, ids2)

    selectData.chooseInfo = compareAndRemoveDuplicates(selectData.chooseInfo, infos2)
  }
}
// 比较两个数组，将重复的数据删除
function compareAndRemoveDuplicates(arr1, arr2) {
  const combined = [...new Set([...arr1, ...arr2])] // 合并两个数组并去除重复项
  const filtered = combined.filter(item => !arr1.includes(item) || !arr2.includes(item)) // 过滤掉在两个数组中都出现的项
  return filtered
}
// 返回全选本页的状态 0 未选 1 半选 2全选
const checkStatus = computed(() => {
  if (
    selectData.chooseIds &&
    selectData.chooseIds.length > 0 &&
    tableForm.listData &&
    tableForm.listData.length > 0
  ) {
    const ids = tableForm.listData.map(x => x.id)
    const num = countCommonElements(selectData.chooseIds, ids)
    console.log('checkStatus-num', num, selectData.chooseIds, ids, tableForm.listData)
    return num === tableForm.listData.length ? 2 : 1
  } else {
    return 0
  }
})
// 比较两个数组，获取重复的数据长度
function countCommonElements(arr1, arr2) {
  return arr1.filter(item => arr2.includes(item)).length
}
const emits = defineEmits(['updateSelectInfo'])
const btnLoading = ref(false) // 确定按钮的loadin

// 取消
function closeDialog() {
  dialog.value.handleClose()
}
function handleConfirm() {
  if (selectData.chooseIds.length === 0) {
    message.warning(`请先选择商品`)
    return
  }
  btnLoading.value = true
  emits('updateFun', selectData.chooseIds, selectData.chooseInfo)
  dialog.value.handleClose()
  btnLoading.value = false
}

onMounted(() => {
  tableForm.laoding = true
  if (props.chooseDialog && props.chooseDialog.ids && props.chooseDialog.ids.length > 0) {
    const ids = JSON.parse(JSON.stringify(props.chooseDialog.ids))
    console.log('ids', ids)
    selectData.chooseIds = ids
  }
  nextTick(() => {
    resetSearch()
  })
})
</script>
<style lang="scss" scoped>
.xm_search {
  padding: 0 !important;
}
.footer_btn {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  // justify-content: space-between;
  width: 100%;
  padding: 8px 0 0 16px;

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
.sumvideo_page {
  width: calc(100% + 16px);
  height: 356px;
  overflow-y: auto;
  .good_list {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    flex-wrap: wrap;
    .one_good {
      cursor: pointer;
      width: 120px;
      margin: 0 12px 16px 0;

      .good_top {
        position: relative;
        width: 120px;
        height: 120px;
        background: rgba(0, 0, 0, 0.1);
        border-radius: 4px;
        .good_cover {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: flex;
          border-radius: 4px;
        }
        .good_select {
          width: 16px;
          height: 16px;
          object-fit: cover;
          display: flex;
          position: absolute;
          right: 8px;
          bottom: 8px;
        }
      }
      .good_bottom {
        width: 100%;
        text-align: center;
        margin-top: 8px;
        font-weight: 400;
        font-size: 12px;
        color: #606266;
        line-height: 17px;
      }
    }
    .choose_good {
      .good_top {
        border: 2px solid #364fcd;
      }
    }
  }
}
.dialog_serach_box {
  width: calc(100% + 16px);
  :deep(.el-input) {
    width: 180px !important;
  }
}
</style>
