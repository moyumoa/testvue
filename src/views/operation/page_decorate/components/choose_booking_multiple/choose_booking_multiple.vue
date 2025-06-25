<template>
  <div class="choose_modal">
    <el-dialog v-model="show" ref="dialog" title="选择活动" width="834px" destroy-on-close>
      <div class="search_box">
        <div class="search_item">
          <label class="item_label">活动标题</label>
          <div class="item_content">
            <el-input
              @blur="retEmit($event)"
              v-model.trim="tableForm.name"
              placeholder="请输入活动标题"
              clearable
            />
          </div>
        </div>
        <div class="search_item" style="justify-content: flex-end; width: 170px">
          <el-button type="primary" @click="searchList">查询</el-button>
          <el-button @click="resetList">重置</el-button>
        </div>
      </div>

      <xm_table
        showSelection
        ref="multipleTableRef"
        class="pic_table"
        max-height="400"
        v-loading="tableForm.loading"
        :data="tableForm.listData"
        v-model:page="tableForm.page"
        @getTableData="getList"
        @selection-change="handleSelectionChange"
        :select="chooseList"
      >
        <el-table-column label="标题">
          <template #default="scope">
            <div class="good_box">
              <!--<div class="good_img_box">
                 <img v-if="scope.row.img" :src="scope.row.img" class="good_img" />
                <img
                  class="good_img"
                  v-else
                  src="@/assets/images/content_center/default_cover.png"
                  alt=""
                />
                <img
                  v-if="scope.row.featured == 1"
                  class="selected_img"
                  src="@/assets/images/content_center/selected.png"
                  alt=""
                />
              </div>-->
              <div class="good_content">
                <div class="content_text line-hidden1">{{ scope.row.name || '--' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column width="170" label="创建时间">
          <template #default="scope">
            <div>{{ scope.row.gmtCreate || '--' }}</div>
          </template>
        </el-table-column>
      </xm_table>

      <template #footer>
        <div class="dialog_footer">
          <div class="footer_mark">已选{{ chooseList.length }}个活动</div>

          <div class="footer_btn">
            <el-button @click="closeDialog">取消</el-button>
            <el-button type="primary" @click="handleConfirm">确定</el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { getActivityListPage } from '@/api/content_center/retain_activity.js'

import { throttle } from '@/utils/tools.js'
const props = defineProps({
  modal: {
    type: Object,
    default: () => {
      return {
        show: false,
        chooseList: [] // 选择的活动
      }
    }
  }
})

// 是否展示
const show = toRef(props.modal, 'show')

const tableForm = reactive({
  loading: false,
  name: '',
  listData: [],
  page: {
    index: 1,
    size: 10,
    total: 0
  }
})
// 查询
const searchList = throttle(() => {
  tableForm.page.index = 1
  tableForm.loading = true
  getList()
}, 300)
// 设置选中
function choose() {
  oldChoose.value.forEach(y => {
    multipleTableRef.value.$refs.table.toggleRowSelection(y, true)
  })
}
// 重置
const resetList = throttle(() => {
  tableForm.name = ''
  tableForm.page.index = 1
  tableForm.page.size = 10
  tableForm.loading = true
  getList()
}, 300)
const multipleTableRef = ref(null)
function getList() {
  const data = {
    activityTitle: tableForm.name,
    // status: 1,
    pageNo: tableForm.page.index,
    pageSize: tableForm.page.size,
    searchCount: true
    // brandId: 16
  }
  getActivityListPage(data)
    .then(res => {
      if (res.code === 0) {
        console.log(res)
        const arr = []
        //   {
        //     img: 'https://p9-aio.ecombdimg.com/obj/temai/71b6e5e464bcc36afd92c8be4041e680260d1247www400-400',
        //     name: '实拍韩国chic小众抽绳连衣裙简约feel气质长款裙子',
        //     discountPrice: 999800,
        //     marketPrice: 999800,
        //     gmtCreate: '2022-1-12',
        //     id: '3427556920385525481'
        //   },
        //   {
        //     img: 'https://p9-aio.ecombdimg.com/obj/temai/bc847b12871c6b27363aed36c07f2d1a4eb5afe0www400-400',
        //     name: '2020夏季新款韩国 chic风 甜美花朵图案高腰阔腿休闲裤长裤',
        //     discountPrice: 999500,
        //     marketPrice: 999400,
        //     gmtCreate: '2022-1-12',
        //     id: '3426428809224829466'
        //   },
        //   {
        //     img: 'https://p6-aio.ecombdimg.com/obj/temai/385c172da274b89c1ffa7736d8733825www720-720',
        //     name: '夏季新款韩版高腰侧边开衩阔腿长裤',
        //     discountPrice: 299500,
        //     marketPrice: 299400,
        //     gmtCreate: '2022-1-12',
        //     id: '3419599839250504560'
        //   }
        // ]
        const list = res.data.records || []
        list.forEach(item => {
          arr.push({
            img: JSON.parse(item.activityHeadImg)[0],
            name: item.activityTitle,
            discountPrice: item.presentPrice,
            marketPrice: item.originalPrice,
            gmtCreate: item.createTime,
            id: item.activityId
          })
        })
        console.log(arr)
        tableForm.listData = arr
        choose()
        tableForm.page.total = res.data.total || 0
      } else {
        if (tableForm.page.index === 1) {
          tableForm.listData = []
        }
      }
      tableForm.loading = false
    })
    .catch(() => {
      tableForm.loading = false
    })
}

// 检查是否有表情包
function retEmit(e) {
  const reg =
    /[^a-zA-Z0-9_\u4e00-\u9fa5\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b/\s,.!！:()?/_""-——]/g
  tableForm.name = e.target.value.replace(reg, '')
}

function unique(arr) {
  const res = new Map()
  return arr.filter(arr => !res.has(arr.id) && res.set(arr.id, 1))
}
// 选中的数据
const oldChoose = ref([])
const chooseList = ref([])
// 表格的选择
function handleSelectionChange(e) {
  chooseList.value = unique(e)
}
function init() {
  if (props.modal.chooseList && props.modal.chooseList.length > 0) {
    oldChoose.value = props.modal.chooseList
    chooseList.value = props.modal.chooseList
  }
  resetList()
  nextTick(() => {
    // choose()
  })
}
onMounted(() => {
  init()
})
const dialog = ref()
const emits = defineEmits(['update:goods'])
// 选择页面
const handleConfirm = function () {
  emits('update:goods', chooseList.value)
  dialog.value.handleClose()
}
const closeDialog = function () {
  dialog.value.handleClose()
}
</script>
<style lang="scss" scoped>
@import '@/views/operation/page_decorate/components/scss/decorate.scss';
.search_box {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin: 5px 0 20px;
  .search_item {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    .item_label {
      margin-right: 14px;
      text-align: right;
    }
  }
}

.good_box {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  .good_img_box {
    width: 60px;
    height: 60px;
    border-radius: 4px;
    margin-right: 10px;
    position: relative;
  }
  .good_img {
    width: 60px;
    height: 60px;
    border-radius: 4px;
    object-fit: cover;
  }
  .selected_img {
    position: absolute;
    left: 0;
    top: 0;
    width: 28px;
    height: 14px;
    display: flex;
  }
  .good_content {
    max-width: calc(100% - 70px);
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    font-size: 14px;
    font-weight: 500;
    color: #303133;
    line-height: 20px;
  }
}
.dialog_footer {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 0 0 24px;
}
</style>
