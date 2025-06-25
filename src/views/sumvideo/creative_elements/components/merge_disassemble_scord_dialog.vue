<template>
  <div>
    <el-dialog
      @close="closeDialogFun"
      ref="dialog"
      :close-on-click-modal="false"
      destroy-on-close
      v-model="show"
      :title="type === 'merge' ? '合并记录' : '拆分记录'"
      width="960px"
      custom-class="rule_setting_dialog show_header_line hide_footer_line"
      align-center
    >
      <div class="dialog_content">
        <xm_search
          :searchComponents="searchComponents"
          @getData="searchList"
          :useOwnReset="true"
          @reset="resetSearch"
        ></xm_search>
        <div class="table_warp">
          <xm_table
            :maxTableHeight="400"
            class="pic_table"
            v-loading="tableForm.loading"
            :data="tableForm.listData"
            v-model:page="tableForm.page"
            :pageSizes="[5]"
            @getTableData="getList"
          >
            <el-table-column
              :label="type === 'merge' ? '合并原料' : '拆分原料'"
              prop="sourceMaterials"
            >
              <template #default="scope">
                <div class="colum_list_warp">
                  <div
                    class="list_item"
                    v-for="(item, index) in scope.row.sourceMaterials"
                    :key="index"
                    @click="openDet(item)"
                  >
                    <img :src="item.coverUrl || item.url" alt="" class="item_cover" />
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              label="拆分时长"
              prop="splitDuration"
              v-if="type == 'disassemble'"
              width="100"
            >
              <template #default="scope">
                <div>
                  {{ scope.row.splitDuration ? scope.row.splitDuration / 1000 + 's' : '--' }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="标签" prop="tagIds" width="180">
              <template #default="scope">
                <div class="tag_box" v-if="scope.row.tagIds && scope.row.tagIds.length > 0">
                  <el-tooltip
                    v-for="(item, index) in scope.row.tagIds"
                    :key="index"
                    popper-class="tooltip-class tooltip_group_list"
                    placement="top"
                  >
                    <template #content>{{ item.name || '' }}</template>

                    <div class="one_tag">
                      {{ item.name || '' }}
                    </div>
                  </el-tooltip>
                </div>
                <div v-else>--</div>
              </template>
            </el-table-column>
            <el-table-column label="文件夹" prop="folderIds" width="150">
              <template #default="scope">
                <div v-if="scope.row.folderIds && scope.row.folderIds.length > 0">
                  <span v-for="(item, index) in scope.row.folderIds" :key="index">
                    {{ item.name || '' }}
                  </span>
                </div>

                <div v-else>--</div>
              </template>
            </el-table-column>
            <el-table-column
              :label="type === 'merge' ? '合并状态' : '拆分状态'"
              prop="status"
              width="100"
            >
              <template #default="scope">
                <div class="xm_status_content" style="width: max-content">
                  <div
                    :class="{
                      status_circle: true,
                      green_circle: scope.row.status == 2,
                      red_circle: scope.row.status == 3,
                      blue_circle: scope.row.status == 1 || scope.row.status == 4
                    }"
                  ></div>
                  <div>
                    {{
                      scope.row.status == 1 || scope.row.status == 4
                        ? scope.row.operationType === 1
                          ? '合并中'
                          : '拆分中'
                        : scope.row.status == 2
                        ? '成功'
                        : scope.row.status == 3
                        ? '失败'
                        : '--'
                    }}
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              :label="type == 'merge' ? '合并时间' : '拆分时间'"
              prop="gmtCreate"
              width="160"
            >
              <template #default="scope">
                <div>
                  {{ scope.row.gmtCreate ? String(scope.row.gmtCreate).replace(/T/, ' ') : '--' }}
                </div>
              </template>
            </el-table-column>
          </xm_table>
        </div>
      </div>
    </el-dialog>
    <!-- 原料详情的弹窗 -->
    <elementDetailDialog
      ref="elementDetailDialogRef"
      v-if="elementDialog.show"
      :elementDialog="elementDialog"
      :origin="'mergeDisassembleRecord'"
      @closeDialog="closeClickIdByDialog"
    ></elementDetailDialog>
  </div>
</template>
<script setup>
import { getQuery } from '@/utils/get_query'
import elementDetailDialog from './element_detail_dialog.vue'
import { listOperationRecords } from '@/api/content_center/material_library'
const props = defineProps({
  info: {
    type: Object,
    default: () => {
      return {
        show: true, // 是否显示弹窗
        type: 'merge'
      }
    },
    required: true
  }
})
const dialog = ref()
const show = toRef(props.info, 'show')
const { type } = toRefs(props.info)
const emits = defineEmits(['cancel'])
const tableForm = reactive({
  loading: true,
  listData: [],
  page: {
    index: 1,
    size: 5,
    total: 0
  }
})

const searchComponents = ref([
  {
    type: 'dateRange',
    label: type.value === 'merge' ? '合并时间' : '拆分时间',
    val: '',
    disabledDate(time) {
      return time.getTime() > Date.now()
    }, // 禁用日期
    isDisEdit: true, // 是否禁用文本框输入
    placeholder: ['开始时间', '结束时间'],
    filed: 'dateRange'
  }
])

const elementDetailDialogRef = ref(null)
const elementDialog = reactive({
  show: false
})

// 原料详情
function openDet(item) {
  console.log('打开详情', item)
  elementDialog.id = item.id
  elementDialog.source = item.source
  elementDialog.info = item
  elementDialog.show = true
}
function closeClickIdByDialog() {
  elementDialog.show = false
}

function getList() {
  tableForm.loading = true
  const data = getQuery(searchComponents.value, ['startTime', 'endTime'])
  console.log('data', data)
  data.operationType = type.value === 'merge' ? 1 : 2
  data.pageNo = tableForm.page.index
  data.pageSize = tableForm.page.size

  listOperationRecords(data)
    .then(res => {
      if (res.code === 0) {
        tableForm.listData = res.data.records || []
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
function searchList() {
  tableForm.loading = true
  tableForm.page.index = 1
  getList()
}
function resetSearch() {
  tableForm.loading = true
  tableForm.page.index = 1
  tableForm.page.size = 5
  getList()
}

function closeDialogFun() {
  emits('cancel')
}
onMounted(() => {
  resetSearch()
})
</script>
<style lang="scss" scoped>
.dialog_content {
  padding: 22px 24px 20px 24px;
  :deep(.xm_search) {
    padding-top: 0;
    padding-right: 0;
    padding-left: 0;
  }
  .colum_list_warp {
    display: flex;
    align-items: center;
    overflow-x: auto;
    height: 100px;
    .list_item {
      width: 60px;
      height: 80px;
      min-width: 60px;
      border-radius: 2px;
      cursor: pointer;
      .item_cover {
        width: 100%;
        height: 100%;
        border-radius: 2px;
        object-fit: cover;
        display: flex;
      }
    }
    .list_item + .list_item {
      margin-left: 8px;
    }
  }
}
.tag_box {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;
  .one_tag {
    margin: 0 8px 8px 0;
    padding: 1px 7px;
    background: rgba(48, 49, 51, 0.1);
    border-radius: 4px;
    max-width: 80px;
    width: max-content;
    font-size: 12px;
    color: #606266;
    line-height: 18px;
    @include mult_line(1);
  }
}
</style>
