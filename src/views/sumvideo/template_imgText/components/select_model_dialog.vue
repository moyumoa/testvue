<template>
  <el-dialog
    :close-on-click-modal="false"
    ref="dialog"
    custom-class="xm_element_dialog"
    destroy-on-close
    v-model="show"
    width="560px"
    title="选择虚拟模特"
  >
    <template #title>
      <div class="dialog_title">
        <span class="title">选择虚拟模特</span>
        <el-tooltip v-if="tip" popper-class="tooltip-class" placement="right" raw-content>
          <template #content>
            <div class="tooltip_content">
              <p>{{ tip }}</p>
            </div>
          </template>
          <img src="@/assets/images/operate/tip_line.png" style="width: 14px; height: 14px" />
        </el-tooltip>
      </div>
    </template>
    <div class="dialog_content" v-loading="tableForm.loading">
      <!-- 筛选条件 -->
      <!-- 分类 -->
      <div class="top_catgory">
        <div class="catgory_label">模特分类：</div>
        <div class="category_content">
          <div
            :class="{ one_category: true, choose_category: item.id == tableForm.chooseCategory }"
            v-for="(item, index) in categoryList"
            :key="index"
            @click="chooseCategoryFun(item.id)"
          >
            {{ item.name }}
          </div>
        </div>
      </div>
      <!-- 风格 -->
      <div class="top_catgory">
        <div class="catgory_label" style="line-height: 32px">模特标签：</div>
        <div class="category_content">
          <choose_tag_dialog
            behavior="选择"
            choseName="标签"
            :addTagInfo="{
              type: 20,
              hideTitleSpan: false,
              id: null,
              index: [],
              source: null
            }"
            :chooseList="tableForm.chooseStyle"
            @updateTag="updateTag"
          />
        </div>
      </div>

      <div class="content_list sumvideo_page" ref="pageScroll">
        <template v-if="tableForm.listData && tableForm.listData.length > 0">
          <div
            ref="contentRef"
            class="model_list"
            :infinite-scroll-delay="1000"
            v-infinite-scroll="getListNext"
            :infinite-scroll-distance="50"
            :infinite-scroll-immediate="false"
            :infinite-scroll-disabled="tableForm.listData.length >= tableForm.page.total"
          >
            <div
              :class="{ one_model: true, choose_model: item.checked }"
              @click.stop="updateSelect(item)"
              v-for="item in tableForm.listData"
              :key="item.id"
            >
              <div class="model_top">
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
                <div class="model_style" v-if="item.tagList && item.tagList.length > 0">
                  <template v-for="(x, y) in item.tagList">
                    <div class="one_style" v-if="x.tagType == 9" :key="y">{{ x.name }}</div>
                  </template>
                </div>
                <img
                  v-if="item.brandId == '0'"
                  class="xm_icon"
                  src="https://tagvv-1256030678.file.myqcloud.com/202410218dz9v.png"
                  alt=""
                />
                <div class="model_select">
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
              <div class="model_bottom line-hidden1">
                {{ item.name || '' }}
              </div>
            </div>
          </div>
          <!-- 加载更多 -->
          <div
            class="loading_library"
            style="padding: 0 16px 20px 0px"
            v-if="tableForm.listData && tableForm.listData.length > 0"
          >
            <img
              src="/public/loading.gif"
              v-if="tableForm.loading && tableForm.page.pageNo > 1"
              alt=""
            />
            {{
              tableForm.loading
                ? tableForm.page.pageNo === 1
                  ? ''
                  : '加载中...'
                : tableForm.listData.length >= tableForm.page.total
                ? '已经到底了~'
                : '上拉加载更多~'
            }}
          </div>
        </template>
        <div v-else class="no_echart" style="padding-right: 16px">
          <img src="@/assets/images/content_center/no_activity.png" alt />
          暂无数据
        </div>
      </div>
    </div>
    <template #footer>
      <div class="footer_btn">
        <div class="f_selectDialog_box">
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
import { throttle, isNotEmpty } from '@/utils/tools'
import { list, getTags } from '@/api/content_center/material_library.js'
const defaultCover = ref('https://tagvv-1256030678.file.myqcloud.com/202212066b4kq.png')

const props = defineProps({
  origin: String, // batchCreate 图文批量生成  templateImgText 图文模板
  tip: String,
  id: Number || String,
  selectDialog: {
    show: false
  }
})
const message = inject('$message')

