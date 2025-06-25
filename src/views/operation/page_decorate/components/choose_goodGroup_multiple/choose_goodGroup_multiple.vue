<template>
  <div class="choose_modal">
    <el-dialog v-model="show" ref="dialog" title="选择商品分组" width="580px" destroy-on-close>
      <div class="search_box">
        <div class="search_item">
          <label class="item_label">分组名</label>
          <div class="item_content">
            <el-input
              @blur="retEmit($event)"
              v-model.trim="tableForm.name"
              placeholder="请输入分组名"
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
        <el-table-column label="商品名称">
          <template #default="scope">
            {{ scope.row.name || '--' }}
          </template>
        </el-table-column>

        <el-table-column label="商品数">
          <template #default="scope">
            {{ wanSliceFormat(scope.row.productCount || 0) }}
          </template>
        </el-table-column>
      </xm_table>

      <template #footer>
        <div class="dialog_footer">
          <div class="footer_mark">已选{{ chooseList.length }}个分组</div>

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
import { selectList } from '@/api/content_center/good_group.js'
import { throttle, wanSliceFormat } from '@/utils/tools.js'
const props = defineProps({
  modal: {
    type: Object,
    default: () => {
      return {
        show: false,
        chooseList: [] // 选择的商品
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
  tableForm.groupsId = -1
  tableForm.page.index = 1
  tableForm.page.size = 10
  tableForm.loading = true
  getList()
}, 300)
const multipleTableRef = ref(null)
function getList() {
  const data = {
    name: tableForm.name,
    pageNo: tableForm.page.index,
    pageSize: tableForm.page.size,
    searchCount: true
  }
  selectList(data)
    .then(res => {
      if (res.code === 0) {
        const list = res.data.records || []
        tableForm.listData = list
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
    choose()
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
