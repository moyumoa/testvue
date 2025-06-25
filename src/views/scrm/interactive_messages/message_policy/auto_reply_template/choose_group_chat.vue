<template>
  <el-dialog v-model="show" :width="560" @close="close">
    <template #title>
      <div class="dialog_title">群聊</div>
    </template>
    <div class="dialog_content">
      <xm_table
        v-model:page="page"
        v-loading="listLoading"
        :data="list"
        @getTableData="getTableList"
        @row-click="onCheck"
        pageLayout="total, prev, pager, next , jumper"
      >
        <el-table-column label="群聊名称" prop="name">
          <template #default="{ row }">{{ row.groupName }}</template>
        </el-table-column>
        <el-table-column label="操作" align="right">
          <template #default="{ row }">
            <div class="action">
              <el-icon v-if="row.checked">
                <i-circle-check-filled :size="16" color="#364FCD" />
              </el-icon>
              <div class="no_check" v-else></div>
            </div>
          </template>
        </el-table-column>
      </xm_table>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="close">取消</el-button>
        <el-button type="primary" @click="confirm">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import tableList from '@/utils/com_composition/table_list'
import { ElMessage } from 'element-plus'
import { getGroupList } from '@/api/scrm/policy'
import { useStore } from 'vuex'

const store = useStore()
const props = defineProps({
  show: Boolean,
  checkedRow: Object
})
const { show } = toRefs(props)
const emits = defineEmits(['update:show', 'confirm'])
const $data = reactive({
  currentRow: null
})

function getList(page) {
  return getGroupList({
    pageNo: page.index,
    pageSize: page.size,
    openId: store.state.chat.policyOpenId
  }).then(res => {
    const _list = res.data.records
    _list.forEach(item => {
      if ($data.currentRow && item.id === $data.currentRow.id) {
        item.checked = true
      }
    })
    page.total = res.data.total
    return _list
  })
}
const { page, list, getTableList, listLoading } = tableList(getList)
page.size = 5

function onCheck(item) {
  if (item.checked) {
    item.checked = false
    $data.currentRow = null
    return
  }
  item.checked = !item.checked
  $data.currentRow = item
  list.value.forEach(e => {
    if (e.id !== item.id) {
      e.checked = false
    }
  })
}

function close() {
  emits('update:show', false)
}
function confirm() {
  if (!$data.currentRow) {
    ElMessage.warning('请先选择群聊')
    return
  }
  close()
  emits('confirm', $data.currentRow)
}

watch(
  () => props.checkedRow,
  val => {
    $data.currentRow = JSON.parse(JSON.stringify(val))
  }
)

onMounted(() => {
  getTableList()
})
</script>

<style lang="scss" scoped>
:deep .el-table__row {
  cursor: pointer;
}
.selected {
  display: flex;
  align-items: center;
  i {
    color: #364fcd;
  }
}
.action {
  display: flex;
  justify-content: flex-end;
  font-size: 18px;
  // .check_btn {
  //   cursor: pointer;
  //   display: inline-block;
  //   padding: 5px;
  // }
  .no_check {
    width: 16px;
    height: 16px;
    margin-right: 1px;
    border-radius: 8px;
    border: 1px solid #dcdee0;
  }
}
</style>