const dialog = ref()
const show = toRef(props.selectDialog, 'show')
const { tip } = toRefs(props)

const emits = defineEmits(['close', 'updateFun'])
const categoryList = ref([]) // 分类列表
const btnLoading = ref(false) // 确定按钮的loadin

const listParams = ref({}) // 获取当前列表的参数
const contentRef = ref(null)
const pageOpenLoading = ref(true)

// 选择逻辑
const selectData = reactive({
  totalNum: 0,
  checkNum: 0, // 已选择数量
  chooseIds: [], // 页面加载出来的，已选中的原料列表，包含了任何条件下的选中
  chooseInfo: [], // 选中的原料信息

  firstCheckAll: false, // 是否在无内容时，点击了全选，如果是，就是选中所有原料，任何筛选的结果都需要选中
  removeIdList: [], // 无内容全选择，需要排除的ids，只有无筛选内容，并且点击全选后，再点击单个原料的取消选择才将取消选择的原料id放在这里
  isIndeterminate: false, // 无筛选条件时，是否半选
  checkAll2: false, // 输入框有内容时是否全选

  checkAll: false, // 筛选条件为空的时候是否全选
  isIndeterminate2: false // 有筛选条件时，是否半选
})
// 已选择原料数

const tableForm = reactive({
  loading: false,

  chooseCategory: null, // 选中的分类
  chooseStyle: [], // 选中的风格
  listData: [], // 原料列表
  page: {
    pageNo: 1,
    pageSize: 18,
    total: 0
  }
})
const pageScroll = ref()
// 重置
function resetSearch() {
  pageScroll.value?.scrollTo(0, 0)

  console.log('重置，只重置xm_search')
  tableForm.loading = true
  tableForm.page.pageNo = 1
  tableForm.page.pageSize = 18
  getList()
}

// 获取列表
function getList() {
  return new Promise((resolve, reject) => {
    if (tableForm.page.pageNo === 1) {
      contentRef.value?.scrollTo(0, 0)
    }

    const params = {
      sources: [22],
      subSource: [4, 11],
      tagType: 9,
      pageSize: tableForm.page.pageSize,
      pageNo: tableForm.page.pageNo,
      tags: isNotEmpty(tableForm.chooseStyle) ? tableForm.chooseStyle.map(x => x.id) : [],
      rangeTags: isNotEmpty(tableForm.chooseCategory) ? [tableForm.chooseCategory] : [],
      isDelete: 0,
      tagsQueryType: 'or'
    }

    // listParams.value = params
    console.log('入参', params)

    // if (data) return
    list(params)
      .then(res => {
        console.log('获取列表返回', res)
        pageOpenLoading.value = false
        if (res.code === 0 && res.data) {
          const { records: list = [], total: resultTotal = 0 } = res.data
          const resultList = list.map(x => {
            let checked = false
            // console.log(
            //   '嘻嘻嘻嘻嘻嘻嘻嘻嘻嘻嘻嘻嘻嘻嘻嘻嘻嘻嘻嘻嘻嘻嘻嘻',
            //   hasCondition(listParams.value),
            //   selectData.firstCheckAll,
            //   selectData.removeIdList,
            //   x.id
            // )
            //  无输入内容时
            if (!hasCondition(listParams.value)) {
              if (selectData.firstCheckAll) {
                // 如果是全选，那就都加上
                checked = selectData.removeIdList.findIndex(xx => xx === x.id) === -1
                if (checked) {
                  // 选中 往chooseIds添加数据
                  if (!selectData.chooseIds.includes(x.id)) {
                    selectData.chooseIds.push(x.id)
                    selectData.chooseInfo.push(x)
                  }
                }
              } else {
                checked = selectData.chooseIds.findIndex(xx => xx === x.id) > -1
              }
            } else {
              if (selectData.firstCheckAll) {
                // 如果是全选，那就都加上
                checked = selectData.removeIdList.findIndex(xx => xx === x.id) === -1
              } else {
                // 非全选，那就看移除ID列表里是否存在该ID，存在就不选中

                checked = selectData.chooseIds.findIndex(xx => xx === x.id) > -1
              }
            }
            return {
              ...x,
              checked: checked
            }
          })
          if (tableForm.page.pageNo === 1) {
            console.log('处理后数据', resultList)
            tableForm.listData = resultList

            const llll = resultList.filter(x => x.checked)
            // 需要记录总数量 用于后续全选的时候显示总数
            if (!hasCondition(listParams.value)) {
              selectData.totalNum = resultTotal
              if (selectData.checkNum === resultTotal && llll && llll.length > 0) {
                selectData.isIndeterminate = false
                selectData.checkAll = true
              } else {
                selectData.checkAll = false
                selectData.isIndeterminate = llll && llll.length > 0
              }
            } else {
              // 根据列表的选中数据来显示到底半选还是不选
              selectData.isIndeterminate2 = llll && llll.length > 0
            }
          } else {
            tableForm.listData = tableForm.listData.concat(resultList)
          }
          tableForm.page.total = resultTotal
        }
        tableForm.loading = false
        resolve()
      })
      .catch(err => {
        pageOpenLoading.value = false
        tableForm.loading = false
        reject(err)
      })
  })
}

