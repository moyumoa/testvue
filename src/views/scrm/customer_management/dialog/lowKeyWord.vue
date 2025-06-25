<template>
  <div>
    <el-dialog v-model="lowDialog" width="560px" @close="closeCalcDialog" title="负面关键词">
      <div class="low_dialog_top">
        <div class="l_top_tips">
          <!-- <el-select v-model="lowType" class="m-2" @change="ChangeType">
            <el-option
              v-for="item in lowKeyWordList"
              :key="item.value"
              :label="item.name"
              :value="item.value"
            />
          </el-select> -->
          共有
          <span style="color: #364fcd">{{ tableForm.page.total }}</span>
          个负面关键词
        </div>
        <div v-if="lowType == 2">
          <el-button
            class="add_word"
            type="primary"
            @click="openEditDialog('addKeyword', undefined)"
          >
            + 新增关键词
          </el-button>
        </div>
      </div>
      <div class="table_box">
        <xm_table
          class="pic_table"
          v-loading="tableForm.loading"
          :data="tableForm.listData"
          v-model:page="tableForm.page"
          @getTableData="getList"
          pageLayout="total, prev, pager, next , jumper"
          @sort-change="sortFun"
          :default-sort="{
            prop: 'hintCnt',
            order: 'descending'
          }"
        >
          <el-table-column label="关键词名称" min-width="180" prop="keyName"></el-table-column>
          <el-table-column
            v-if="lowType == 2"
            label="命中次数"
            max-width="150"
            prop="hintCnt"
            sortable="custom"
          ></el-table-column>
          <el-table-column
            v-if="lowType == 2"
            label="操作"
            min-width="100"
            header-align="right"
            align="right"
          >
            <template #default="scope">
              <el-link
                type="primary"
                class="table-btn"
                @click="openEditDialog('updateKeyword', scope.row)"
              >
                编辑
              </el-link>
              <el-link type="primary" class="table-btn" @click="deleteKeyword(scope.row)">
                删除
              </el-link>
            </template>
          </el-table-column>
        </xm_table>
      </div>
    </el-dialog>

    <EditDialog
      v-if="dialogConfig.show"
      v-model="dialogConfig.show"
      :config="dialogConfig"
      @confirm="onConfirm"
    ></EditDialog>
  </div>
</template>

<script setup>
import { useKeyword } from '@/views/scrm/customer_management/data/index'
import EditDialog from '@/views/scrm/customer_management/dialog/edit_dialog.vue'

const props = defineProps({
  lowDialog: {
    type: Boolean,
    default: false
  }
})
const { lowDialog } = toRefs(props)
const emit = defineEmits(['update:lowShow'])
const lowKeyWordList = ref([])
const lowType = ref(2)
lowKeyWordList.value = [
  { name: '系统内置', value: 1 },
  { name: '品牌自有', value: 2 }
]
const { tableForm, getList, dialogConfig, openEditDialog, onConfirm, deleteKeyword } = useKeyword(
  2,
  lowType.value
)
function ChangeType(val) {
  lowType.value = val || 1
  tableForm.page.index = 1
  tableForm.page.size = 5
  tableForm.queryParam = {}
  tableForm.queryParam = {
    type: lowType.value
  }
  getList()
}

function closeCalcDialog() {
  lowDialog.value = false
  emit('update:lowShow', false)
}

ChangeType(2)
function sortFun(e) {
  console.log(e.prop, e.order)
  if (e.prop === 'hintCnt') {
    if (e.order === 'ascending') {
      tableForm.orderSetting = 'ASC:hint_cnt'
    } else if (e.order === 'descending') {
      tableForm.orderSetting = 'DESC:hint_cnt'
    } else {
      tableForm.orderSetting = ''
    }
  } else {
    tableForm.orderSetting = ''
  }
  getList()
}
</script>

<style lang="scss" scoped>
.low_dialog_top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;

  .m-2 {
    margin-right: 12px;
  }

  .add_word {
    width: 120px;
    height: 32px;
    border-radius: 4px;
  }
}

.table_box {
  .table-btn {
    margin: 0 0 0 10px;
  }
}
</style>
