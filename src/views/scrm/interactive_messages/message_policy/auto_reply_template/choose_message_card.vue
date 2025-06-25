<template>
  <el-dialog v-model="show" :width="560" @close="close">
    <template #title>
      <div class="dialog_title">消息卡片</div>
    </template>
    <div class="dialog_content">
      <el-tabs v-model="$data.activeTabName" @tab-click="handleTabClick">
        <el-tab-pane label="全部卡片" :name="0"></el-tab-pane>
        <el-tab-pane label="文字链接" :name="1"></el-tab-pane>
        <el-tab-pane label="图片链接" :name="2"></el-tab-pane>
        <el-tab-pane label="问题列表" :name="3"></el-tab-pane>
        <el-tab-pane label="电话拨打" :name="4"></el-tab-pane>
        <el-tab-pane label="电话收集" :name="5"></el-tab-pane>
      </el-tabs>
      <xm_table
        v-model:page="page"
        v-loading="listLoading"
        :data="list"
        @getTableData="getTableList"
        @row-click="onCheck"
        pageLayout="total, prev, pager, next , jumper"
      >
        <el-table-column label="消息卡片名称">
          <template #default="{ row }">{{ row.cardName }}</template>
        </el-table-column>
        <el-table-column label="操作" align="right">
          <template #default="{ row }">
            <div class="action">
              <!-- <div class="check_btn"></div> -->
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
import { getCardList } from '@/api/scrm/policy'
import { useStore } from 'vuex'

const store = useStore()
const props = defineProps({
  show: Boolean,
  checkedRow: Object
})
const { show } = toRefs(props)
const emits = defineEmits(['confirm'])
const $data = reactive({
  activeTabName: 0,
  tabs: [],
  currentRow: null
})

function getList(page) {
  const _activeTabName = Number($data.activeTabName)
  const param = {
    pageNo: page.index,
    pageSize: page.size,
    openId: store.state.chat.policyOpenId
  }
  if (_activeTabName) {
    param.cardType = _activeTabName
  }
  return getCardList(param).then(res => {
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

function handleTabClick() {
  getTableList()
}

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
    ElMessage.warning('请先选择消息卡片')
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
:deep .el-tabs__item {
  padding: 0 16px 14px 16px;
}
.selected {
  display: flex;
  align-items: center;
}
.action {
  display: flex;
  justify-content: flex-end;
  font-size: 18px;
  .no_check {
    width: 16px;
    height: 16px;
    margin-right: 1px;
    border-radius: 8px;
    border: 1px solid #dcdee0;
  }
}
</style>