// 获取下一页
function getListNext() {
  tableForm.loading = true
  tableForm.page.pageNo++
  getList()
}

// 清空已选择
function clearSelect() {
  clearFun()
  batchRemoveFun(tableForm.listData)
}

// 判断是否有筛选条件
function hasCondition(params) {
  return params?.tags && params.tags.length > 0
}

// 无筛选条件下的清除全选 - 当前选中都要清除 - 无条件筛选状态为false
function batchRemoveFun(dataList, addNum) {
  let num = 0
  dataList.forEach(x => {
    if (x.checked) {
      x.checked = false
      num++
    }
  })
  const getId2 = dataList.map(item => item.id)
  const list2 = selectData.chooseIds.filter(id => !getId2.includes(id))
  selectData.chooseIds = list2
  const list3 = selectData.chooseInfo.filter(x => !getId2.includes(x.id))
  selectData.chooseInfo = list3

  if (addNum) {
    selectData.checkNum = selectData.checkNum - num
  }
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

    const iii = selectData.removeIdList.findIndex(iiii => iiii === item.id)
    if (iii > -1) {
      selectData.removeIdList.splice(iii, 1)
    }
    selectData.checkNum++
    if (hasCondition(listParams.value)) {
      console.log('有内容时')
      selectData.isIndeterminate2 = true
      console.log('selectData.firstCheckAll', selectData.firstCheckAll)
      console.log('selectData.removeIdList', selectData.removeIdList)

      if (selectData.firstCheckAll && selectData.removeIdList.length === 0) {
        selectData.checkAll = true
      }
    } else {
      console.log('单个多选框')
      if (selectData.checkNum === selectData.totalNum && selectData.removeIdList.length === 0) {
        selectData.isIndeterminate = false
        selectData.checkAll = true

        selectData.firstCheckAll = true
      } else {
        selectData.isIndeterminate = true
        selectData.checkAll = false
      }
    }
  } else {
    // 取消选中 在chooseIds删除数据
    const index = selectData.chooseIds.findIndex(y => y === item.id)
    console.log('删除的ids', index)
    if (index > -1) {
      selectData.chooseIds.splice(index, 1)
      selectData.chooseInfo.splice(index, 1)
    }

    selectData.checkNum--
    // 有输入内容
    if (hasCondition(listParams.value)) {
      console.log(
        '有输入内容',
        !tableForm.listData.filter(xxx => xxx.checked).length,
        selectData.firstCheckAll
      )

      if (!tableForm.listData.filter(xxx => xxx.checked).length) {
        selectData.isIndeterminate2 = false
      }
      if (tableForm.listData.filter(xxx => xxx.checked).length)
        if (selectData.firstCheckAll) {
          selectData.removeIdList.push(item.id)
          selectData.checkAll = false
        }
    } else {
      // 无输入内容
      selectData.checkAll = false

      selectData.isIndeterminate = selectData.chooseIds.length > 0

      if (selectData.firstCheckAll) {
        selectData.removeIdList.push(item.id)
      }

      // 如果searchList的未勾选数量和总数一致，那就把初次全选的标志清空
      const lll = tableForm.listData.filter(x => !x.checked)
      if (lll.length === selectData.totalNum) {
        clearFun()
      }
    }

    if (
      selectData.removeIdList.length === selectData.totalNum &&
      selectData.removeIdList.length > 0
    ) {
      clearFun()
    }
  }
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
// 比较两个数组，将重复的数据删除
function compareAndRemoveDuplicates(arr1, arr2) {
  const combined = [...new Set([...arr1, ...arr2])] // 合并两个数组并去除重复项
  const filtered = combined.filter(item => !arr1.includes(item) || !arr2.includes(item)) // 过滤掉在两个数组中都出现的项
  return filtered
}
// 全选当前数据
function selectAllFun() {
  // 判断当前是否有数据 没有就return
  if (tableForm.listData.length === 0) return
  // 判断当前是否有未选择的数据 有就是把那些未选择都改成选择 否则 就是取消当前页面的所有数据
  const unCheckList = tableForm.listData.filter(x => !x.checked)
  if (unCheckList && unCheckList.length > 0) {
    // 把未选中的都改成选中状态 并且把ID添加到chooseIds里
    const ids = []
    const infos = []
    tableForm.listData.forEach(x => {
      if (!x.checked) {
        x.checked = true
        // if (isBgm.value) {
        //   selectData.chooseInfo.push({ id: x.id, url: x.url })
        // }
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
    //   if (isBgm.value) {
    //     const ids3 = selectData.chooseInfo.map(x => x.id)
    //     selectData.chooseInfo = compareAndRemoveDuplicates(ids3, ids2)
    //   }
  }
}
// 清空数据
function clearFun() {
  console.log('清空')
  selectData.firstCheckAll = false
  selectData.checkAll = false
  selectData.checkAll2 = false
  selectData.isIndeterminate = false
  selectData.isIndeterminate2 = false
  selectData.removeIdList = []
  selectData.checkNum = 0
  selectData.chooseIds = []
  selectData.chooseInfo = []
}

// 取消
function closeDialog() {
  emits('close')
  dialog.value.handleClose()
}
function handleConfirm() {
  if (selectData.chooseIds.length === 0) {
    message.warning(`请先选择虚拟模特`)
    return
  }
  btnLoading.value = true
  emits('updateFun', selectData.chooseIds, dialog.value, btnLoading)
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
      resetSearch()
    }
  })
}
// 选择分类  选择完毕要清空标签
const chooseCategoryFun = throttle(e => {
  if (tableForm.chooseCategory === e) return
  selectData.firstCheckAll = false
  tableForm.chooseCategory = e
  resetSearch()
}, 500)
// 选中风格
function updateTag(info) {
  if (isNotEmpty(info)) {
    tableForm.chooseStyle = info
  } else {
    tableForm.chooseStyle = []
  }
  selectData.firstCheckAll = false
  resetSearch()
}
onMounted(() => {
  tableForm.loading = true
  getCategoryList()
})
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.model_list {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;
  .choose_model {
    .model_top {
      overflow: hidden;
      border-radius: 4px;
      border: 2px solid #364fcd !important;
    }
  }
  .one_model {
    cursor: pointer;

    width: 122px;
    height: 188px;
    border-radius: 4px;
    margin-right: 12px;
    margin-bottom: 12px;
    .model_top {
      border: 2px solid transparent;
      position: relative;
      width: 100%;
      height: 160px;
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
        left: 8px;
        width: calc(100% - 16px);
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: flex-start;
        flex-wrap: wrap;
        height: 28px;
        overflow: hidden;
        .one_style {
          margin-bottom: 8px;
          margin-left: 8px;
          font-weight: 400;
          font-size: 12px;
          color: #ffffff;
          line-height: 18px;
          padding: 1px 8px;
          background: rgba(0, 0, 0, 0.4);
          border-radius: 4px;
          @include mult_line(1);
        }
      }
    }
    .model_bottom {
      width: 100%;
      text-align: center;
      padding: 8px 4px 0;

      font-weight: 400;
      font-size: 14px;
      color: #303133;
      line-height: 20px;
    }
    .model_select {
      position: absolute;
      right: 8px;
      bottom: 8px;
      width: 16px;
      height: 16px;
      .select_icon {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: flex;
      }
    }
  }
}
.dialog_content {
  width: calc(100% + 16px);

  .content_list {
    height: calc(100% - 144px);
    height: 401px;
    overflow: auto;
    overflow-x: hidden;
  }

  ::-webkit-scrollbar {
    width: 6px;
  }
}
.footer_btn {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  width: 100%;
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
// .loading_library {
//   display: flex;
//   flex-direction: row;
//   justify-content: center;
//   align-items: center;
//   width: 100%;
//   margin-bottom: 15px;
//   font-size: 12px;
//   color: #909399;
//   img {
//     height: 25px;
//     margin-right: 4px;
//   }
// }
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
.dialog_title {
  display: flex;
  align-items: center;

  .title {
    margin-right: 8px;
  }
}
</style>
